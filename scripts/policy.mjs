export const noteIds = ['context', 'budget', 'routing', 'cache', 'inference', 'scheduling', 'evaluation', 'first-principles', 'survey-framework'];
export const routes = ['/', '/learn/', '/topics/', '/library/', '/reports/',
  ...noteIds.slice(0, 7).map(id => `/topics/${id}/`),
  ...noteIds.slice(7).map(id => `/notes/${id}/`)];
export const assetExtensions = new Set(['.css', '.js', '.svg', '.woff', '.woff2']);
