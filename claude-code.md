# Accessibility Analyzer Web App

## Project Structure
```
accessibility-analyzer/
├── app/
│   ├── api/
│   │   ├── analyze/
│   │   │   └── route.js
│   │   ├── reports/
│   │   │   └── route.js
│   │   └── lighthouse/
│   │       └── route.js
│   ├── components/
│   │   ├── AnalyzerForm.js
│   │   ├── ReportDisplay.js
│   │   ├── ReportHistory.js
│   │   └── LoadingSpinner.js
│   ├── globals.css
│   ├── layout.js
│   └── page.js
├── lib/
│   ├── mongodb.js
│   └── utils.js
├── models/
│   └── Report.js
└── package.json
```

## 1. Package.json Dependencies
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
    "puppeteer": "^21.0.0"
  }
}
```

## 2. MongoDB Connection (lib/mongodb.js)
```javascript
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
```

## 3. Report Model (models/Report.js)
```javascript
import mongoose from 'mongoose';

const ReportSchema = new mongoose.Schema({
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

## 4. Main Layout (app/layout.js)
```javascript
import './globals.css';

export const metadata = {
  title: 'Accessibility Analyzer',
  description: 'Comprehensive web accessibility analysis tool',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        <nav className="bg-blue-600 text-white p-4">
          <div className="container mx-auto">
            <h1 className="text-2xl font-bold">Accessibility Analyzer</h1>
            <p className="text-blue-100">Comprehensive web accessibility testing</p>
          </div>
        </nav>
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
```

## 5. Main Page (app/page.js)
```javascript
'use client';

import { useState } from 'react';
import AnalyzerForm from './components/AnalyzerForm';
import ReportDisplay from './components/ReportDisplay';
import ReportHistory from './components/ReportHistory';

export default function Home() {
  const [currentReport, setCurrentReport] = useState(null);
  const [refreshHistory, setRefreshHistory] = useState(0);

  const handleReportGenerated = (report) => {
    setCurrentReport(report);
    setRefreshHistory(prev => prev + 1);
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Analyze Website Accessibility</h2>
        <AnalyzerForm onReportGenerated={handleReportGenerated} />
      </div>

      {currentReport && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Analysis Results</h2>
          <ReportDisplay report={currentReport} />
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Report History</h2>
        <ReportHistory key={refreshHistory} />
      </div>
    </div>
  );
}
```

## 6. Analyzer Form Component (app/components/AnalyzerForm.js)
```javascript
'use client';

import { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

export default function AnalyzerForm({ onReportGenerated }) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [includeLighthouse, setIncludeLighthouse] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, includeLighthouse }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const report = await response.json();
      onReportGenerated(report);
    } catch (error) {
      console.error('Error analyzing website:', error);
      alert('Failed to analyze website. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
          Website URL
        </label>
        <input
          type="url"
          id="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          disabled={isLoading}
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="lighthouse"
          checked={includeLighthouse}
          onChange={(e) => setIncludeLighthouse(e.target.checked)}
          className="mr-2"
          disabled={isLoading}
        />
        <label htmlFor="lighthouse" className="text-sm text-gray-700">
          Include Lighthouse accessibility audit (slower but more comprehensive)
        </label>
      </div>

      <button
        type="submit"
        disabled={isLoading || !url}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <LoadingSpinner />
            <span className="ml-2">Analyzing...</span>
          </>
        ) : (
          'Analyze Accessibility'
        )}
      </button>
    </form>
  );
}
```

## 7. Report Display Component (app/components/ReportDisplay.js)
```javascript
export default function ReportDisplay({ report }) {
  const { axeResults, lighthouseResults, summary, url, timestamp } = report;

  const getSeverityColor = (impact) => {
    switch (impact) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'serious': return 'text-orange-600 bg-orange-50';
      case 'moderate': return 'text-yellow-600 bg-yellow-50';
      case 'minor': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{summary.violations}</div>
            <div className="text-sm text-gray-600">Violations</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{summary.passes}</div>
            <div className="text-sm text-gray-600">Passes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{summary.incomplete}</div>
            <div className="text-sm text-gray-600">Incomplete</div>
          </div>
          {summary.accessibilityScore && (
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{summary.accessibilityScore}/100</div>
              <div className="text-sm text-gray-600">Lighthouse Score</div>
            </div>
          )}
        </div>
      </div>

      {/* Violations */}
      {axeResults.violations && axeResults.violations.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 text-red-600">
            Accessibility Violations ({axeResults.violations.length})
          </h3>
          <div className="space-y-4">
            {axeResults.violations.map((violation, index) => (
              <div key={index} className="border border-red-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{violation.description}</h4>
                  <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(violation.impact)}`}>
                    {violation.impact}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{violation.help}</p>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Affected Elements ({violation.nodes.length}):
                  </div>
                  {violation.nodes.slice(0, 3).map((node, nodeIndex) => (
                    <div key={nodeIndex} className="text-xs text-gray-600 mb-1">
                      {node.target.join(', ')}
                    </div>
                  ))}
                  {violation.nodes.length > 3 && (
                    <div className="text-xs text-gray-500">
                      ...and {violation.nodes.length - 3} more
                    </div>
                  )}
                </div>
                <a
                  href={violation.helpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 text-sm hover:underline mt-2 inline-block"
                >
                  Learn more →
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lighthouse Results */}
      {lighthouseResults && (
        <div>
          <h3 className="text-lg font-semibold mb-3 text-blue-600">Lighthouse Accessibility Audit</h3>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {Math.round(lighthouseResults.accessibility.score * 100)}
                </div>
                <div className="text-sm text-gray-600">Accessibility Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Object.keys(lighthouseResults.accessibility.details.items.filter(item => item.score === 1)).length}
                </div>
                <div className="text-sm text-gray-600">Passed Audits</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {Object.keys(lighthouseResults.accessibility.details.items.filter(item => item.score < 1)).length}
                </div>
                <div className="text-sm text-gray-600">Failed Audits</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="text-sm text-gray-500 pt-4 border-t">
        <p>URL: {url}</p>
        <p>Analyzed: {new Date(timestamp).toLocaleString()}</p>
      </div>
    </div>
  );
}
```

## 8. Report History Component (app/components/ReportHistory.js)
```javascript
'use client';

import { useState, useEffect } from 'react';

export default function ReportHistory() {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/reports');
      if (response.ok) {
        const data = await response.json();
        setReports(data);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading reports...</div>;
  }

  if (reports.length === 0) {
    return <div className="text-gray-500 text-center py-4">No reports yet</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full table-auto">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-4 py-2 text-left">URL</th>
            <th className="px-4 py-2 text-left">Date</th>
            <th className="px-4 py-2 text-left">Violations</th>
            <th className="px-4 py-2 text-left">Score</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => (
            <tr key={report._id} className="border-b hover:bg-gray-50">
              <td className="px-4 py-2">
                <div className="truncate max-w-xs" title={report.url}>
                  {report.url}
                </div>
              </td>
              <td className="px-4 py-2 text-sm text-gray-600">
                {new Date(report.timestamp).toLocaleDateString()}
              </td>
              <td className="px-4 py-2">
                <span className="text-red-600 font-medium">
                  {report.summary.violations}
                </span>
              </td>
              <td className="px-4 py-2">
                {report.summary.accessibilityScore ? (
                  <span className="text-blue-600 font-medium">
                    {report.summary.accessibilityScore}/100
                  </span>
                ) : (
                  <span className="text-gray-400">N/A</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

## 9. Loading Spinner Component (app/components/LoadingSpinner.js)
```javascript
export default function LoadingSpinner() {
  return (
    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
  );
}
```

## 10. Analyze API Route (app/api/analyze/route.js)
```javascript
import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { AxePuppeteer } from '@axe-core/puppeteer';
import lighthouse from 'lighthouse';
import chromeLauncher from 'chrome-launcher';
import dbConnect from '../../../lib/mongodb';
import Report from '../../../models/Report';

export async function POST(request) {
  try {
    const { url, includeLighthouse = false } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Connect to database
    await dbConnect();

    // Run Axe analysis
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    await page.setViewport({ width: 1200, height: 800 });
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    const axeResults = await new AxePuppeteer(page).analyze();
    await browser.close();

    let lighthouseResults = null;
    let accessibilityScore = null;

    // Run Lighthouse analysis if requested
    if (includeLighthouse) {
      try {
        const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
        const options = {
          logLevel: 'info',
          output: 'json',
          onlyCategories: ['accessibility'],
          port: chrome.port,
        };

        const runnerResult = await lighthouse(url, options);
        await chrome.kill();

        lighthouseResults = {
          accessibility: runnerResult.lhr.categories.accessibility,
        };
        accessibilityScore = Math.round(runnerResult.lhr.categories.accessibility.score * 100);
      } catch (lighthouseError) {
        console.error('Lighthouse error:', lighthouseError);
      }
    }

    // Create summary
    const summary = {
      violations: axeResults.violations.length,
      passes: axeResults.passes.length,
      incomplete: axeResults.incomplete.length,
      inapplicable: axeResults.inapplicable.length,
      accessibilityScore,
    };

    // Save to database
    const report = new Report({
      url,
      axeResults,
      lighthouseResults,
      summary,
    });

    await report.save();

    return NextResponse.json({
      _id: report._id,
      url: report.url,
      timestamp: report.timestamp,
      axeResults: report.axeResults,
      lighthouseResults: report.lighthouseResults,
      summary: report.summary,
    });

  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze website' },
      { status: 500 }
    );
  }
}
```

## 11. Reports API Route (app/api/reports/route.js)
```javascript
import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Report from '../../../models/Report';

export async function GET() {
  try {
    await dbConnect();
    
    const reports = await Report.find({})
      .sort({ timestamp: -1 })
      .limit(50)
      .select('url timestamp summary');

    return NextResponse.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}
```

## 12. Global Styles (app/globals.css)
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

## 13. Environment Variables (.env.local)
```
MONGODB_URI=mongodb://localhost:27017/accessibility-analyzer
# or your MongoDB Atlas connection string
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/accessibility-analyzer
```

## 14. Tailwind Config (tailwind.config.js)
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

## Installation & Setup Instructions:

1. **Install dependencies:**
```bash
npm install
```

2. **Set up MongoDB:**
   - Install MongoDB locally or use MongoDB Atlas
   - Update the MONGODB_URI in your .env.local file

3. **Configure Tailwind CSS:**
```bash
npx tailwindcss init -p
```

4. **Run the development server:**
```bash
npm run dev
```

## Features:
- ✅ Axe-core accessibility testing
- ✅ Lighthouse accessibility audits
- ✅ MongoDB report storage
- ✅ Report history and tracking
- ✅ Responsive design with Tailwind CSS
- ✅ Real-time analysis results
- ✅ Detailed violation reporting
- ✅ Severity-based color coding
- ✅ Performance optimized

The app provides comprehensive accessibility analysis using both Axe-core and Lighthouse, stores results in MongoDB, and presents them in a clean, accessible interface.