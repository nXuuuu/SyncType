from __future__ import annotations

import re
from pathlib import Path
from typing import Dict, List, Tuple

import pandas as pd
from flask import Flask, jsonify, request
from flask_cors import CORS
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.neighbors import NearestNeighbors
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import MarianTokenizer, AutoModelForSeq2SeqLM

MODEL_ID = os.getenv("HF_MODEL_ID", "kev223/synctype-model")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": [FRONTEND_URL]}})

tokenizer = MarianTokenizer.from_pretrained(MODEL_ID)
model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_ID)

@app.get("/")
def home():
    return {"message": "SyncType backend is running"}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/translate")
def translate():
    data = request.get_json(force=True)
    text = data.get("text", "").strip()

    if not text:
        return jsonify({"translation": "", "error": "No text provided"}), 400

    inputs = tokenizer(text, return_tensors="pt")
    outputs = model.generate(**inputs, max_new_tokens=64)
    translation = tokenizer.decode(outputs[0], skip_special_tokens=True)

    return jsonify({"translation": translation})

BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "combined_dataset.csv"

app = Flask(__name__)
CORS(app)

WORD_RE = re.compile(r"[a-z0-9]+|[^\w\s]", flags=re.IGNORECASE)


def normalize_text(text: str) -> str:
    text = str(text).strip().lower()
    text = text.replace("'", "")
    text = re.sub(r"\s+", " ", text)
    return text


def tokenize_text(text: str) -> List[str]:
    return WORD_RE.findall(normalize_text(text))


def detokenize_khmer(tokens: List[str]) -> str:
    out = ""
    for token in tokens:
        if not token:
            continue
        if token in {"?", "!", ".", ",", ":", ";"}:
            out = out.rstrip() + token
        else:
            out += token
    return out


def augment_roman_text(text: str) -> List[str]:
    base = normalize_text(text)
    variants = {base}

    replacements = [
        ("ey", "ei"),
        ("ei", "ey"),
        ("ou", "o"),
        ("oa", "o"),
        ("ae", "e"),
        ("ea", "ia"),
        ("kh", "k"),
        ("ph", "p"),
    ]

    for old, new in replacements:
        updated = base.replace(old, new)
        if updated:
            variants.add(updated)

    variants.add(base.replace(" tov ", " tv "))
    variants.add(base.replace("tv", "tov"))
    variants.add(base.replace(" dg ", " doeng "))
    variants.add(base.replace(" ot ", " ort "))
    variants.add(base.replace("nham", "nyam"))
    variants.add(base.replace("slanh", "srolanh"))

    cleaned = []
    for item in variants:
        item = normalize_text(item)
        if item:
            cleaned.append(item)
    return list(dict.fromkeys(cleaned))


def load_training_data() -> Tuple[pd.DataFrame, TfidfVectorizer, NearestNeighbors, List[str], List[str]]:
    df = pd.read_csv(DATA_PATH)
    df = df[["roman", "khmer"]].dropna().copy()
    df["roman"] = df["roman"].astype(str)
    df["khmer"] = df["khmer"].astype(str)

    augmented_rows = []
    for _, row in df.iterrows():
        for variant in augment_roman_text(row["roman"]):
            augmented_rows.append({"roman": variant, "khmer": row["khmer"].strip()})

    aug_df = pd.DataFrame(augmented_rows).drop_duplicates().reset_index(drop=True)

    vectorizer = TfidfVectorizer(analyzer="char_wb", ngram_range=(2, 5))
    X = vectorizer.fit_transform(aug_df["roman"])

    nn = NearestNeighbors(n_neighbors=3, metric="cosine")
    nn.fit(X)

    roman_list = aug_df["roman"].tolist()
    khmer_list = aug_df["khmer"].tolist()
    return aug_df, vectorizer, nn, roman_list, khmer_list


def nearest_match(text: str) -> Dict:
    vec = VECTORIZER.transform([text])
    distances, indices = NN_MODEL.kneighbors(vec)
    best_idx = int(indices[0][0])
    best_distance = float(distances[0][0])
    best_similarity = max(0.0, 1.0 - best_distance)
    return {
        "translation": KHMER_LIST[best_idx],
        "confidence": round(best_similarity, 4),
        "matched_roman": ROMAN_LIST[best_idx],
        "candidates": [
            {
                "roman": ROMAN_LIST[int(i)],
                "khmer": KHMER_LIST[int(i)],
                "similarity": round(max(0.0, 1.0 - float(d)), 4),
            }
            for d, i in zip(distances[0], indices[0])
        ],
    }


def translate_sentence(raw_text: str) -> Dict:
    text = normalize_text(raw_text)
    if not text:
        return {"translation": "", "confidence": 0.0, "matched_roman": "", "method": "empty", "segments": []}

    if text in EXACT_LOOKUP:
        return {
            "translation": EXACT_LOOKUP[text],
            "confidence": 1.0,
            "matched_roman": text,
            "method": "exact",
            "segments": [{"input": text, "output": EXACT_LOOKUP[text], "method": "exact", "confidence": 1.0}],
        }

    tokens = tokenize_text(text)
    segments = []
    outputs: List[str] = []
    confidence_scores: List[float] = []

    i = 0
    max_span = min(4, len(tokens))
    while i < len(tokens):
        token = tokens[i]
        if re.fullmatch(r"[^\w\s]", token):
            outputs.append(token)
            segments.append({"input": token, "output": token, "method": "punct", "confidence": 1.0})
            i += 1
            continue

        chosen = None

        # Prefer longest exact phrase up to 4 tokens.
        for span in range(min(max_span, len(tokens) - i), 0, -1):
            phrase_tokens = tokens[i : i + span]
            if any(re.fullmatch(r"[^\w\s]", t) for t in phrase_tokens):
                continue
            phrase = " ".join(phrase_tokens)
            if phrase in EXACT_LOOKUP:
                chosen = {
                    "span": span,
                    "input": phrase,
                    "output": EXACT_LOOKUP[phrase],
                    "method": "exact",
                    "confidence": 1.0,
                    "matched_roman": phrase,
                }
                break

        # Otherwise try nearest-neighbor phrase or token.
        if chosen is None:
            best = None
            for span in range(min(max_span, len(tokens) - i), 0, -1):
                phrase_tokens = tokens[i : i + span]
                if any(re.fullmatch(r"[^\w\s]", t) for t in phrase_tokens):
                    continue
                phrase = " ".join(phrase_tokens)
                match = nearest_match(phrase)
                adjusted = match["confidence"] + (span - 1) * 0.06
                threshold = 0.5 if span == 1 else 0.58
                if adjusted >= threshold:
                    candidate = {
                        "span": span,
                        "input": phrase,
                        "output": match["translation"],
                        "method": "nearest_neighbor",
                        "confidence": round(match["confidence"], 4),
                        "matched_roman": match["matched_roman"],
                    }
                    if best is None or span > best["span"] or adjusted > best["confidence"]:
                        best = candidate
            chosen = best

        # Fallback: preserve the token when confidence is too weak.
        if chosen is None:
            chosen = {
                "span": 1,
                "input": token,
                "output": token,
                "method": "copy",
                "confidence": 0.0,
                "matched_roman": token,
            }

        outputs.append(chosen["output"])
        confidence_scores.append(chosen["confidence"])
        segments.append({k: v for k, v in chosen.items() if k != "span"})
        i += chosen["span"]

    translation = detokenize_khmer(outputs)
    avg_conf = round(sum(confidence_scores) / len(confidence_scores), 4) if confidence_scores else 1.0

    best_non_punct = next((s for s in segments if s["method"] not in {"punct"}), {"matched_roman": text})
    method = "hybrid" if any(s["method"] == "nearest_neighbor" for s in segments) else "exact_segmented"

    return {
        "translation": translation,
        "confidence": avg_conf,
        "matched_roman": best_non_punct.get("matched_roman", text),
        "method": method,
        "segments": segments,
    }


AUG_DF, VECTORIZER, NN_MODEL, ROMAN_LIST, KHMER_LIST = load_training_data()
EXACT_LOOKUP = {roman: khmer for roman, khmer in zip(ROMAN_LIST, KHMER_LIST)}


@app.get("/")
def home():
    return jsonify({"message": "SyncType backend is running", "endpoints": ["/health", "/translate"]})


@app.get("/health")
def health():
    return jsonify(
        {
            "status": "ok",
            "dataset_rows": int(len(AUG_DF)),
            "unique_khmer": int(AUG_DF["khmer"].nunique()),
        }
    )


@app.post("/translate")
def translate():
    payload = request.get_json(silent=True) or {}
    raw_text = payload.get("text", "")
    result = translate_sentence(raw_text)
    return jsonify(result)


@app.post("/suggest")
def suggest():
    """Return top N suggestions for autocomplete as user types."""
    payload = request.get_json(silent=True) or {}
    raw_text = payload.get("text", "")
    max_results = int(payload.get("max_results", 5))
    
    text = normalize_text(raw_text)
    if not text:
        return jsonify({"suggestions": []})
    
    # Check exact match first
    if text in EXACT_LOOKUP:
        return jsonify({
            "suggestions": [{
                "roman": text,
                "khmer": EXACT_LOOKUP[text],
                "confidence": 1.0
            }]
        })
    
    # Get nearest neighbors
    match_result = nearest_match(text)
    candidates = match_result.get("candidates", [])
    
    # Format for frontend, limit results, deduplicate by khmer
    seen_khmer = set()
    suggestions = []
    for c in candidates:
        khmer = c["khmer"]
        if khmer not in seen_khmer and len(suggestions) < max_results:
            seen_khmer.add(khmer)
            suggestions.append({
                "roman": c["roman"],
                "khmer": khmer,
                "confidence": c["similarity"]
            })
    
    return jsonify({"suggestions": suggestions})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
