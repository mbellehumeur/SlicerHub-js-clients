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
      <td>${escapeHtml(pickLocale(t.term, locale))}</td>
      <td>${escapeHtml(pickLocale(t.definition, locale))}</td>
      <td>${examples}</td>
    </tr>`;
  }).join('');
  const note = state.courseDemoNote
    ? `<p class="rp-muted rp-course-note">${escapeHtml(state.courseDemoNote)}</p>`
    : '';
  return `
    <div class="rp-section rp-planes-section">
      <div class="rp-section-head rp-section-head-center">
        <h2 class="rp-section-title">${escapeHtml(chrome.glossary)}</h2>
      </div>
      <div class="rp-view-scan-row">
        <span class="rp-view-scan-label">${escapeHtml(chrome.viewScan)}</span>
        <button
          type="button"
          class="rp-viewer-btn"
          data-open-scene="mrhead"
          ${state.connection === 'connected' ? '' : 'disabled'}
        >${escapeHtml(chrome.scanMrHead)}</button>
        <button
          type="button"
          class="rp-viewer-btn"
          data-open-scene="totalsegmentator-ct"
          ${state.connection === 'connected' ? '' : 'disabled'}
        >${escapeHtml(chrome.scanTotalSegCt)}</button>
      </div>
      <div class="rp-activity-row">
        <span class="rp-activity-label">${escapeHtml(chrome.activityLabel)}</span>
        <span class="rp-activity-instruction">${escapeHtml(chrome.activityInstruction)}</span>
      </div>
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
      ${note}
    </div>`;
}

function quizHtml(quiz: QuizState, locale: string): string {
  const chrome = courseChromeFor(locale);
  if (!quiz.order.length) {
    return `<div class="rp-section"><p class="rp-muted">${escapeHtml(chrome.quiz)}</p></div>`;
  }
  if (quiz.index >= quiz.order.length) {
    return `
      <div class="rp-section">
        <div class="rp-section-head">
          <h2 class="rp-section-title">${escapeHtml(chrome.quiz)}</h2>
        </div>
        <p>${escapeHtml(chrome.quizScore)}: ${quiz.correct} / ${quiz.order.length}</p>
        <button type="button" class="rp-viewer-btn" data-quiz-restart>${escapeHtml(chrome.quizRestart)}</button>
      </div>`;
  }
  const id = quiz.order[quiz.index]!;
  const term = DIRECTIONAL_TERMS.find((t) => t.id === id)!;
  const opts = choicesFor(term);
  const prompt =
    quiz.mode === 'def'
      ? `<p class="rp-quiz-prompt">${escapeHtml(chrome.quizPromptDef)}</p>
         <p class="rp-quiz-stem">${escapeHtml(pickLocale(term.definition, locale))}</p>`
      : `<p class="rp-quiz-prompt">${escapeHtml(chrome.quizPromptTerm)}</p>
         <p class="rp-quiz-stem">${escapeHtml(pickLocale(term.term, locale))}</p>`;
  const buttons = opts
    .map((o) => {
      const label =
        quiz.mode === 'def'
          ? pickLocale(o.term, locale)
          : pickLocale(o.definition, locale);
      return `<button type="button" class="rp-viewer-btn rp-quiz-choice" data-quiz-choice="${escapeHtml(o.id)}" ${
        quiz.answered ? 'disabled' : ''
      }>${escapeHtml(label)}</button>`;
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
    <div class="rp-section">
      <div class="rp-section-head">
        <h2 class="rp-section-title">${escapeHtml(chrome.quiz)}</h2>
        <span class="rp-muted">${escapeHtml(chrome.quizScore)}: ${quiz.correct} / ${quiz.index}${
          quiz.answered ? '' : ''
        } · ${quiz.index + 1}/${quiz.order.length}</span>
      </div>
      ${prompt}
      <div class="rp-quiz-choices">${buttons}</div>
      ${feedback}
      ${next}
    </div>`;
}

export function renderCoursePanel(
  glossaryContainer: HTMLElement | null,
  quizContainer: HTMLElement | null,
  state: AppState,
  quiz: QuizState
): void {
  const locale = resolveStoredLocale();
  if (glossaryContainer) glossaryContainer.innerHTML = glossaryHtml(state, locale);
  if (quizContainer) quizContainer.innerHTML = quizHtml(quiz, locale);
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
