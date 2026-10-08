const providerFailureCodes = new Set([
  "CAPTIONS_UNAVAILABLE",
  "TEMPORARY_PROVIDER_FAILURE",
  "VIDEO_UNAVAILABLE",
]);

export function isProviderFailure(outcome: string) {
  return providerFailureCodes.has(outcome);
}
