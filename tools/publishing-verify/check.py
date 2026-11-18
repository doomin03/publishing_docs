import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

from PIL import Image


class VerificationTest(unittest.TestCase):
    def setUp(self):
        directory = tempfile.TemporaryDirectory()
        self.addCleanup(directory.cleanup)
        self.root = Path(directory.name)
        self.manifest = {
            "case": "form/default",
            "image": {"expected": "reference.png", "actual": "capture.png"},
            "metrics": {
                "expected": "reference.json",
                "actual": "capture.json",
                "tolerances": {"button.width": 0.5},
            },
        }
        Image.new("RGBA", (2, 2), "white").save(self.root / "reference.png")
        Image.new("RGBA", (2, 2), "white").save(self.root / "capture.png")
        self.write("reference.json", {"button.width": 120, "button.height": 48})
        self.write("capture.json", {"button.width": 120.5, "button.height": 48})

    def write(self, name, value):
        (self.root / name).write_text(json.dumps(value), encoding="utf-8")

    def run_cli(self, code):
        self.write("case.json", self.manifest)
        result = subprocess.run(
            [sys.executable, str(Path(__file__).with_name("verify.py").resolve()),
             str(self.root / "case.json"), "--output", str(self.root / "result")],
            capture_output=True, text=True, timeout=20,
        )
        self.assertEqual(result.returncode, code, result.stdout + result.stderr)
        if code != 2:
            return json.loads((self.root / "result/report.json").read_text(encoding="utf-8"))

    def test_identical_image_and_numeric_tolerance(self):
        self.assertTrue(self.run_cli(0)["passed"])

    def test_pixel_diff_and_metric_key_mismatch(self):
        with Image.open(self.root / "capture.png") as image:
            changed = image.copy()
        changed.putpixel((0, 0), (0, 0, 0, 255))
        changed.save(self.root / "capture.png")
        self.write("capture.json", {"button.width": 122, "form.gap": 16})
        report = self.run_cli(1)
        self.assertEqual(report["image"]["diffRatio"], 0.25)
        self.assertTrue((self.root / "result/diff.png").is_file())
        statuses = {key: row["status"] for key, row in report["metrics"]["values"].items()}
        self.assertEqual(statuses, {"button.height": "missing", "button.width": "different",
                                    "form.gap": "unexpected"})

    def test_different_image_dimensions_fail(self):
        Image.new("RGBA", (3, 2), "white").save(self.root / "capture.png")
        self.assertEqual(self.run_cli(1)["image"]["reason"], "size mismatch")

    def test_invalid_threshold_creates_no_report(self):
        self.manifest["image"]["maxDiffRatio"] = 2
        self.run_cli(2)
        self.assertFalse((self.root / "result").exists())


if __name__ == "__main__":
    unittest.main()
