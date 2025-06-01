import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import FileUploader from '../components/Upload/FileUploader';
import UploadProgress from '../components/Upload/UploadProgress';
import './HomePage.css';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<{
    progress: number;
    status: 'uploading' | 'processing' | 'complete' | 'error';
    error?: string;
  }>({ progress: 0, status: 'uploading' });

  const handleFileAccepted = async (acceptedFile: File) => {
    setFile(acceptedFile);
    setUploadState({ progress: 0, status: 'uploading' });

    try {
      // Create form data for the file upload
      const formData = new FormData();
      formData.append('pdf', acceptedFile);

      // Simulate upload progress
      const uploadSimulation = setInterval(() => {
        setUploadState(prev => {
          if (prev.progress >= 90) {
            clearInterval(uploadSimulation);
            return prev;
          }
          return { ...prev, progress: prev.progress + 10 };
        });
      }, 300);

      // Send file to backend
      const response = await fetch('http://localhost:8000/extract_data', {
        method: 'POST',
        body: formData,
      });

      clearInterval(uploadSimulation);
      setUploadState({ progress: 100, status: 'processing' });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
      }

      const data = await response.json();

      // Save backend response data to localStorage
      localStorage.removeItem('propertyData');
      localStorage.setItem('propertyData', JSON.stringify(data.data));
      

      setUploadState({ progress: 100, status: 'complete' });

      // Redirect to properties page after short delay
      setTimeout(() => {
        navigate('/properties');
      }, 1000);
    } catch (error: any) {
      setUploadState({ progress: 100, status: 'error', error: error.message });
    }
  };

  return (
    <div className="container home-page">
      <div className="home-header">
        <Building2 size={48} className="home-icon" />
        <h1 className="home-title">
          <span className="text-gradient">PropIntel</span>
        </h1>
        <p className="home-description">
          Upload commercial real estate PDFs to extract key information, view properties, 
          and automatically connect with brokers.
        </p>
      </div>
      
      <div className="upload-container glass-card">
        {file && uploadState ? (
          <div className="upload-progress-section">
            <h2>Processing Your Document</h2>
            <UploadProgress 
              progress={uploadState.progress} 
              status={uploadState.status}
              errorMessage={uploadState.error}
            />
            <p className="upload-info-text">
              {uploadState.status === 'processing' 
                ? "We're extracting property details, images, and broker information..." 
                : uploadState.status === 'complete'
                ? "Success! Redirecting to your properties..."
                : uploadState.status === 'error'
                ? `Error: ${uploadState.error}`
                : "Uploading your document..."}
            </p>
          </div>
        ) : (
          <FileUploader onFileAccepted={handleFileAccepted} />
        )}
      </div>
      
      <div className="home-features">
        <div className="feature-item">
          <div className="feature-icon">📄</div>
          <h3>Smart PDF Extraction</h3>
          <p>Upload real estate PDFs and automatically extract key property information.</p>
        </div>
        
        <div className="feature-item">
          <div className="feature-icon">📊</div>
          <h3>Organized Property View</h3>
          <p>View properties with rent, address, and broker details in a clean interface.</p>
        </div>
        
        <div className="feature-item">
          <div className="feature-icon">📧</div>
          <h3>Automated Broker Emails</h3>
          <p>Send interest emails to brokers with a single click and track responses.</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
