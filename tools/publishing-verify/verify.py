import argparse
import json
import math
from pathlib import Path
import sys

from PIL import Image, ImageChops


def read_object(path):
    def unique_object(pairs):
        result = {}
        for key, value in pairs:
            if key in result:
                raise ValueError(f"{path}: duplicate key {key!r}")
            result[key] = value
        return result

    value = json.loads(path.read_text(encoding="utf-8-sig"), object_pairs_hook=unique_object)
    if not isinstance(value, dict) or not value:
        raise ValueError(f"{path}: expected a non-empty JSON object")
    return value


def number(value, label, minimum=None, maximum=None):
    if type(value) not in (int, float) or not math.isfinite(value):
        raise ValueError(f"{label}: expected a finite number")
    if minimum is not None and value < minimum:
        raise ValueError(f"{label}: minimum is {minimum}")
    if maximum is not None and value > maximum:
        raise ValueError(f"{label}: maximum is {maximum}")
    return value


def options(manifest, key, allowed):
    config = manifest[key]
    if not isinstance(config, dict) or config.keys() - allowed:
        raise ValueError(f"{key}: expected an object with fields {sorted(allowed)}")
    return config


def input_path(base, config, key):
    value = config[key]
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{key}: expected a file path")
    return base / value


def read_png(path):
    with Image.open(path, formats=["PNG"]) as source:
        if getattr(source, "n_frames", 1) != 1:
            raise ValueError(f"{path}: expected a single-frame PNG")
        return source.convert("RGBA")


def compare_images(base, config):
    channel_limit = number(config.get("channelTolerance", 0), "channelTolerance", 0, 255)
    if type(channel_limit) is not int:
        raise ValueError("channelTolerance: expected an integer")
    ratio_limit = number(config.get("maxDiffRatio", 0), "maxDiffRatio", 0, 1)
    expected = read_png(input_path(base, config, "expected"))
    actual = read_png(input_path(base, config, "actual"))
    result = {
        "expectedSize": expected.size,
        "actualSize": actual.size,
        "channelTolerance": channel_limit,
        "maxDiffRatio": ratio_limit,
    }
    if expected.size != actual.size:
        return {**result, "passed": False, "reason": "size mismatch"}, None

    # Ignore invisible RGB values by comparing both images over black and white.
    mask = Image.new("L", expected.size)
    for background in ("black", "white"):
        canvas = Image.new("RGBA", expected.size, background)
        reference = Image.alpha_composite(canvas, expected).convert("RGB")
        rendered = Image.alpha_composite(canvas, actual).convert("RGB")
        for channel in ImageChops.difference(reference, rendered).split():
            mask = ImageChops.lighter(mask, channel)
    mask = mask.point([255 if value > channel_limit else 0 for value in range(256)])
    changed = mask.histogram()[255]
    pixels = expected.width * expected.height
    ratio = changed / pixels
    diff = None
    if changed:
        diff = Image.blend(actual.convert("L").convert("RGB"), Image.new("RGB", actual.size, "white"), 0.75)
        diff.paste("red", mask=mask)
        result["diffImage"] = "diff.png"
    return {**result, "passed": ratio <= ratio_limit, "differentPixels": changed,
            "totalPixels": pixels, "diffRatio": ratio}, diff


def compare_metrics(base, config):
    expected = read_object(input_path(base, config, "expected"))
    actual = read_object(input_path(base, config, "actual"))
    tolerances = config.get("tolerances", {})
    if not isinstance(tolerances, dict) or tolerances.keys() - expected.keys():
        raise ValueError("tolerances: expected an object keyed by expected metric names")
    for label, values in (("expected", expected), ("actual", actual)):
        for key, value in values.items():
            number(value, f"{label}.{key}")
    for key, value in tolerances.items():
        number(value, f"tolerances.{key}", 0)

    rows = {}
    for key in sorted(expected.keys() | actual.keys()):
        if key not in expected or key not in actual:
            rows[key] = {"expected": expected.get(key), "actual": actual.get(key),
                         "status": "missing" if key in expected else "unexpected"}
            continue
        delta = number(actual[key] - expected[key], f"delta.{key}")
        tolerance = tolerances.get(key, 0)
        rows[key] = {"expected": expected[key], "actual": actual[key], "delta": delta,
                     "tolerance": tolerance, "status": "pass" if abs(delta) <= tolerance else "different"}
    return {"passed": all(row["status"] == "pass" for row in rows.values()), "values": rows}


def verify(manifest_path, output):
    manifest = read_object(manifest_path)
    if manifest.keys() - {"case", "context", "image", "metrics"}:
        raise ValueError("manifest: unknown fields")
    case = manifest["case"]
    if not isinstance(case, str) or not case.strip():
        raise ValueError("case: expected a non-empty screen/state identifier")
    context = manifest.get("context", {})
    if not isinstance(context, dict):
        raise ValueError("context: expected an object")
    if not manifest.keys() & {"image", "metrics"}:
        raise ValueError("manifest: add image or metrics")

    base = manifest_path.parent
    results = {}
    diff = None
    if "image" in manifest:
        config = options(manifest, "image", {"expected", "actual", "channelTolerance", "maxDiffRatio"})
        results["image"], diff = compare_images(base, config)
    if "metrics" in manifest:
        config = options(manifest, "metrics", {"expected", "actual", "tolerances"})
        results["metrics"] = compare_metrics(base, config)

    passed = all(result["passed"] for result in results.values())
    report = {"case": case, "context": context, "passed": passed, **results}
    report_json = json.dumps(report, indent=2, ensure_ascii=False, allow_nan=False)
    output.mkdir(parents=True, exist_ok=False)
    if diff is not None:
        diff.save(output / "diff.png")
    (output / "report.json").write_text(report_json + "\n", encoding="utf-8")
    print(f"{'PASS' if passed else 'FAIL'}: {case} ({output / 'report.json'})")
    return 0 if passed else 1


def main():
    parser = argparse.ArgumentParser(description="Verify one screen state against PNG and numeric baselines.")
    parser.add_argument("manifest", type=Path)
    parser.add_argument("--output", required=True, type=Path, help="New directory for the comparison results.")
    args = parser.parse_args()
    try:
        return verify(args.manifest, args.output)
    except (OSError, ValueError, KeyError, OverflowError, Image.DecompressionBombError) as error:
        print(f"Verification error: {error}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
