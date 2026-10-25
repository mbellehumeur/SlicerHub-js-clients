import type { CastMessage } from '@slicer-hub/client';
import { messageSubscriberName } from '@slicer-hub/client';

/** OHIF hanging protocol id: axial + volume3d + coronal + sagittal. */
export const SLICER_FOUR_UP_HANGING_PROTOCOL_ID = 'fourUp';

/** True when Hub publisher subscriber.name is a 3D Slicer Image Display client. */
export function isSlicerIdSubscriberName(subscriberName: unknown): boolean {
  return String(subscriberName || '')
    .trim()
    .toUpperCase()
    .startsWith('3DSLICER');
}

/** Resolve fourUp HP id from an inbound Hub message, or undefined. */
export function hangingProtocolIdFromSlicerPublisher(
  message: CastMessage | undefined | null
): string | undefined {
  if (!message) {
    return undefined;
  }
  const subscriber =
    messageSubscriberName(message) ||
    String(message['subscriber.name'] || '').trim();
  if (!isSlicerIdSubscriberName(subscriber)) {
    return undefined;
  }
  return SLICER_FOUR_UP_HANGING_PROTOCOL_ID;
}
