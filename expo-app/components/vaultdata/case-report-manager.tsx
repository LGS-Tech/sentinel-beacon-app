import React, { useState } from 'react';

interface TicketReportProps {
  ticketId: string;
  authToken: string;
  apiBaseUrl?: string;
}

export const TicketReportManager: React.FC<TicketReportProps> = ({
  ticketId,
  authToken,
  apiBaseUrl = 'http://localhost:3000',
}) => {
  const [reportContent, setReportContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch & display the report inside the UI component
  const handleFetchReport = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiBaseUrl}/cases/${encodeURIComponent(ticketId)}/report/view`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`,
          Accept: 'text/plain',
        },
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}: ${response.statusText}`);
      }

      const textData = await response.text();
      setReportContent(textData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to retrieve report.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Trigger direct file download in the user's browser (.txt)
  const handleDownloadReport = async (): Promise<void> => {
    setError(null);

    try {
      const response = await fetch(`${apiBaseUrl}/cases/${encodeURIComponent(ticketId)}/report/download`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Download failed with status ${response.status}`);
      }

      // Convert response stream to a browser blob and trigger download link
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `ticket-${ticketId}-report.txt`;

      document.body.appendChild(link);
      link.click();

      // Cleanup DOM object
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to download file.';
      setError(message);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          Report Sync: <span className="text-blue-600">#{ticketId}</span>
        </h2>
        <div className="space-x-2">
          <button
            onClick={handleFetchReport}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'View Inline'}
          </button>
          <button
            onClick={handleDownloadReport}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Download .txt
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded border border-red-200">
          {error}
        </div>
      )}

      {reportContent && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-gray-600 mb-1">Report Preview:</h3>
          <pre className="p-4 bg-gray-900 text-green-400 rounded font-mono text-xs overflow-x-auto whitespace-pre-wrap max-h-96">
            {reportContent}
          </pre>
        </div>
      )}
    </div>
  );
};