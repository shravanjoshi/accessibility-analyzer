# Accessibility Analyzer Web App with AI Code Suggestions

## Updated Project Structure
```
accessibility-analyzer/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.js
│   │   ├── analyze/
│   │   │   └── route.js
│   │   ├── ai-suggestions/
│   │   │   └── route.js
│   │   ├── reports/
│   │   │   └── route.js
│   │   │   └── [id]
|    |  |       └── route.js
│   │   └── lighthouse/
│   │       └── route.js
│   ├── components/
│   │   ├── AnalyzerForm.js
│   │   ├── ReportDisplay.js
│   │   ├── ReportHistory.js
│   │   ├── LoadingSpinner.js
│   │   ├── AuthForm.js
│   │   ├── Navbar.js
│   │   ├── AISuggestions.js
│   │   └── CodeBlock.js
│   ├── auth/
│   │   ├── signin/
│   │   │   └── page.js
│   │   └── signup/
│   │       └── page.js
│   ├── globals.css
│   ├── layout.js
│   └── page.js
├── lib/
│   ├── mongodb.js
│   ├── auth.js
│   ├── gemini.js
│   └── utils.js
├── models/
│   ├── Report.js
│   └── User.js
├── package.json
└── middleware.js
```

## 1. Updated Package.json Dependencies
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "mongoose": "^8.0.0",
    "axe-core": "^4.8.0",
    "lighthouse": "^11.0.0",
    "chrome-launcher": "^1.1.0",
    "puppeteer": "^21.0.0",
    "next-auth": "^4.24.0",
    "bcryptjs": "^2.4.3",
    "@google/generative-ai": "^0.15.0",
    "prismjs": "^1.29.0",
    "react-syntax-highlighter": "^15.5.0"
  }
}
```

## 2. Updated Environment Variables (.env.local)
```
MONGODB_URI=mongodb://localhost:27017/accessibility-analyzer
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-make-it-long-and-random
GEMINI_API_KEY=your-gemini-api-key-here
```

## 3. Gemini AI Configuration (lib/gemini.js)
```javascript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateAccessibilitySuggestions(violations, url) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Prepare violation data for AI analysis
    const violationSummary = violations.map(violation => ({
      id: violation.id,
      impact: violation.impact,
      description: violation.description,
      help: violation.help,
      nodes: violation.nodes.slice(0, 3).map(node => ({
        html: node.html,
        target: node.target,
        failureSummary: node.failureSummary
      }))
    }));

    const prompt = `
You are an expert web accessibility consultant. Analyze the following accessibility violations from an axe-core scan of the website "${url}" and provide specific, actionable code suggestions to fix each issue.

Accessibility Violations:
${JSON.stringify(violationSummary, null, 2)}

For each violation, provide:
1. A clear explanation of the problem
2. The accessibility impact and WCAG guidelines affected
3. Specific HTML/CSS/JavaScript code examples showing how to fix the issue
4. Best practices and additional recommendations

Format your response as a JSON object with this structure:
{
  "suggestions": [
    {
      "violationId": "rule-id",
      "priority": "high|medium|low",
      "title": "Brief title of the fix",
      "problem": "Clear explanation of the accessibility issue",
      "wcagGuidelines": ["2.1.1", "4.1.2"],
      "impact": "Description of who this affects and how",
      "solution": "Step-by-step solution explanation",
      "codeExample": {
        "before": "<!-- Bad example HTML -->",
        "after": "<!-- Fixed example HTML -->",
        "css": "/* Additional CSS if needed */",
        "javascript": "// Additional JavaScript if needed"
      },
      "additionalTips": [
        "Additional tip 1",
        "Additional tip 2"
      ],
      "testingInstructions": "How to test if the fix works"
    }
  ],
  "generalRecommendations": [
    "Overall recommendation 1",
    "Overall recommendation 2"
  ],
  "resourceLinks": [
    {
      "title": "WCAG Guidelines",
      "url": "https://www.w3.org/WAI/WCAG21/quickref/"
    }
  ]
}

Focus on practical, implementable solutions that developers can immediately apply. Make sure all code examples are valid and follow modern web standards.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the JSON response
    const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    return JSON.parse(cleanedText);

  } catch (error) {
    console.error('Error generating AI suggestions:', error);
    
    // Return fallback suggestions if AI fails
    return {
      suggestions: violations.slice(0, 5).map(violation => ({
        violationId: violation.id,
        priority: violation.impact === 'critical' ? 'high' : violation.impact === 'serious' ? 'medium' : 'low',
        title: `Fix ${violation.id}`,
        problem: violation.description,
        wcagGuidelines: violation.tags?.filter(tag => tag.startsWith('wcag')) || [],
        impact: `This ${violation.impact} impact issue affects users with disabilities`,
        solution: violation.help,
        codeExample: {
          before: violation.nodes[0]?.html || '<!-- No example available -->',
          after: '<!-- Please refer to WCAG guidelines for proper implementation -->',
          css: '',
          javascript: ''
        },
        additionalTips: [
          'Refer to WCAG guidelines for detailed implementation',
          'Test with screen readers and keyboard navigation'
        ],
        testingInstructions: 'Use axe-core or similar accessibility testing tools to verify the fix'
      })),
      generalRecommendations: [
        'Implement a comprehensive accessibility testing strategy',
        'Use semantic HTML elements where possible',
        'Ensure proper color contrast ratios',
        'Make all interactive elements keyboard accessible'
      ],
      resourceLinks: [
        {
          title: 'WCAG 2.1 Guidelines',
          url: 'https://www.w3.org/WAI/WCAG21/quickref/'
        },
        {
          title: 'axe-core Rules',
          url: 'https://dequeuniversity.com/rules/axe/'
        }
      ]
    };
  }
}

export async function validateApiKey() {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent('Test');
    return true;
  } catch (error) {
    console.error('Gemini API key validation failed:', error);
    return false;
  }
}
```

## 4. AI Suggestions API Route (app/api/ai-suggestions/route.js)
```javascript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '../../../lib/mongodb';
import Report from '../../../models/Report';
import { authOptions } from '../../../lib/auth';
import { generateAccessibilitySuggestions } from '../../../lib/gemini';
import mongoose from 'mongoose';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { reportId } = await request.json();

    if (!reportId) {
      return NextResponse.json(
        { error: 'Report ID is required' },
        { status: 400 }
      );
    }

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      return NextResponse.json(
        { error: 'Invalid report ID format' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find the report and ensure it belongs to the authenticated user
    const report = await Report.findOne({ 
      _id: reportId, 
      userId: session.user.id 
    });

    if (!report) {
      return NextResponse.json(
        { error: 'Report not found or access denied' },
        { status: 404 }
      );
    }

    // Check if there are violations to analyze
    if (!report.axeResults?.violations || report.axeResults.violations.length === 0) {
      return NextResponse.json({
        suggestions: [],
        generalRecommendations: [
          'Great job! No accessibility violations were found.',
          'Continue to test regularly as your website evolves.',
          'Consider running additional accessibility tests for comprehensive coverage.'
        ],
        resourceLinks: [
          {
            title: 'Web Accessibility Guidelines',
            url: 'https://www.w3.org/WAI/WCAG21/quickref/'
          }
        ]
      });
    }

    // Generate AI suggestions
    const suggestions = await generateAccessibilitySuggestions(
      report.axeResults.violations,
      report.url
    );

    // Update the report with AI suggestions
    report.aiSuggestions = suggestions;
    report.aiGeneratedAt = new Date();
    await report.save();

    return NextResponse.json(suggestions);

  } catch (error) {
    console.error('Error generating AI suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI suggestions' },
      { status: 500 }
    );
  }
}
```

## 5. Updated Report Model (models/Report.js)
```javascript
import mongoose from 'mongoose';

const ReportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  axeResults: {
    type: Object,
    required: true,
  },
  lighthouseResults: {
    type: Object,
    required: false,
  },
  aiSuggestions: {
    type: Object,
    required: false,
  },
  aiGeneratedAt: {
    type: Date,
    required: false,
  },
  summary: {
    violations: Number,
    passes: Number,
    incomplete: Number,
    inapplicable: Number,
    accessibilityScore: Number,
  },
});

export default mongoose.models.Report || mongoose.model('Report', ReportSchema);
```

## 6. Code Block Component (app/components/CodeBlock.js)
```javascript
'use client';

import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function CodeBlock({ code, language = 'html', title = '' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  if (!code || code.trim() === '') {
    return null;
  }

  return (
    <div className="relative bg-gray-900 rounded-lg overflow-hidden">
      {title && (
        <div className="bg-gray-800 px-4 py-2 text-sm text-gray-300 font-medium">
          {title}
        </div>
      )}
      <div className="relative">
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 z-10 bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
        <SyntaxHighlighter
          language={language}
          style={tomorrow}
          customStyle={{
            margin: 0,
            padding: '16px',
            paddingTop: '40px',
            fontSize: '14px',
            lineHeight: '1.5'
          }}
          showLineNumbers={true}
          wrapLines={true}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
```

## 7. AI Suggestions Component (app/components/AISuggestions.js)
```javascript
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
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!suggestions && !isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            AI-Powered Code Suggestions
          </h3>
          <p className="text-gray-500 mb-4">
            Get intelligent suggestions to fix accessibility issues using Google's Gemini AI.
          </p>
          <button
            onClick={generateSuggestions}
            disabled={isLoading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Generate AI Suggestions
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner />
          <span className="ml-3 text-gray-600">Generating AI suggestions...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button
          onClick={generateSuggestions}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
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
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <svg className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              AI Code Suggestions
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Powered by Google Gemini • {suggestions.suggestions.length} suggestions
            </p>
          </div>
          <button
            onClick={generateSuggestions}
            disabled={isLoading}
            className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded"
          >
            Regenerate
          </button>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {suggestions.suggestions.map((suggestion, index) => (
          <div key={index} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded border ${getPriorityColor(suggestion.priority)}`}>
                    {suggestion.priority.toUpperCase()} PRIORITY
                  </span>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                    {suggestion.violationId}
                  </code>
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  {suggestion.title}
                </h4>
                <p className="text-gray-600 mb-3">
                  {suggestion.problem}
                </p>
                {suggestion.wcagGuidelines && suggestion.wcagGuidelines.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {suggestion.wcagGuidelines.map((guideline, idx) => (
                      <span key={idx} className="inline-flex px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                        WCAG {guideline}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => toggleSuggestion(index)}
                className="ml-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                {expandedSuggestions.has(index) ? 'Show Less' : 'Show Solution'}
              </button>
            </div>

            {expandedSuggestions.has(index) && (
              <div className="space-y-6">
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Impact</h5>
                  <p className="text-gray-600">{suggestion.impact}</p>
                </div>

                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Solution</h5>
                  <p className="text-gray-600">{suggestion.solution}</p>
                </div>

                {suggestion.codeExample && (
                  <div className="space-y-4">
                    <h5 className="font-medium text-gray-900">Code Examples</h5>
                    
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
                    <h5 className="font-medium text-gray-900 mb-2">Additional Tips</h5>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      {suggestion.additionalTips.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {suggestion.testingInstructions && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Testing Instructions</h5>
                    <p className="text-gray-600">{suggestion.testingInstructions}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {suggestions.generalRecommendations && suggestions.generalRecommendations.length > 0 && (
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">General Recommendations</h4>
          <ul className="list-disc list-inside space-y-1 text-gray-600">
            {suggestions.generalRecommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>
      )}

      {suggestions.resourceLinks && suggestions.resourceLinks.length > 0 && (
        <div className="p-6 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Helpful Resources</h4>
          <div className="space-y-2">
            {suggestions.resourceLinks.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-blue-600 hover:text-blue-800 underline"
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
```

## 8. Updated Report Display Component (app/components/ReportDisplay.js)
```javascript
'use client';

import { useState } from 'react';
import AISuggestions from './AISuggestions';

export default function ReportDisplay({ report }) {
  const [activeTab, setActiveTab] = useState('summary');

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'serious':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'minor':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const tabs = [
    { id: 'summary', label: 'Summary', icon: '📊' },
    { id: 'violations', label: 'Violations', icon: '⚠️' },
    { id: 'ai-suggestions', label: 'AI Suggestions', icon: '🤖' },
    { id: 'passes', label: 'Passes', icon: '✅' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Accessibility Report
        </h2>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-gray-600">
              <strong>URL:</strong> <a href={report.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{report.url}</a>
            </p>
            <p className="text-gray-600">
              <strong>Analyzed:</strong> {formatTimestamp(report.timestamp)}
            </p>
          </div>
          {report.summary?.accessibilityScore && (
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {report.summary.accessibilityScore}%
              </div>
              <div className="text-sm text-gray-500">
                Lighthouse Score
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
              {tab.id === 'violations' && report.summary?.violations > 0 && (
                <span className="ml-2 bg-red-100 text-red-600 py-1 px-2 rounded-full text-xs">
                  {report.summary.violations}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'summary' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-red-50