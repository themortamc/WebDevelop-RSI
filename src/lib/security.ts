// PostgREST .or() accepts grammar, not a bound parameter. Quote the value
// and escape both PostgreSQL regex metacharacters and PostgREST quotes.
// imatch avoids ilike's implicit '*' wildcard alias (unsafe for bulk edits).
export function productSearchFilter(term: string, includeDescription = false): string {
  const literal = term.trim().replace(/[\\^$.*+?()[\]{}|]/g, '\\$&');
  const quoted = `"${literal.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  const columns = includeDescription
    ? ['name', 'description', 'brand', 'sku']
    : ['name', 'brand', 'sku'];
  return columns.map((column) => `${column}.imatch.${quoted}`).join(',');
}

export const IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
};
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export function imageUploadError(file: { type: string; size: number }): string | null {
  if (!Object.prototype.hasOwnProperty.call(IMAGE_TYPES, file.type)) {
    return 'Usá una imagen JPEG, PNG, WebP, GIF o AVIF. No se admiten SVG ni HTML.';
  }
  if (file.size <= 0 || file.size > MAX_IMAGE_BYTES) {
    return 'La imagen debe pesar entre 1 byte y 5MB.';
  }
  return null;
}
