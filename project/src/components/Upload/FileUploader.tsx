import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileType, AlertCircle, File } from 'lucide-react';
import './FileUploader.css';

interface FileUploaderProps {
  onFileAccepted: (file: File) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileAccepted }) => {
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      setError('Please upload a valid PDF file.');
      return;
    }

    if (acceptedFiles.length > 0) {
      setError(null);
      setSelectedFile(acceptedFiles[0]);
      onFileAccepted(acceptedFiles[0]);
    }
  }, [onFileAccepted]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
  });

  return (
    <div className="file-uploader-container">
      <div 
        {...getRootProps()} 
        className={`dropzone ${isDragActive ? 'active' : ''} ${isDragReject ? 'reject' : ''} ${selectedFile ? 'has-file' : ''}`}
      >
        <input {...getInputProps()} />
        
        <div className="dropzone-content">
          {selectedFile ? (
            <div className="selected-file">
              <File size={36} className="file-icon" />
              <div className="file-info">
                <span className="file-name">{selectedFile.name}</span>
                <span className="file-size">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            </div>
          ) : (
            <>
              <div className="upload-icon-container">
                <Upload size={48} className="upload-icon" />
                <FileType size={24} className="file-type-icon" />
              </div>
              <h3 className="upload-title">Upload Real Estate PDF</h3>
              <p className="upload-description">
                Drag & drop your PDF file here, or <span className="upload-browse">browse</span>
              </p>
              <p className="upload-note">Only PDF files are supported</p>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="upload-error">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default FileUploader;