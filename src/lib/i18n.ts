/**
 * Internationalisation.
 *
 * `en` is the canonical dictionary; `ru` must cover exactly the same keys.
 * Components never hardcode user-facing strings - they call `t(key, params)`.
 * Number/date/percent formatting goes through Intl with the active locale.
 */

export type Language = 'en' | 'ru';

export const DEFAULT_LANGUAGE: Language = 'en';

export const LANGUAGES: { id: Language; label: string; flag: string }[] = [
  { id: 'en', label: 'English', flag: '🇬🇧' },
  { id: 'ru', label: 'Русский', flag: '🇷🇺' },
];

const LOCALES: Record<Language, string> = {
  en: 'en-US',
  ru: 'ru-RU',
};

const en = {
  // ---- Common -------------------------------------------------------------
  'common.close': 'Close',
  'common.copy': 'Copy',
  'common.copied': 'Copied',
  'common.copyFailed': 'Copy failed',
  'common.save': 'Save',
  'common.open': 'Open',
  'common.cancel': 'Cancel',
  'common.search': 'Search',
  'common.loading': 'Loading…',

  // ---- App ----------------------------------------------------------------
  'app.brandTop': 'BABYLON',
  'app.brandBottom': 'LIBRARY',
  'app.title': 'Library of Babel',
  'app.pageTitle': 'Page {id} — Library of Babel',
  'app.footer':
    'Every page is computed deterministically from its address · 6400 characters · no database',

  // ---- Header -------------------------------------------------------------
  'header.search': 'Search (/)',
  'header.bookmarks': 'Bookmarks',
  'header.compare': 'Compare pages',
  'header.stats': 'Statistics',
  'header.settings': 'Settings',
  'header.debug': 'Debug',
  'header.about': 'About the library',
  'header.textToPage': 'Text → Page',
  'header.toggleTheme': 'Toggle theme',
  'header.commandPalette': 'Command palette (Ctrl+K)',

  // ---- Home ---------------------------------------------------------------
  'home.kicker': 'Babylon · Library',
  'home.title': 'Explore the Library',
  'home.subtitle': 'An infinite space of every possible fixed-length text',

  // ---- Page ---------------------------------------------------------------
  'page.current': 'Current Page',
  'page.address': 'Page address',
  'page.copyAddress': 'Copy address',
  'page.copyAddressButton': 'Address',
  'page.share': 'Share',
  'page.shareTitle': 'Share link',
  'page.save': 'Save',
  'page.saveTitle': 'Save page',
  'page.showFull': 'Show full address ({count})',
  'page.collapse': 'Collapse address',
  'page.index': 'index',
  'page.alphabet': 'alphabet',
  'page.previous': 'Previous',
  'page.random': 'Random',
  'page.next': 'Next',
  'page.previousTitle': 'Previous page (←)',
  'page.randomTitle': 'Random page (R)',
  'page.nextTitle': 'Next page (→)',
  'page.open': 'Open',
  'page.goToPlaceholder': 'Enter a page address…',
  'page.charCount': '{count} / {total} characters',
  'page.mode': 'mode',
  'page.invalidAddress': 'Invalid page address. Check the address format.',
  'page.invalidAddressHint': 'An address may contain A–Z, a–z, 0–9, “-” and “_”.',

  // ---- Page modes ---------------------------------------------------------
  'mode.book': 'Book',
  'mode.terminal': 'Terminal',
  'mode.minimal': 'Minimal',

  // ---- Generation mode ----------------------------------------------------
  'generation.title': 'Generation Mode',
  'generation.traditional': 'Traditional',
  'generation.pseudo': 'Pseudo-Random',
  'generation.traditional.tooltip': 'Original deterministic library generation.',
  'generation.pseudo.tooltip':
    'Deterministic pseudo-random generation. The same address always produces the same page.',

  // ---- Search -------------------------------------------------------------
  'search.title': 'Search the Library',
  'search.subtitle': 'Enter a phrase — we find the page mathematically and highlight it in the text.',
  'search.placeholder': 'Enter text you want to find…',
  'search.button': 'Search',
  'search.searching': 'Searching…',
  'search.queryLength': 'Query length: {count} / {total}',
  'search.alphabetValidation': 'Alphabet validation:',
  'search.allAvailable': 'all characters available',
  'search.missingCount': 'missing characters: {count}',
  'search.tooLong': 'The text is longer than one page ({total} characters). Shorten the query.',
  'search.missingTitle': 'Some characters are missing from the current alphabet',
  'search.missingExplain': 'This query cannot be placed directly in the current library space.',
  'search.missingList': 'Missing characters: {count}',
  'search.currentAlphabet': 'Current alphabet: {count} characters',
  'search.enableMissing': 'Enable missing characters',
  'search.cannotEnable': 'These characters cannot be added through existing groups: {list}',
  'search.found': 'Found',
  'search.foundExplain': 'First occurrence at position {position}. The page is open; matches are highlighted.',
  'search.previousMatch': 'Previous match',
  'search.nextMatch': 'Next match',

  // ---- Text → Page --------------------------------------------------------
  'textToPage.title': 'Text → Page',
  'textToPage.subtitle': 'Mathematical search across the library space',

  // ---- Command palette ----------------------------------------------------
  'palette.placeholder': 'Search commands…',
  'palette.goToPlaceholder': 'Enter a page address and press Enter…',
  'palette.noResults': 'No results',
  'palette.goToHint': 'A page address or a decimal index is supported. For example:',
  'palette.goToExample': '42',
  'palette.openPage': 'Open page',
  'palette.footer': '↑↓ navigate · Enter to select',
  'palette.group.navigation': 'Navigation',
  'palette.group.page': 'Page',
  'palette.group.alphabet': 'Alphabet',
  'palette.group.interface': 'Interface',
  'palette.random': 'Random Page',
  'palette.goto': 'Go To Page',
  'palette.find': 'Find Text',
  'palette.textToPage': 'Text → Page',
  'palette.save': 'Save Page',
  'palette.compare': 'Compare Pages',
  'palette.copyAddress': 'Copy Address',
  'palette.copyPage': 'Copy Page',
  'palette.toggleNumbers': 'Toggle Numbers',
  'palette.toggleEnglish': 'Toggle English',
  'palette.toggleSpecial': 'Toggle Special Characters',
  'palette.changeTheme': 'Change Theme',
  'palette.openBookmarks': 'Open Bookmarks',
  'palette.stats': 'Library Statistics',
  'palette.settings': 'Settings',
  'palette.about': 'About the Library',

  // ---- Bookmarks ----------------------------------------------------------
  'bookmarks.title': 'Bookmarks',
  'bookmarks.subtitle': 'Saved pages: {count}',
  'bookmarks.empty': 'No saved pages yet.',
  'bookmarks.emptyHint': 'Open a page and press “Save” or Ctrl+S.',
  'bookmarks.rename': 'Save title',
  'bookmarks.open': 'Open',
  'bookmarks.copyAddress': 'Copy address',
  'bookmarks.renameAction': 'Rename',
  'bookmarks.delete': 'Delete',
  'bookmarks.alphabet': 'alphabet {code}',
  'bookmarks.mode': 'mode {mode}',

  // ---- Compare ------------------------------------------------------------
  'compare.title': 'Compare Pages',
  'compare.left': 'Left page',
  'compare.right': 'Right page',
  'compare.mode': 'Mode',
  'compare.leftPlaceholder': 'Left page address…',
  'compare.rightPlaceholder': 'Right page address…',
  'compare.useCurrent': 'Use current page',
  'compare.random': 'Random',
  'compare.button': 'Compare',
  'compare.comparing': 'Comparing…',
  'compare.diffMode': 'Diff Mode',
  'compare.match': 'Match',
  'compare.matching': 'Matching',
  'compare.differing': 'Differing',
  'compare.total': 'Total',
  'compare.errorBoth': 'Specify both addresses',
  'compare.errorLoad': 'Failed to compute one of the pages',
  'compare.open': 'Open',

  // ---- Statistics ---------------------------------------------------------
  'stats.title': 'Library Statistics',
  'stats.subtitle': 'Scale of the space',
  'stats.possiblePages': 'Number of possible pages',
  'stats.sameTexts':
    'The same number of distinct texts: each page is one unique text. This number has {digits} decimal digits.',
  'stats.alphabetSize': 'Symbols in alphabet',
  'stats.pageLength': 'Page length',
  'stats.fixed': 'fixed',
  'stats.digitsInAlphabet': 'Digits in alphabet',
  'stats.included': 'included',
  'stats.excluded': 'excluded',
  'stats.base': 'Base of the system',
  'stats.baseSub': 'positional notation',
  'stats.generationMode': 'Generation Mode',
  'stats.currentAddress': 'Current address',
  'stats.addressLength': 'address length: {count} characters',
  'stats.currentIndex': 'Current page index',
  'stats.alphabet': 'Alphabet',

  // ---- Debug --------------------------------------------------------------
  'debug.title': 'Developer / Debug',
  'debug.subtitle': 'Determinism check',
  'debug.alphabetSize': 'Alphabet size',
  'debug.alphabetCode': 'Alphabet code',
  'debug.pageLength': 'Page length',
  'debug.pageIndex': 'Page index',
  'debug.encodedIndex': 'Encoded index (address)',
  'debug.decodedIndex': 'Decoded index',
  'debug.roundTrip': 'Round-trip address',
  'debug.roundTripOk': 'The address decodes and re-encodes losslessly',
  'debug.roundTripFail': 'Mismatch',
  'debug.checksum': 'Checksum (SHA-256)',
  'debug.verifyOk': 'Re-generation matched ✓',
  'debug.verifyFail': 'Mismatch',
  'debug.verify': 'Verify Page',
  'debug.verifying': 'Verifying…',
  'debug.verifyHint':
    'Verification recomputes the page from the index and compares the result. Address: {address}',
  'debug.error': 'Verification error',

  // ---- Settings -----------------------------------------------------------
  'settings.title': 'Settings',
  'settings.subtitle': 'Alphabet and appearance',
  'settings.alphabet': 'Alphabet',
  'settings.alphabetHint':
    'Disabling a group changes the alphabet size, so the entire library space is recalculated automatically.',
  'settings.alphabetSize': 'N = {count}',
  'settings.theme': 'Theme',
  'settings.language': 'Language',
  'settings.optional': 'optional',
  'settings.persistHint':
    'Settings are stored locally in your browser. You can share the current alphabet and mode via the “Share” button — they are encoded in the link.',

  // ---- About --------------------------------------------------------------
  'about.title': 'About the Library',
  'about.intro':
    'The library is a positional numeral system. The alphabet has {size} symbols and a page is exactly {length} symbols. Every page uniquely corresponds to a number (index) from 0 to N^{length}−1.',
  'about.howTitle': 'How it works',
  'about.how1':
    'Index → text: the number is expanded in base N, each digit maps to an alphabet symbol.',
  'about.how2': 'Text → index: the inverse transformation (Horner’s method).',
  'about.how3':
    'An address is a compact base64 encoding of the index. The same address always yields the same text.',
  'about.how4':
    'Search does not enumerate pages: we mathematically construct the canonical page containing the query at a deterministic position.',
  'about.how5':
    'Nothing is stored: a page is computed on the fly (in a Web Worker) and never written to a database.',
  'about.limitTitle': 'Honest limitation',
  'about.limit':
    'Exact addressing and short addresses are incompatible: a page carries as much information as it has symbols. That is why the address is long — the price of mathematical enumerability. Search is only possible for characters present in the current alphabet; if a character is missing, the UI offers to enable the group that contains it.',
  'about.privacy':
    'Bookmarks, alphabet settings and the last session are stored only locally in your browser.',

  // ---- Themes -------------------------------------------------------------
  'theme.system': 'System',
  'theme.dark': 'Dark',
  'theme.light': 'Light',
  'theme.terminal': 'Terminal',
  'theme.minimal': 'Minimal',

  // ---- Language names -----------------------------------------------------
  'language.en': 'English',
  'language.ru': 'Русский',

  // ---- Alphabet groups ----------------------------------------------------
  'alphabet.group.ru': 'Cyrillic letters',
  'alphabet.group.ru.description': 'Аа–Яя, including Ё',
  'alphabet.enable.ru': 'Enable Cyrillic',
  'alphabet.group.en': 'Latin letters',
  'alphabet.group.en.description': 'Aa–Zz',
  'alphabet.enable.en': 'Enable Latin',
  'alphabet.group.digits': 'Digits 0–9',
  'alphabet.group.digits.description': 'Ten digits (optional)',
  'alphabet.enable.digits': 'Enable numbers',
  'alphabet.group.space': 'Space',
  'alphabet.group.space.description': 'A single separator',
  'alphabet.enable.space': 'Enable space',
  'alphabet.group.punctuation': 'Punctuation marks',
  'alphabet.group.punctuation.description': '.,!?;:«»()[]{}—–…',
  'alphabet.enable.punctuation': 'Enable punctuation',
  'alphabet.group.special': 'Special characters',
  'alphabet.group.special.description': '@#$%^&*+=<>|/\\~`_',
  'alphabet.enable.special': 'Enable special characters',

  // ---- Special character names (the characters themselves are never translated)
  'missing.space': 'SPACE',
  'missing.newline': 'NEWLINE',
  'missing.tab': 'TAB',
  'missing.cr': 'CR',
  'missing.nbsp': 'NBSP',
  'missing.zwsp': 'ZWSP',
  'missing.lineSeparator': 'LINE SEPARATOR',
  'missing.paragraphSeparator': 'PARAGRAPH SEPARATOR',
  'missing.vt': 'VT',
  'missing.ff': 'FF',

  // ---- 404 ----------------------------------------------------------------
  'notFound.title': 'Page not found',
  'notFound.message':
    'There is no such address in this universe of the library — or it is corrupted. But every possible page exists somewhere in the space.',
  'notFound.home': 'Home',
  'notFound.random': 'Random page',

  // ---- Toasts & errors ----------------------------------------------------
  'toast.addressCopied': 'Address copied',
  'toast.copyFailed': 'Copy failed',
  'toast.pageTextCopied': 'Page text copied',
  'toast.shareCopied': 'Link copied',
  'toast.shareFailed': 'Failed to copy link',
  'toast.bookmarkSaved': 'Page saved to bookmarks',
  'toast.addressParseFailed': 'Could not parse the address',
  'error.invalidAddress': 'Invalid page address. Check the address format.',
  'error.pageComputeFailed': 'Failed to compute the page',
  'error.verifyFailed': 'Verification error',
  'error.somethingWrong': 'Something went wrong',
  'error.crashMessage': 'The library hit an unexpected problem while computing the page.',
  'error.backToLibrary': 'Back to the library',
} as const;

export type TranslationKey = keyof typeof en;

const ru: Record<TranslationKey, string> = {
  'common.close': 'Закрыть',
  'common.copy': 'Копировать',
  'common.copied': 'Скопировано',
  'common.copyFailed': 'Не удалось скопировать',
  'common.save': 'Сохранить',
  'common.open': 'Открыть',
  'common.cancel': 'Отмена',
  'common.search': 'Поиск',
  'common.loading': 'Загрузка…',

  'app.brandTop': 'BABYLON',
  'app.brandBottom': 'LIBRARY',
  'app.title': 'Вавилонская библиотека',
  'app.pageTitle': 'Страница {id} — Вавилонская библиотека',
  'app.footer':
    'Каждая страница вычисляется детерминированно из своего адреса · 6400 символов · без базы данных',

  'header.search': 'Поиск (/)',
  'header.bookmarks': 'Избранное',
  'header.compare': 'Сравнить страницы',
  'header.stats': 'Статистика',
  'header.settings': 'Настройки',
  'header.debug': 'Отладка',
  'header.about': 'О библиотеке',
  'header.textToPage': 'Текст → страница',
  'header.toggleTheme': 'Сменить тему',
  'header.commandPalette': 'Палитра команд (Ctrl+K)',

  'home.kicker': 'Babylon · Library',
  'home.title': 'Исследуйте библиотеку',
  'home.subtitle': 'Бесконечное пространство всех возможных текстов фиксированной длины',

  'page.current': 'Текущая страница',
  'page.address': 'Адрес страницы',
  'page.copyAddress': 'Скопировать адрес',
  'page.copyAddressButton': 'Адрес',
  'page.share': 'Поделиться',
  'page.shareTitle': 'Поделиться ссылкой',
  'page.save': 'Сохранить',
  'page.saveTitle': 'Сохранить страницу',
  'page.showFull': 'Показать полностью ({count})',
  'page.collapse': 'Свернуть адрес',
  'page.index': 'индекс',
  'page.alphabet': 'алфавит',
  'page.previous': 'Предыдущая',
  'page.random': 'Случайная',
  'page.next': 'Следующая',
  'page.previousTitle': 'Предыдущая страница (←)',
  'page.randomTitle': 'Случайная страница (R)',
  'page.nextTitle': 'Следующая страница (→)',
  'page.open': 'Открыть',
  'page.goToPlaceholder': 'Введите адрес страницы…',
  'page.charCount': '{count} / {total} символов',
  'page.mode': 'режим',
  'page.invalidAddress': 'Некорректный адрес страницы. Проверьте формат адреса.',
  'page.invalidAddressHint': 'Адрес может состоять из A–Z, a–z, 0–9, «-» и «_».',

  'mode.book': 'Книга',
  'mode.terminal': 'Терминал',
  'mode.minimal': 'Минимал',

  'generation.title': 'Режим генерации',
  'generation.traditional': 'Традиционная',
  'generation.pseudo': 'Псевдорандомная',
  'generation.traditional.tooltip': 'Оригинальный детерминированный алгоритм библиотеки.',
  'generation.pseudo.tooltip':
    'Детерминированная псевдослучайная генерация. Один адрес всегда создаёт одну и ту же страницу.',

  'search.title': 'Поиск по библиотеке',
  'search.subtitle': 'Введите фразу — мы математически найдём страницу и подсветим её в тексте.',
  'search.placeholder': 'Введите текст, который хотите найти…',
  'search.button': 'Найти',
  'search.searching': 'Поиск…',
  'search.queryLength': 'Длина запроса: {count} / {total}',
  'search.alphabetValidation': 'Проверка алфавита:',
  'search.allAvailable': 'все символы доступны',
  'search.missingCount': 'отсутствует символов: {count}',
  'search.tooLong': 'Текст длиннее одной страницы ({total} символов). Сократите запрос.',
  'search.missingTitle': 'Некоторые символы отсутствуют в текущем алфавите',
  'search.missingExplain': 'Этот запрос нельзя напрямую разместить в текущем пространстве библиотеки.',
  'search.missingList': 'Отсутствующие символы: {count}',
  'search.currentAlphabet': 'Текущий алфавит: {count} символов',
  'search.enableMissing': 'Включить отсутствующие символы',
  'search.cannotEnable': 'Эти символы нельзя добавить через существующие группы: {list}',
  'search.found': 'Найдено',
  'search.foundExplain': 'Первое вхождение — позиция {position}. Страница открыта, совпадения подсвечены.',
  'search.previousMatch': 'Предыдущее совпадение',
  'search.nextMatch': 'Следующее совпадение',

  'textToPage.title': 'Текст → страница',
  'textToPage.subtitle': 'Математический поиск по пространству библиотеки',

  'palette.placeholder': 'Поиск команд…',
  'palette.goToPlaceholder': 'Введите адрес страницы и нажмите Enter…',
  'palette.noResults': 'Ничего не найдено',
  'palette.goToHint': 'Поддерживается адрес страницы или десятичный индекс. Например:',
  'palette.goToExample': '42',
  'palette.openPage': 'Открыть страницу',
  'palette.footer': '↑↓ навигация · Enter выбрать',
  'palette.group.navigation': 'Навигация',
  'palette.group.page': 'Страница',
  'palette.group.alphabet': 'Алфавит',
  'palette.group.interface': 'Интерфейс',
  'palette.random': 'Случайная страница',
  'palette.goto': 'Перейти к странице',
  'palette.find': 'Найти текст',
  'palette.textToPage': 'Текст → страница',
  'palette.save': 'Сохранить страницу',
  'palette.compare': 'Сравнить страницы',
  'palette.copyAddress': 'Скопировать адрес',
  'palette.copyPage': 'Скопировать страницу',
  'palette.toggleNumbers': 'Переключить цифры',
  'palette.toggleEnglish': 'Переключить английский',
  'palette.toggleSpecial': 'Переключить спецсимволы',
  'palette.changeTheme': 'Сменить тему',
  'palette.openBookmarks': 'Открыть избранное',
  'palette.stats': 'Статистика библиотеки',
  'palette.settings': 'Настройки',
  'palette.about': 'О библиотеке',

  'bookmarks.title': 'Избранное',
  'bookmarks.subtitle': 'Сохранено страниц: {count}',
  'bookmarks.empty': 'Пока нет сохранённых страниц.',
  'bookmarks.emptyHint': 'Откройте страницу и нажмите «Сохранить» или Ctrl+S.',
  'bookmarks.rename': 'Сохранить название',
  'bookmarks.open': 'Открыть',
  'bookmarks.copyAddress': 'Копировать адрес',
  'bookmarks.renameAction': 'Переименовать',
  'bookmarks.delete': 'Удалить',
  'bookmarks.alphabet': 'алфавит {code}',
  'bookmarks.mode': 'режим {mode}',

  'compare.title': 'Сравнение страниц',
  'compare.left': 'Левая страница',
  'compare.right': 'Правая страница',
  'compare.mode': 'Режим',
  'compare.leftPlaceholder': 'Адрес левой страницы…',
  'compare.rightPlaceholder': 'Адрес правой страницы…',
  'compare.useCurrent': 'Взять текущую',
  'compare.random': 'Случайная',
  'compare.button': 'Сравнить',
  'compare.comparing': 'Сравнение…',
  'compare.diffMode': 'Режим различий',
  'compare.match': 'Совпадение',
  'compare.matching': 'Совпадает',
  'compare.differing': 'Отличается',
  'compare.total': 'Всего',
  'compare.errorBoth': 'Укажите оба адреса',
  'compare.errorLoad': 'Не удалось вычислить одну из страниц',
  'compare.open': 'Открыть',

  'stats.title': 'Статистика библиотеки',
  'stats.subtitle': 'Масштаб пространства',
  'stats.possiblePages': 'Число возможных страниц',
  'stats.sameTexts':
    'Столько же различных текстов: каждая страница — один уникальный текст. Это число содержит {digits} десятичных цифр.',
  'stats.alphabetSize': 'Символов в алфавите',
  'stats.pageLength': 'Длина страницы',
  'stats.fixed': 'фиксированная',
  'stats.digitsInAlphabet': 'Цифр в алфавите',
  'stats.included': 'включены',
  'stats.excluded': 'выключены',
  'stats.base': 'Основание системы',
  'stats.baseSub': 'позиционная запись',
  'stats.generationMode': 'Режим генерации',
  'stats.currentAddress': 'Текущий адрес',
  'stats.addressLength': 'длина адреса: {count} символов',
  'stats.currentIndex': 'Текущий индекс страницы',
  'stats.alphabet': 'Алфавит',

  'debug.title': 'Разработка / Отладка',
  'debug.subtitle': 'Проверка детерминированности',
  'debug.alphabetSize': 'Размер алфавита',
  'debug.alphabetCode': 'Код алфавита',
  'debug.pageLength': 'Длина страницы',
  'debug.pageIndex': 'Индекс страницы',
  'debug.encodedIndex': 'Закодированный индекс (адрес)',
  'debug.decodedIndex': 'Декодированный индекс',
  'debug.roundTrip': 'Обратимость адреса',
  'debug.roundTripOk': 'Адрес декодируется и кодируется обратно без потерь',
  'debug.roundTripFail': 'Несовпадение',
  'debug.checksum': 'Контрольная сумма (SHA-256)',
  'debug.verifyOk': 'Повторная генерация совпала ✓',
  'debug.verifyFail': 'Несовпадение',
  'debug.verify': 'Проверить страницу',
  'debug.verifying': 'Проверка…',
  'debug.verifyHint':
    'Проверка повторно вычисляет страницу из индекса и сравнивает результат. Адрес: {address}',
  'debug.error': 'Ошибка проверки',

  'settings.title': 'Настройки',
  'settings.subtitle': 'Алфавит и оформление',
  'settings.alphabet': 'Алфавит',
  'settings.alphabetHint':
    'Отключение группы меняет размер алфавита, а значит и всё пространство библиотеки пересчитывается автоматически.',
  'settings.alphabetSize': 'N = {count}',
  'settings.theme': 'Тема оформления',
  'settings.language': 'Язык',
  'settings.optional': 'опционально',
  'settings.persistHint':
    'Настройки сохраняются локально в браузере. Поделиться текущим алфавитом и режимом можно через кнопку «Поделиться» — они зашифрованы в ссылке.',

  'about.title': 'О библиотеке',
  'about.intro':
    'Библиотека — это позиционная система счисления. Алфавит содержит {size} символов, страница — ровно {length} символов. Каждая страница однозначно соответствует числу (индексу) от 0 до N^{length}−1.',
  'about.howTitle': 'Как это работает',
  'about.how1':
    'Индекс → текст: число раскладывается по основанию N, каждая цифра отображается в символ алфавита.',
  'about.how2': 'Текст → индекс: обратное преобразование (схема Горнера).',
  'about.how3':
    'Адрес — это компактная base64-запись индекса. Один и тот же адрес всегда даёт один и тот же текст.',
  'about.how4':
    'Поиск не перебирает страницы: мы математически конструируем каноническую страницу, содержащую запрос в детерминированной позиции.',
  'about.how5':
    'Ничего не хранится: страница вычисляется на лету (в Web Worker) и не пишется в базу данных.',
  'about.limitTitle': 'Честное ограничение',
  'about.limit':
    'Точная адресация и короткие адреса несовместимы: страница несёт столько информации, сколько символов в ней. Поэтому адрес длинный — это цена математической перечислимости. Поиск возможен только для символов, входящих в текущий алфавит; если символа нет, интерфейс предложит включить нужную группу.',
  'about.privacy':
    'Избранное, настройки алфавита и последняя сессия хранятся только локально в вашем браузере.',

  'theme.system': 'Системная',
  'theme.dark': 'Тёмная',
  'theme.light': 'Светлая',
  'theme.terminal': 'Terminal',
  'theme.minimal': 'Minimal',

  'language.en': 'English',
  'language.ru': 'Русский',

  'alphabet.group.ru': 'Русские буквы',
  'alphabet.group.ru.description': 'Аа–Яя, включая Ё',
  'alphabet.enable.ru': 'Включить кириллицу',
  'alphabet.group.en': 'Английские буквы',
  'alphabet.group.en.description': 'Aa–Zz',
  'alphabet.enable.en': 'Включить латиницу',
  'alphabet.group.digits': 'Цифры 0–9',
  'alphabet.group.digits.description': 'Десять цифр (опционально)',
  'alphabet.enable.digits': 'Включить цифры',
  'alphabet.group.space': 'Пробел',
  'alphabet.group.space.description': 'Один разделитель',
  'alphabet.enable.space': 'Включить пробел',
  'alphabet.group.punctuation': 'Знаки пунктуации',
  'alphabet.group.punctuation.description': '.,!?;:«»()[]{}—–…',
  'alphabet.enable.punctuation': 'Включить пунктуацию',
  'alphabet.group.special': 'Специальные символы',
  'alphabet.group.special.description': '@#$%^&*+=<>|/\\~`_',
  'alphabet.enable.special': 'Включить спецсимволы',

  'missing.space': 'ПРОБЕЛ',
  'missing.newline': 'НОВАЯ СТРОКА',
  'missing.tab': 'ТАБУЛЯЦИЯ',
  'missing.cr': 'CR',
  'missing.nbsp': 'НЕРАЗРЫВНЫЙ ПРОБЕЛ',
  'missing.zwsp': 'ZWSP',
  'missing.lineSeparator': 'РАЗДЕЛИТЕЛЬ СТРОК',
  'missing.paragraphSeparator': 'РАЗДЕЛИТЕЛЬ АБЗАЦЕВ',
  'missing.vt': 'VT',
  'missing.ff': 'FF',

  'notFound.title': 'Страница не найдена',
  'notFound.message':
    'Такого адреса нет в этой вселенной библиотеки — либо он повреждён. Но любая возможная страница существует где-то в пространстве.',
  'notFound.home': 'На главную',
  'notFound.random': 'Случайная страница',

  'toast.addressCopied': 'Адрес скопирован',
  'toast.copyFailed': 'Не удалось скопировать',
  'toast.pageTextCopied': 'Текст страницы скопирован',
  'toast.shareCopied': 'Ссылка скопирована',
  'toast.shareFailed': 'Не удалось скопировать ссылку',
  'toast.bookmarkSaved': 'Страница сохранена в избранное',
  'toast.addressParseFailed': 'Не удалось разобрать адрес',
  'error.invalidAddress': 'Некорректный адрес страницы. Проверьте формат адреса.',
  'error.pageComputeFailed': 'Не удалось вычислить страницу',
  'error.verifyFailed': 'Ошибка проверки',
  'error.somethingWrong': 'Произошла ошибка',
  'error.crashMessage': 'Библиотека столкнулась с непредвиденной проблемой при вычислении страницы.',
  'error.backToLibrary': 'Вернуться в библиотеку',
};

export type Translator = (key: TranslationKey, params?: Record<string, string | number>) => string;

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = params[name];
    return value === undefined || value === null ? match : String(value);
  });
}

export function translate(
  language: Language,
  key: TranslationKey,
  params?: Record<string, string | number>,
): string {
  const dictionary = language === 'ru' ? ru : en;
  const template = dictionary[key] ?? en[key] ?? key;
  return interpolate(template, params);
}

export function createTranslator(language: Language): Translator {
  return (key, params) => translate(language, key, params);
}

export function localeOf(language: Language): string {
  return LOCALES[language];
}

export function formatNumber(language: Language, value: number | bigint): string {
  try {
    return new Intl.NumberFormat(LOCALES[language]).format(value);
  } catch {
    return String(value);
  }
}

/** `value` is a percentage in the 0..100 range. */
export function formatPercent(language: Language, value: number): string {
  try {
    return new Intl.NumberFormat(LOCALES[language], {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value / 100);
  } catch {
    return `${value.toFixed(2)}%`;
  }
}

export function formatDateTime(language: Language, timestamp: number): string {
  try {
    return new Intl.DateTimeFormat(LOCALES[language], {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(timestamp);
  } catch {
    return new Date(timestamp).toLocaleString();
  }
}
