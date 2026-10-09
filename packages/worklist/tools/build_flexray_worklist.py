"""Freeze ~20 public IDC CR/DX series into flexray-manifest.json.

The official FleXray browser demo uses PNG samples (AC joints, oblique neck,
hands & wrists), not DICOM. This worklist instead opens IDC CR/DX series that
cover similar anatomy (shoulder, C-spine, chest, hip, extremities, spine).
IDC has no public hand/wrist CR/DX series.

Requires: pip install idc-index
"""
from __future__ import annotations

import json
from pathlib import Path

from idc_index import IDCClient

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "flexray-manifest.json"

c = IDCClient()

SLOTS = [
    (
        "chest-pa-dx",
        "Chest PA · DX",
        "IDC lidc_idri · DX chest PA",
        """
        collection_id='lidc_idri' AND Modality='DX' AND BodyPartExamined='CHEST'
        AND (LOWER(COALESCE(StudyDescription,'')) LIKE '%pa%'
             OR LOWER(COALESCE(SeriesDescription,'')) LIKE '%pa%')
        AND instanceCount=1
        """,
    ),
    (
        "chest-pa-cr",
        "Chest PA · CR",
        "IDC covid_19_ar · CR chest PA",
        """
        collection_id='covid_19_ar' AND Modality='CR' AND BodyPartExamined='CHEST'
        AND LOWER(COALESCE(StudyDescription,'')) LIKE '%chest pa%'
        AND instanceCount=1
        """,
    ),
    (
        "chest-ap-portable-cr",
        "Chest AP portable · CR",
        "IDC covid_19_ar · CR chest AP portable",
        """
        collection_id='covid_19_ar' AND Modality='CR'
        AND LOWER(COALESCE(StudyDescription,'')) LIKE '%chest ap portable%'
        AND instanceCount=1
        """,
    ),
    (
        "chest-ap-dx",
        "Chest AP · DX",
        "IDC midrc_ricord_1c · DX chest AP",
        """
        collection_id='midrc_ricord_1c' AND Modality='DX' AND BodyPartExamined='CHEST'
        AND LOWER(COALESCE(SeriesDescription,'')) LIKE '%ap%'
        AND instanceCount=1
        """,
    ),
    (
        "chest-lat-cr",
        "Chest LAT · CR",
        "IDC acrin_nsclc_fdg_pet · CR chest LAT",
        """
        collection_id='acrin_nsclc_fdg_pet' AND Modality='CR' AND BodyPartExamined='CHEST'
        AND LOWER(COALESCE(SeriesDescription,'')) LIKE '%lateral%'
        AND instanceCount=1
        """,
    ),
    (
        "ribs-oblique-cr",
        "Ribs oblique · CR",
        "IDC acrin_nsclc_fdg_pet · CR ribs",
        """
        collection_id='acrin_nsclc_fdg_pet' AND Modality='CR'
        AND LOWER(COALESCE(SeriesDescription,'')) LIKE '%rib%'
        AND instanceCount=1
        """,
    ),
    (
        "peds-chest-ap-cr",
        "Pediatric chest AP · CR",
        "IDC midrc_ricord_1c · CR pediatric chest AP",
        """
        collection_id='midrc_ricord_1c' AND Modality='CR'
        AND LOWER(COALESCE(SeriesDescription,'')) LIKE '%peds%'
        AND instanceCount=1
        """,
    ),
    (
        "abdomen-kub-cr",
        "Abdomen KUB AP · CR",
        "IDC covid_19_ny_sbu · CR abdomen supine KUB",
        """
        collection_id='covid_19_ny_sbu' AND Modality='CR' AND BodyPartExamined='ABDOMEN'
        AND LOWER(COALESCE(StudyDescription,'')) LIKE '%kub%'
        AND instanceCount=1
        """,
    ),
    (
        "abdomen-erect-dx",
        "Abdomen erect · DX",
        "IDC cmb_crc · DX abdomen erect",
        """
        collection_id='cmb_crc' AND Modality='DX' AND BodyPartExamined='ABDOMEN'
        AND LOWER(COALESCE(SeriesDescription,'')) LIKE '%abdomen%'
        AND instanceCount=1
        """,
    ),
    (
        "pelvis-ap-cr",
        "Pelvis AP · CR",
        "IDC varepop_apollo · CR pelvis AP",
        """
        collection_id='varepop_apollo' AND Modality='CR' AND BodyPartExamined='PELVIS'
        AND instanceCount=1
        """,
    ),
    (
        "hip-ap-cr",
        "Hip AP · CR",
        "IDC varepop_apollo · CR hip AP",
        """
        collection_id='varepop_apollo' AND Modality='CR' AND BodyPartExamined='HIP'
        AND LOWER(COALESCE(SeriesDescription,'')) LIKE '%ap%'
        AND instanceCount=1
        """,
    ),
    (
        "cspine-lat-dx",
        "C-spine LAT · DX",
        "IDC varepop_apollo · DX cervical spine LAT",
        """
        collection_id='varepop_apollo' AND Modality='DX' AND BodyPartExamined='CSPINE'
        AND LOWER(COALESCE(SeriesDescription,'')) LIKE '%lat%'
        AND instanceCount=1
        """,
    ),
    (
        "cspine-ap-dx",
        "C-spine AP · DX",
        "IDC varepop_apollo · DX cervical spine AP",
        """
        collection_id='varepop_apollo' AND Modality='DX' AND BodyPartExamined='CSPINE'
        AND LOWER(COALESCE(SeriesDescription,'')) LIKE '%spine ap%'
        AND instanceCount=1
        """,
    ),
    (
        "lspine-lat-cr",
        "L-spine LAT · CR",
        "IDC cmb_mml · CR lumbar spine LAT",
        """
        collection_id='cmb_mml' AND Modality='CR' AND BodyPartExamined='LSPINE'
        AND LOWER(COALESCE(SeriesDescription,'')) LIKE '%lat%'
        AND instanceCount=1
        """,
    ),
    (
        "lspine-ap-cr",
        "L-spine AP · CR",
        "IDC cmb_mml · CR lumbar spine AP",
        """
        collection_id='cmb_mml' AND Modality='CR' AND BodyPartExamined='LSPINE'
        AND LOWER(COALESCE(SeriesDescription,'')) LIKE '%ap%'
        AND instanceCount=1
        """,
    ),
    (
        "tspine-lat-cr",
        "T-spine LAT · CR",
        "IDC cmb_mml · CR thoracic spine LAT",
        """
        collection_id='cmb_mml' AND Modality='CR' AND BodyPartExamined='TSPINE'
        AND instanceCount=1
        """,
    ),
    (
        "shoulder-ap-dx",
        "Shoulder AP · DX",
        "IDC varepop_apollo · DX shoulder AP",
        """
        collection_id='varepop_apollo' AND Modality='DX' AND BodyPartExamined='SHOULDER'
        AND LOWER(COALESCE(SeriesDescription,'')) LIKE '%external%'
        AND instanceCount=1
        """,
    ),
    (
        "elbow-ap-cr",
        "Elbow AP · CR",
        "IDC varepop_apollo · CR elbow AP",
        """
        collection_id='varepop_apollo' AND Modality='CR' AND BodyPartExamined='ELBOW'
        AND instanceCount=1
        """,
    ),
    (
        "femur-cr",
        "Femur · CR",
        "IDC cmb_mml · CR femur",
        """
        collection_id='cmb_mml' AND Modality='CR' AND BodyPartExamined='FEMUR'
        """,
    ),
    (
        "skull-lat-cr",
        "Skull LAT · CR",
        "IDC cmb_mml · CR skull LAT",
        """
        collection_id='cmb_mml' AND Modality='CR' AND BodyPartExamined='SKULL'
        AND LOWER(COALESCE(SeriesDescription,'')) LIKE '%lat%'
        AND instanceCount=1
        """,
    ),
]

used_series = set()
studies = []
for slot_id, name, desc, where in SLOTS:
    q = f"""
    SELECT collection_id, Modality, BodyPartExamined,
      COALESCE(SeriesDescription,'') AS SeriesDescription,
      COALESCE(StudyDescription,'') AS StudyDescription,
      PatientID, StudyInstanceUID, SeriesInstanceUID,
      crdc_series_uuid, aws_bucket, ROUND(series_size_MB,1) AS mb,
      instanceCount, license_short_name
    FROM index
    WHERE Modality IN ('CR','DX')
      AND (analysis_result_id IS NULL OR analysis_result_id = '')
      AND ({where})
    ORDER BY series_size_MB, SeriesInstanceUID
    """
    df = c.sql_query(q)
    row = None
    for rec in df.to_dict("records"):
        if rec["SeriesInstanceUID"] in used_series:
            continue
        row = rec
        break
    if row is None:
        print("MISSING", slot_id)
        continue
    used_series.add(row["SeriesInstanceUID"])
    bucket = str(row["aws_bucket"] or "idc-open-data").replace("s3://", "").split("/")[0]
    studies.append(
        {
            "id": f"flexray-{slot_id}",
            "name": name,
            "description": desc,
            "format": "DICOM",
            "modalities": [str(row["Modality"])],
            "openMode": "idc",
            "size": f"{int(round(float(row['mb'])))} MB",
            "studyInstanceUID": row["StudyInstanceUID"],
            "seriesInstanceUID": row["SeriesInstanceUID"],
            "ctCrdc": row["crdc_series_uuid"],
            "bucket": bucket,
            "collection": row["collection_id"],
        }
    )
    print(
        f"{slot_id:22} {row['collection_id']:22} {row['Modality']} n={row['instanceCount']} "
        f"{row['mb']}MB  {row['SeriesDescription']!r} / {row['StudyDescription']!r}  {bucket}"
    )

print("\ncount", len(studies))
out = {
    "organization": "flexray",
    "organizationLabel": "FleXray",
    "studies": studies,
}
OUT.write_text(json.dumps(out, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
print(f"wrote {OUT}")
