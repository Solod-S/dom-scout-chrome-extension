export function generateConfigJson({ domain, url, collectionSelector, fields }) {
  const fieldsObj = {};

  (fields || []).forEach((f) => {
    fieldsObj[f.name] = {
      selector: f.selector || '',
      extract: f.extractType || 'text',
      ...(f.attribute ? { attribute: f.attribute } : {}),
      ...(f.transform ? { transform: f.transform } : {})
    };
  });

  const config = {
    name: `${domain || 'Custom'} Scraper`,
    domain: domain || 'example.com',
    url: url || `https://${domain || 'example.com'}`,
    type: 'collection',
    collection: {
      selector: collectionSelector || ''
    },
    fields: fieldsObj
  };

  return JSON.stringify(config, null, 2);
}
