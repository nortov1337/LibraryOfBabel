import { BookView } from '../components/BookView';
import { NotFound } from './NotFound';
import { useLibrary } from '../state/LibraryContext';

export function LibraryPage() {
  const { address } = useLibrary();
  if (!address) return <NotFound />;
  return <BookView />;
}
