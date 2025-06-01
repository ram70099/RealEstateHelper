import React from 'react';
import './UploadProgress.css';

interface UploadProgressProps {
  progress: number;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  errorMessage?: string;
}

const UploadProgress: React.FC<UploadProgressProps> = ({ 
  progress, 
  status,
  errorMessage 
}) => {
  const statusMessages = {
    uploading: 'Uploading PDF...',
    processing: 'Extracting data from PDF...',
    complete: 'Data extraction complete!',
    error: errorMessage || 'An error occurred during upload.'
  };

  return (
    <div className="upload-progress-container">
      <div className="progress-bar-container">
        <div 
          className={`progress-bar ${status}`} 
          style={{ width: `${progress}%` }}
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
        
        <span className="progress-percentage">{Math.round(progress)}%</span>
      </div>
    </div>
  );
};

export default UploadProgress;