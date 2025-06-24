'use client';

import { useState } from 'react';
import CodeBlock from './CodeBlock';
import LoadingSpinner from './LoadingSpinner';

export default function AISuggestions({ reportId, initialSuggestions = null }) {
  const [suggestions, setSuggestions] = useState(initialSuggestions);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedSuggestions, setExpandedSuggestions] = useState(new Set());

  const generateSuggestions = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/ai-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reportId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate suggestions');
      }

      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error('Error generating suggestions:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSuggestion = (index) => {
    const newExpanded = new Set(expandedSuggestions);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSuggestions(newExpanded);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800/30';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800/30';
      case 'low':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800/30';
      default:
        return 'bg-gray-100 dark:bg-gray-800/50 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
  };

  if (!suggestions && !isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors">
        <div className="text-center">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-blue-400 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            AI-Powered Code Suggestions
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Get intelligent suggestions to fix accessibility issues using Google&apos;s Gemini AI.
          </p>
          <button
            onClick={generateSuggestions}
            disabled={isLoading}
            className="bg-blue-600 dark:bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            Generate AI Suggestions
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors">
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner />
          <span className="ml-3 text-gray-600 dark:text-gray-400">Generating AI suggestions...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors">
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button
          onClick={generateSuggestions}
          className="bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!suggestions || !suggestions.suggestions) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
              <svg className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              AI Code Suggestions
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Powered by Google Gemini • {suggestions.suggestions.length} suggestions
            </p>
          </div>
          <button
            onClick={generateSuggestions}
            disabled={isLoading}
            className="text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1 rounded transition-colors"
          >
            Regenerate
          </button>
        </div>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {suggestions.suggestions.map((suggestion, index) => (
          <div key={index} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded border ${getPriorityColor(suggestion.priority)}`}>
                    {suggestion.priority.toUpperCase()} PRIORITY
                  </span>
                  <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono text-gray-800 dark:text-gray-300">
                    {suggestion.violationId}
                  </code>
                </div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {suggestion.title}
                </h4>
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  {suggestion.problem}
                </p>
                {suggestion.wcagGuidelines && suggestion.wcagGuidelines.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {suggestion.wcagGuidelines.map((guideline, idx) => (
                      <span key={idx} className="inline-flex px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 rounded">
                        WCAG {guideline}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => toggleSuggestion(index)}
                className="ml-4 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium transition-colors"
              >
                {expandedSuggestions.has(index) ? 'Show Less' : 'Show Solution'}
              </button>
            </div>

            {expandedSuggestions.has(index) && (
              <div className="space-y-6">
                <div>
                  <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Impact</h5>
                  <p className="text-gray-600 dark:text-gray-400">{suggestion.impact}</p>
                </div>

                <div>
                  <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Solution</h5>
                  <p className="text-gray-600 dark:text-gray-400">{suggestion.solution}</p>
                </div>

                {suggestion.codeExample && (
                  <div className="space-y-4">
                    <h5 className="font-medium text-gray-900 dark:text-gray-100">Code Examples</h5>
                    
                    {suggestion.codeExample.before && (
                      <CodeBlock
                        code={suggestion.codeExample.before}
                        language="html"
                        title="❌ Before (Problematic Code)"
                      />
                    )}
                    
                    {suggestion.codeExample.after && (
                      <CodeBlock
                        code={suggestion.codeExample.after}
                        language="html"
                        title="✅ After (Fixed Code)"
                      />
                    )}
                    
                    {suggestion.codeExample.css && (
                      <CodeBlock
                        code={suggestion.codeExample.css}
                        language="css"
                        title="Additional CSS"
                      />
                    )}
                    
                    {suggestion.codeExample.javascript && (
                      <CodeBlock
                        code={suggestion.codeExample.javascript}
                        language="javascript"
                        title="Additional JavaScript"
                      />
                    )}
                  </div>
                )}

                {suggestion.additionalTips && suggestion.additionalTips.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Additional Tips</h5>
                    <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                      {suggestion.additionalTips.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {suggestion.testingInstructions && (
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Testing Instructions</h5>
                    <p className="text-gray-600 dark:text-gray-400">{suggestion.testingInstructions}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {suggestions.generalRecommendations && suggestions.generalRecommendations.length > 0 && (
        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">General Recommendations</h4>
          <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
            {suggestions.generalRecommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>
      )}

      {suggestions.resourceLinks && suggestions.resourceLinks.length > 0 && (
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Helpful Resources</h4>
          <div className="space-y-2">
            {suggestions.resourceLinks.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline transition-colors"
              >
                {link.title} ↗
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}