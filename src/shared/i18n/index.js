import en from './en.json';
import ru from './ru.json';
import uk from './uk.json';

const dictionaries = { en, ru, uk };

/**
 * Detect system language matching rules from spec:
 * ru -> 'ru', uk -> 'uk', all others -> 'en'
 */
export function getSystemLanguage() {
  const browserLang = (
    (typeof chrome !== 'undefined' && chrome.i18n && chrome.i18n.getUILanguage && chrome.i18n.getUILanguage()) ||
    (typeof navigator !== 'undefined' && (navigator.language || navigator.userLanguage)) ||
    'en'
  ).toLowerCase();

  if (browserLang.startsWith('ru')) return 'ru';
  if (browserLang.startsWith('uk')) return 'uk';
  return 'en';
}

/**
 * Resolve effective language
 */
export function resolveLanguage(setting) {
  if (!setting || setting === 'system') {
    return getSystemLanguage();
  }
  if (dictionaries[setting]) {
    return setting;
  }
  return 'en';
}

/**
 * Translate a dotted key (e.g. 'inspect.recommended') for given or current lang
 */
export function t(key, params = {}, lang = 'en') {
  const dict = dictionaries[lang] || dictionaries.en;
  const parts = key.split('.');
  let val = dict;

  for (const part of parts) {
    if (val && typeof val === 'object' && part in val) {
      val = val[part];
    } else {
      // Fallback to English
      let fallback = dictionaries.en;
      for (const fbPart of parts) {
        if (fallback && typeof fallback === 'object' && fbPart in fallback) {
          fallback = fallback[fbPart];
        } else {
          return key;
        }
      }
      val = fallback;
      break;
    }
  }

  if (typeof val !== 'string') {
    return key;
  }

  // Interpolate {params}
  return val.replace(/\{(\w+)\}/g, (_, name) => {
    return params[name] !== undefined ? params[name] : `{${name}}`;
  });
}
