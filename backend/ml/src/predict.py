import os
import sys
import pandas as pd
import joblib

PROJECT_ROOT = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..")
)

if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from ml.src.blocking import generate_candidates
from ml.src.features import calculate_features


def load_model_and_threshold():
    model_path = os.path.join(
        PROJECT_ROOT,
        "ml",
        "models",
        "matching_model.pkl"
    )

    threshold_path = os.path.join(
        PROJECT_ROOT,
        "ml",
        "models",
        "threshold.txt"
    )

    model = joblib.load(model_path)

    with open(threshold_path, "r") as f:
        threshold = float(f.read().strip())

    return model, threshold


def predict_matches(source1, source2, source3):

    print("Generating candidates...")

    candidates = generate_candidates(
        source1,
        source2,
        source3
    )

    print(f"Candidate pairs: {len(candidates)}")

    if candidates.empty:
        return {
            "matches": pd.DataFrame(),
            "candidates": candidates,
            "metrics": {
                "candidate_pairs": 0,
                "matches": 0
            }
        }

    print("Calculating features...")

    source1_dict = (
        source1.set_index("entity_id").to_dict(orient="index")
        if "entity_id" in source1.columns
        else source1.to_dict(orient="index")
    )
    source2_dict = (
        source2.set_index("entity_id").to_dict(orient="index")
        if "entity_id" in source2.columns
        else source2.to_dict(orient="index")
    )
    source3_dict = (
        source3.set_index("entity_id").to_dict(orient="index")
        if "entity_id" in source3.columns
        else source3.to_dict(orient="index")
    )

    feature_rows = []

    s1_ids = candidates["source1_entity_id"].values
    cand_ids = candidates["candidate_entity_id"].values
    cand_srcs = candidates["candidate_source"].values

    for s1_id, candidate_id, cand_src in zip(s1_ids, cand_ids, cand_srcs):

        if cand_src == "source2":
            candidate_row = source2_dict.get(candidate_id, {})
        else:
            candidate_row = source3_dict.get(candidate_id, {})

        source1_row = source1_dict.get(s1_id, {})

        features = calculate_features(
            source1_row,
            candidate_row
        )

        feature_rows.append(features)

    features_df = pd.DataFrame(feature_rows)

    print("Loading trained model...")

    model, threshold = load_model_and_threshold()

    print(f"Threshold: {threshold}")

    probabilities = model.predict_proba(
        features_df
    )[:, 1]

    candidates = candidates.copy()

    candidates["probability"] = probabilities

    candidates["match"] = (
        candidates["probability"] >= threshold
    ).astype(int)

    final_matches = candidates[
        candidates["match"] == 1
    ].copy()

    metrics = {
        "candidate_pairs": len(candidates),
        "matches": len(final_matches),
        "threshold": threshold
    }

    return {
        "matches": final_matches,
        "candidates": candidates,
        "metrics": metrics
    }


def run_matching(source1, source2, source3):

    result = predict_matches(
        source1,
        source2,
        source3
    )

    return (
        result["matches"],
        result["candidates"],
        result["metrics"]
    )