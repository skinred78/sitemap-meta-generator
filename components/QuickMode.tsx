'use client';

import { useState } from 'react';
import { validateURL } from '@/lib/url-validator';
import ResultCard from './ResultCard';
import type { SingleURLState, SingleURLResponse } from '@/types/single-url';

export default function QuickMode() {
  const [state, setState] = useState<SingleURLState>({
    url: '',
    loading: false,
    error: null,
    result: null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate URL
    const validation = validateURL(state.url);
    if (!validation.isValid) {
      setState((prev) => ({ ...prev, error: validation.error || 'Invalid URL' }));
      return;
    }

    // Reset state and start processing
    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
      result: null,
    }));

    try {
      const response = await fetch('/api/process-single', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: validation.normalizedUrl }),
      });

      const data: SingleURLResponse = await response.json();

      if (!response.ok || !data.success) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: data.error || 'Failed to process URL',
        }));
        return;
      }

      setState((prev) => ({
        ...prev,
        loading: false,
        result: data.result!,
      }));
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error.message || 'An unexpected error occurred',
      }));
    }
  };

  const handleProcessAnother = () => {
    setState({
      url: '',
      loading: false,
      error: null,
      result: null,
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Input Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="url-input" className="block text-sm font-medium text-gray-700 mb-2">
            Enter URL
          </label>
          <input
            id="url-input"
            type="text"
            value={state.url}
            onChange={(e) => setState((prev) => ({ ...prev, url: e.target.value, error: null }))}
            placeholder="https://example.com/page"
            disabled={state.loading}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900"
          />
          <p className="mt-1 text-xs text-gray-500">
            Enter a URL to generate optimized Japanese meta tags
          </p>
        </div>

        {/* Error Message */}
        {state.error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-1 text-sm text-red-700">{state.error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={state.loading || !state.url.trim()}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-colors"
        >
          {state.loading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Generating meta tags...
            </span>
          ) : (
            'Generate Meta Tags'
          )}
        </button>
      </form>

      {/* Loading Message */}
      {state.loading && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="animate-spin h-5 w-5 text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Processing...</h3>
              <div className="mt-1 text-sm text-blue-700">
                Fetching page content and generating optimized meta tags. This typically takes
                5-30 seconds.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {state.result && (
        <ResultCard result={state.result} onProcessAnother={handleProcessAnother} />
      )}
    </div>
  );
}
