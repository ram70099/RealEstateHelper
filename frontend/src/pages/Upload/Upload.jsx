import { useTranslation } from 'react-i18next';
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload as UploadIcon, File, X } from 'lucide-react';
import ProgressLog from './ProgressLog';
import { useNavigate } from 'react-router-dom';

const Upload = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [logs, setLogs] = useState([]);
  const [finalData, setFinalData] = useState(null);

  const addLog = (msg) => {
    setLogs((logs) => [...logs, msg]);
  };

  const clearLogs = () => setLogs([]);

  const onDrop = useCallback((acceptedFiles) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadError(null);
      setFinalData(null);
      clearLogs();
    }
  }, []);

  const removeFile = () => {
    setFile(null);
    setUploadError(null);
    setFinalData(null);
    clearLogs();
    localStorage.removeItem('extractedData'); // Clear localStorage on file remove too
  };

  const uploadFile = async () => {
    if (!file) {
      alert("Please select a PDF file first!");
      return;
    }

    setUploading(true);
    setUploadError(null);
    setFinalData(null);
    clearLogs();

    addLog("Starting upload...");

    try {
      const formData = new FormData();
      formData.append("pdf", file);

      const response = await fetch("http://localhost:8000/extract_data", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Upload failed");
      }

      addLog("File uploaded successfully. Processing...");

      const data = await response.json();

      if (data.status === "success") {
        addLog("Processing complete! Data ready for analysis.");
        setFinalData(data.data);

        // Clear old data and save new in localStorage
        localStorage.removeItem('extractedData');
        localStorage.setItem('extractedData', JSON.stringify(data.data));

        // No automatic navigation here!
      } else {
        addLog("Processing failed or returned no data.");
        setUploadError("No data extracted");
      }
    } catch (error) {
      addLog(`Error: ${error.message}`);
      setUploadError(error.message);
    } finally {
      setUploading(false);
    }
  };

  const goToAnalysis = () => {
    if (!finalData) return;
    navigate('/analysis', { state: { data: finalData } });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: 10 * 1024 * 1024,
    maxFiles: 1,
    disabled: uploading,
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold mb-2">{t('upload.title')}</h1>
      <p className="text-muted-foreground mb-6">{t('upload.subtitle')}</p>

      {!file ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer
            ${isDragActive ? 'bg-secondary/50 border-primary' : 'hover:bg-secondary/20 border-border'}`}
        >
          <input {...getInputProps()} />
          <UploadIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-2">
            {isDragActive ? 'Drop the file here' : 'Drag & drop your PDF here'}
          </p>
          <p className="text-muted-foreground mb-4">or click to browse files</p>
          <div className="flex flex-col gap-1 text-sm text-muted-foreground">
            <p>{t('upload.fileTypes')}</p>
            <p>{t('upload.maxSize')}</p>
          </div>
        </div>
      ) : (
        <div className="border border-border rounded-xl p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-secondary/70 rounded-lg flex items-center justify-center text-primary">
              <File size={24} />
            </div>
            <div>
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              {uploadError && <p className="text-red-500 mt-1">Error: {uploadError}</p>}
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <button
              onClick={removeFile}
              className="p-1 rounded-full hover:bg-secondary text-muted-foreground"
              disabled={uploading}
              title="Remove file"
            >
              <X size={20} />
            </button>
            <button
              onClick={uploadFile}
              disabled={uploading}
              className="btn-primary px-4 py-2 rounded"
            >
              {uploading ? "Uploading..." : "Upload & Extract"}
            </button>
            {/* Show go to analysis button ONLY if finalData exists */}
            {finalData && (
              <button
                onClick={goToAnalysis}
                className="btn-secondary px-4 py-2 rounded ml-4"
              >
                Go to Analysis
              </button>
            )}
          </div>
        </div>
      )}

      <ProgressLog logs={logs} finalData={finalData} />
    </div>
  );
};

export default Upload;
