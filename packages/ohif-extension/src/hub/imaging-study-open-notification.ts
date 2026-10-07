import {
  extractVolviewSampleId,
  normalizeImagingStudyContext,
  resolveImagingStudyOpenPlan,
  type CastMessage,
} from '@slicer-hub/client';
import type { HubEvent, ServicesManagerLike } from './types';

function publisherLabel(message: CastMessage): string {
  const subscriberName = message['subscriber.name'];
  if (typeof subscriberName === 'string' && subscriberName.trim()) {
    return subscriberName.trim();
  }
  const productName = message['subscriber.product.name'];
  if (typeof productName === 'string' && productName.trim()) {
    return productName.trim();
  }
  return '';
}

export function buildImagingStudyOpenNotificationMessage(
  event: HubEvent,
  message: CastMessage
): string {
  const normalized = normalizeImagingStudyContext(event.context);
  const plan = resolveImagingStudyOpenPlan(normalized);
  const from = publisherLabel(message);
  const parts: string[] = [];

  if (plan?.mode === 'dicomweb' || plan?.mode === 'idc') {
    parts.push(`Study ${plan.studyInstanceUID}`);
    if (plan.seriesInstanceUID) {
      parts.push(`series ${plan.seriesInstanceUID}`);
    }
  } else if (plan?.mode === 'files') {
    parts.push(plan.studyId || `${plan.files.length} file(s)`);
  } else {
    const sampleId = extractVolviewSampleId(normalized);
    if (sampleId) {
      parts.push(sampleId);
    } else {
      parts.push('Opening imaging study…');
    }
  }

  if (from) {
    parts.push(`from ${from}`);
  }

  return parts.join(' · ');
}

export function shouldShowImagingStudyOpenLoadingNotification(
  event: HubEvent | undefined
): boolean {
  if (!event?.context) {
    return true;
  }
  const plan = resolveImagingStudyOpenPlan(
    normalizeImagingStudyContext(event.context)
  );
  return plan?.mode !== 'dicomweb';
}

export type ImagingStudyOpenResult = {
  event: HubEvent;
  message: CastMessage;
};

export function showImagingStudyOpenLoadingNotification(
  servicesManager: ServicesManagerLike,
  promise: Promise<ImagingStudyOpenResult | null>
): void {
  const uiNotificationService = servicesManager.services.uiNotificationService;
  if (!uiNotificationService?.show) {
    return;
  }

  // Show loading only — OHIF's promise helper also pops a green success toast;
  // that second popup is noisy for study open, so dismiss loading on settle
  // and surface errors alone.
  const loadingId = uiNotificationService.show({
    title: 'Imaging study open',
    message: 'Downloading and opening imaging study…',
    type: 'loading',
    autoClose: false,
    id: 'hub-imagingstudy-open',
    allowDuplicates: false,
  });

  promise.then(
    () => {
      uiNotificationService.hide?.(loadingId);
    },
    error => {
      uiNotificationService.hide?.(loadingId);
      const detail =
        error instanceof Error ? error.message : String(error ?? '').trim();
      uiNotificationService.show({
        title: 'Imaging study open',
        message: detail || 'Failed to open imaging study',
        type: 'error',
        id: 'hub-imagingstudy-open-error',
        allowDuplicates: false,
        duration: 4000,
      });
    }
  );
}
