'use client';

import { useState, useEffect } from 'react';
import { FaTrash } from 'react-icons/fa'; // Import the trash icon
import LoadingSpinner from './LoadingSpinner';
import ReportDisplay from './ReportDisplay';

export default function ReportHistory() {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedReportId, setExpandedReportId] = useState(null);
  const [expandedReport, setExpandedReport] = useState(null);
  const [loadingReportId, setLoadingReportId] = useState(null);
  const [deletingReportId, setDeletingReportId] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/reports');
      
      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }
      
      const data = await response.json();
      setReports(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError('Failed to load reports');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReportClick = async (reportId) => {
    // If clicking on already expanded report, collapse it
    if (expandedReportId && expandedReportId === reportId) {
      setExpandedReportId(null);
      setExpandedReport(null);
      return;
    }

    try {
      setLoadingReportId(reportId);
      const response = await fetch(`/api/reports/${reportId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch report details');
      }
      
      const report = await response.json();
      console.log('Loading report details:', report);
      setExpandedReportId(reportId);
      setExpandedReport(report);
    } catch (error) {
      console.error('Error fetching report details:', error);
      setError('Failed to load report details');
    } finally {
      setLoadingReportId(null);
    }
  };

  const handleDeleteReport = async (reportId, e) => {
    // Stop the click event from propagating to the parent (which would expand the report)
    e.stopPropagation();
    
    // Confirm before deleting
    if (!window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingReportId(reportId);
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete report');
      }
      
      // Remove deleted report from state
      setReports(reports.filter(report => report._id !== reportId));
      
      // If the deleted report was expanded, collapse it
      if (expandedReportId === reportId) {
        setExpandedReportId(null);
        setExpandedReport(null);
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      setError('Failed to delete report. Please try again.');
    } finally {
      setDeletingReportId(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getViolationSeverityColor = (violations) => {
    if (violations === 0) return 'text-green-600 dark:text-green-400';
    if (violations <= 3) return 'text-yellow-600 dark:text-yellow-400';
    if (violations <= 10) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getAccessibilityScoreColor = (score) => {
    if (score === null || score === undefined) return 'text-gray-500 dark:text-gray-400';
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
    if (score >= 50) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8 text-gray-900 dark:text-gray-100">
        <LoadingSpinner />
        <span className="ml-2">Loading reports...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 px-4 py-3 rounded">
        {error}
        <button
          onClick={fetchReports}
          className="ml-4 text-red-700 dark:text-red-300 underline hover:no-underline transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p>No reports found. Run your first accessibility analysis to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {reports.map((report) => (
          <div key={report._id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm dark:shadow-gray-900/20 transition-colors">
            {/* Report Summary (Always Visible) */}
            <div
              onClick={() => handleReportClick(report._id)}
              className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 p-4 hover:bg-gray-100 dark:hover:bg-gray-700/50 cursor-pointer transition-colors duration-200"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200 truncate">
                    {report.url}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {formatDate(report.timestamp)}
                  </p>
                </div>
                
                <div className="flex items-center space-x-4 ml-4">
                  <div className="text-center">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Violations</div>
                    <div className={`text-lg font-semibold dark:text-gray-200`}>
                      {report.summary?.violations || 0}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Passes</div>
                    <div className="text-lg font-semibold dark:text-gray-200">
                      {report.summary?.passes || 0}
                    </div>
                  </div>
                  
                  {report.summary?.accessibilityScore !== null && report.summary?.accessibilityScore !== undefined && (
                    <div className="text-center">
                      <div className="text-xs text-gray-500 dark:text-gray-400">Score</div>
                      <div className={`text-lg font-semibold dark:text-gray-200`}>
                        {report.summary.accessibilityScore}%
                      </div>
                    </div>
                  )}

                  <div className="text-blue-600 dark:text-blue-400 text-sm">
                    {loadingReportId === report._id ? (
                      <LoadingSpinner />
                    ) : expandedReport && expandedReport._id === report._id ? (
                      '▼ Hide Details'
                    ) : (
                      '▶ View Details'
                    )}
                  </div>

                  {/* Delete icon using react-icons */}
                  <span 
                    onClick={(e) => handleDeleteReport(report._id, e)}
                    className="ml-2 p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-full transition-colors duration-200 cursor-pointer"
                    role="button"
                    tabIndex={0}
                    aria-label="Delete report"
                    title="Delete report"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleDeleteReport(report._id, e);
                      }
                    }}
                  >
                    {deletingReportId === report._id ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <FaTrash size={16} />
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Expanded Report Details */}
            {expandedReport && expandedReport._id === report._id && (
              <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-6">
                {/* <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-lg p-3">
                  <p className="text-blue-800 dark:text-blue-200 text-sm">
                    <strong>Full Report Details for:</strong> {expandedReport.url}
                  </p>
                  <p className="text-blue-600 dark:text-blue-400 text-xs mt-1">
                    Generated on {formatDate(expandedReport.timestamp)}
                  </p>
                </div> */}

                <ReportDisplay report={expandedReport} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}