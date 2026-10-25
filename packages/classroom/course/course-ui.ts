import { resolveStoredLocale } from '@slicer-hub/i18n';
import type { AppState } from '../hub';
import {
  getCourse,
  pickLocale,
  type CourseDefinition,
} from './registry';

function escapeHtml(s: string): string {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Escape a plane term and enlarge the leading a/b/c letter when enabled. */
function termLabelHtml(term: string, letterLabels: boolean): string {
  if (!letterLabels) return escapeHtml(term);
  const m = String(term || '').match(/^([abc])\s*-\s*(.*)$/i);
  if (!m) return escapeHtml(term);
  const letter = m[1]!.toLowerCase();
  const rest = m[2] ?? '';
  return `<span class="rp-plane-letter">${escapeHtml(letter)}</span> - ${escapeHtml(rest)}`;
}

const CAMERA_ICON = `<svg class="rp-activity-inline-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
  <path d="M4 8h3l1.5-2h7L17 8h3a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
  <circle cx="12" cy="14" r="3.5" stroke="currentColor" stroke-width="1.7"/>
</svg>`;

/** Same pen mark as IRA vanishing-brush / ICONS.marker. */
const BRUSH_ICON = `<svg class="rp-activity-inline-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M4 20l2.5-2.5 11-11 2.5 2.5-11 11L4 20z"/>
  <path d="M15.5 6.5l2.5 2.5"/>
  <path d="M5 19l1 1" stroke-width="2.2"/>
</svg>`;

function instructionStepHtml(text: string): string {
  return escapeHtml(text)
    .replace(/\{\{camera\}\}/g, CAMERA_ICON)
    .replace(/\{\{brush\}\}/g, BRUSH_ICON);
}

function stubGlossaryHtml(
  content: ReturnType<CourseDefinition['contentFor']>
): string {
  return `
    <div class="rp-section rp-course-stub">
      <p class="rp-planes-intro">${escapeHtml(content.intro)}</p>
      <p class="rp-muted">${escapeHtml(content.comingSoon || content.activityText)}</p>
    </div>`;
}

function glossaryHtml(state: AppState, locale: string): string {
  const course = getCourse(state.courseId);
  const content = course.contentFor(locale);
  if (!course.terms.length) {
    return stubGlossaryHtml(content);
  }

  const letterLabels = Boolean(content.letterLabels);
  const rows = course.terms
    .map((t) => {
      const selected =
        state.selectedTermId === t.id ? ' rp-term-row-selected' : '';
      const examples = t.examples
        .map((ex) => escapeHtml(pickLocale(ex, locale)))
        .join('<br/>');
      return `<tr class="rp-term-row${selected}" data-term-id="${escapeHtml(t.id)}" tabindex="0">
      <td>${termLabelHtml(pickLocale(t.term, locale), letterLabels)}</td>
      <td>${escapeHtml(pickLocale(t.definition, locale))}</td>
      <td>${examples}</td>
    </tr>`;
    })
    .join('');

  const figure =
    content.figureSrc
      ? `<figure class="rp-planes-figure">
          <img
            src="${escapeHtml(content.figureSrc)}"
            alt="${escapeHtml(content.figureAlt || '')}"
            ${content.figureWidth ? `width="${content.figureWidth}"` : ''}
            ${content.figureHeight ? `height="${content.figureHeight}"` : ''}
            loading="lazy"
          />
          ${
            content.figureCredit
              ? `<figcaption class="rp-planes-figure-credit">
            <a
              href="${escapeHtml(content.figureCreditHref || '#')}"
              target="_blank"
              rel="noopener noreferrer"
            >${escapeHtml(content.figureCredit)}</a>
          </figcaption>`
              : ''
          }
        </figure>`
      : '';

  const viewerFigure =
    content.viewerFigureSrc
      ? `<figure class="rp-viewer-figure">
          <img
            src="${escapeHtml(content.viewerFigureSrc)}"
            alt="${escapeHtml(content.viewerFigureAlt || '')}"
            ${content.viewerFigureWidth ? `width="${content.viewerFigureWidth}"` : ''}
            ${content.viewerFigureHeight ? `height="${content.viewerFigureHeight}"` : ''}
            loading="lazy"
          />
        </figure>`
      : '';

  const connected = state.connection === 'connected';
  const scanButtons = course.scans
    .map((scan) => {
      const titleAttr = scan.title
        ? ` title="${escapeHtml(scan.title)}"`
        : '';
      return `<button
            type="button"
            class="rp-viewer-btn"
            data-open-scene="${escapeHtml(scan.sceneKey)}"
            ${titleAttr}
            ${connected ? '' : 'disabled'}
          >${escapeHtml(pickLocale(scan.label, locale))}</button>`;
    })
    .join('');

  const instructions =
    content.instructionSteps.length > 0
      ? `<div class="rp-instructions-block">
            <span class="rp-instructions-label">${escapeHtml(content.instructionsLabel)}</span>
            <ol class="rp-instructions-list">
              ${content.instructionSteps
                .map((step) => `<li>${instructionStepHtml(step)}</li>`)
                .join('')}
            </ol>
          </div>`
      : '';

  const note = state.courseDemoNote
    ? `<p class="rp-muted rp-course-note">${escapeHtml(state.courseDemoNote)}</p>`
    : '';

  return `
    <div class="rp-section rp-planes-section">
      <p class="rp-planes-intro">${escapeHtml(content.intro)}</p>
      <div class="rp-planes-table-row">
        <div class="rp-table-wrap">
          <table class="rp-table rp-term-table">
            <thead>
              <tr>
                <th>${escapeHtml(content.colTerm)}</th>
                <th>${escapeHtml(content.colDefinition)}</th>
                <th>${escapeHtml(content.colExamples)}</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
        ${figure}
      </div>
      <div class="rp-activity-instructions-row">
        <div class="rp-activity-instructions-copy">
          <div class="rp-activity-row">
            <span class="rp-activity-label">${escapeHtml(content.activityLabel)}</span>
            <span class="rp-activity-text">${escapeHtml(content.activityText)}</span>
          </div>
          ${instructions}
        </div>
        ${viewerFigure}
      </div>
      ${
        scanButtons
          ? `<div class="rp-view-scan-block">
        <div class="rp-view-scan-buttons">${scanButtons}</div>
      </div>`
          : ''
      }
      ${note}
    </div>`;
}

export function renderCoursePanel(
  glossaryContainer: HTMLElement | null,
  state: AppState
): void {
  const locale = resolveStoredLocale();
  if (glossaryContainer) glossaryContainer.innerHTML = glossaryHtml(state, locale);
}
