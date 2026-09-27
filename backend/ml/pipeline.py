"""
ML Pipeline Adapter
====================
Bridges the ML team's entity-resolution code (ml/src/) to the FastAPI
backend's matching_service contract.

Entry point: register() is called at app startup (from main.py).
It calls services.matching_service.register_matching_pipeline() with
the real pipeline function.

Pipeline execution flow:
  1. Read source TSVs from file Paths into DataFrames
  2. Normalize entity_id column name to "entity_id" for ML modules
  3. Preprocess (normalize business_name, address, country)
  4. Generate candidate pairs via blocking
  5. Calculate matching features
  6. Load model and threshold
  7. Predict matches
  8. Convert DataFrame results -> MatchingPipelineResult dict
  9. Return to matching_service for TSV/JSON serialization
"""

import sys
import logging
from pathlib import Path

import pandas as pd

logger = logging.getLogger(__name__)

# -- Ensure backend/ is on sys.path so "from ml.src.X import Y" resolves -------
_BACKEND_DIR = Path(__file__).resolve().parent.parent  # backend/
if str(_BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(_BACKEND_DIR))


def _load_source(path: Path, source_name: str) -> pd.DataFrame:
    """
    Read a source TSV and normalise the entity_id column to "entity_id".

    The challenge TSVs use source-prefixed ID column names:
        source1 -> "source1_entity_id"
        source2 -> "source2_entity_id"
        source3 -> "source3_entity_id"

    The ML blocking / feature modules expect a plain "entity_id" column.
    """
    df = pd.read_csv(path, sep="\t", dtype=str, on_bad_lines="skip")
    df = df.fillna("")

    # Rename the entity_id column if it has a source prefix
    prefixed = f"{source_name}_entity_id"
    if prefixed in df.columns and "entity_id" not in df.columns:
        df = df.rename(columns={prefixed: "entity_id"})

    if "entity_id" not in df.columns:
        # Fallback: treat the first column as entity_id
        df = df.rename(columns={df.columns[0]: "entity_id"})

    return df


def _convert_candidates_to_dict_list(candidates_df: pd.DataFrame) -> list:
    """
    Convert the flat candidate pairs DataFrame returned by the ML pipeline into
    the list-of-dicts format expected by matching_service.save_pipeline_outputs():

    Input DataFrame columns:
        source1_entity_id | candidate_entity_id | candidate_source | ...

    Output:
        [
            {"source1_entity_id": "S1-001", "candidate_entity_ids": ["S2-001", "S3-002"]},
            ...
        ]

    Candidates from source2 and source3 are merged per source1 entity.
    """
    if candidates_df is None or candidates_df.empty:
        return []

    grouped = (
        candidates_df
        .groupby("source1_entity_id")["candidate_entity_id"]
        .apply(list)
        .reset_index()
        .rename(columns={"candidate_entity_id": "candidate_entity_ids"})
    )
    return grouped.to_dict(orient="records")


def _convert_matches_to_dict_list(matches_df: pd.DataFrame) -> list:
    """
    Convert the filtered match rows DataFrame into the service contract format:

    Input DataFrame columns:
        source1_entity_id | candidate_entity_id | candidate_source | match | probability | ...

    Output:
        [
            {"source1_entity_id": "S1-001", "matched_entity_ids": ["S2-001", "S3-002"]},
            ...
        ]
    """
    if matches_df is None or matches_df.empty:
        return []

    grouped = (
        matches_df
        .groupby("source1_entity_id")["candidate_entity_id"]
        .apply(list)
        .reset_index()
        .rename(columns={"candidate_entity_id": "matched_entity_ids"})
    )
    return grouped.to_dict(orient="records")


def run_ml_pipeline(
    source1_path: Path,
    source2_path: Path,
    source3_path: Path,
) -> dict:
    """
    Full entity-resolution pipeline.

    Accepts file Paths (from the FastAPI route), loads DataFrames,
    runs the ML team's logic, and returns a MatchingPipelineResult dict.

    Returns
    -------
    {
        "matches":    [{"source1_entity_id": ..., "matched_entity_ids": [...]}],
        "candidates": [{"source1_entity_id": ..., "candidate_entity_ids": [...]}],
        "metrics":    {"candidate_pairs": int, "matches": int, "threshold": float}
    }
    """
    # -- 1. Load datasets ------------------------------------------------------
    logger.info("Loading source datasets...")
    source1 = _load_source(source1_path, "source1")
    source2 = _load_source(source2_path, "source2")
    source3 = _load_source(source3_path, "source3")

    logger.info(
        "Loaded: source1=%d rows, source2=%d rows, source3=%d rows",
        len(source1), len(source2), len(source3),
    )

    # -- 2. Preprocess ---------------------------------------------------------
    logger.info("Preprocessing datasets...")
    from ml.src.preprocessing import preprocess_dataframe
    source1 = preprocess_dataframe(source1)
    source2 = preprocess_dataframe(source2)
    source3 = preprocess_dataframe(source3)

    # -- 3. Run prediction (blocking + features + model) -----------------------
    logger.info("Running ML prediction pipeline...")
    from ml.src.predict import predict_matches
    result = predict_matches(source1, source2, source3)

    matches_df    = result["matches"]
    candidates_df = result["candidates"]
    metrics       = result["metrics"]

    logger.info(
        "Pipeline complete: %d candidates, %d matches, threshold=%.3f",
        metrics.get("candidate_pairs", 0),
        metrics.get("matches", 0),
        metrics.get("threshold", 0.0),
    )

    # -- 4. Convert DataFrames -> service contract dicts -----------------------
    matches_list    = _convert_matches_to_dict_list(matches_df)
    candidates_list = _convert_candidates_to_dict_list(candidates_df)

    return {
        "matches":    matches_list,
        "candidates": candidates_list,
        "metrics":    metrics,
    }


def register() -> None:
    """
    Register the real ML pipeline with the matching service.
    Called once at application startup from main.py.
    """
    from services.matching_service import register_matching_pipeline
    register_matching_pipeline(run_ml_pipeline)
    logger.info("ML pipeline registered with matching service.")
