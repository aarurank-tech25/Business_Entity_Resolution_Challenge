import os
from pathlib import Path

# Base backend directory
BASE_DIR = Path(__file__).resolve().parent

# Configurable paths via environment variables with sensible defaults
UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", BASE_DIR / "uploads")).resolve()
OUTPUT_DIR = Path(os.getenv("OUTPUT_DIR", BASE_DIR / "outputs")).resolve()
DATASET_TEST_DIR = Path(os.getenv("DATASET_TEST_DIR", BASE_DIR.parent / "dataset" / "test")).resolve()
VALIDATION_SCRIPT_PATH = Path(
    os.getenv("VALIDATION_SCRIPT_PATH", BASE_DIR.parent / "utils" / "validate_submission.py")
).resolve()

# Output artifact paths
MATCHING_RESULTS_FILE = OUTPUT_DIR / "matching_results.tsv"
CANDIDATE_PAIRS_FILE = OUTPUT_DIR / "candidate_pairs.tsv"
METRICS_FILE = OUTPUT_DIR / "metrics.json"

# Fixed dataset names for security and consistency
ALLOWED_SOURCES = ("source1", "source2", "source3")
DATASET_FILES = {
    source: UPLOAD_DIR / f"{source}.tsv"
    for source in ALLOWED_SOURCES
}

# Ensure upload and output directories exist
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
