import io
import shutil
import tempfile
import unittest
from pathlib import Path

from fastapi.testclient import TestClient

# Import app and config
import sys
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

import config
from main import app


class BackendTestSuite(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def setUp(self):
        # Create isolated temporary folders for testing uploads and outputs
        self.test_dir = tempfile.mkdtemp()
        self.upload_dir = Path(self.test_dir) / "uploads"
        self.output_dir = Path(self.test_dir) / "outputs"
        self.upload_dir.mkdir(parents=True, exist_ok=True)
        self.output_dir.mkdir(parents=True, exist_ok=True)

        # Monkey-patch config paths for clean isolation during tests
        self.orig_upload_dir = config.UPLOAD_DIR
        self.orig_output_dir = config.OUTPUT_DIR
        self.orig_dataset_files = config.DATASET_FILES
        self.orig_matching_results = config.MATCHING_RESULTS_FILE
        self.orig_candidate_pairs = config.CANDIDATE_PAIRS_FILE
        self.orig_metrics_file = config.METRICS_FILE

        config.UPLOAD_DIR = self.upload_dir
        config.OUTPUT_DIR = self.output_dir
        config.DATASET_FILES = {
            s: self.upload_dir / f"{s}.tsv" for s in config.ALLOWED_SOURCES
        }
        config.MATCHING_RESULTS_FILE = self.output_dir / "matching_results.tsv"
        config.CANDIDATE_PAIRS_FILE = self.output_dir / "candidate_pairs.tsv"
        config.METRICS_FILE = self.output_dir / "metrics.json"

        # Update service module imports to point to test paths
        import services.file_service as fs
        import services.result_service as rs
        import services.matching_service as ms

        fs.UPLOAD_DIR = self.upload_dir
        fs.DATASET_FILES = config.DATASET_FILES

        rs.MATCHING_RESULTS_FILE = config.MATCHING_RESULTS_FILE
        rs.CANDIDATE_PAIRS_FILE = config.CANDIDATE_PAIRS_FILE
        rs.METRICS_FILE = config.METRICS_FILE

        ms.MATCHING_RESULTS_FILE = config.MATCHING_RESULTS_FILE
        ms.CANDIDATE_PAIRS_FILE = config.CANDIDATE_PAIRS_FILE
        ms.METRICS_FILE = config.METRICS_FILE
        ms.DATASET_FILES = config.DATASET_FILES

    def tearDown(self):
        # Restore configuration
        config.UPLOAD_DIR = self.orig_upload_dir
        config.OUTPUT_DIR = self.orig_output_dir
        config.DATASET_FILES = self.orig_dataset_files
        config.MATCHING_RESULTS_FILE = self.orig_matching_results
        config.CANDIDATE_PAIRS_FILE = self.orig_candidate_pairs
        config.METRICS_FILE = self.orig_metrics_file

        import services.file_service as fs
        import services.result_service as rs
        import services.matching_service as ms

        fs.UPLOAD_DIR = self.orig_upload_dir
        fs.DATASET_FILES = self.orig_dataset_files
        rs.MATCHING_RESULTS_FILE = self.orig_matching_results
        rs.CANDIDATE_PAIRS_FILE = self.orig_candidate_pairs
        rs.METRICS_FILE = self.orig_metrics_file
        ms.MATCHING_RESULTS_FILE = self.orig_matching_results
        ms.CANDIDATE_PAIRS_FILE = self.orig_candidate_pairs
        ms.METRICS_FILE = self.orig_metrics_file
        ms.DATASET_FILES = self.orig_dataset_files

        # Clean up temporary directory
        shutil.rmtree(self.test_dir, ignore_errors=True)

    def test_health_check(self):
        """Verify GET /health returns 200 and expected payload."""
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json(),
            {"status": "healthy", "service": "Business Entity Resolution API"}
        )

    def test_list_datasets_initial(self):
        """Verify GET /datasets reports missing files initially."""
        response = self.client.get("/datasets")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "success")
        self.assertFalse(data["all_uploaded"])
        self.assertFalse(data["datasets"]["source1"]["exists"])

    def test_upload_rejects_non_tsv(self):
        """Verify POST /upload/ rejects non-tsv file extensions."""
        files = {
            "source1": ("source1.txt", b"id\tname\n1\titem", "text/plain"),
            "source2": ("source2.tsv", b"id\tname\n2\titem", "text/tab-separated-values"),
            "source3": ("source3.tsv", b"id\tname\n3\titem", "text/tab-separated-values"),
        }
        response = self.client.post("/upload/", files=files)
        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertEqual(data["status"], "error")
        self.assertIn("must be a TSV file", data["message"])

    def test_upload_rejects_empty_file(self):
        """Verify POST /upload/ rejects empty files."""
        files = {
            "source1": ("source1.tsv", b"", "text/tab-separated-values"),
            "source2": ("source2.tsv", b"id\tname\n2\titem", "text/tab-separated-values"),
            "source3": ("source3.tsv", b"id\tname\n3\titem", "text/tab-separated-values"),
        }
        response = self.client.post("/upload/", files=files)
        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertEqual(data["status"], "error")
        self.assertIn("empty", data["message"].lower())

    def test_upload_valid_datasets(self):
        """Verify POST /upload/ succeeds with valid TSV files and streams them to disk."""
        s1_data = "source1_entity_id\tname\tcity\nS1-001\tAcme Inc\tSeattle\nS1-002\tBeta LLC\tAustin\n"
        s2_data = "source2_entity_id\tname\tcity\nS2-001\tAcme\tSeattle\n"
        s3_data = "source3_entity_id\tname\tcity\nS3-001\tAcme Corp\tSeattle\n"

        files = {
            "source1": ("test_s1.tsv", s1_data.encode("utf-8"), "text/tab-separated-values"),
            "source2": ("test_s2.tsv", s2_data.encode("utf-8"), "text/tab-separated-values"),
            "source3": ("test_s3.tsv", s3_data.encode("utf-8"), "text/tab-separated-values"),
        }
        response = self.client.post("/upload/", files=files)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "success")
        self.assertIn("source1", data["files"])
        self.assertIn("source2", data["files"])
        self.assertIn("source3", data["files"])

        # Check datasets status
        status_resp = self.client.get("/datasets")
        self.assertEqual(status_resp.status_code, 200)
        self.assertTrue(status_resp.json()["all_uploaded"])

    def test_dataset_preview(self):
        """Verify GET /datasets/{source_name}/preview returns bounded row previews."""
        # Create sample TSV in test upload dir
        tsv_content = "source1_entity_id\tname\tcity\nS1-1\tAlpha\tNYC\nS1-2\tBeta\tLA\nS1-3\tGamma\tChicago\n"
        (self.upload_dir / "source1.tsv").write_text(tsv_content, encoding="utf-8")

        response = self.client.get("/datasets/source1/preview?limit=2")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "success")
        self.assertEqual(data["source"], "source1")
        self.assertEqual(data["preview_rows"], 2)
        self.assertEqual(data["columns"], ["source1_entity_id", "name", "city"])
        self.assertEqual(data["data"][0]["name"], "Alpha")
        self.assertEqual(data["data"][1]["name"], "Beta")

    def test_dataset_preview_missing_dataset(self):
        """Verify preview on a missing dataset returns 404."""
        response = self.client.get("/datasets/source2/preview")
        self.assertEqual(response.status_code, 404)
        data = response.json()
        self.assertEqual(data["status"], "error")
        self.assertIn("does not exist", data["message"])

    def test_dataset_preview_invalid_source(self):
        """Verify preview with an invalid source name returns 400."""
        response = self.client.get("/datasets/invalid_source/preview")
        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertEqual(data["status"], "error")

    def test_results_and_candidates_when_not_exist(self):
        """Verify GET /results and /candidates report exists=False cleanly."""
        res = self.client.get("/results")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["exists"], False)
        self.assertEqual(res.json()["status"], "not_found")

        cand = self.client.get("/candidates")
        self.assertEqual(cand.status_code, 200)
        self.assertEqual(cand.json()["exists"], False)
        self.assertEqual(cand.json()["status"], "not_found")

    def test_download_when_not_exist(self):
        """Verify GET /results/download and /candidates/download return 404 when files missing."""
        res_down = self.client.get("/results/download")
        self.assertEqual(res_down.status_code, 404)
        self.assertEqual(res_down.json()["status"], "error")

        cand_down = self.client.get("/candidates/download")
        self.assertEqual(cand_down.status_code, 404)
        self.assertEqual(cand_down.json()["status"], "error")

    def test_metrics_when_unavailable(self):
        """Verify GET /metrics returns status 'not_available' without fake scores."""
        response = self.client.get("/metrics")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "not_available")
        self.assertIn("not available until the matching pipeline is executed", data["message"])
        # Ensure no fake metrics are returned
        self.assertNotIn("metrics", data)

    def test_run_matching_when_datasets_missing(self):
        """Verify POST /run-matching returns 400 if source datasets have not been uploaded."""
        response = self.client.post("/run-matching")
        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertEqual(data["status"], "error")
        self.assertIn("Required dataset", data["message"])

    def test_run_matching_when_pipeline_not_connected(self):
        """Verify POST /run-matching returns 503 error when pipeline is not connected."""
        # Create empty files to simulate uploaded datasets
        for name in config.ALLOWED_SOURCES:
            (self.upload_dir / f"{name}.tsv").write_text("header\nrow\n", encoding="utf-8")

        response = self.client.post("/run-matching")
        self.assertEqual(response.status_code, 503)
        data = response.json()
        self.assertEqual(data["status"], "error")
        self.assertEqual(data["message"], "Matching pipeline is not connected yet")

    def test_validate_missing_files(self):
        """Verify POST /validate returns 400 when required output files do not exist."""
        response = self.client.post("/validate")
        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertEqual(data["status"], "error")
        self.assertIn("not found", data["message"].lower())

    def test_member2_pipeline_plugging_workflow(self):
        """Verify that when Member 2 plugs in their pipeline, matching runs and outputs are stored."""
        from services.matching_service import register_matching_pipeline, _PIPELINE_FUNCTION
        import services.matching_service as ms

        # Upload dummy source datasets
        for name in config.ALLOWED_SOURCES:
            (self.upload_dir / f"{name}.tsv").write_text("id\tval\n1\ta\n", encoding="utf-8")

        # Mock Member 2 pipeline adhering to the exact contract
        def mock_member2_pipeline(s1, s2, s3):
            return {
                "matches": [
                    {"source1_entity_id": "S1-001", "matched_entity_ids": ["S2-001", "S3-001"]}
                ],
                "candidates": [
                    {"source1_entity_id": "S1-001", "candidate_entity_ids": ["S2-001", "S3-001"]}
                ],
                "metrics": {
                    "f0_5": 0.85,
                    "precision": 0.90,
                    "recall": 0.80,
                    "total_source1": 1,
                    "matched_source1": 1,
                    "singleton_source1": 0
                }
            }

        try:
            register_matching_pipeline(mock_member2_pipeline)

            # Trigger matching
            response = self.client.post("/run-matching")
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.json()["status"], "success")

            # Check matching_results.tsv exists and has correct columns
            res = self.client.get("/results")
            self.assertEqual(res.status_code, 200)
            self.assertTrue(res.json()["exists"])
            self.assertEqual(res.json()["columns"], ["source1_entity_id", "matched_entity_ids"])
            self.assertEqual(res.json()["preview"][0]["source1_entity_id"], "S1-001")

            # Check candidate_pairs.tsv exists and has correct columns
            cand = self.client.get("/candidates")
            self.assertEqual(cand.status_code, 200)
            self.assertTrue(cand.json()["exists"])
            self.assertEqual(cand.json()["columns"], ["source1_entity_id", "candidate_entity_ids"])

            # Check metrics endpoint now returns real metrics
            metrics_resp = self.client.get("/metrics")
            self.assertEqual(metrics_resp.status_code, 200)
            self.assertEqual(metrics_resp.json()["status"], "success")
            self.assertEqual(metrics_resp.json()["metrics"]["f0_5"], 0.85)
        finally:
            # Unregister pipeline so tests remain isolated
            ms._PIPELINE_FUNCTION = None



if __name__ == "__main__":
    unittest.main()
