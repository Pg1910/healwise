import React, { useState, useEffect } from 'react';
import HealWiseTestSuite from '../utils/testingUtils.js';

export default function TestingDashboard({ onBack, darkMode }) {
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const runTests = async () => {
    setIsRunning(true);
    const testSuite = new HealWiseTestSuite();
    const results = await testSuite.runFullTestSuite();
    setTestResults(results);
    setIsRunning(false);
  };

  const getStatusColor = (status) => {
    if (status.includes('PASS')) return darkMode ? 'text-green-400' : 'text-green-600';
    if (status.includes('FAIL')) return darkMode ? 'text-red-400' : 'text-red-600';
    if (status.includes('WARNING')) return darkMode ? 'text-yellow-400' : 'text-yellow-600';
    return darkMode ? 'text-gray-400' : 'text-gray-600';
  };

  const cardClasses = darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-orange-200";

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gradient-to-br from-amber-50 via-orange-50 to-red-50'} p-6`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>
              🧪 System Testing Dashboard
            </h1>
            <p className={`${darkMode ? 'text-gray-400' : 'text-amber-600'} italic mt-2`}>
              Comprehensive testing for HealWise system reliability
            </p>
          </div>
          <button
            onClick={onBack}
            className={`px-6 py-3 ${cardClasses} border rounded-xl hover:shadow-md transition-all`}
          >
            ← Back to Journal
          </button>
        </div>

        {/* Test Controls */}
        <div className={`${cardClasses} border p-6 rounded-xl mb-8`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2">Test Controls</h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Run comprehensive tests to identify system breakpoints and ensure reliability
              </p>
            </div>
            <button
              onClick={runTests}
              disabled={isRunning}
              className={`px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 ${
                isRunning ? 'cursor-not-allowed' : ''
              }`}
            >
              {isRunning ? '🔄 Running Tests...' : '🚀 Run Full Test Suite'}
            </button>
          </div>
        </div>

        {/* Test Results */}
        {testResults && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className={`${cardClasses} border p-6 rounded-xl text-center`}>
                <div className="text-3xl mb-2">✅</div>
                <h3 className="font-semibold mb-2">Passed</h3>
                <div className="text-2xl font-bold text-green-500">
                  {testResults.tests.filter(t => t.status.includes('PASS')).length}
                </div>
              </div>

              <div className={`${cardClasses} border p-6 rounded-xl text-center`}>
                <div className="text-3xl mb-2">❌</div>
                <h3 className="font-semibold mb-2">Failed</h3>
                <div className="text-2xl font-bold text-red-500">
                  {testResults.tests.filter(t => t.status.includes('FAIL')).length}
                </div>
              </div>

              <div className={`${cardClasses} border p-6 rounded-xl text-center`}>
                <div className="text-3xl mb-2">⚠️</div>
                <h3 className="font-semibold mb-2">Warnings</h3>
                <div className="text-2xl font-bold text-yellow-500">
                  {testResults.warnings.length}
                </div>
              </div>

              <div className={`${cardClasses} border p-6 rounded-xl text-center`}>
                <div className="text-3xl mb-2">🚨</div>
                <h3 className="font-semibold mb-2">Critical</h3>
                <div className="text-2xl font-bold text-red-600">
                  {testResults.criticalErrors.length}
                </div>
              </div>
            </div>

            {/* Critical Errors */}
            {testResults.criticalErrors.length > 0 && (
              <div className={`${cardClasses} border p-6 rounded-xl mb-8 border-red-500`}>
                <h3 className="text-xl font-semibold mb-4 text-red-500">🚨 Critical Issues</h3>
                <div className="space-y-2">
                  {testResults.criticalErrors.map((error, index) => (
                    <div key={index} className={`p-3 rounded-lg ${darkMode ? 'bg-red-900 bg-opacity-30' : 'bg-red-50'}`}>
                      <div className="font-medium">{error.component}</div>
                      <div className={`text-sm ${darkMode ? 'text-red-200' : 'text-red-700'}`}>
                        {error.error}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Detailed Test Results */}
            <div className={`${cardClasses} border p-6 rounded-xl`}>
              <h3 className="text-xl font-semibold mb-4">Detailed Test Results</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {testResults.tests.map((test, index) => (
                  <div key={index} className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} flex items-start justify-between`}>
                    <div className="flex-1">
                      <div className="font-medium">{test.test}</div>
                      {test.note && (
                        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {test.note}
                        </div>
                      )}
                      {test.error && (
                        <div className={`text-sm ${darkMode ? 'text-red-300' : 'text-red-600'}`}>
                          Error: {test.error}
                        </div>
                      )}
                    </div>
                    <div className={`font-medium ${getStatusColor(test.status)}`}>
                      {test.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Test Report */}
            <div className={`${cardClasses} border p-6 rounded-xl mt-8`}>
              <h3 className="text-xl font-semibold mb-4">Full Test Report</h3>
              <pre className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} whitespace-pre-wrap overflow-x-auto`}>
                {testResults.report}
              </pre>
            </div>
          </>
        )}

        {/* Manual Testing Checklist */}
        <div className={`${cardClasses} border p-6 rounded-xl mt-8`}>
          <h3 className="text-xl font-semibold mb-4">📋 Manual Testing Checklist</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">UI/UX Testing</h4>
              <ul className={`space-y-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>□ Test on mobile devices</li>
                <li>□ Test dark/light mode switching</li>
                <li>□ Test keyboard navigation</li>
                <li>□ Test screen reader compatibility</li>
                <li>□ Test with slow internet connection</li>
                <li>□ Test with large conversation history</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Functional Testing</h4>
              <ul className={`space-y-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>□ Test meditation sessions completion</li>
                <li>□ Test game functionality</li>
                <li>□ Test progress tracking accuracy</li>
                <li>□ Test early warning system</li>
                <li>□ Test with backend offline</li>
                <li>□ Test data export/import</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}