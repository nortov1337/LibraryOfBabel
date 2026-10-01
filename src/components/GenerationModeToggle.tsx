import { useLibrary } from '../state/LibraryContext';
import type { GenerationMode } from '../lib/settings';

interface Props {
  value: GenerationMode;
  onChange: (mode: GenerationMode) => void;
  className?: string;
}

/** Modern segmented control for the generation mode. */
export function GenerationModeToggle({ value, onChange, className = '' }: Props) {
  const { t } = useLibrary();

  const options: { id: GenerationMode; label: string; tooltip: string }[] = [
    {
      id: 'traditional',
      label: t('generation.traditional'),
      tooltip: t('generation.traditional.tooltip'),
    },
    { id: 'pseudo', label: t('generation.pseudo'), tooltip: t('generation.pseudo.tooltip') },
  ];

  return (
    <div
      role="group"
      aria-label={t('generation.title')}
      className={`inline-flex rounded-xl border border-app-border bg-app-surface p-1 ${className}`}
    >
      {options.map((option) => {
        const active = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            title={option.tooltip}
            aria-pressed={active}
            onClick={() => onChange(option.id)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              active
                ? 'bg-app-accent-soft text-app-accent shadow-sm'
                : 'text-app-muted hover:bg-app-surface-hover hover:text-app-text'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
