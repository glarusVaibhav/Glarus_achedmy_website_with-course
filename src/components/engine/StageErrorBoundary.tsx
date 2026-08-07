"use client";

// ============================================================
// Stage Error Boundary — Fault Tolerance per Stage
// ============================================================
// Wraps each stage component. If a stage crashes, only that
// stage shows an error — the rest of the app stays alive.
// ============================================================

import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { eventBus } from '@/lib/events/eventBus';
import { AlertTriangle, RotateCcw, SkipForward } from 'lucide-react';

interface Props {
  children: ReactNode;
  stageType: string;
  onSkip?: () => void;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class StageErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });

    eventBus.emit('ERROR_BOUNDARY_HIT', {
      stageType: this.props.stageType,
      error: error.message,
      timestamp: Date.now(),
    });

    console.error(`[StageErrorBoundary] Stage "${this.props.stageType}" crashed:`, error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="h-full flex items-center justify-center p-4">
          <div className="glass-panel p-10 rounded-3xl border-white/10 text-center max-w-lg shadow-2xl relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-red-500/20 blur-[80px]" />
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30 shadow-[0_0_25px_rgba(239,68,68,0.3)]">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-2xl font-black text-white mb-3">
              Stage <span className="text-red-400">{this.props.stageType}</span> encountered an error
            </h2>
            <p className="text-white/60 text-sm mb-6 leading-relaxed">
              {this.state.error?.message || 'An unexpected error occurred in this stage.'}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={this.handleRetry}
                className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all border border-white/10"
              >
                <RotateCcw className="w-4 h-4" /> Retry
              </button>
              {this.props.onSkip && (
                <button
                  onClick={this.props.onSkip}
                  className="flex items-center gap-2 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold rounded-xl transition-all border border-red-500/20"
                >
                  <SkipForward className="w-4 h-4" /> Skip Stage
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
