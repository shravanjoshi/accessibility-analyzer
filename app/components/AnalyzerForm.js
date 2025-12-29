// app/components/AnalyzerForm.js
'use client';

import { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { Globe, Zap } from 'lucide-react';

export default function AnalyzerForm({ onReportGenerated }) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const report = await response.json();
      onReportGenerated(report);
      setUrl('');
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Website URL
        </label>
      </div>
      <div className='flex align-centre justify-center gap-3'>
        <div className='w-full'>
          <div className="relative">
            <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full pl-10 pr-3 py-2 border border-gray-500 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-600 transition-colors duration-200"
              required
              disabled={isLoading}
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className=" cursor-pointer bg-emerald-800  text-white  rounded-md px-3 hover:bg-emerald-900 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center transition-colors duration-200"
        >
          {isLoading ? (
            <>
              <LoadingSpinner />
              <span className="ml-2">Analyzing...</span>
            </>
          ) : (
            'Analyze'
          )}
        </button>
      </div>

    </form>
  );
}