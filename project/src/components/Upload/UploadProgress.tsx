import React, { useEffect, useState, useRef } from 'react';
import './UploadProgress.css';

interface UploadProgressProps {
  progress: number; // initial or actual progress from parent
  status: 'uploading' | 'processing' | 'complete' | 'error';
  errorMessage?: string;
}

const UploadProgress: React.FC<UploadProgressProps> = ({
  progress,
  status,
  errorMessage,
}) => {
  const [displayProgress, setDisplayProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (status === 'uploading' || status === 'processing') {
      // Start slow increment if displayProgress < progress prop
      if (intervalRef.current) clearInterval(intervalRef.current);

      intervalRef.current = setInterval(() => {
        setDisplayProgress((prev) => {
          // Slow increments, max up to `progress` prop value
          if (prev < progress) {
            return prev + 0.3; // slow crawl, tweak this number for speed
          } else {
            return prev;
          }
        });
      }, 50); // update every 50ms

    } else if (status === 'complete') {
      // Clear slow increment
      if (intervalRef.current) clearInterval(intervalRef.current);

      // Fast jump to 100% smoothly
      let fastInterval = setInterval(() => {
        setDisplayProgress((prev) => {
          if (prev >= 100) {
            clearInterval(fastInterval);
            return 100;
          }
          return prev + 5; // big fast steps
        });
      }, 30);
    } else if (status === 'error') {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [progress, status]);

  const statusMessages = {
    uploading: 'Uploading PDF...',
    processing: 'Extracting data from PDF...',
    complete: 'Data extraction complete!',
    error: errorMessage || 'An error occurred during upload.',
  };

  return (
    <div className="upload-progress-container">
      <div className="progress-bar-container">
        <div
          className={`progress-bar ${status}`}
          style={{ width: `${Math.min(displayProgress, 100)}%` }}
        />
      </div>

      <div className="progress-status">
        <div className={`status-indicator ${status}`}>
          {status === 'processing' && (
            <div className="extracting-animation">
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}
          <span className="status-text">{statusMessages[status]}</span>
        </div>

        <span className="progress-percentage">{Math.round(displayProgress)}%</span>
      </div>
    </div>
  );
};

export default UploadProgress;
