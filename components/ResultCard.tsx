'use client';

import { useState } from 'react';
import { copyToClipboard } from '@/lib/clipboard';
import type { SingleURLResponse } from '@/types/single-url';

interface ResultCardProps {
  result: NonNullable<SingleURLResponse['result']>;
  onProcessAnother: () => void;
}

export default function ResultCard({ result, onProcessAnother }: ResultCardProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (text: string, field: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const getCharCountColor = (count: number, target: { min: number; max: number }) => {
    if (count < target.min) return 'text-yellow-600 bg-yellow-50';
    if (count > target.max) return 'text-red-600 bg-red-50';
    return 'text-green-600 bg-green-50';
  };

  const titleTarget = { min: 25, max: 35 };
  const descriptionTarget = { min: 100, max: 120 };

  return (
    <div className="mt-6 border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Generated Meta Tags</h3>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="font-medium">Model:</span>
          <span className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
            {result.model}
          </span>
          {result.retryCount > 1 && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
              Retry {result.retryCount}
            </span>
          )}
        </div>
      </div>

      {/* URL */}
      <div className="mb-4 p-3 bg-gray-50 rounded">
        <div className="text-xs font-medium text-gray-500 mb-1">URL</div>
        <div className="text-sm text-gray-900 break-all font-mono">{result.url}</div>
      </div>

      {/* Title */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Page Title</label>
            <span
              className={`px-2 py-0.5 rounded text-xs font-medium ${getCharCountColor(
                result.titleCharCount,
                titleTarget
              )}`}
            >
              {result.titleCharCount} chars
            </span>
          </div>
          <button
            onClick={() => handleCopy(result.title, 'title')}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {copiedField === 'title' ? '✓ Copied!' : 'Copy'}
          </button>
        </div>
        <div className="p-3 bg-gray-50 border border-gray-200 rounded text-gray-900">
          {result.title}
        </div>
        {result.existingTitle && (
          <div className="mt-1 text-xs text-gray-500">
            Original: {result.existingTitle}
          </div>
        )}
      </div>

      {/* Description */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Meta Description</label>
            <span
              className={`px-2 py-0.5 rounded text-xs font-medium ${getCharCountColor(
                result.descriptionCharCount,
                descriptionTarget
              )}`}
            >
              {result.descriptionCharCount} chars
            </span>
          </div>
          <button
            onClick={() => handleCopy(result.description, 'description')}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {copiedField === 'description' ? '✓ Copied!' : 'Copy'}
          </button>
        </div>
        <div className="p-3 bg-gray-50 border border-gray-200 rounded text-gray-900">
          {result.description}
        </div>
        {result.existingDescription && (
          <div className="mt-1 text-xs text-gray-500">
            Original: {result.existingDescription}
          </div>
        )}
      </div>

      {/* Compliance Score */}
      <div className="mb-4 p-4 bg-gray-50 rounded">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Style Guide Compliance</span>
          <span
            className={`text-lg font-bold ${
              result.compliance.score >= 85 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {result.compliance.score}%
          </span>
        </div>

        {result.compliance.violations.length > 0 && (
          <details className="mt-2">
            <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
              {result.compliance.violations.length} violation(s) - Click to view
            </summary>
            <div className="mt-2 space-y-2">
              {result.compliance.violations.map((violation, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded text-sm ${
                    violation.severity === 'error' ? 'bg-red-50' : 'bg-yellow-50'
                  }`}
                >
                  <div className="font-medium text-gray-900">{violation.message}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    Location: {violation.location}
                  </div>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => handleCopy(`${result.title}\n${result.description}`, 'both')}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
        >
          {copiedField === 'both' ? '✓ Copied Both!' : 'Copy Both'}
        </button>
        <button
          onClick={onProcessAnother}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 font-medium"
        >
          Process Another URL
        </button>
      </div>
    </div>
  );
}
