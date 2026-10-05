# IDC REST API Search Guide

A compact implementation guide for building an Imaging Data Commons
(IDC) search UI without requiring an LLM or MCP client.

## References

-   Interactive REST API documentation (Swagger):\
    https://api.imaging.datacommons.cancer.gov/v3/docs
-   OpenAPI specification:\
    https://api.imaging.datacommons.cancer.gov/v3/openapi.json
-   IDC REST/MCP repository:\
    https://github.com/ImagingDataCommons/IDC-REST-MCP
-   API user guide:\
    https://github.com/ImagingDataCommons/IDC-REST-MCP/blob/main/docs/user-guide.md

Base URL:

``` text
https://api.imaging.datacommons.cancer.gov
```

## Recommended application architecture

``` text
User
  |
  v
Search / Filter UI
  |
  v
Application query model
  |
  v
IDC REST API
  |
  v
IDC
  |
  +--> Worklist / search results
  |
  +--> Viewer (for example OHIF)
```

MCP or an AI agent is not required for this architecture. The UI can
call the deterministic REST endpoints directly.

## Core endpoints for a search UI

### Discover available attributes

``` http
GET /v3/attributes
```

Use this at application startup (or cache the result) to discover which
IDC attributes can be searched and what kinds of filters they support.

The application should not expose every attribute at once. Present a
curated set of common filters and make the rest available through an
**Add filter** control.

Suggested initial UI:

``` text
Collection       [ Any      v ]
Modality         [ Any      v ]
Body part        [ Any      v ]
Analysis data    [ Any      v ]

+ Add filter
```

### Discover values for an attribute

``` http
GET /v3/attributes/{attribute}/values
```

Example:

``` http
GET /v3/attributes/Modality/values
```

Use this when the user opens a filter. This lets the UI obtain valid IDC
values dynamically rather than maintaining hard-coded lists.

Conceptual UI:

``` text
Modality

[ ] CT
[ ] MR
[ ] PT
[ ] SEG
...
```

Another example:

``` http
GET /v3/attributes/BodyPartExamined/values
```

The UI can provide a search box when an attribute has many possible
values.

## Collections

``` http
GET /v3/collections
GET /v3/collections/{id}
```

Use these endpoints to provide collection discovery and collection
metadata.

A collection selector can be more useful than a single large dropdown:

``` text
Collections

[ Search collections... ]

Breast
  [ ] Duke-Breast-Cancer-MRI
  [ ] TCGA-BRCA

Lung
  [ ] NLST
  [ ] NSCLC-Radiomics

Brain
  [ ] TCGA-GBM
  [ ] TCGA-LGG
```

## Analysis results / derived data

``` http
GET /v3/analysis_results
```

Use this to discover derived datasets and analysis results.

For imaging users, consider presenting these as higher-level concepts
rather than forcing users to understand every DICOM object type:

``` text
Associated data

[ ] Segmentations
[ ] Annotations
[ ] Radiotherapy structures
```

## Build a cohort

The UI should maintain an internal query object representing the
selected filters.

For example:

``` json
{
  "terms": {
    "Modality": ["MR"],
    "BodyPartExamined": ["BREAST"]
  }
}
```

Multiple values for one attribute represent OR-like selection, while
separate attributes combine to narrow the cohort.

Conceptually:

``` text
(MR OR CT)
AND
BRAIN
```

can be represented as:

``` json
{
  "terms": {
    "Modality": ["MR", "CT"],
    "BodyPartExamined": ["BRAIN"]
  }
}
```

Always confirm the exact current request schema in the Swagger/OpenAPI
documentation before implementing the client.

## Get cohort counts

``` http
POST /v3/cohort/counts
```

Use the count operation as the user modifies filters so that the
interface can provide immediate feedback.

Example UI:

``` text
Modality: MR
Body part: BREAST

1,284 patients
1,910 studies
4,822 series
```

Recommended interaction:

``` text
User changes filter
       |
       v
Update local query model
       |
       v
POST /v3/cohort/counts
       |
       v
Update matching counts
```

Debounce rapid UI changes so that typing or quickly selecting several
filters does not generate unnecessary requests.

## Retrieve matching data

Use the cohort/manifest functionality exposed by the current v3 API to
retrieve the actual matching series and retrieval information.

Consult Swagger for the exact current endpoint and request/response
schema:

https://api.imaging.datacommons.cancer.gov/v3/docs

The resulting data can feed an imaging-oriented worklist such as:

``` text
4,822 matching series

Collection       Patient       Study             Series
---------------------------------------------------------------
TCGA-BRCA        ...           1.2.840...        T1 MRI
TCGA-BRCA        ...           1.2.840...        T2 MRI
Duke-Breast      ...           1.2.840...        DCE MRI
Duke-Breast      ...           1.2.840...        ADC
```

Prefer server-side pagination rather than loading an entire large cohort
into the browser.

## Range filters

Some attributes are better represented as numeric or date ranges.

Example UI:

``` text
Magnetic field strength

Minimum [ 1.5 ] T
Maximum [ 3.0 ] T
```

Conceptually this could be represented by a query model such as:

``` json
{
  "terms": {
    "Modality": ["MR"]
  },
  "ranges": {
    "MagneticFieldStrength": {
      "gte": 1.5,
      "lte": 3.0
    }
  }
}
```

Use `/v3/attributes` and the OpenAPI schema to determine the exact
supported type and syntax for each attribute.

## Progressive filter UI

Do not display every IDC attribute simultaneously.

Recommended design:

``` text
Search IDC

Collection       [ Any      v ]
Modality         [ MR       v ]
Body part        [ BREAST   v ]

+ Add filter

-----------------------------------
1,910 studies / 4,822 series
-----------------------------------
```

When **Add filter** is selected:

``` text
Add filter

[ Search filters... ]

Suggested
  Manufacturer
  Magnetic field strength
  Study date
  Series description

Acquisition
  Slice thickness
  Contrast
  Manufacturer model

Advanced
  Show all IDC attributes
```

The available attributes should originate from the IDC API. The
application controls their labels, grouping, ranking, and progressive
disclosure.

## Suggested request flow

``` text
PAGE LOAD
    |
    +--> GET /v3/attributes
    |
    +--> GET /v3/collections
    |
    +--> GET /v3/analysis_results
    |
    v
Render search UI
    |
User opens Modality
    |
    v
GET /v3/attributes/Modality/values
    |
User selects MR
    |
    v
POST /v3/cohort/counts
    |
Display matching count
    |
User selects BREAST
    |
    v
POST /v3/cohort/counts
    |
Display new matching count
    |
User selects Show Results
    |
    v
Retrieve cohort/manifest results
    |
    v
Imaging worklist
    |
User selects study/series
    |
    v
Open/view imaging data
```

## Advanced queries

Simple attribute filtering will not represent every useful imaging
query.

Examples include questions involving relationships between source images
and derived objects, specialized analysis-result metadata, joins,
grouping, or other relational conditions.

IDC exposes SQL/table-oriented capabilities for these advanced cases.
Check the current Swagger documentation for the available `/v3` table
and SQL endpoints and their schemas.

The application can hide this distinction:

``` text
                         +--> Structured cohort filters
UI query model ----------+
                         +--> Advanced relational/SQL query
```

The user should still see a consistent search experience.

## Implementation recommendation

Keep the UI independent from IDC's wire format.

For example:

``` ts
interface SearchFilter {
  id: string;
  label: string;
  attribute: string;
  type: "term" | "range";
  values?: string[];
  min?: number;
  max?: number;
}

interface SearchQuery {
  filters: SearchFilter[];
}
```

Then create an IDC adapter:

``` text
UI SearchQuery
      |
      v
IDC query adapter
      |
      +--> cohort/count request
      +--> cohort/results request
      +--> advanced query when required
```

This separation is useful if a natural-language/AI search is added
later. Both the visual filter UI and an AI agent can produce the same
application-level query model:

``` text
Filter UI --------+
                  |
                  v
             SearchQuery
                  |
AI / MCP ---------+
                  |
                  v
             IDC adapter
                  |
                  v
             IDC REST API
```

## Important

Treat the live OpenAPI specification as authoritative for exact endpoint
paths, parameter names, and request/response schemas:

https://api.imaging.datacommons.cancer.gov/v3/openapi.json

The examples in this file describe the intended application architecture
and query flow; verify exact schemas against the current v3 API before
coding.
