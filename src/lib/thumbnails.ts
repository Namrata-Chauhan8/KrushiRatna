/**
 * Neutral placeholder shown by the image picker and by table rows whose
 * record has no image yet. Inlined as an SVG data URI so it needs no asset
 * pipeline and matches the `string` shape real uploads use.
 */
const PLACEHOLDER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
<rect width="96" height="96" rx="20" fill="#f1f2f6"/>
<path d="M30 60l12-14 9 10 6-7 9 11z" fill="#c7c9d3"/>
<circle cx="38" cy="36" r="5" fill="#c7c9d3"/>
</svg>`;

export const placeholderThumbnail = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  PLACEHOLDER_SVG,
)}`;
