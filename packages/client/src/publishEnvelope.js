/** Wildcard destination on publish envelope fields. */
export const HUB_ENVELOPE_ANY = '*';

/** Default ``subscriber.actor`` for image-display clients (VolView, OHIF). */
export const HUB_DEFAULT_SUBSCRIBER_ACTOR = 'ID';

export const DEFAULT_CAST_PUBLISH_ENVELOPE_FIELDS = {
  subscriberName: HUB_ENVELOPE_ANY,
  subscriberActor: HUB_DEFAULT_SUBSCRIBER_ACTOR,
  targetActor: HUB_ENVELOPE_ANY,
  targetProductName: HUB_ENVELOPE_ANY,
};

export function normalizeOptionalEnvelopeField(value) {
  const text = String(value ?? '').trim();
  return text || HUB_ENVELOPE_ANY;
}

export function resolveHubPublishEnvelopeFields(fields, defaults) {
  const name = (fields.subscriberName ?? '').trim();
  return {
    subscriberName: name || defaults.subscriberName || HUB_ENVELOPE_ANY,
    subscriberActor:
      (fields.subscriberActor ?? '').trim() || HUB_DEFAULT_SUBSCRIBER_ACTOR,
    targetActor: normalizeOptionalEnvelopeField(fields.targetActor),
    targetProductName: normalizeOptionalEnvelopeField(fields.targetProductName),
  };
}

export function applyCastPublishEnvelopeFields(message, fields) {
  message['subscriber.name'] =
    fields.subscriberName.trim() || HUB_ENVELOPE_ANY;
  message['subscriber.actor'] =
    fields.subscriberActor.trim() || HUB_DEFAULT_SUBSCRIBER_ACTOR;
  message['target.actor'] = normalizeOptionalEnvelopeField(fields.targetActor);
  message['target.product.name'] = normalizeOptionalEnvelopeField(
    fields.targetProductName
  );
}
