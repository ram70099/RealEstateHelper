import React, { useEffect, useRef } from 'react';

const ProgressLog = ({ logs, finalData }) => {
  const logsEndRef = useRef(null);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  return (
    <div className="mt-8 bg-gray-800 p-4 rounded-lg max-h-96 overflow-y-auto text-white font-mono text-sm">
      <h2 className="font-semibold mb-2">Progress</h2>
      <ul className="space-y-1">
        {logs.map((log, idx) => (
          <li key={idx}>{log}</li>
        ))}
        <div ref={logsEndRef} />
      </ul>

      {finalData && (
        <>
          <h2 className="font-semibold mt-6 mb-2">Extracted Data</h2>
          <pre className="bg-gray-900 p-4 rounded overflow-x-auto max-h-96">
            {JSON.stringify(finalData, null, 2)}
          </pre>
        </>
      )}
    </div>
  );
};

export default ProgressLog;
