/** Removes the API key (raw or URL-encoded) from any text before it is logged or thrown. */
export function redact(text: string, secret: string): string {
  if (!secret) return text;
  return text.split(secret).join("***").split(encodeURIComponent(secret)).join("***");
}