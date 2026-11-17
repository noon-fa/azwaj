import React from 'react';
import { Button } from '@/src/components/ui/button';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error.message || 'An unexpected application error occurred.',
    };
  }

  override componentDidCatch(error: Error) {
    console.error('Application ErrorBoundary caught:', error);
  }

  override render() {
    if (this.state.hasError) {
      let friendlyMessage = this.state.message;
      try {
        const parsed = JSON.parse(this.state.message);
        if (parsed?.error) {
          friendlyMessage = `Data access notice (${parsed.operationType || 'operation'}): ${parsed.error}`;
        }
      } catch {
        // Non-JSON error message
      }

      return (
        <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-white border border-[#E5E0D5] rounded-xl p-8 space-y-5">
            <p className="text-xs font-medium tracking-wide text-[#9A7B3E]">
              Azwaj Platform Notice
            </p>
            <h1 className="text-2xl font-semibold text-[#1A2421]">
              Something interrupted this view
            </h1>
            <p className="text-sm text-[#54615C] leading-relaxed break-words">
              {friendlyMessage}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <Button
                onClick={() => {
                  this.setState({ hasError: false, message: '' });
                  window.location.assign('/');
                }}
              >
                Return Home
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Reload Page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
