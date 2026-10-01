import { useLibrary } from '../../state/LibraryContext';
import { GROUPS } from '../../lib/alphabet';
import { THEMES } from '../../lib/settings';
import { LANGUAGES } from '../../lib/i18n';
import { SlideOver } from '../Modal';

export function SettingsPanel() {
  const {
    settings,
    alphabet,
    theme,
    resolvedTheme,
    toggleGroup,
    setTheme,
    language,
    setLanguage,
    closePanel,
    t,
    number,
  } = useLibrary();

  return (
    <SlideOver title={t('settings.title')} subtitle={t('settings.subtitle')} onClose={closePanel}>
      <div className="space-y-6">
        <section>
          <div className="flex items-center justify-between">
            <h3 className="label">{t('settings.alphabet')}</h3>
            <span className="chip font-mono">
              {t('settings.alphabetSize', { count: number(alphabet.length) })}
            </span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-app-faint">{t('settings.alphabetHint')}</p>

          <div className="mt-3 space-y-2">
            {GROUPS.map((group) => {
              const enabled = settings.groups.includes(group.id);
              return (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  className={`flex w-full items-center justify-between gap-3 rounded-xl border p-3 text-left transition ${
                    enabled
                      ? 'border-app-accent bg-app-accent-soft'
                      : 'border-app-border bg-app-surface hover:border-app-border-strong'
                  }`}
                >
                  <div>
                    <p className="text-sm text-app-text">
                      {t(group.labelKey)}
                      {group.id === 'digits' && (
                        <span className="ml-2 rounded-full border border-app-accent px-2 py-0.5 text-[10px] uppercase tracking-wider text-app-accent">
                          {t('settings.optional')}
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 text-[11px] text-app-faint">{t(group.descriptionKey)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[11px] text-app-faint">
                      {number(group.chars.length)}
                    </span>
                    <span
                      className={`relative h-5 w-9 rounded-full transition ${
                        enabled ? 'bg-app-accent' : 'bg-app-border'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-4 w-4 rounded-full transition-all ${
                          enabled ? 'left-[18px]' : 'left-0.5'
                        }`}
                        style={{ backgroundColor: 'var(--text)' }}
                      />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <h3 className="label">{t('settings.language')}</h3>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {LANGUAGES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setLanguage(item.id)}
                className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs transition ${
                  language === item.id
                    ? 'border-app-accent bg-app-accent-soft text-app-accent'
                    : 'border-app-border bg-app-surface text-app-muted hover:border-app-border-strong'
                }`}
              >
                <span aria-hidden="true">{item.flag}</span>
                {t(item.id === 'en' ? 'language.en' : 'language.ru')}
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between">
            <h3 className="label">{t('settings.theme')}</h3>
            <span className="chip font-mono">{resolvedTheme}</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {THEMES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTheme(item.id)}
                className={`rounded-xl border p-3 text-xs transition ${
                  theme === item.id
                    ? 'border-app-accent bg-app-accent-soft text-app-accent'
                    : 'border-app-border bg-app-surface text-app-muted hover:border-app-border-strong'
                }`}
              >
                {t(item.labelKey)}
              </button>
            ))}
          </div>
        </section>

        <p className="text-[11px] leading-relaxed text-app-faint">{t('settings.persistHint')}</p>
      </div>
    </SlideOver>
  );
}
