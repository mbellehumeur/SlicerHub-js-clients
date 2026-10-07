import { registerImageLoader } from '@cornerstonejs/core';
import {
  cornerstoneNiftiImageLoader,
  init as niftiInit,
} from '@cornerstonejs/nifti-volume-loader';

let registered = false;

export function ensureHubNiftiLoaderRegistered(): void {
  if (registered) {
    return;
  }
  niftiInit();
  registerImageLoader('nifti', cornerstoneNiftiImageLoader);
  registered = true;
}
