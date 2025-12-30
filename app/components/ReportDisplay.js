'use client';

import { useState } from 'react';
import AISuggestions from './AISuggestions';
import IssuesChart from './IssuesChart';

export default function ReportDisplay({ report, showChart = true }) {
  const [activeTab, setActiveTab] = useState('summary');
  const [aiSuggestions, setAiSuggestions] = useState(report.aiSuggestions);

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
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800/30';
      case 'serious':
        return 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800/30';
      case 'moderate':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800/30';
      case 'minor':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800/30';
      default:
        return 'bg-gray-100 dark:bg-gray-800/50 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
  };

  const tabs = [
    { id: 'summary', label: 'Summary' },
    { id: 'violations', label: 'Violations' },
    { id: 'incomplete', label: 'Incomplete' },
    { id: 'ai-suggestions', label: 'AI Suggestions' },
    { id: 'passes', label: 'Passes' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/20 transition-colors duration-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Accessibility Report
        </h2>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-gray-600 dark:text-gray-400">
              <strong>URL:</strong> <a href={report.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">{report.url}</a>
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              <strong>Analyzed:</strong> {formatTimestamp(report.timestamp)}
            </p>
          </div>
          {report.summary?.accessibilityScore && (
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                {report.summary.accessibilityScore}%
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Accessibility Score
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 px-6 overflow-x-auto" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                } transition-colors duration-200`}
            >
              {/* <span className="mr-2">{tab.icon}</span> */}
              {tab.label}
              {/* {tab.id === 'violations' && report.summary?.violations > 0 && (
                <span className="ml-1 text-emerald-900 dark:text-red-400 py-1 px-2 rounded-full text-xs">
                  {report.summary.violations}
                </span>
              )} */}
              {/* {tab.id === 'incomplete' && report.summary?.incomplete > 0 && (
                <span className="ml-2 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 py-1 px-2 rounded-full text-xs">
                  {report.summary.incomplete}
                </span>
              )} */}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'summary' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className=" border border-red-200 dark:border-red-800/30 rounded-lg p-4">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {report.summary?.violations || report.axeResults?.violations?.length || 0}
                </div>
                <div className="text-sm text-red-800 dark:text-red-300">Violations</div>
              </div>
              <div className="border border-green-200 dark:border-green-800/80 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {report.summary?.passes || report.axeResults?.passes?.length || 0}
                </div>
                <div className="text-sm text-green-800 dark:text-green-300">Passes</div>
              </div>
              <div className=" border border-yellow-200 dark:border-yellow-800/30 rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {report.summary?.incomplete || report.axeResults?.incomplete?.length || 0}
                </div>
                <div className="text-sm text-yellow-800 dark:text-yellow-300">Incomplete</div>
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                  {report.summary?.inapplicable || report.axeResults?.inapplicable?.length || 0}
                </div>
                <div className="text-sm text-gray-800 dark:text-gray-300">Inapplicable</div>
              </div>
            </div>

            {/* Issues Trend Chart */}
            {showChart && <div className="mt-6">
              <IssuesChart url={report.url} />
            </div> }

            {/* Lighthouse Results Summary
            {report.lighthouseResults && (
              <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 rounded-lg p-4">
                <h3 className="text-lg font-medium text-blue-900 dark:text-blue-300 mb-3">Lighthouse Accessibility Audit</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {Math.round(report.lighthouseResults.lhr?.categories?.accessibility?.score * 100) || 'N/A'}
                    </div>
                    <div className="text-sm text-blue-800 dark:text-blue-300">Accessibility Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {report.lighthouseResults.lhr?.audits ? 
                        Object.values(report.lighthouseResults.lhr.audits).filter(audit => 
                          audit.score === 1 && audit.scoreDisplayMode !== 'notApplicable'
                        ).length : 'N/A'}
                    </div>
                    <div className="text-sm text-green-800 dark:text-green-300">Passed Audits</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {report.lighthouseResults.lhr?.audits ? 
                        Object.values(report.lighthouseResults.lhr.audits).filter(audit => 
                          audit.score !== null && audit.score < 1 && audit.scoreDisplayMode !== 'notApplicable'
                        ).length : 'N/A'}
                    </div>
                    <div className="text-sm text-red-800 dark:text-red-300">Failed Audits</div>
                  </div>
                </div>
              </div>
            )} */}
          </div>
        )}

        {activeTab === 'violations' && (
          <div className="space-y-4">
            {report.axeResults?.violations?.length > 0 ? (
              report.axeResults.violations.map((violation, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800/50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded border ${getImpactColor(violation.impact)}`}>
                          {violation.impact?.toUpperCase()}
                        </span>
                        <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono text-gray-800 dark:text-gray-300">
                          {violation.id}
                        </code>
                      </div>
                      <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {violation.help}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 mt-2">
                        {violation.description}
                      </p>
                    </div>
                  </div>

                  {violation.helpUrl && (
                    <div className="mb-3">
                      <a
                        href={violation.helpUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                      >
                        Learn more about this rule →
                      </a>
                    </div>
                  )}

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                    <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Affected Elements ({violation.nodes?.length || 0})
                    </h5>
                    <div className="space-y-2">
                      {violation.nodes?.slice(0, 3).map((node, nodeIndex) => (
                        <div key={nodeIndex} className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                          <code className="text-sm text-gray-800 dark:text-gray-300 block mb-1">
                            {node.target?.join(', ') || 'Unknown selector'}
                          </code>
                          {node.html && (
                            <pre className="text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 p-2 rounded border border-gray-200 dark:border-gray-700 overflow-x-auto">
                              {node.html}
                            </pre>
                          )}
                          {node.failureSummary && (
                            <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                              {node.failureSummary}
                            </p>
                          )}
                        </div>
                      ))}
                      {violation.nodes?.length > 3 && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          ... and {violation.nodes.length - 3} more elements
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="text-green-600 dark:text-green-400 text-4xl mb-4">✅</div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No Accessibility Violations Found!
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Great job! Your website passed all axe-core accessibility tests.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'incomplete' && (
          <div className="space-y-4">
            {report.axeResults?.incomplete?.length > 0 ? (
              report.axeResults.incomplete.map((item, index) => (
                <div key={index} className="border border-yellow-200 dark:border-yellow-800/30 rounded-lg p-4 bg-yellow-50 dark:bg-yellow-900/10">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded border bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800/30">
                          NEEDS REVIEW
                        </span>
                        <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono text-gray-800 dark:text-gray-300">
                          {item.id}
                        </code>
                      </div>
                      <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {item.help}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 mt-2">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {item.helpUrl && (
                    <div className="mb-3">
                      <a
                        href={item.helpUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                      >
                        Learn more about this rule →
                      </a>
                    </div>
                  )}

                  <div className="border-t border-yellow-200 dark:border-yellow-800/30 pt-3">
                    <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Elements Requiring Review ({item.nodes?.length || 0})
                    </h5>
                    <div className="space-y-2">
                      {item.nodes?.slice(0, 3).map((node, nodeIndex) => (
                        <div key={nodeIndex} className="bg-white dark:bg-gray-800 p-3 rounded border border-yellow-100 dark:border-yellow-800/20">
                          <code className="text-sm text-gray-800 dark:text-gray-300 block mb-1">
                            {node.target?.join(', ') || 'Unknown selector'}
                          </code>
                          {node.html && (
                            <pre className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-2 rounded border border-gray-200 dark:border-gray-700 overflow-x-auto">
                              {node.html}
                            </pre>
                          )}
                          {node.failureSummary && (
                            <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-2">
                              {node.failureSummary}
                            </p>
                          )}
                          {node.any && node.any.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Manual checks needed:</p>
                              <ul className="list-disc list-inside text-xs text-gray-600 dark:text-gray-400 ml-2">
                                {node.any.map((check, checkIndex) => (
                                  <li key={checkIndex}>{check.message || check.id}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                      {item.nodes?.length > 3 && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          ... and {item.nodes.length - 3} more elements
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="text-yellow-500 dark:text-yellow-400 text-4xl mb-4">📋</div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No Incomplete Tests
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  There are no accessibility tests that need manual verification.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'ai-suggestions' && (
          <AISuggestions
            reportId={report._id}
            initialSuggestions={aiSuggestions}
            onUpdateSuggestions={(newSuggestions) => setAiSuggestions(newSuggestions)}
          />
        )}

        {activeTab === 'passes' && (
          <div className="space-y-4">
            {report.axeResults?.passes?.length > 0 ? (
              report.axeResults.passes.map((pass, index) => (
                <div key={index} className="border border-green-200 dark:border-green-800/30 rounded-lg p-4 bg-green-50 dark:bg-green-900/10">
                  <div className="flex items-start gap-3">
                    <div className="text-green-600 dark:text-green-400 text-xl">✅</div>
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-green-900 dark:text-green-300 mb-2">
                        {pass.help}
                      </h4>
                      <p className="text-green-700 dark:text-green-400 mb-2">
                        {pass.description}
                      </p>
                      <div className="text-sm text-green-600 dark:text-green-400">
                        <strong>Rule:</strong> <code className="bg-green-100 dark:bg-green-900/20 px-1 py-0.5 rounded">{pass.id}</code>
                        {pass.helpUrl && (
                          <>
                            {' • '}
                            <a
                              href={pass.helpUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline"
                            >
                              Learn more →
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 dark:text-gray-500 text-4xl mb-4">📋</div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No Passed Tests Recorded
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Passed accessibility tests will appear here.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}