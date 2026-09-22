export const EXTRACTION_TYPES = {
  TEXT: 'text',
  HTML: 'html',
  ATTRIBUTE: 'attribute',
  HREF: 'href',
  SRC: 'src'
};

export const COMMON_FIELD_NAMES = [
  'title',
  'url',
  'date',
  'image',
  'description',
  'author',
  'category',
  'price',
  'oldPrice',
  'sku',
  'brand',
  'availability',
  'rating'
];

export const TRANSFORMS = {
  TRIM: 'trim',
  NORMALIZE_WHITESPACE: 'normalizeWhitespace',
  ABSOLUTE_URL: 'absoluteUrl'
};
