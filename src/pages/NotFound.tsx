import { Link } from 'react-router-dom';
import { useLibrary } from '../state/LibraryContext';

export function NotFound() {
  const { random, t } = useLibrary();
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <div className="font-serif text-7xl text-app-accent">404</div>
      <h1 className="mt-4 text-lg font-semibold text-app-text">{t('notFound.title')}</h1>
      <p className="mt-2 text-sm text-app-faint">{t('notFound.message')}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Link to="/" className="btn">
          {t('notFound.home')}
        </Link>
        <button type="button" className="btn btn-primary" onClick={random}>
          {t('notFound.random')}
        </button>
      </div>
    </div>
  );
}
