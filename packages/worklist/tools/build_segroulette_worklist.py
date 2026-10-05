#!/usr/bin/env python3
"""Build slim, size-sorted segroulette-worklist.json for the Cast worklist.

Reads segroulette-idc.json (enriched) + uses the same CHEST subcategory /
body-region rules as worklist/config.ts. Drops ctIdx/segIdx and other
list-unused fields. Output rows are already in ascending sizeMB order.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# Keep in sync with worklist/config.ts IDC_CHEST_SUBCATEGORIES / IDC_CATEGORIES.
CHEST_SUBCATEGORIES = [
    {
        "id": "CHEST:NODULES_LIDC",
        "namePrefix": "CHEST · Nodules",
        "collections": ["lidc_idri"],
    },
    {
        "id": "CHEST:MEDIASTINAL_LN",
        "namePrefix": "CHEST · Mediastinal LN",
        "collections": ["mediastinal_lymph_node_seg"],
    },
    {
        "id": "CHEST:NLST_TOTALSEG",
        "namePrefix": "CHEST · NLST",
        "collections": ["nlst"],
    },
    {
        "id": "CHEST:AIMI_LUNG_FDG",
        "namePrefix": "CHEST · AIMI",
        "collections": [
            "acrin_nsclc_fdg_pet",
            "lung_pet_ct_dx",
            "rider_lung_pet_ct",
        ],
    },
    {
        "id": "CHEST:OTHER",
        "namePrefix": "CHEST · Other",
        "collections": "other",
    },
]

BODY_REGIONS = {
    "ABDOMEN",
    "ADRENAL",
    "BRAIN",
    "BREAST",
    "CHEST",
    "KIDNEY",
    "LIVER",
    "LUNG",
    "PANCREAS",
    "PELVIS",
    "PROSTATE",
    "WHOLEBODY",
}

EXCLUDED_REGIONS = {"SPINE", "MEDIASTINUM"}

# Collection → worklist subcategory (keeps KiTS out of plain ABDOMEN).
# Keep in sync with worklist/config.ts IDC_KITS_CATEGORY.
COLLECTION_SUBCATEGORIES = {
    "c4kc_kits": {
        "id": "KIDNEY:KITS",
        "namePrefix": "KiTS",
    },
}

# Bases that are further split by primary series modality (`m`).
# Keep in sync with worklist/config.ts IDC_MODALITY_SPLIT_BASES.
MODALITY_SPLIT_BASES = {
    "ABDOMEN",
    "BREAST",
    "LIVER",
    "LUNG",
    "CHEST:AIMI_LUNG_FDG",
    "CHEST:OTHER",
}

ROW_KEYS = (
    "c",
    "s",
    "m",
    "col",
    "cb",
    "sb",
    "st",
    "sd",
    "pid",
    "sizeMB",
    "modalities",
)


def primary_region(loc: str | None) -> str:
    raw = (loc or "").strip()
    if not raw:
        return "OTHER"
    first = raw.split(",")[0].strip().upper()
    return first or "OTHER"


def chest_map() -> dict[str, dict]:
    out: dict[str, dict] = {}
    other = None
    for sub in CHEST_SUBCATEGORIES:
        if sub["collections"] == "other":
            other = sub
            continue
        for col in sub["collections"]:
            out[col] = sub
    assert other is not None
    return out, other  # type: ignore[return-value]


def with_modality_split(
    idc_category: str, name_prefix: str, row: dict
) -> tuple[str, str]:
    if idc_category not in MODALITY_SPLIT_BASES:
        return idc_category, name_prefix
    modality = str(row.get("m") or "").strip().upper()
    if not modality or modality == "SEG":
        return idc_category, name_prefix
    return f"{idc_category}:{modality}", f"{name_prefix} · {modality}"


def slim_row(row: dict, idc_category: str, name_prefix: str) -> dict:
    out = {k: row[k] for k in ROW_KEYS if row.get(k) is not None}
    out["idcCategory"] = idc_category
    out["namePrefix"] = name_prefix
    return out


def size_key(row: dict) -> tuple[int, float]:
    v = row.get("sizeMB")
    try:
        n = float(v)
    except (TypeError, ValueError):
        return (1, 0.0)
    if n != n:  # NaN
        return (1, 0.0)
    return (0, n)


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument(
        "--input",
        type=Path,
        default=ROOT / "segroulette-idc.json",
        help="Enriched SegRoulette catalog",
    )
    ap.add_argument(
        "--output",
        type=Path,
        default=ROOT / "segroulette-worklist.json",
        help="Slim worklist catalog",
    )
    args = ap.parse_args()

    data = json.loads(args.input.read_text(encoding="utf-8"))
    rows = data.get("rows") if isinstance(data, dict) else data
    if not isinstance(rows, list):
        raise SystemExit("input has no rows[]")
    coll_meta = ((data.get("stats") or {}).get("collMeta") or {}) if isinstance(data, dict) else {}

    col_to_sub, chest_other = chest_map()
    out_rows: list[dict] = []
    for row in rows:
        if not isinstance(row, dict) or not row.get("c") or not row.get("col"):
            continue
        col = str(row["col"]).strip()
        meta = coll_meta.get(row["col"]) or {}
        region = primary_region(meta.get("loc"))
        if region in EXCLUDED_REGIONS or region not in BODY_REGIONS:
            continue
        coll_sub = COLLECTION_SUBCATEGORIES.get(col)
        if coll_sub:
            idc_category = coll_sub["id"]
            name_prefix = coll_sub["namePrefix"]
        elif region == "CHEST":
            sub = col_to_sub.get(col, chest_other)
            idc_category = sub["id"]
            name_prefix = sub["namePrefix"]
        else:
            idc_category = region
            name_prefix = region
        idc_category, name_prefix = with_modality_split(
            idc_category, name_prefix, row
        )
        out_rows.append(slim_row(row, idc_category, name_prefix))

    out_rows.sort(key=size_key)

    payload = {
        "version": 1,
        "sortedBy": "sizeMB",
        "sortOrder": "asc",
        "rows": out_rows,
    }
    args.output.write_text(
        json.dumps(payload, separators=(",", ":"), ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(
        f"Wrote {args.output} · {len(out_rows)} rows · "
        f"{args.output.stat().st_size / 1e6:.2f} MB"
    )


if __name__ == "__main__":
    main()
