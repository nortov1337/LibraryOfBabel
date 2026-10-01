import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Shell } from './components/Shell';
import { Toasts } from './components/Toasts';
import { ToastProvider } from './state/ToastContext';
import { LibraryProvider } from './state/LibraryContext';
import { HomeRedirect } from './pages/HomeRedirect';
import { LibraryPage } from './pages/LibraryPage';
import { NotFound } from './pages/NotFound';

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ToastProvider>
          <LibraryProvider>
            <Routes>
              <Route element={<Shell />}>
                <Route path="/" element={<HomeRedirect />} />
                <Route path="/book/:address" element={<LibraryPage />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
            <Toasts />
          </LibraryProvider>
        </ToastProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
