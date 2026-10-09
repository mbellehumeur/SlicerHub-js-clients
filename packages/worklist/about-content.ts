import {
  HUB_DEFINITIONS,
  hubOriginFromEndpoint,
  IDC_AGENT_URL,
  LOG_PREFIX,
  shouldUseSameOriginHub,
} from './config';

const DEFAULT_ABOUT_NAME = 'Hub Interface worklist example client';
const DEFAULT_ABOUT_DESCRIPTION =
  '3D Slicer extension for desktop integration workflows for healthcare providers and researchers.';
const DEFAULT_ABOUT_HOMEPAGE =
  'https://github.com/hub-interface/SlicerHub/';

const IDC_PORTAL_URL = 'https://portal.imaging.datacommons.cancer.gov/';
const KITWARE_DATA_URL = 'https://data.kitware.com/';
const TOTALSEG_CT_PAPER_URL = 'https://arxiv.org/abs/2208.05868';
const TOTALSEG_MRI_PAPER_URL = 'https://arxiv.org/abs/2405.19492';
const NNUNET_PAPER_URL = 'https://arxiv.org/abs/1809.10486';
const IDC_INDEX_URL = 'https://github.com/ImagingDataCommons/idc-index';
const IDC_PAPER_URL = 'https://doi.org/10.1148/rg.230180';
const SLICERLIVE_GITHUB_URL = 'https://github.com/pieper/SlicerLive';
const SLICERLIVE_GALLERY_URL = 'https://pieper.github.io/live';
const SLICERHEART_GITHUB_URL = 'https://github.com/SlicerHeart/SlicerHeart';
const SLICERHEART_PAPER_URL = 'https://doi.org/10.3389/fcvm.2022.886549';
const OHIF_URL = 'https://ohif.org/';
const SLIM_GITHUB_URL = 'https://github.com/ImagingDataCommons/slim';

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function aboutLicenseAckHtml(homepage: string): string {
  const licenseUrl = `${String(homepage || '').replace(/\/$/, '')}/blob/main/LICENSE`;
  return `
    <div class="about-disclaimer">
      <h4>License</h4>
      <p>Hub Interface is distributed under the <a href="${escapeHtml(licenseUrl)}" target="_blank" rel="noopener noreferrer">MIT License</a>.</p>
      <h4>Acknowledgements</h4>
      <p><strong>3D Slicer</strong> &mdash; open-source platform for medical image computing from the <a href="https://www.slicer.org/" target="_blank" rel="noopener noreferrer">3D Slicer community</a>.</p>
      <p><strong>OHIF</strong> &mdash; open-source zero-footprint viewer from the <a href="${escapeHtml(OHIF_URL)}" target="_blank" rel="noopener noreferrer">Open Health Imaging Foundation</a>.</p>
      <p><strong>Slim</strong> &mdash; interoperable slide microscopy viewer from the <a href="${escapeHtml(SLIM_GITHUB_URL)}" target="_blank" rel="noopener noreferrer">Imaging Data Commons</a> (National Cancer Institute).</p>
      <p><strong>SlicerLive</strong> &mdash; live 3D Slicer scenes on the web (render MRML/MRB in the browser, no install). See <a href="${escapeHtml(SLICERLIVE_GITHUB_URL)}" target="_blank" rel="noopener noreferrer">github.com/pieper/SlicerLive</a> and the <a href="${escapeHtml(SLICERLIVE_GALLERY_URL)}" target="_blank" rel="noopener noreferrer">SlicerLive gallery</a>.</p>
      <p><strong>SlicerHeart</strong> &mdash; 3D Slicer extension for cardiac image analysis and modeling. See <a href="${escapeHtml(SLICERHEART_GITHUB_URL)}" target="_blank" rel="noopener noreferrer">github.com/SlicerHeart/SlicerHeart</a>. If you use it in research, cite Lasso A, et al., <em>Frontiers in Cardiovascular Medicine</em> (<a href="${escapeHtml(SLICERHEART_PAPER_URL)}" target="_blank" rel="noopener noreferrer">2022</a>).</p>
    </div>`;
}

const ABOUT_SAMPLE_DATA_ACK_HTML = `
  <div class="about-disclaimer">
    <h4>Sample data acknowledgement</h4>
    <p>Worklist demo studies are provided courtesy of the <a href="${escapeHtml(IDC_PORTAL_URL)}" target="_blank" rel="noopener noreferrer">Imaging Data Commons</a> (National Cancer Institute) and the <a href="${escapeHtml(KITWARE_DATA_URL)}" target="_blank" rel="noopener noreferrer">Kitware sample data repository</a>. IDC entries are loaded from public IDC collections; VolView sample entries mirror datasets hosted on Kitware&rsquo;s data portal. The hub example does not redistribute these studies; it links to or loads them from their original sources.</p>
  </div>`;

const ABOUT_RESOURCE_SERVERS_ACK_HTML = `
  <div class="about-disclaimer">
    <h4>Service providers acknowledgement</h4>
    <p><strong>TotalSegmentator</strong> was created by the Department of Research and Analysis at University Hospital Basel. If you use it, please cite our Radiology: Artificial Intelligence paper (<a href="${escapeHtml(TOTALSEG_CT_PAPER_URL)}" target="_blank" rel="noopener noreferrer">free preprint</a>). If you use it for MR images, please cite the TotalSegmentator MRI <em>Radiology</em> paper (<a href="${escapeHtml(TOTALSEG_MRI_PAPER_URL)}" target="_blank" rel="noopener noreferrer">free preprint</a>).</p>
    <p><strong>nnU-Net</strong> &mdash; TotalSegmentator is heavily based on nnU-Net; (<a href="${escapeHtml(NNUNET_PAPER_URL)}" target="_blank" rel="noopener noreferrer">preprint</a>).</p>
    <p><strong>IDC Claude / NL search</strong> &mdash; Anthropic on the Slicer hub translates natural-language IDC requests into a structured SearchQuery; the worklist executes it against the public IDC REST API. Query guidance follows the <a href="${escapeHtml(IDC_AGENT_URL)}" target="_blank" rel="noopener noreferrer">IDC AI assistants</a> docs.</p>
    <p><strong>idc-index</strong> &mdash; official Imaging Data Commons Python package for local DuckDB SQL against IDC metadata and DICOM series download URLs; used by the IDC Claude service provider. If you use it in research, cite Fedorov A, et al., <em>Radiographics</em> (<a href="${escapeHtml(IDC_PAPER_URL)}" target="_blank" rel="noopener noreferrer">2023</a>). See also <a href="${escapeHtml(IDC_INDEX_URL)}" target="_blank" rel="noopener noreferrer">idc-index</a>.</p>
  </div>`;

const ABOUT_TRADEMARK_HTML = `
  <div class="about-disclaimer">
    <h4>Standards and trademarks</h4>
    <p>DICOM&reg; is the registered trademark of the National Electrical Manufacturers Association (NEMA) for its standards publications relating to digital imaging and communications in medicine. FHIR&reg; and related HL7 marks are registered trademarks of Health Level Seven International (HL7). IHE&reg; is a registered trademark of HIMSS. VolView&reg; is a trademark of Kitware, Inc. OHIF&reg; is a trademark of the Open Health Imaging Foundation. Imaging Data Commons&reg; is a trademark of the National Cancer Institute.</p>
    <p>The Hub Interface (including its hub, clients, and documentation) references ideas, workflows, and vocabulary drawn from these standards&mdash;such as DICOM objects and metadata, FHIR and FHIRcast-style context and events, and IHE actor roles (for example, Image Display and Evidence Creator)&mdash;and product names such as VolView, OHIF, and Imaging Data Commons solely to describe interoperability behavior.</p>
    <p><strong>Hub Interface is not part of these standards.</strong> It is not published by NEMA, HL7, or HIMSS, and is not an IHE Integration Profile, a FHIR implementation guide, or a DICOM conformance statement. Use of standard names and terms does not imply endorsement, certification, or official status. All other product and company names are trademarks of their respective owners.</p>
  </div>`;

type AboutMeta = {
  name: string;
  description: string;
  homepage: string;
};

/** Hub origin for About metadata / banner (standalone page or worklist session). */
export function resolveAboutHubOrigin(
  location: Location = window.location
): string | null {
  if (shouldUseSameOriginHub(location)) {
    return location.origin;
  }
  return hubOriginFromEndpoint(HUB_DEFINITIONS.local.hubEndpoint);
}

async function fetchAboutMeta(origin: string | null): Promise<AboutMeta> {
  const meta: AboutMeta = {
    name: DEFAULT_ABOUT_NAME,
    description: DEFAULT_ABOUT_DESCRIPTION,
    homepage: DEFAULT_ABOUT_HOMEPAGE,
  };
  if (!origin) return meta;
  try {
    const response = await fetch(`${origin}/api/hub/admin/about`);
    if (!response.ok) return meta;
    const data = (await response.json()) as Record<string, unknown>;
    if (data.name) meta.name = String(data.name);
    if (data.description) meta.description = String(data.description);
    if (data.homepage) meta.homepage = String(data.homepage);
  } catch (err) {
    console.warn(`${LOG_PREFIX} About metadata unavailable:`, err);
  }
  return meta;
}

function aboutBannerSrc(origin: string | null): string {
  const base = origin || '';
  return `${base}/static/images/banner_dark.png`;
}

function renderAboutContent(
  content: HTMLElement,
  titleEl: HTMLElement | null,
  meta: AboutMeta,
  origin: string | null
): void {
  if (titleEl) {
    titleEl.textContent = `About ${meta.name}`;
  }
  content.innerHTML = `
    <div class="about-banner-wrap">
      <img class="about-banner" src="${escapeHtml(aboutBannerSrc(origin))}"
           alt="${escapeHtml(meta.name)}">
    </div>
    <p class="about-body">${escapeHtml(meta.description)} This Integrated Worklist client connects to a Slicer hub as <code>WORKLIST_CLIENT</code>. See the <a href="${escapeHtml(meta.homepage)}" target="_blank" rel="noopener noreferrer">3D Slicer Hub interface extension</a> documentation.</p>
    ${aboutLicenseAckHtml(meta.homepage)}
    ${ABOUT_SAMPLE_DATA_ACK_HTML}
    ${ABOUT_RESOURCE_SERVERS_ACK_HTML}
    ${ABOUT_TRADEMARK_HTML}
  `;
}

/**
 * Fill an About content root from hub `/api/hub/admin/about`.
 */
export async function fillAboutContent(
  content: HTMLElement,
  titleEl: HTMLElement | null,
  origin: string | null
): Promise<void> {
  content.innerHTML = `<p class="wl-muted">Loading…</p>`;
  const meta = await fetchAboutMeta(origin);
  renderAboutContent(content, titleEl, meta, origin);
}

/** Mount About into ``#aboutPageContent`` / ``#aboutPageTitle`` on about.html. */
export async function mountAboutPage(
  root: ParentNode = document,
  location: Location = window.location
): Promise<void> {
  const content = root.querySelector(
    '#aboutPageContent'
  ) as HTMLElement | null;
  const titleEl = root.querySelector('#aboutPageTitle') as HTMLElement | null;
  if (!content) return;
  const origin = resolveAboutHubOrigin(location);
  await fillAboutContent(content, titleEl, origin);
}
