import { describe, it, expect } from 'vitest';
import { t, resolveLanguage } from '../../src/shared/i18n/index.js';

describe('i18n Localization Layer', () => {
  it('translates English keys correctly', () => {
    expect(t('appName', {}, 'en')).toBe('DOM Scout');
    expect(t('tabs.inspect', {}, 'en')).toBe('Inspect');
    expect(t('tabs.collection', {}, 'en')).toBe('Collection');
    expect(t('semanticTypes.element', {}, 'en')).toBe('Element');
    expect(t('inspect.inspectElement', {}, 'en')).toBe('Inspect element');
    expect(t('inspect.selectedBadge', {}, 'en')).toBe('Selected');
  });

  it('translates Russian keys correctly', () => {
    expect(t('tabs.inspect', {}, 'ru')).toBe('Инспектор');
    expect(t('tabs.collection', {}, 'ru')).toBe('Коллекция');
    expect(t('tabs.analyze', {}, 'ru')).toBe('Анализ');
    expect(t('tabs.export', {}, 'ru')).toBe('Экспорт');
    expect(t('semanticTypes.element', {}, 'ru')).toBe('Элемент');
    expect(t('semanticTypes.link', {}, 'ru')).toBe('Ссылка');
    expect(t('inspect.inspectElement', {}, 'ru')).toBe('Выбрать элемент');
    expect(t('inspect.selectedBadge', {}, 'ru')).toBe('Выбран');
    expect(t('collection.useCollection', {}, 'ru')).toBe('Использовать коллекцию');
  });

  it('translates Ukrainian keys correctly', () => {
    expect(t('tabs.inspect', {}, 'uk')).toBe('Інспектор');
    expect(t('tabs.collection', {}, 'uk')).toBe('Колекція');
    expect(t('tabs.analyze', {}, 'uk')).toBe('Аналіз');
    expect(t('tabs.export', {}, 'uk')).toBe('Експорт');
    expect(t('semanticTypes.element', {}, 'uk')).toBe('Елемент');
    expect(t('semanticTypes.link', {}, 'uk')).toBe('Посилання');
    expect(t('inspect.inspectElement', {}, 'uk')).toBe('Обрати елемент');
    expect(t('inspect.selectedBadge', {}, 'uk')).toBe('Обраний');
    expect(t('collection.useCollection', {}, 'uk')).toBe('Використати колекцію');
  });

  it('interpolates parameters accurately in all languages', () => {
    expect(t('inspect.matchCount', { count: 32 }, 'en')).toBe('Match count: 32');
    expect(t('inspect.matchCount', { count: 32 }, 'ru')).toBe('Совпадений: 32');
    expect(t('inspect.matchCount', { count: 32 }, 'uk')).toBe('Збігів: 32');
    expect(t('whyReasons.usesSemanticClass', { name: 'card' }, 'ru')).toBe('Использует семантический класс (.card)');
  });

  it('resolves supported languages and system default', () => {
    expect(resolveLanguage('ru')).toBe('ru');
    expect(resolveLanguage('uk')).toBe('uk');
    expect(resolveLanguage('en')).toBe('en');
    expect(['en', 'ru', 'uk']).toContain(resolveLanguage('system'));
  });
});
