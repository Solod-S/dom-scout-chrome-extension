# DOM Scout — подробное техническое задание для AI coding agent

## 0. Роль AI-агента

Ты выступаешь как **Senior Frontend / Chrome Extension Engineer + Product Engineer + UI/UX Engineer**.

Твоя задача — спроектировать и реализовать с нуля Chrome Extension под названием **DOM Scout**.

DOM Scout — это профессиональный инструмент для разработчиков, которые занимаются:

- web scraping;
- мониторингом сайтов;
- написанием парсеров;
- анализом DOM;
- поиском CSS/XPath-селекторов;
- исследованием повторяющихся структур страниц;
- парсингом новостных сайтов;
- парсингом e-commerce;
- автоматизацией через Puppeteer / Playwright / Cheerio;
- поиском данных, уже присутствующих в HTML, JSON-LD и meta-тегах.

Приложение должно помогать разработчику быстро перейти от:

> «Я открыл незнакомый сайт»

к:

> «Я понимаю структуру страницы, знаю устойчивые селекторы, вижу повторяющиеся элементы, проверил результаты и могу скопировать готовую конфигурацию или код парсера».

Проект должен быть пригоден для дальнейшего развития и публикации в Chrome Web Store.

---

# 1. Название продукта

**DOM Scout**

Рабочий tagline:

> Inspect. Select. Extract.

Альтернативное описание:

> Developer toolkit for inspecting DOM structures and building reliable web scrapers.

Название приложения в UI:

```text
DOM Scout
```

---

# 2. Основная идея

DOM Scout — это не обычный CSS selector picker.

Главная задача приложения — ускорить подготовительную часть разработки web scraper.

Обычный workflow разработчика:

```text
Открыть DevTools
→ перейти в Elements
→ найти карточку
→ найти общий контейнер
→ скопировать selector
→ открыть Console
→ document.querySelectorAll(...)
→ проверить количество
→ найти title
→ найти URL
→ найти date
→ найти image
→ проверить lazy-loading
→ найти pagination
→ проверить JSON-LD
→ написать код
→ снова проверить DOM
```

DOM Scout должен сократить workflow примерно до:

```text
Open DOM Scout
→ Pick Element
→ Detect Collection
→ Add Fields
→ Preview
→ Validate Selectors
→ Export
```

Приложение не должно пытаться полностью заменить Puppeteer, Playwright или Cheerio.

DOM Scout — это **developer companion / scraper preparation tool**.

---

# 3. Целевая аудитория

Основная аудитория:

- frontend-разработчики;
- backend-разработчики;
- fullstack-разработчики;
- разработчики парсеров;
- разработчики monitoring systems;
- QA automation engineers;
- data engineers;
- разработчики Puppeteer;
- разработчики Playwright;
- пользователи Cheerio;
- разработчики crawling/scraping-сервисов.

Особенно полезно для двух сценариев:

### News websites

Поиск:

- списка новостей;
- карточки новости;
- title;
- URL;
- publication date;
- image;
- category;
- author;
- article content;
- tags;
- pagination.

### E-commerce

Поиск:

- product card;
- product name;
- product URL;
- price;
- old price;
- SKU;
- availability;
- brand;
- image;
- rating;
- pagination;
- category;
- product attributes.

---

# 4. Главный продуктовый принцип

DOM Scout должен давать ответ не только на вопрос:

> Какой CSS selector у этого элемента?

Но и:

> Насколько этот selector пригоден для долгосрочного парсера?

Поэтому приложение должно:

1. генерировать селектор;
2. проверять его;
3. показывать количество совпадений;
4. оценивать его устойчивость;
5. искать альтернативы;
6. предупреждать о потенциально динамических классах;
7. помогать найти повторяющийся parent/container;
8. давать preview реальных данных;
9. экспортировать результат.

---

# 5. Формат Chrome Extension

Использовать:

- **Chrome Extension Manifest V3**;
- **Chrome Side Panel** как основной UI;
- content scripts / `chrome.scripting` для работы со страницей;
- service worker только для действительно нужной фоновой логики;
- `chrome.storage.local` для локального хранения;
- `chrome.i18n` / `_locales` для системной локализации extension;
- собственный runtime i18n layer для переключения языка без перезагрузки, если это необходимо.

Минимальная поддерживаемая версия Chrome должна быть определена в README.

Ориентироваться на современные версии Chrome.

---

# 6. Технологический стек

Предпочтительный стек:

```text
Chrome Extension Manifest V3
React
JavaScript
Vite
CSS Modules или обычный modular CSS
Zustand — только если реально нужен глобальный state
Vitest
ESLint
Prettier
```

## Важно

Использовать **JavaScript, не TypeScript**.

Не добавлять тяжелые библиотеки без необходимости.

Не использовать большой UI framework вроде:

- Material UI;
- Ant Design;
- Bootstrap;

если интерфейс можно нормально реализовать собственными компонентами.

Допустимо использовать небольшую icon library:

```text
Lucide
```

Иконки должны быть визуально единообразными.

---

# 7. Архитектура проекта

Предлагаемая структура:

```text
dom-scout/
│
├── public/
│   ├── icons/
│   └── ...
│
├── src/
│   │
│   ├── background/
│   │   └── service-worker.js
│   │
│   ├── content/
│   │   ├── index.js
│   │   ├── inspector.js
│   │   ├── highlighter.js
│   │   ├── selector-generator.js
│   │   ├── selector-analyzer.js
│   │   ├── collection-detector.js
│   │   ├── extraction.js
│   │   └── page-analyzer.js
│   │
│   ├── sidepanel/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── components/
│   │   ├── features/
│   │   └── styles/
│   │
│   ├── devtools/
│   │   ├── devtools.html
│   │   ├── devtools.js
│   │   └── network/
│   │
│   ├── shared/
│   │   ├── constants/
│   │   ├── messages/
│   │   ├── utils/
│   │   ├── selectors/
│   │   ├── exporters/
│   │   ├── storage/
│   │   └── i18n/
│   │
│   └── styles/
│
├── _locales/
│   ├── en/messages.json
│   ├── ru/messages.json
│   └── uk/messages.json
│
├── tests/
│
├── manifest.json
├── package.json
├── vite.config.js
├── README.md
└── CHANGELOG.md
```

Структуру разрешено оптимизировать, но архитектура должна оставаться понятной.

---

# 8. Основные части extension

DOM Scout должен логически состоять из четырех частей.

## 8.1 Side Panel

Главный пользовательский интерфейс.

Здесь пользователь:

- запускает Inspector;
- выбирает DOM element;
- смотрит селекторы;
- анализирует selector quality;
- ищет collection;
- добавляет fields;
- смотрит preview;
- анализирует meta / JSON-LD;
- сохраняет конфигурацию;
- экспортирует код.

---

## 8.2 Content Script

Работает внутри исследуемой страницы.

Отвечает за:

- mouse hover;
- element picking;
- DOM highlighting;
- поиск matching elements;
- генерацию selector candidates;
- анализ DOM;
- collection detection;
- extraction preview;
- сбор ограниченной информации об элементах.

Content script не должен ломать страницу.

После выключения Inspector все добавленные DOM overlays/listeners должны корректно удаляться.

---

## 8.3 Background Service Worker

Использовать только для:

- communication routing;
- storage orchestration;
- extension lifecycle;
- tab-related events;
- открытия Side Panel;
- будущих extension-level возможностей.

Не переносить туда DOM-логику.

---

## 8.4 DevTools integration

Отдельный модуль для будущего **Network Inspector**.

Он должен использовать DevTools extension API и быть архитектурно отделен от основного DOM Inspector.

Network-модуль разрешено реализовать после стабильного MVP.

---

# 9. UI / UX

## Общая концепция

UI должен быть:

- светлый;
- современный;
- минималистичный;
- профессиональный;
- компактный;
- не перегруженный;
- ориентированный на разработчика;
- хорошо читаемый в узкой Chrome Side Panel.

Не делать интерфейс похожим на admin dashboard.

Не использовать слишком много карточек внутри карточек.

Не делать чрезмерное количество рамок.

---

# 10. Visual Style

## Цветовая схема

Тема только светлая для первой версии.

Основной фон:

```text
#FFFFFF
```

Secondary background:

```text
#F7F8FA
```

Border:

```text
#E5E7EB
```

Primary text:

```text
#111827
```

Secondary text:

```text
#667085
```

Muted text:

```text
#98A2B3
```

Accent:

разрешается выбрать аккуратный синий / indigo.

Например:

```text
#4F46E5
```

Success:

```text
#16A34A
```

Warning:

```text
#D97706
```

Error:

```text
#DC2626
```

Цвета оформить через CSS variables/design tokens.

---

# 11. Typography

Использовать системный UI font stack.

Например:

```css
font-family:
  Inter,
  ui-sans-serif,
  system-ui,
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  sans-serif;
```

Если Inter требует внешней загрузки, не зависеть от Google Fonts.

Extension должен нормально работать offline.

Для selectors/code:

```text
SFMono-Regular
Menlo
Monaco
Consolas
Liberation Mono
monospace
```

---

# 12. Размеры и плотность UI

DOM Scout — developer tool, поэтому интерфейс должен быть плотным, но не тесным.

Ориентиры:

```text
Base font: 13–14px
Section title: 13–14px / semibold
Main title: 15–16px
Small labels: 11–12px
Button height: ~32px
Input height: ~34px
Border radius: 6–8px
```

Не использовать огромные кнопки и заголовки.

---

# 13. Главное окно Side Panel

Базовая структура:

```text
┌──────────────────────────────────┐
│ DOM Scout                 ⋮      │
│ example.com                      │
├──────────────────────────────────┤
│ Inspect | Collection | Analyze   │
├──────────────────────────────────┤
│                                  │
│ current tool content             │
│                                  │
│                                  │
│                                  │
├──────────────────────────────────┤
│ Saved                     Export │
└──────────────────────────────────┘
```

Не обязательно использовать tabs буквально.

Можно сделать компактную toolbar/navigation.

---

# 14. Header

Header должен содержать:

- логотип DOM Scout;
- название;
- текущий hostname;
- settings/menu button.

Например:

```text
DOM Scout
example.com
```

Через overflow menu:

```text
Language
Settings
About
Reset current session
```

---

# 15. Мультиязычность

Обязательные языки:

```text
English
Русский
Українська
```

Коды:

```text
en
ru
uk
```

## Требования

Все user-facing строки должны находиться в словарях.

Запрещено оставлять hardcoded UI strings внутри React components.

Пример ключей:

```json
{
  "inspectElement": "Inspect element",
  "stopInspecting": "Stop inspecting",
  "matches": "Matches",
  "selectorQuality": "Selector quality"
}
```

---

# 16. Выбор языка

В Settings:

```text
Language

○ System
○ English
○ Русский
○ Українська
```

По умолчанию:

```text
System
```

Алгоритм:

```text
Chrome/UI locale ru → RU
Chrome/UI locale uk → UK
остальные → EN
```

Пользовательский выбор сохранять в `chrome.storage.local`.

---

# 17. Inspector Mode

Главная кнопка:

```text
Inspect element
```

После нажатия:

```text
Stop inspecting
```

Иконка:

```text
crosshair / mouse-pointer
```

---

# 18. Hover Inspector

После активации Inspector пользователь водит мышкой по странице.

DOM Scout должен подсвечивать текущий элемент.

Overlay не должен:

- менять layout;
- влиять на pointer events;
- ломать CSS сайта;
- менять размеры элемента.

Использовать отдельный overlay layer.

---

# 19. Tooltip при hover

Возле выбранного элемента показывать компактный floating tooltip:

```text
article.news-card
824 × 218
```

или:

```text
a.article-title
12 matches
```

Tooltip не должен закрывать элемент.

Если места мало, автоматически менять позицию.

---

# 20. Выбор элемента

После click:

- prevent picking click from triggering navigation;
- Inspector временно останавливается;
- выбранный элемент остается highlighted;
- информация передается в Side Panel.

Side Panel показывает:

```text
Selected element

<a>
.article-title

"Apple presents new..."
```

---

# 21. Element Overview

Показывать:

### Tag

```text
a
```

### ID

```text
article-title
```

если есть.

### Classes

```text
article-title
featured
```

### Text preview

Максимум несколько строк.

### Attributes

Основные:

```text
href
src
srcset
datetime
data-*
aria-*
role
name
title
alt
```

Не показывать сотни attributes сразу.

Длинный список должен быть collapsible.

---

# 22. CSS Selector Generator

После выбора элемента сгенерировать несколько вариантов.

Например:

```text
Recommended
.article-title

Alternative
article.news-card .article-title

Strict
main .news-list article.news-card > h2 > a.article-title
```

Не использовать `nth-child()` без необходимости.

---

# 23. Selector generation priority

Приоритет примерно такой:

## Level A — хорошие selector sources

```text
stable unique id
data-testid
data-test
data-id
data-product-id
data-article-id
itemprop
name
role + stable attribute
semantic class
href pattern
```

## Level B

```text
semantic parent + semantic child
tag + semantic class
stable ancestor
```

## Level C

```text
deep DOM path
multiple generic classes
```

## Level D

```text
nth-child
nth-of-type
random generated class
hashed CSS module
runtime-generated id
```

---

# 24. Dynamic class detection

DOM Scout должен пытаться обнаруживать подозрительные классы.

Примеры:

```text
css-1xabc92
sc-bdfBwQ
jss128
_3FHD92
style__Title-sc-abc123-0
xY89z0
```

Это heuristic, поэтому UI должен писать:

```text
Possibly generated class
```

а не утверждать это как факт.

---

# 25. Selector Validation

Каждый selector обязательно проверять через DOM.

Показывать:

```text
Matches: 1
```

или:

```text
Matches: 24
```

или:

```text
No matches
```

Для selected element также проверить:

> входит ли исходный element в найденный NodeList.

---

# 26. Live Highlight

При hover на selector candidate:

подсвечивать все matching elements.

Например:

```text
.news-card
32 matches
```

На странице подсвечиваются 32 блока.

---

# 27. Selector Quality Score

Для каждого selector вычислить:

```text
0–100
```

Пример:

```text
94
Stable

72
Good

49
Fragile

21
Very fragile
```

Не делать score научно точным.

Это heuristic developer assistance.

---

# 28. Selector Quality Factors

Положительные:

```text
+ unique stable id
+ stable data attribute
+ semantic attribute
+ semantic class
+ short selector
+ low DOM depth
+ expected match count
+ stable parent
```

Отрицательные:

```text
- nth-child
- nth-of-type
- very deep path
- random-looking id
- random-looking class
- CSS-in-JS class
- excessive class chain
- numeric/generated suffix
- selector dependent on unrelated wrapper
```

---

# 29. Selector explanation

Возле score добавить:

```text
Why?
```

Пример:

```text
+ Uses semantic class
+ Short path
+ 32 consistent matches
- Depends on one generated-looking class
```

Максимум 4–5 важных факторов.

---

# 30. Copy actions

Для любого selector:

```text
Copy selector
Copy querySelector
Copy querySelectorAll
Copy XPath
```

После копирования показывать небольшой toast:

```text
Copied
```

Не использовать modal.

---

# 31. XPath

DOM Scout должен генерировать базовый XPath.

Например:

```text
//article[contains(@class,"news-card")]//a[contains(@class,"title")]
```

Не нужно превращать приложение в XPath IDE.

CSS остается primary format.

---

# 32. Live Selector Tester

Отдельный инструмент:

```text
Selector Tester
```

Input:

```text
article.news-card .title
```

Режим:

```text
CSS
XPath
```

Результат:

```text
Matches: 32
```

Matching elements автоматически подсвечиваются.

---

# 33. Selector Tester states

Поддерживать:

```text
valid selector
invalid syntax
0 matches
1 match
multiple matches
```

Ошибки должны отображаться inline.

---

# 34. Collection Detector

Это одна из ключевых функций DOM Scout.

Пользователь выбирает элемент внутри карточки.

Например:

```html
<a class="news-card__title">
```

DOM Scout должен искать repeated ancestor structures.

Например:

```html
article.news-card
article.news-card
article.news-card
article.news-card
```

и предложить:

```text
Possible collection

article.news-card
32 items
```

---

# 35. Collection detection algorithm

Не использовать AI в MVP.

Использовать DOM heuristics.

Идея:

1. взять selected element;
2. подняться по parent chain;
3. на каждом уровне построить candidate selector;
4. определить siblings / repeated structures;
5. искать элементы с похожим tag/class signature;
6. считать match count;
7. оценивать сходство внутренних DOM structures;
8. ранжировать candidates.

Например:

```text
article.news-card        32
.news-list > article     32
.news-column             1
main                     1
```

Лучший candidate:

```text
article.news-card
```

---

# 36. Collection UI

После detection:

```text
Collection detected

article.news-card

32 items

[Use collection]
```

При hover подсвечивать все collection items.

---

# 37. Manual Collection

Если auto detection ошибся:

```text
Edit selector
```

Пользователь может ввести:

```text
.news-list article
```

и DOM Scout сразу покажет count.

---

# 38. Collection Fields

После выбора collection пользователь может добавлять fields.

Button:

```text
+ Add field
```

Структура field:

```text
Field name
title

Selector
.title

Extract
Text
```

---

# 39. Field types

Предустановленные названия:

```text
title
url
date
image
description
author
category
price
oldPrice
sku
brand
availability
rating
```

Также:

```text
Custom field
```

Название editable.

---

# 40. Field selector scope

Важно.

Field selector должен работать **относительно collection item**, а не всего document.

Например:

```js
$item.querySelector(".title")
```

а не:

```js
document.querySelector(".title")
```

Это должно быть явно отражено в архитектуре.

---

# 41. Extraction Modes

Для каждого field:

```text
Text
HTML
Attribute
URL
Image
```

Для Attribute:

```text
href
src
srcset
data-src
datetime
content
...
```

---

# 42. Smart extraction suggestions

Если selected element:

```html
<a href="/news/123">
```

предлагать:

```text
Text
href
```

Если:

```html
<time datetime="2026-09-19T10:00">
```

предлагать:

```text
datetime
Text
```

Если:

```html
<img>
```

предлагать:

```text
src
srcset
data-src
data-original
alt
```

---

# 43. Lazy Image Detection

Проверять распространенные attributes:

```text
src
srcset
data-src
data-srcset
data-original
data-lazy-src
data-lazy
```

Если:

```text
src = placeholder
data-src = real image
```

показывать:

```text
Possible lazy-loaded image
```

и рекомендовать data-src.

---

# 44. Relative → Absolute URLs

Preview должен уметь преобразовывать:

```text
/news/123
```

в:

```text
https://example.com/news/123
```

через:

```js
new URL(value, location.href)
```

Пользователь должен иметь возможность выбрать:

```text
Raw
Absolute URL
```

---

# 45. Data Preview

После настройки collection и fields показывать preview.

Например:

| # | title | date | url |
|---|---|---|---|
| 1 | Apple... | 10:32 | /news/1 |
| 2 | Google... | 10:25 | /news/2 |
| 3 | OpenAI... | 10:17 | /news/3 |

---

# 46. Preview limits

Чтобы не перегружать UI:

по умолчанию отображать:

```text
10 rows
```

и дать:

```text
Show 25
Show all
```

Для очень больших collections предупреждать о потенциальной нагрузке.

---

# 47. Field Coverage

Одна из наиболее полезных функций.

Показывать:

```text
title       32 / 32   100%
url         32 / 32   100%
date        31 / 32    97%
image       28 / 32    88%
```

Если coverage < 100%:

```text
warning
```

Клик по строке должен позволить подсветить элементы, где field отсутствует.

---

# 48. Duplicate Detection

Для fields вроде:

```text
url
title
sku
```

показывать:

```text
Unique: 31 / 32
Duplicates: 1
```

Это помогает обнаруживать неправильный selector.

---

# 49. DOM Structure Viewer

Для selected element / collection показывать compact tree.

Например:

```text
article.news-card ×32
├── a.image ×32
│   └── img ×32
├── .meta ×32
├── h2 ×32
│   └── a.title ×32
└── time ×31
```

---

# 50. DOM tree rules

Не показывать весь document.

Показывать только локальную структуру выбранного блока.

Глубина:

```text
3–5 levels
```

по умолчанию.

Дать возможность раскрывать отдельные nodes.

---

# 51. Repeated Structure Detection

Отдельный Analyze tool:

```text
Find repeated blocks
```

Результат:

```text
article.news-card         32
.product-card             24
.sidebar-item             10
.pagination a              8
.tag                       7
```

При выборе строки подсвечивать все элементы.

---

# 52. Filter repeated structures

Не показывать мусор вроде:

```text
div × 500
span × 900
```

Нужен ranking.

Повышать вес:

- semantic classes;
- повторяемая internal structure;
- размеры больше минимального;
- наличие link/image/text;
- наличие нескольких child nodes.

---

# 53. Page Analyzer

Отдельный режим:

```text
Analyze Page
```

Секции:

```text
Page
Meta
Structured Data
Detected Content
Technical
```

---

# 54. Page Info

Показывать:

```text
URL
hostname
title
canonical
language
charset
```

---

# 55. Meta Inspector

Показывать:

```text
title
description
canonical
robots
```

OpenGraph:

```text
og:title
og:description
og:image
og:url
og:type
```

Twitter:

```text
twitter:card
twitter:title
twitter:description
twitter:image
```

---

# 56. JSON-LD Inspector

Находить:

```html
<script type="application/ld+json">
```

Парсить все найденные блоки.

Определять types:

```text
NewsArticle
Article
Product
BreadcrumbList
Organization
WebSite
FAQPage
Person
```

UI:

```text
Structured Data

NewsArticle
Product
BreadcrumbList
```

Каждый block expandable.

---

# 57. JSON-LD actions

Для JSON-LD:

```text
Copy JSON
Copy value
Copy path
```

Пример:

```text
offers.price
```

или:

```text
@graph[1].headline
```

---

# 58. News Article Detector

DOM Scout может heuristically определить:

```text
Possible article page
```

и показать candidates:

```text
Headline
Publication date
Author
Article body
Main image
Category
Tags
```

Источники:

1. JSON-LD;
2. meta;
3. semantic HTML;
4. DOM heuristic.

---

# 59. Product Detector

Для e-commerce:

```text
Possible product page
```

Candidates:

```text
name
price
old price
sku
brand
availability
images
description
breadcrumbs
rating
```

Приоритет:

1. Product JSON-LD;
2. meta;
3. DOM.

---

# 60. Pagination Detector

Первая версия может быть heuristic.

Искать:

```text
rel="next"
Next
Previous
Load more
Show more
Показать еще
Показати ще
Завантажити ще
pagination
pager
```

Вывод:

```text
Possible pagination

.next-page
```

или:

```text
Possible Load More button

button.load-more
```

---

# 61. Infinite Scroll indication

Не обязательно полностью автоматически определять infinite scroll в MVP.

Но архитектуру предусмотреть.

Будущая версия может:

- наблюдать network;
- отслеживать DOM mutations;
- определять добавление collection items после scroll.

---

# 62. Mutation Monitor

Phase 2 feature.

Пользователь выбирает selector:

```text
.product-price
```

нажимает:

```text
Watch changes
```

DOM Scout использует `MutationObserver`.

Лог:

```text
12:30:11 element changed
12:30:11 1299 → 1199

12:31:02 node removed

12:31:04 node added
```

---

# 63. Network Inspector

Phase 2 / DevTools feature.

Не пытаться реализовать эту часть через хаки внутри обычного content script.

Использовать Chrome DevTools extension integration.

---

# 64. Network Inspector UI

Отдельная DevTools panel:

```text
DOM Scout
```

или integration с side panel через messaging.

Фильтры:

```text
Fetch/XHR
JSON
GraphQL
Document
All
```

---

# 65. API Candidates

Пытаться выделить requests, похожие на data endpoints.

Например:

```text
GET /api/news?page=2
200
application/json

GET /catalog/products?page=3
200
application/json

POST /graphql
200
application/json
```

---

# 66. Network actions

Для request:

```text
Copy URL
Copy cURL
Copy fetch()
Copy Axios
View response
```

Если есть JSON:

```text
Pretty JSON
```

---

# 67. Sensitive data

Никогда автоматически не показывать / экспортировать чувствительные headers без предупреждения.

Особенно:

```text
Authorization
Cookie
Set-Cookie
X-API-Key
```

При Copy cURL по умолчанию удалять чувствительные headers.

Дать явно включаемый option:

```text
Include sensitive headers
```

с предупреждением.

---

# 68. Export

Главный блок:

```text
Export
```

Форматы:

```text
Config JSON
Vanilla JS
Cheerio
Puppeteer
Playwright
```

---

# 69. Config JSON

Пример:

```json
{
  "name": "Example News",
  "domain": "example.com",
  "url": "https://example.com/news",
  "type": "collection",
  "collection": {
    "selector": "article.news-card"
  },
  "fields": {
    "title": {
      "selector": ".title",
      "extract": "text"
    },
    "url": {
      "selector": ".title a",
      "extract": "href",
      "transform": "absoluteUrl"
    },
    "date": {
      "selector": "time",
      "extract": "attribute",
      "attribute": "datetime"
    }
  }
}
```

---

# 70. Vanilla JS export

Пример output:

```js
const items = [...document.querySelectorAll("article.news-card")].map((item) => ({
  title: item.querySelector(".title")?.textContent?.trim() ?? null,
  url: item.querySelector(".title a")?.href ?? null,
  date: item.querySelector("time")?.getAttribute("datetime") ?? null,
}));

console.log(items);
```

---

# 71. Cheerio export

Пример:

```js
const items = [];

$("article.news-card").each((_, element) => {
  const $item = $(element);

  items.push({
    title: $item.find(".title").first().text().trim() || null,
    url: $item.find(".title a").first().attr("href") || null,
    date: $item.find("time").first().attr("datetime") || null,
  });
});
```

---

# 72. Puppeteer export

Пример:

```js
const items = await page.$$eval("article.news-card", (elements) =>
  elements.map((item) => ({
    title: item.querySelector(".title")?.textContent?.trim() ?? null,
    url: item.querySelector(".title a")?.href ?? null,
    date: item.querySelector("time")?.getAttribute("datetime") ?? null,
  }))
);
```

---

# 73. Playwright export

Пример:

```js
const items = await page.locator("article.news-card").evaluateAll((elements) =>
  elements.map((item) => ({
    title: item.querySelector(".title")?.textContent?.trim() ?? null,
    url: item.querySelector(".title a")?.href ?? null,
    date: item.querySelector("time")?.getAttribute("datetime") ?? null,
  }))
);
```

---

# 74. Export correctness

Generated code должен:

- быть читаемым;
- не падать на отсутствующем field;
- использовать `null`, если data отсутствует;
- корректно обрабатывать `.trim()`;
- учитывать attribute extraction;
- учитывать absolute URL transform;
- не содержать лишних dependencies.

---

# 75. Saved Projects

Пользователь может сохранить конфигурацию для domain/page.

Например:

```text
example.com

News listing
Article page
Search results
```

---

# 76. Storage schema

Пример:

```js
{
  settings: {
    language: "system"
  },

  projects: {
    "example.com": [
      {
        id: "...",
        name: "News listing",
        urlPattern: "/news",
        collectionSelector: "...",
        fields: [...]
      }
    ]
  }
}
```

---

# 77. History

Хранить последние исследованные selectors.

Например:

```text
Recent

article.news-card
.article-title
time[datetime]
.product-price
```

History должна быть ограничена.

Например:

```text
50–100 entries
```

---

# 78. Selector Health

Phase 2.

Для сохраненной project configuration при открытии страницы:

```text
Selector health

Collection   32 matches   OK
Title        32/32        OK
URL          32/32        OK
Date         29/32        Warning
Image         0/32        Broken
```

---

# 79. Session State

При navigation внутри tab не должно возникать неконтролируемых ошибок.

Активная сессия должна учитывать:

```text
tabId
URL
hostname
document state
```

При полном navigation Inspector должен корректно reset/reconnect.

---

# 80. Communication

Использовать нормализованные message types.

Например:

```js
{
  type: "INSPECTOR_START"
}

{
  type: "ELEMENT_SELECTED",
  payload: {}
}

{
  type: "HIGHLIGHT_SELECTOR",
  payload: {
    selector: ".news-card"
  }
}
```

Вынести message names в constants.

---

# 81. Не передавать DOM Nodes

Нельзя передавать реальные DOM Nodes через extension messaging.

Передавать serializable descriptors:

```js
{
  tag: "a",
  id: "",
  classes: ["article-title"],
  text: "...",
  attributes: {},
  selectors: []
}
```

---

# 82. Performance

DOM Scout не должен заметно тормозить страницу.

Запрещено:

- постоянно сканировать весь DOM без причины;
- запускать тяжелый MutationObserver на body в обычном режиме;
- выполнять `querySelectorAll("*")` на каждом mousemove;
- пересчитывать structure сотни раз в секунду.

---

# 83. Hover performance

Для pointer/mouse events:

- минимизировать DOM calculations;
- при необходимости использовать requestAnimationFrame;
- не строить selector candidates до click;
- hover должен заниматься только lightweight highlight.

---

# 84. Large Pages

Если DOM очень большой:

```text
> 20 000 elements
```

тяжелые анализаторы должны запускаться вручную.

Показывать:

```text
Large page detected.
Deep analysis may take longer.
```

---

# 85. Shadow DOM

MVP:

- корректно не падать;
- определять, что selected element находится в Shadow DOM;
- показывать badge:

```text
Shadow DOM
```

Полная генерация cross-shadow selector может быть Phase 2.

---

# 86. iframe

MVP:

- поддерживать same-origin frames где возможно;
- явно показывать frame context;
- cross-origin iframe не должен ломать extension.

Сообщение:

```text
Cross-origin iframe.
Direct DOM access is restricted.
```

---

# 87. SPAs

Extension должен корректно работать с:

```text
React
Vue
Angular
Next.js
Nuxt
SPA navigation
```

Не полагаться только на browser full reload.

Следить за URL changes через разумный механизм.

---

# 88. Security

Главный принцип:

> DOM Scout работает локально и не отправляет содержимое посещаемых страниц на внешние серверы.

Для MVP:

```text
NO backend
NO analytics
NO AI API
NO remote DOM upload
```

Если позже появится AI:

он должен быть opt-in.

---

# 89. Permissions

Запрашивать минимально необходимые permissions.

Ожидаемый набор:

```text
activeTab
scripting
storage
sidePanel
```

Дополнительные permissions добавлять только если функция действительно их требует.

Не использовать:

```text
<all_urls>
```

без обоснованной необходимости.

---

# 90. Content Security Policy

Соблюдать Manifest V3 CSP.

Не использовать:

```text
eval()
new Function()
remote JS
```

Не загружать executable scripts с CDN.

---

# 91. Error Handling

Extension не должен показывать raw stack trace пользователю.

User message:

```text
Unable to inspect this page.
```

Developer console:

```text
full technical error
```

---

# 92. Unsupported Pages

На страницах вроде:

```text
chrome://
chrome-extension://
Chrome Web Store
```

где injection запрещен, показывать понятное состояние:

```text
DOM inspection is unavailable on this page.
```

---

# 93. Empty States

Не оставлять пустой panel.

Например:

```text
Inspect your first element

Click "Inspect element", then select any element on the page.
```

---

# 94. Loading States

Если идет тяжелый Analyze:

```text
Analyzing page…
```

Не блокировать весь UI, если это не обязательно.

---

# 95. Toast notifications

Использовать для:

```text
Copied
Saved
Project deleted
Config imported
```

Toast небольшой.

Не использовать browser alert.

---

# 96. Confirmation dialogs

Использовать только для destructive actions:

```text
Delete project?
Reset all data?
```

---

# 97. Keyboard shortcuts

Предусмотреть:

```text
Esc
```

остановить Inspector.

Phase 2:

```text
Alt/Option + Shift + D
```

открыть DOM Scout.

Shortcut должен быть configurable через Chrome extension commands.

---

# 98. Accessibility

UI должен:

- иметь keyboard focus;
- иметь visible focus state;
- иметь button titles;
- использовать semantic buttons;
- иметь достаточный contrast;
- не полагаться только на цвет.

---

# 99. Responsive Side Panel

UI должен нормально выглядеть при ширине примерно:

```text
320px
400px
500px
```

При узкой панели:

- таблица Preview может иметь horizontal scroll;
- toolbar может compact;
- длинные selectors должны обрезаться через ellipsis.

---

# 100. Copy behavior

Selector/code копируется без лишних кавычек.

Например:

```text
article.news-card .title
```

Не:

```text
"article.news-card .title"
```

если пользователь выбрал Copy Selector.

---

# 101. Import

Поддержать импорт DOM Scout JSON configuration.

Button:

```text
Import config
```

Проверять schema.

Невалидный JSON:

```text
Invalid DOM Scout configuration
```

---

# 102. Export file naming

Пример:

```text
example.com-news-listing-dom-scout.json
```

Sanitize filename.

---

# 103. Settings

Минимальные settings:

```text
Language
Auto-highlight matches
Absolute URLs by default
Maximum preview rows
Confirm before deleting project
```

Не перегружать settings.

---

# 104. About

Показывать:

```text
DOM Scout
Version
Inspect. Select. Extract.
```

---

# 105. Logging

В development mode разрешены debug logs.

В production:

не засорять console.

Создать helper:

```js
logger.debug()
logger.warn()
logger.error()
```

Debug mode легко отключается.

---

# 106. Testing

Использовать:

```text
Vitest
```

Unit tests как минимум для:

- selector scoring;
- generated-class heuristic;
- URL normalization;
- extraction helpers;
- export generators;
- collection ranking helpers;
- storage migrations.

---

# 107. Manual test pages

Создать локальные fixtures:

```text
tests/fixtures/news-list.html
tests/fixtures/article.html
tests/fixtures/product-list.html
tests/fixtures/product.html
tests/fixtures/dynamic-classes.html
tests/fixtures/lazy-images.html
```

---

# 108. News fixture

Должна содержать:

```text
20 article cards
title
URL
date
image
one missing date
lazy image
pagination
JSON-LD
```

Это позволит проверять coverage.

---

# 109. Product fixture

Содержит:

```text
20 products
name
price
old price
SKU
image
availability
one broken product
Product JSON-LD
```

---

# 110. Selector Score Tests

Примеры:

Хороший:

```css
article.news-card
```

Средний:

```css
main .content .news-card
```

Плохой:

```css
body > div:nth-child(2) > div:nth-child(4) > div:nth-child(3)
```

Score должен логично отличаться.

Не тестировать точное значение, если formula меняется.

Тестировать диапазон/classification.

---

# 111. Code Quality

Требования:

- маленькие модули;
- понятные функции;
- отсутствие огромного `App.jsx`;
- DOM logic отдельно от React;
- selector engine отдельно;
- exporter отдельно;
- Chrome API wrapper отдельно;
- отсутствие copy/paste logic.

---

# 112. Comments

Комментарии писать только там, где они объясняют:

```text
why
```

а не очевидный:

```text
what
```

---

# 113. README

README должен содержать:

```text
What is DOM Scout
Features
Screenshots placeholder
Architecture
Requirements
Installation
Development
Build
Load unpacked extension
Permissions
Privacy
Project structure
Testing
Roadmap
```

---

# 114. Local Development

Команды:

```bash
npm install
npm run dev
npm run build
npm run test
npm run lint
```

Build:

```text
dist/
```

`dist` должен быть готов к:

```text
chrome://extensions
→ Developer mode
→ Load unpacked
```

---

# 115. Manifest

`manifest.json` должен содержать корректные:

```text
manifest_version: 3
name
version
description
default_locale
permissions
background
action
side_panel
icons
```

Если подключается DevTools:

```text
devtools_page
```

---

# 116. Extension icon

На первом этапе можно создать простой temporary vector/icon.

Визуальная идея:

```text
cursor / crosshair
+
DOM brackets < >
```

Не использовать чужие trademark assets.

---

# 117. Onboarding

При первом запуске не делать длинный onboarding wizard.

Показать 3 коротких шага:

```text
1. Click Inspect
2. Select an element
3. Review and copy selector
```

И:

```text
Got it
```

Больше не показывать после закрытия.

---

# 118. MVP — обязательный scope

Первая рабочая версия должна включать:

### Core

- Side Panel;
- Inspector;
- element hover;
- element selection;
- highlight overlay;
- CSS selector generation;
- alternative selector generation;
- selector validation;
- match count;
- selector quality score;
- selector explanations;
- Copy selector;
- XPath;
- Live Selector Tester.

### Collections

- repeated parent detection;
- collection selection;
- fields;
- relative selectors;
- extraction types;
- preview;
- coverage.

### Analyze

- page meta;
- OpenGraph;
- JSON-LD;
- basic article/product clues.

### Export

- JSON;
- Vanilla JS;
- Cheerio;
- Puppeteer;
- Playwright.

### Persistence

- save project;
- recent selectors;
- settings.

### UI

- EN;
- RU;
- UK;
- light modern design;
- responsive side panel.

---

# 119. Не включать в MVP

Не тратить время первой версии на:

```text
AI integration
cloud sync
accounts
backend
team collaboration
paid plans
automatic crawling
proxy support
captcha bypass
browser automation
scheduled monitoring
full network analyzer
complex Shadow DOM selectors
remote scraping
```

---

# 120. Phase 2

После стабильного MVP:

```text
DevTools Network Inspector
API candidate detector
Copy cURL/fetch/Axios
Mutation Monitor
Selector Health
pagination improvements
infinite scroll analysis
Shadow DOM improvements
iframe improvements
keyboard shortcuts
```

---

# 121. Phase 3

Возможные AI features:

```text
AI selector repair
AI page structure analysis
AI field detection
AI parser generation
AI broken-selector suggestions
```

Но AI не должен становиться обязательной частью работы DOM Scout.

---

# 122. AI Selector Repair — future idea

Пример:

Сохранено:

```text
.article-card__headline
```

Теперь:

```text
0 matches
```

DOM Scout ищет похожую DOM structure и предлагает:

```text
Possible replacement

.article-card .title
```

AI может использоваться только как дополнительный ranking layer.

---

# 123. Product UX scenario — News parser

Проверить полный workflow:

1. Пользователь открывает news listing.
2. Открывает DOM Scout.
3. Нажимает Inspect.
4. Кликает title одной новости.
5. DOM Scout генерирует selector.
6. Collection Detector предлагает card container.
7. Пользователь нажимает Use Collection.
8. Collection подсвечивается.
9. Пользователь добавляет:
   - title;
   - url;
   - date;
   - image.
10. Preview показывает 20 новостей.
11. Coverage показывает missing date.
12. Пользователь корректирует selector.
13. Coverage становится 100%.
14. Пользователь выбирает Cheerio.
15. DOM Scout генерирует код.
16. Пользователь копирует код.

Это основной acceptance scenario.

---

# 124. Product UX scenario — E-commerce

1. Открыть category page.
2. Inspect product name.
3. Detect collection.
4. Получить product card.
5. Добавить:
   - name;
   - url;
   - price;
   - oldPrice;
   - sku;
   - image.
6. Preview.
7. Detect duplicates.
8. Export Playwright / Cheerio.

---

# 125. UX scenario — single article

1. Открыть article page.
2. Analyze Page.
3. DOM Scout обнаруживает:
   - NewsArticle JSON-LD;
   - headline;
   - published date;
   - author.
4. Пользователь Inspect article body.
5. Получает selector.
6. Экспортирует config.

---

# 126. Acceptance Criteria — Inspector

Функция считается готовой если:

- Inspector включается;
- hover не ломает сайт;
- элемент подсвечивается;
- click выбирает элемент;
- navigation по ссылке не происходит во время selection;
- Esc отменяет режим;
- overlay полностью удаляется;
- selected element передается Side Panel.

---

# 127. Acceptance Criteria — Selector

Функция готова если:

- есть минимум Recommended + Alternative;
- selector валиден;
- selected element входит в matches;
- показывается match count;
- можно подсветить matches;
- можно скопировать;
- считается quality score;
- пользователь видит причины score.

---

# 128. Acceptance Criteria — Collection

Готово если:

- из child element предлагается repeated parent;
- показывается item count;
- пользователь может вручную изменить selector;
- все items подсвечиваются;
- fields scoped относительно item;
- preview корректный.

---

# 129. Acceptance Criteria — Languages

Готово если:

- весь UI переведен;
- EN работает;
- RU работает;
- UK работает;
- язык можно менять;
- setting сохраняется;
- System locale работает;
- новые UI strings не hardcoded.

---

# 130. Acceptance Criteria — Storage

Готово если:

- project сохраняется;
- после reload Chrome project остается;
- project можно удалить;
- settings сохраняются;
- corrupted data не ломает extension;
- предусмотрена schema version.

---

# 131. Storage Versioning

Использовать:

```js
{
  schemaVersion: 1,
  ...
}
```

Подготовить migration mechanism.

Даже если пока migration только одна.

---

# 132. UX Details

Selectors отображать monospace.

Рядом:

```text
Copy icon
```

При длинном selector:

```text
ellipsis
```

Но tooltip или expand должен показывать полный selector.

---

# 133. Badges

Использовать маленькие badges:

```text
32 matches
Stable
JSON-LD
Lazy
Shadow DOM
```

Не превращать интерфейс в набор цветных pill-компонентов.

---

# 134. Tables

Preview table:

- sticky header;
- компактные rows;
- horizontal scroll;
- copy cell action по необходимости;
- длинные text values truncation.

---

# 135. Inspector overlays

Использовать два визуальных состояния:

```text
hover
selected
```

Selected должен быть визуально заметнее.

Overlay должен учитывать scroll/resize.

---

# 136. DOM changes

Если selected element исчез из DOM:

Side Panel показывает:

```text
Selected element is no longer available.
```

и предлагает:

```text
Inspect another
```

---

# 137. Browser resize

При resize окна highlight должен пересчитывать coordinates.

---

# 138. Scroll

При scroll highlight должен оставаться синхронизирован с элементом.

Не использовать тяжелый scroll handler без throttling/rAF.

---

# 139. Text normalization

При extraction text:

```js
textContent.trim()
```

Дополнительно дать transform:

```text
Normalize whitespace
```

Пример:

```text
"Hello     world"
```

→

```text
"Hello world"
```

---

# 140. Field transforms

MVP transforms:

```text
Trim
Normalize whitespace
Absolute URL
```

Phase 2:

```text
Regex
Replace
Number
Price
Date
```

---

# 141. Privacy page

В README и будущем Chrome Store listing явно указать:

```text
DOM Scout analyzes page content locally in the browser.
No page content is uploaded to external servers in the default version.
```

---

# 142. Chrome Web Store readiness

Не добавлять permissions «на будущее».

Каждый permission должен иметь понятное назначение.

Подготовить:

```text
privacy description
permission rationale
```

в docs.

---

# 143. Design states

Для каждого feature предусмотреть:

```text
empty
loading
success
warning
error
disabled
unsupported
```

---

# 144. Developer experience

Код должен быть удобен для дальнейшей разработки AI coding agents.

Поэтому:

- небольшие файлы;
- predictable naming;
- JSDoc для сложных public functions;
- понятные data structures;
- fixtures;
- unit tests;
- README architecture section.

---

# 145. Не делать overengineering

Не добавлять:

```text
Redux
GraphQL
database
backend
microservices
Docker
authentication
server API
```

если они не нужны.

Это локальный Chrome Extension.

---

# 146. Data Model

Рекомендуемый project:

```js
{
  id: "uuid",
  schemaVersion: 1,
  name: "News listing",
  domain: "example.com",
  urlPattern: "/news",
  createdAt: 0,
  updatedAt: 0,

  collection: {
    selector: "article.news-card",
    score: 94
  },

  fields: [
    {
      id: "uuid",
      name: "title",
      selector: ".title",
      extraction: {
        type: "text"
      },
      transforms: [
        "trim",
        "normalizeWhitespace"
      ]
    }
  ]
}
```

---

# 147. Selected Element Model

```js
{
  tagName: "a",
  id: "",
  classes: [
    "article-title"
  ],
  textPreview: "Apple...",
  attributes: {
    href: "/news/123"
  },
  rect: {
    x: 0,
    y: 0,
    width: 300,
    height: 40
  },
  selectors: []
}
```

---

# 148. Selector Candidate Model

```js
{
  selector: "article.news-card .article-title",
  type: "css",
  matchCount: 32,
  containsSelectedElement: true,
  score: 92,
  quality: "stable",
  reasons: [
    "semantic-class",
    "short-path"
  ]
}
```

---

# 149. Field Preview Model

```js
{
  fieldId: "...",
  found: 31,
  total: 32,
  coverage: 96.875,
  duplicateCount: 0,
  values: []
}
```

---

# 150. Development sequence

AI agent должен реализовывать приложение поэтапно.

## Stage 1 — Foundation

- Vite;
- React;
- Manifest V3;
- Side Panel;
- service worker;
- content script;
- messaging;
- localization;
- base UI.

Не переходить дальше, пока Side Panel реально не открывается и messaging работает.

---

# 151. Stage 2 — Inspector

Реализовать:

- activate/deactivate;
- hover overlay;
- selection;
- Esc;
- selected element model;
- Side Panel display.

---

# 152. Stage 3 — Selector Engine

Реализовать:

- CSS generation;
- candidates;
- validation;
- match count;
- highlight;
- scoring;
- copy.

---

# 153. Stage 4 — Collection

Реализовать:

- ancestor analysis;
- collection candidates;
- field configuration;
- extraction;
- preview;
- coverage.

---

# 154. Stage 5 — Analyze

Реализовать:

- meta;
- OpenGraph;
- canonical;
- JSON-LD;
- basic page type clues.

---

# 155. Stage 6 — Export

Реализовать exporters:

- Config JSON;
- Vanilla;
- Cheerio;
- Puppeteer;
- Playwright.

Добавить unit tests.

---

# 156. Stage 7 — Persistence

- projects;
- history;
- settings;
- import/export;
- schema version.

---

# 157. Stage 8 — Polish

- responsive;
- accessibility;
- translations review;
- errors;
- empty states;
- onboarding;
- performance;
- README.

---

# 158. Stage 9 — Network Inspector

Только после стабильного MVP.

Реализовать отдельным feature branch/module.

---

# 159. Agent behavior

AI coding agent не должен генерировать весь проект одним огромным шагом.

Работать итеративно.

После каждого Stage:

1. проверить build;
2. проверить lint;
3. запустить tests;
4. проверить extension в Chrome;
5. исправить ошибки;
6. только потом переходить дальше.

---

# 160. Не оставлять mock implementation

Если UI-кнопка присутствует в MVP, она должна работать.

Не оставлять:

```text
TODO
Coming soon
Fake data
console.log only
```

для функций, обозначенных как готовые.

Phase 2 функции можно скрыть до реализации.

---

# 161. Definition of Done

MVP считается законченным когда пользователь может:

```text
1. установить extension;
2. открыть любой обычный сайт;
3. открыть DOM Scout Side Panel;
4. выбрать элемент;
5. получить надежный CSS selector;
6. увидеть match count;
7. увидеть selector quality;
8. обнаружить collection;
9. добавить несколько fields;
10. получить preview;
11. увидеть coverage;
12. посмотреть JSON-LD/meta;
13. экспортировать scraper code;
14. сохранить project;
15. сменить EN/RU/UK язык.
```

---

# 162. Финальная проверка AI-агента

Перед завершением проекта самостоятельно проверить:

## Chrome

```text
Extension loads
No manifest errors
No CSP errors
No service worker errors
No side panel errors
```

## Inspector

```text
hover
click
Esc
scroll
resize
cleanup
```

## Selector

```text
unique element
multiple elements
generated classes
deep DOM
invalid selector
0 matches
```

## Collection

```text
news list
product list
missing fields
duplicate values
```

## Analyze

```text
meta
OpenGraph
JSON-LD
invalid JSON-LD
multiple JSON-LD blocks
```

## i18n

```text
EN
RU
UK
System
```

## Export

```text
JSON
JS
Cheerio
Puppeteer
Playwright
```

---

# 163. Что должно быть возвращено после реализации

AI-агент должен предоставить:

1. полностью рабочий source code;
2. `README.md`;
3. `CHANGELOG.md`;
4. инструкции запуска;
5. инструкции `Load unpacked`;
6. production build;
7. краткое описание architecture;
8. список permissions и объяснение;
9. список реализованных features;
10. список Phase 2 features;
11. результаты tests;
12. известные ограничения.

---

# 164. Основной приоритет разработки

Если возникает выбор между:

```text
больше функций
```

и:

```text
быстрый, понятный, стабильный workflow
```

выбирать второй вариант.

Главная ценность DOM Scout:

> разработчик должен исследовать DOM и подготовить данные для парсера значительно быстрее, чем через обычные Chrome DevTools.

---

# 165. Финальное направление продукта

DOM Scout должен ощущаться как профессиональный developer tool:

```text
быстрый
локальный
понятный
легкий
технический
аккуратный
не перегруженный
```

Не превращать его в no-code scraper SaaS.

Не превращать его в универсальный browser automation tool.

Не превращать его в AI-chat.

Главная специализация:

> **DOM inspection + reliable selectors + repeated collections + extraction preview + scraper export.**

---

# 166. Короткое product statement для README

> **DOM Scout is a lightweight Chrome developer tool for inspecting page structures, generating and validating reliable selectors, detecting repeated collections, previewing extracted data, and exporting scraper-ready configurations and code.**

---

# 167. Референсы Chrome API

При реализации сверяться с актуальной официальной документацией Chrome:

- Side Panel API  
  https://developer.chrome.com/docs/extensions/reference/api/sidePanel

- Scripting API  
  https://developer.chrome.com/docs/extensions/reference/api/scripting

- Internationalization  
  https://developer.chrome.com/docs/extensions/reference/api/i18n

- Chrome DevTools Network API  
  https://developer.chrome.com/docs/extensions/reference/api/devtools/network

- Chrome Extensions documentation  
  https://developer.chrome.com/docs/extensions

Не копировать архитектурные решения вслепую из устаревших Manifest V2 примеров.

---

# 168. Начальный prompt для запуска coding agent

Используй это как дополнительную стартовую команду после передачи данного ТЗ:

```text
Изучи полностью файл DOM_SCOUT_AI_AGENT_TASK.md.

Твоя задача — реализовать Chrome Extension DOM Scout в соответствии с этим техническим заданием.

Начни с анализа требований и текущей структуры репозитория.

Если репозиторий пустой — создай архитектуру проекта с нуля.

Используй Chrome Extension Manifest V3, React + Vite и JavaScript без TypeScript.

Не пытайся реализовать весь scope одним огромным коммитом. Работай по Stage-плану из ТЗ.

Сначала создай рабочий foundation:
- Manifest V3;
- Vite;
- React;
- Side Panel;
- content script;
- background service worker;
- messaging;
- EN/RU/UK localization;
- базовую светлую UI-систему.

После этого реализуй Inspector и только затем Selector Engine, Collection Mode, Analyze и Export.

На каждом этапе:
- проверяй build;
- запускай tests;
- исправляй ошибки;
- не оставляй fake implementation;
- не ломай уже работающие функции.

UI должен быть светлым, современным, компактным и профессиональным, без визуальной перегрузки.

Главный продуктовый приоритет:
DOM Scout должен максимально ускорять исследование DOM и подготовку надежных селекторов/структуры данных для реальных web scrapers.
```
