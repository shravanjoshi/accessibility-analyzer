'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function IssuesChart({ url }) {
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!url) return;

        const fetchReportHistory = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/reports/by-url?url=${encodeURIComponent(url)}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch report history');
                }

                const reports = await response.json();

                // Transform data for Recharts
                const transformedData = reports.map((report, index) => ({
                    reportNumber: `#${index + 1}`,
                    violations: report.summary?.violations || 0,
                    incomplete: report.summary?.incomplete || 0,
                    passes: report.summary?.passes || 0,
                    timestamp: new Date(report.timestamp).toLocaleDateString(),
                }));

                setChartData(transformedData);
            } catch (err) {
                console.error('Error fetching report history:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchReportHistory();
    }, [url]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">Loading chart data...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-lg p-4">
                <p className="text-red-600 dark:text-red-400">Error loading chart: {error}</p>
            </div>
        );
    }

    if (chartData.length === 0) {
        return (
            <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                    No historical data available for this URL yet.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                    Run multiple analyses to see trends over time.
                </p>
            </div>
        );
    }

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-lg">
                    {payload[0]?.payload?.timestamp && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                            {payload[0].payload.timestamp}
                        </p>
                    )}
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <div
                                className="w-3 h-3 rounded"
                                style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                {entry.name}: <strong>{entry.value}</strong>
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Issues Trend Over Time
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Tracking accessibility issues across {chartData.length} report{chartData.length !== 1 ? 's' : ''}
                </p>
            </div>

            <ResponsiveContainer width="100%" height={350}>
                <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-gray-200 dark:stroke-gray-700"
                    />
                    <XAxis
                        dataKey="reportNumber"
                        className="text-xs fill-gray-600 dark:fill-gray-400"
                        label={{
                            value: 'Reports',
                            position: 'insideBottom',
                            offset: -3,
                            className: 'fill-gray-700 dark:fill-gray-300'
                        }}
                    />
                    <YAxis
                        className="text-xs fill-gray-600 dark:fill-gray-400"
                        label={{
                            value: 'Numbers',
                            angle: -90,
                            position: 'insideLeft',
                            className: 'fill-gray-700 dark:fill-gray-300'
                        }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                        dataKey="violations"
                        fill="#DC2626"
                        name="Violations"
                        radius={[4, 4, 0, 0]}
                    />
                    <Bar
                        dataKey="incomplete"
                        fill="#F59E0B"
                        name="Incomplete"
                        radius={[4, 4, 0, 0]}
                    />
                    <Bar
                        dataKey="passes"
                        fill="#10B981"
                        name="Passes"
                        radius={[4, 4, 0, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>

            <div className="mt-6 flex flex-wrap gap-4 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-red-600"></div>
                    <span>Violations: Critical accessibility issues</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-yellow-500"></div>
                    <span>Incomplete: Manual review needed</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-green-600"></div>
                    <span>Passes: Successfully passed tests</span>
                </div>
            </div>
        </div>
    );
}
