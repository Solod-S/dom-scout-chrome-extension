/**
 * Helper to serialize a DOM element into a lightweight descriptor
 */
export function getElementDescriptor(element) {
  if (!element || element.nodeType !== Node.ELEMENT_NODE) return null;

  const tag = element.tagName.toLowerCase();
  const rawClasses = element.className && typeof element.className === 'string'
    ? element.className.trim().split(/\s+/).filter(Boolean)
    : [];

  const rect = element.getBoundingClientRect();

  // Extract meaningful attributes
  const attributes = {};
  const allowedAttrs = [
    'href', 'src', 'srcset', 'alt', 'title', 'datetime',
    'id', 'class', 'role', 'type', 'name', 'value', 'placeholder',
    'aria-label', 'aria-describedby'
  ];

  for (let i = 0; i < element.attributes.length; i++) {
    const attr = element.attributes[i];
    const name = attr.name.toLowerCase();
    if (allowedAttrs.includes(name) || name.startsWith('data-')) {
      attributes[name] = attr.value.length > 200 ? attr.value.slice(0, 200) + '...' : attr.value;
    }
  }

  // Text preview
  let textPreview = element.textContent ? element.textContent.trim().replace(/\s+/g, ' ') : '';
  if (textPreview.length > 120) {
    textPreview = textPreview.slice(0, 120) + '...';
  }

  // Infer high-level semantic badge (e.g. Link, Image, Heading, Button)
  let semanticType = 'Element';
  if (tag === 'a') semanticType = 'Link';
  else if (tag === 'img') semanticType = 'Image';
  else if (tag === 'button' || element.getAttribute('role') === 'button') semanticType = 'Button';
  else if (/^h[1-6]$/.test(tag)) semanticType = 'Heading';
  else if (tag === 'time') semanticType = 'Date';
  else if (tag === 'input' || tag === 'textarea' || tag === 'select') semanticType = 'Input';
  else if (tag === 'article') semanticType = 'Card';

  return {
    tagName: tag,
    id: element.id || '',
    classes: rawClasses,
    textPreview,
    attributes,
    semanticType,
    rect: {
      x: Math.round(rect.x),
      y: Math.round(rect.y),
      width: Math.round(rect.width),
      height: Math.round(rect.height)
    }
  };
}
