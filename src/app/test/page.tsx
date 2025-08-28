'use client';

import { useState } from 'react';

export default function TestPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testSeed = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/seed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'admin',
          password: 'admin123'
        })
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            🧪 MongoDB Atlas Connection Test
          </h1>
          
          <div className="space-y-6">
            <div className="text-center">
              <button
                onClick={testSeed}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg mr-4 disabled:opacity-50"
              >
                {loading ? '⏳ Testing...' : '🌱 Seed Database'}
              </button>
              
              <button
                onClick={testLogin}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50"
              >
                {loading ? '⏳ Testing...' : '🔐 Test Login'}
              </button>
            </div>

            {result && (
              <div className="mt-8 bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Result:</h3>
                <pre className="bg-gray-800 text-green-400 p-4 rounded-lg overflow-auto text-sm">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}

            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">📋 Test Instructions:</h3>
              <ul className="text-blue-800 space-y-1">
                <li>• <strong>Seed Database:</strong> Creates sample users and rooms in MongoDB Atlas</li>
                <li>• <strong>Test Login:</strong> Attempts to login with admin credentials</li>
                <li>• Check the result below to see if MongoDB connection is working</li>
                <li>• If successful, you can proceed to the main dashboard</li>
              </ul>
            </div>

            <div className="text-center">
              <a
                href="/"
                className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg"
              >
                🏠 Back to Home
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
