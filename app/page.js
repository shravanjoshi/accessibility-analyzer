// app/page.js
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AnalyzerForm from './components/AnalyzerForm';
import ReportDisplay from './components/ReportDisplay';
import ReportHistory from './components/ReportHistory';
import Link from 'next/link';

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
        <div className="space-x-2">
              <Link
                href="/auth/signin"
                className=" px-3 py-1 rounded hover:underline text-black dark:text-gray-200"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="cursor-pointer text-white bg-emerald-800 hover:bg-emerald-900 dark:bg-gray-100 dark:hover:bg-gray-200 dark:text-black px-3 py-1 rounded transition-colors duration-200"
              >
                Sign Up
              </Link>
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