// app/page.js
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AnalyzerForm from './components/AnalyzerForm';
import ReportDisplay from './components/ReportDisplay';
import ReportHistory from './components/ReportHistory';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentReport, setCurrentReport] = useState(null);
  const [refreshHistory, setRefreshHistory] = useState(0);

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-xl text-gray-900 dark:text-gray-100">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          Welcome to Accessibility Analyzer
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Please sign in to start analyzing websites for accessibility issues.
        </p>
        <div className="space-x-4">
          <button
            onClick={() => router.push('/auth/signin')}
            className="bg-blue-600 dark:bg-blue-700 text-white px-6 py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200"
          >
            Sign In
          </button>
          <button
            onClick={() => router.push('/auth/signup')}
            className="bg-green-600 dark:bg-green-700 text-white px-6 py-3 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors duration-200"
          >
            Sign Up
          </button>
        </div>
      </div>
    );
  }

  const handleReportGenerated = (report) => {
    setCurrentReport(report);
    setRefreshHistory(prev => prev + 1);
  };

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Analyze Website Accessibility
        </h2>
        <AnalyzerForm onReportGenerated={handleReportGenerated} />
      </div>

      {currentReport && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Analysis Results
          </h2>
          <ReportDisplay report={currentReport} />
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Your Report History
        </h2>
        <ReportHistory key={refreshHistory} />
      </div>
    </div>
  );
}