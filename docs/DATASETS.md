# Dataset provenance and interpretation

All 77,950 included rows have `provenance=SIMULATED`:

| File | Rows | Role |
| --- | ---: | --- |
| train_healthy.csv | 12,000 | Healthy-label playback |
| train_faults.csv | 43,950 | Mixed healthy/fault playback |
| test_scenarios.csv | 22,000 | Mixed scenario playback |

These names do not demonstrate an actual training/evaluation pipeline. No trained model is present. The checked-in CSV values and file names are preserved.

Run `python scripts/validate_datasets.py --check` to validate required columns, all numeric cells, finite values, throttle/severity ranges, provenance, inventory and SHA-256 hashes after CRLF-to-LF newline normalization. `docs/dataset-inventory.json` records columns, runs, labels and counts. Regenerate intentionally with `python scripts/validate_datasets.py` after reviewing dataset edits. Checks establish file integrity and software compatibility, not scientific accuracy.

The `true_*` column names are inherited source labels; they are not evidence of measured ground truth. The original generator, random seed, physical parameter source, sensor calibration, fault injection methodology and independent licensing/provenance records are absent. Obtain these from the dataset authors before making scientific or redistribution claims beyond the repository's existing license.

Future model evaluation must separate runs (not randomly mixed time samples), audit train/test overlap, document each fault definition, choose metrics and thresholds before evaluating, and retain reproducible predictions. Until then, do not claim accuracy, false-alarm rate, prognostic quality or aircraft applicability.
