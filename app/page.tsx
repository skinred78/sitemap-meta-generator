'use client';

import { useState } from 'react';
import Papa from 'papaparse';
import { XMLParser } from 'fast-xml-parser';

interface ValidationViolation {
  type: 'forbidden_term' | 'forbidden_grammar' | 'missing_required' | 'tone_issue';
  severity: 'error' | 'warning';
  message: string;
  term?: string;
  location: 'title' | 'description' | 'both';
}

interface ComplianceResult {
  score: number;
  violations: ValidationViolation[];
  compliant: boolean;
  details: {
    forbiddenTermsFound: number;
    forbiddenGrammarFound: number;
    requiredTermsMissing: number;
  };
}

interface Result {
  url: string;
  title: string;
  description: string;
  titleCharCount: number;
  descriptionCharCount: number;
  compliance?: ComplianceResult;
  model?: string;
  retryCount?: number;
  error?: string;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [error, setError] = useState('');
  const [urlCount, setUrlCount] = useState<number>(0);
  const [limitMode, setLimitMode] = useState<'all' | 'custom'>('all');
  const [customLimit, setCustomLimit] = useState<number>(100);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [totalUrlsToProcess, setTotalUrlsToProcess] = useState<number>(0);
  const [selectedViolations, setSelectedViolations] = useState<Result | null>(null);

  const parseSitemapForCount = async (file: File) => {
    try {
      const text = await file.text();
      const parser = new XMLParser();
      const result = parser.parse(text);

      if (result.urlset && result.urlset.url) {
        const urls = Array.isArray(result.urlset.url)
          ? result.urlset.url
          : [result.urlset.url];
        setUrlCount(urls.length);
      } else {
        setUrlCount(0);
      }
    } catch (err) {
      setUrlCount(0);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
      setResults([]);
      parseSitemapForCount(selectedFile);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith('.xml')) {
      setFile(droppedFile);
      setError('');
      setResults([]);
      parseSitemapForCount(droppedFile);
    } else {
      setError('Please upload an XML file');
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError('Please select a file');
      return;
    }

    // Calculate limit
    const limit = limitMode === 'all' ? urlCount : Math.min(customLimit, urlCount);
    setTotalUrlsToProcess(limit);

    // Show confirmation for >500 URLs
    if (limit > 500 && !showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    setShowConfirmation(false);
    setProcessing(true);
    setError('');
    setResults([]);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('limit', limit.toString());

      const response = await fetch('/api/process', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Processing failed');
      }

      setResults(data.results);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setProcessing(false);
    }
  };

  const downloadCSV = () => {
    if (results.length === 0) return;

    const csv = Papa.unparse(
      results.map((r) => ({
        URL: r.url,
        'Page Title': r.title,
        'Meta Description': r.description,
        'Title Char Count': r.titleCharCount,
        'Description Char Count': r.descriptionCharCount,
        'Compliance Score': r.compliance?.score ?? 'N/A',
        'Compliant': r.compliance?.compliant ? 'Yes' : 'No',
        'Violations': r.compliance?.violations.length ?? 0,
        'Model Used': r.model ?? 'N/A',
        'Retry Count': r.retryCount ?? 1,
      }))
    );

    // Add BOM for proper Japanese character encoding
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `sitemap-meta-${Date.now()}.csv`;
    link.click();
  };

  return (
    <main className="min-h-screen p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Sitemap Meta Generator</h1>
        <p className="text-gray-700">
          Upload an XML sitemap to generate SEO-optimized Japanese meta tags
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mb-8">
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4 hover:border-gray-400 transition-colors"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <input
            type="file"
            accept=".xml"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="text-gray-700">
              {file ? (
                <p className="text-lg font-medium text-gray-900">{file.name}</p>
              ) : (
                <>
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Drop your sitemap.xml here or click to browse
                  </p>
                  <p className="text-sm text-gray-700">XML files only</p>
                </>
              )}
            </div>
          </label>
        </div>

        {file && urlCount > 0 && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700 mb-3">
              Found <span className="font-semibold">{urlCount}</span> URLs in sitemap
            </p>

            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">
                Process:
              </label>

              <select
                value={limitMode}
                onChange={(e) => setLimitMode(e.target.value as 'all' | 'custom')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              >
                <option value="all">All URLs ({urlCount})</option>
                <option value="custom">Custom limit</option>
              </select>

              {limitMode === 'custom' && (
                <input
                  type="number"
                  min="1"
                  max={urlCount}
                  value={customLimit}
                  onChange={(e) => setCustomLimit(parseInt(e.target.value) || 1)}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  placeholder="100"
                />
              )}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={!file || processing}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {processing ? 'Processing...' : 'Generate Meta Tags'}
        </button>
      </form>

      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Large Processing</h3>
            <p className="text-gray-700 mb-4">
              You're about to process <span className="font-semibold">{totalUrlsToProcess}</span> URLs.
              This will take approximately {Math.ceil(totalUrlsToProcess / 5)} minutes and cost around
              ${(totalUrlsToProcess * 0.002).toFixed(2)}.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={(e) => {
                  setShowConfirmation(false);
                  handleSubmit(e as any);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Proceed
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {processing && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-4">
          Processing {totalUrlsToProcess} of {urlCount} URLs... This may take a few minutes.
        </div>
      )}

      {results.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Results ({results.length} URLs)
            </h2>
            <button
              onClick={downloadCSV}
              className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Download CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    URL
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Description
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Title Chars
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Desc Chars
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Compliance
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Model
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {results.map((result, index) => (
                  <tr
                    key={index}
                    className={result.error ? 'bg-red-50' : 'hover:bg-gray-50'}
                  >
                    <td className="px-4 py-3 text-sm text-blue-600 break-all max-w-xs">
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {result.url}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{result.title}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{result.description}</td>
                    <td className="px-4 py-3 text-sm text-center">
                      <span
                        className={
                          result.titleCharCount >= 30 &&
                          result.titleCharCount <= 35
                            ? 'text-green-600 font-medium'
                            : 'text-orange-600'
                        }
                      >
                        {result.titleCharCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      <span
                        className={
                          result.descriptionCharCount >= 80 &&
                          result.descriptionCharCount <= 120
                            ? 'text-green-600 font-medium'
                            : 'text-orange-600'
                        }
                      >
                        {result.descriptionCharCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      {result.compliance ? (
                        <div className="flex flex-col items-center gap-1">
                          <span
                            className={
                              result.compliance.score >= 85
                                ? 'text-green-600 font-medium'
                                : 'text-red-600 font-medium'
                            }
                          >
                            {result.compliance.score}%
                          </span>
                          {result.compliance.violations.length > 0 && (
                            <button
                              onClick={() => setSelectedViolations(result)}
                              className="text-xs text-blue-600 hover:underline"
                            >
                              {result.compliance.violations.length} issue{result.compliance.violations.length > 1 ? 's' : ''}
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-gray-600">
                      {result.model ? (
                        <div className="flex flex-col items-center text-xs">
                          <span>{result.model}</span>
                          {result.retryCount && result.retryCount > 1 && (
                            <span className="text-orange-600">({result.retryCount} tries)</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedViolations && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-900">Style Guide Violations</h3>
              <button
                onClick={() => setSelectedViolations(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 break-all">
                <strong>URL:</strong> {selectedViolations.url}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                <strong>Compliance Score:</strong>{' '}
                <span className={selectedViolations.compliance!.score >= 85 ? 'text-green-600' : 'text-red-600'}>
                  {selectedViolations.compliance!.score}%
                </span>
              </p>
            </div>

            <div className="space-y-3">
              {selectedViolations.compliance!.violations.map((violation, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border ${
                    violation.severity === 'error'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-yellow-50 border-yellow-200'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg">{violation.severity === 'error' ? '❌' : '⚠️'}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{violation.message}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        Location: <span className="font-medium">{violation.location}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedViolations(null)}
              className="mt-6 w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
