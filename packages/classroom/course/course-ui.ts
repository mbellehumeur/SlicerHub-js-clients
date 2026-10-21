import { resolveStoredLocale } from '@slicer-hub/i18n';
import type { AppState } from '../hub';
import {
  DIRECTIONAL_TERMS,
  pickLocale,
  type DirectionalTerm,
  type TermId,
} from './directional-terms';
import { courseChromeFor } from './strings';

function escapeHtml(s: string): string {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Escape a plane term and enlarge the leading a/b/c letter. */
function termLabelHtml(term: string): string {
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

export type QuizState = {
  mode: 'def' | 'term';
  index: number;
  order: TermId[];
  correct: number;
  answered: boolean;
  lastOk: boolean | null;
};

export function createQuizState(): QuizState {
  const order = shuffle(DIRECTIONAL_TERMS.map((t) => t.id));
  return {
    mode: 'def',
    index: 0,
    order,
    correct: 0,
    answered: false,
    lastOk: null,
  };
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

function choicesFor(term: DirectionalTerm): DirectionalTerm[] {
  const pool = DIRECTIONAL_TERMS.filter((t) => t.id !== term.id);
  const antonym = term.antonymId
    ? DIRECTIONAL_TERMS.find((t) => t.id === term.antonymId)
    : undefined;
  const rest = shuffle(pool.filter((t) => t.id !== antonym?.id)).slice(0, 2);
  const opts = shuffle([term, ...(antonym ? [antonym] : []), ...rest].slice(0, 4));
  return opts;
}

function glossaryHtml(state: AppState, locale: string): string {
  const chrome = courseChromeFor(locale);
  const rows = DIRECTIONAL_TERMS.map((t) => {
    const selected = state.selectedTermId === t.id ? ' rp-term-row-selected' : '';
    const examples = t.examples
      .map((ex) => escapeHtml(pickLocale(ex, locale)))
      .join('<br/>');
    return `<tr class="rp-term-row${selected}" data-term-id="${escapeHtml(t.id)}" tabindex="0">
      <td>${termLabelHtml(pickLocale(t.term, locale))}</td>
      <td>${escapeHtml(pickLocale(t.definition, locale))}</td>
      <td>${examples}</td>
    </tr>`;
  }).join('');
  const note = state.courseDemoNote
    ? `<p class="rp-muted rp-course-note">${escapeHtml(state.courseDemoNote)}</p>`
    : '';
  return `
    <div class="rp-section rp-planes-section">
      <p class="rp-planes-intro">${escapeHtml(chrome.planesIntro)}</p>
      <div class="rp-planes-table-row">
        <div class="rp-table-wrap">
          <table class="rp-table rp-term-table">
            <thead>
              <tr>
                <th>${escapeHtml(chrome.colTerm)}</th>
                <th>${escapeHtml(chrome.colDefinition)}</th>
                <th>${escapeHtml(chrome.colExamples)}</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
        <figure class="rp-planes-figure">
          <img
            src="assets/planes-of-body-labeled.jpg"
            alt="${escapeHtml(chrome.planesFigureAlt)}"
            width="619"
            height="635"
            loading="lazy"
          />
          <figcaption class="rp-planes-figure-credit">
            <a
              href="https://creativecommons.org/licenses/by/4.0/"
              target="_blank"
              rel="noopener noreferrer"
            >${escapeHtml(chrome.planesFigureCredit)}</a>
          </figcaption>
        </figure>
      </div>
      <div class="rp-activity-instructions-row">
        <div class="rp-activity-instructions-copy">
          <div class="rp-activity-row">
            <span class="rp-activity-label">${escapeHtml(chrome.activityLabel)}</span>
            <span class="rp-activity-text">${escapeHtml(chrome.activityText)}</span>
          </div>
          <div class="rp-instructions-block">
            <span class="rp-instructions-label">${escapeHtml(chrome.instructionsLabel)}</span>
            <ol class="rp-instructions-list">
              ${chrome.instructionSteps
                .map((step) => `<li>${instructionStepHtml(step)}</li>`)
                .join('')}
            </ol>
          </div>
        </div>
        <figure class="rp-viewer-figure">
          <img
            src="assets/screenshot-viewer.jpg"
            alt="${escapeHtml(chrome.viewerFigureAlt)}"
            width="1431"
            height="846"
            loading="lazy"
          />
        </figure>
      </div>
      <div class="rp-view-scan-block">
        <div class="rp-view-scan-buttons">
          <button
            type="button"
            class="rp-viewer-btn"
            data-open-scene="mrhead"
            ${state.connection === 'connected' ? '' : 'disabled'}
          >${escapeHtml(chrome.scanMrHead)}</button>
          <button
            type="button"
            class="rp-viewer-btn"
            data-open-scene="kits-00038"
            title="KiTS · c4kc kits · KiTS-00038"
            ${state.connection === 'connected' ? '' : 'disabled'}
          >${escapeHtml(chrome.scanKits)}</button>
          <button
            type="button"
            class="rp-viewer-btn"
            data-open-scene="totalsegmentator-ct"
            title="TotalSegmentator-CT"
            ${state.connection === 'connected' ? '' : 'disabled'}
          >${escapeHtml(chrome.scanThoraxLarge)}</button>
          <button
            type="button"
            class="rp-viewer-btn"
            data-open-scene="ctaabdomen-panoramix"
            title="CTAAbdomenPanoramix"
            ${state.connection === 'connected' ? '' : 'disabled'}
          >${escapeHtml(chrome.scanAbdomenPelvisLarge)}</button>
        </div>
      </div>
      ${note}
    </div>`;
}

/** Persist Quiz / Bonus collapse across remountCourse. */
let quizOpen = false;
let bonusOpen = false;

const BONUS_ENDO_URL = 'https://pieper.github.io/live/webgpu/endo.html';
const BONUS_CREDIT_SLICERHEART_URL =
  'https://github.com/SlicerHeart/SlicerHeart';
const BONUS_CREDIT_JACC_URL =
  'https://doi.org/10.1016/j.jaccas.2024.102827';
const BONUS_CREDIT_RADIOL_URL = 'https://doi.org/10.1148/ryct.250129';
const BONUS_CREDIT_SOURCE_URL = 'https://github.com/pieper/SlicerLive';

function quizBodyHtml(quiz: QuizState, locale: string): string {
  const chrome = courseChromeFor(locale);
  if (!quiz.order.length) {
    return `<p class="rp-muted">${escapeHtml(chrome.quiz)}</p>`;
  }
  if (quiz.index >= quiz.order.length) {
    return `
      <p>${escapeHtml(chrome.quizScore)}: ${quiz.correct} / ${quiz.order.length}</p>
      <button type="button" class="rp-viewer-btn" data-quiz-restart>${escapeHtml(chrome.quizRestart)}</button>`;
  }
  const id = quiz.order[quiz.index]!;
  const term = DIRECTIONAL_TERMS.find((t) => t.id === id)!;
  const opts = choicesFor(term);
  const prompt =
    quiz.mode === 'def'
      ? `<p class="rp-quiz-prompt">${escapeHtml(chrome.quizPromptDef)}</p>
         <p class="rp-quiz-stem">${escapeHtml(pickLocale(term.definition, locale))}</p>`
      : `<p class="rp-quiz-prompt">${escapeHtml(chrome.quizPromptTerm)}</p>
         <p class="rp-quiz-stem">${termLabelHtml(pickLocale(term.term, locale))}</p>`;
  const buttons = opts
    .map((o) => {
      const labelHtml =
        quiz.mode === 'def'
          ? termLabelHtml(pickLocale(o.term, locale))
          : escapeHtml(pickLocale(o.definition, locale));
      return `<button type="button" class="rp-viewer-btn rp-quiz-choice" data-quiz-choice="${escapeHtml(o.id)}" ${
        quiz.answered ? 'disabled' : ''
      }>${labelHtml}</button>`;
    })
    .join(' ');
  const feedback =
    quiz.lastOk == null
      ? ''
      : `<p class="rp-quiz-feedback">${escapeHtml(
          quiz.lastOk ? chrome.quizCorrect : chrome.quizWrong
        )}</p>`;
  const next = quiz.answered
    ? `<button type="button" class="rp-viewer-btn" data-quiz-next>${escapeHtml(chrome.quizNext)}</button>`
    : '';
  return `
    <div class="rp-section-head rp-quiz-progress">
      <span class="rp-muted">${escapeHtml(chrome.quizScore)}: ${quiz.correct} / ${quiz.index}${
        quiz.answered ? '' : ''
      } · ${quiz.index + 1}/${quiz.order.length}</span>
    </div>
    ${prompt}
    <div class="rp-quiz-choices">${buttons}</div>
    ${feedback}
    ${next}`;
}

function bonusHtml(locale: string): string {
  const chrome = courseChromeFor(locale);
  const controls = chrome.bonusControls
    .map(
      (c) =>
        `<li><span class="rp-bonus-control-key">${escapeHtml(c.key)}</span> — ${escapeHtml(c.action)}</li>`
    )
    .join('');
  return `
    <details class="rp-collapse rp-bonus-collapse"${bonusOpen ? ' open' : ''}>
      <summary class="rp-collapse-summary">
        <span class="rp-section-title">${escapeHtml(chrome.bonus)}</span>
      </summary>
      <div class="rp-collapse-body">
        <p class="rp-bonus-pitch">${escapeHtml(chrome.bonusPitch)}</p>
        <p class="rp-bonus-link-wrap">
          <a
            class="rp-bonus-link"
            href="${escapeHtml(BONUS_ENDO_URL)}"
            target="_blank"
            rel="noopener noreferrer"
          >${escapeHtml(chrome.bonusLink)}</a>
        </p>
        <ul class="rp-bonus-controls">${controls}</ul>
        <figure class="rp-bonus-figure">
          <a
            href="${escapeHtml(BONUS_ENDO_URL)}"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="assets/Screenshot-fly-through.png"
              alt="${escapeHtml(chrome.bonusFigureAlt)}"
              loading="lazy"
            />
          </a>
          <figcaption class="rp-bonus-credits">
            <a
              href="${escapeHtml(BONUS_CREDIT_SLICERHEART_URL)}"
              target="_blank"
              rel="noopener noreferrer"
            >${escapeHtml(chrome.bonusCreditSlicerHeart)}</a>
            <a
              href="${escapeHtml(BONUS_CREDIT_JACC_URL)}"
              target="_blank"
              rel="noopener noreferrer"
            >${escapeHtml(chrome.bonusCreditJacc)}</a>
            <a
              href="${escapeHtml(BONUS_CREDIT_RADIOL_URL)}"
              target="_blank"
              rel="noopener noreferrer"
            >${escapeHtml(chrome.bonusCreditRadiol)}</a>
            <a
              href="${escapeHtml(BONUS_CREDIT_SOURCE_URL)}"
              target="_blank"
              rel="noopener noreferrer"
            >${escapeHtml(chrome.bonusCreditSource)}</a>
          </figcaption>
        </figure>
      </div>
    </details>`;
}

function quizHtml(quiz: QuizState, locale: string): string {
  const chrome = courseChromeFor(locale);
  return `
    <details class="rp-collapse rp-quiz-collapse"${quizOpen ? ' open' : ''}>
      <summary class="rp-collapse-summary">
        <span class="rp-section-title">${escapeHtml(chrome.quiz)}</span>
      </summary>
      <div class="rp-collapse-body">
        ${quizBodyHtml(quiz, locale)}
      </div>
    </details>
    ${bonusHtml(locale)}`;
}

export function renderCoursePanel(
  glossaryContainer: HTMLElement | null,
  quizContainer: HTMLElement | null,
  state: AppState,
  quiz: QuizState
): void {
  const locale = resolveStoredLocale();
  if (glossaryContainer) glossaryContainer.innerHTML = glossaryHtml(state, locale);
  if (quizContainer) {
    quizContainer.innerHTML = quizHtml(quiz, locale);
    const collapse = quizContainer.querySelector(
      '.rp-quiz-collapse'
    ) as HTMLDetailsElement | null;
    collapse?.addEventListener('toggle', () => {
      quizOpen = Boolean(collapse.open);
    });
    const bonus = quizContainer.querySelector(
      '.rp-bonus-collapse'
    ) as HTMLDetailsElement | null;
    bonus?.addEventListener('toggle', () => {
      bonusOpen = Boolean(bonus.open);
    });
  }
}

export function applyQuizChoice(
  quiz: QuizState,
  choiceId: string
): QuizState {
  if (quiz.answered || quiz.index >= quiz.order.length) return quiz;
  const expected = quiz.order[quiz.index]!;
  const ok = choiceId === expected;
  return {
    ...quiz,
    answered: true,
    lastOk: ok,
    correct: quiz.correct + (ok ? 1 : 0),
  };
}

export function advanceQuiz(quiz: QuizState): QuizState {
  if (!quiz.answered) return quiz;
  const nextIndex = quiz.index + 1;
  const flip = nextIndex % 2 === 0 ? 'def' : 'term';
  return {
    ...quiz,
    index: nextIndex,
    answered: false,
    lastOk: null,
    mode: flip,
  };
}
