import { Component, type ErrorInfo, type ReactNode } from 'react';
import { translate, type TranslationKey } from '../lib/i18n';
import { loadSettings } from '../lib/settings';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // eslint-disable-next-line no-console
    console.error('Library of Babel crashed:', error, info.componentStack);
  }

  private t = (key: TranslationKey) => translate(loadSettings().language, key);

  handleReset = () => {
    this.setState({ error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen items-center justify-center p-6">
          <div className="card w-full max-w-md p-8 text-center animate-fade-up">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-app-danger bg-app-danger-soft text-2xl">
              !
            </div>
            <h1 className="text-lg font-semibold text-app-text">{this.t('error.somethingWrong')}</h1>
            <p className="mt-2 text-sm text-app-muted">{this.t('error.crashMessage')}</p>
            <pre className="mt-4 max-h-32 overflow-auto rounded-lg border border-app-border bg-app-surface-2 p-3 text-left text-xs text-app-danger">
              {this.state.error.message}
            </pre>
            <button type="button" className="btn btn-primary mt-6" onClick={this.handleReset}>
              {this.t('error.backToLibrary')}
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
