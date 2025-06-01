import React from 'react';
import './EmailDetailsModal.css';

interface EmailDetailsModalProps {
  email: {
    from: string;
    subject: string;
    timestamp: string;
    body: string;
    status: string;
  };
  onClose: () => void;
}

const EmailDetailsModal: React.FC<EmailDetailsModalProps> = ({ email, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>×</button>
        <h2>Email Details</h2>

        <div className="email-section"><strong>From:</strong> {email.from}</div>
        <div className="email-section"><strong>Subject:</strong> {email.subject}</div>
        <div className="email-section"><strong>Status:</strong> {email.status}</div>
        <div className="email-section"><strong>Timestamp:</strong> {new Date(email.timestamp).toLocaleString()}</div>

        <div className="email-section email-body">
          <strong>Body:</strong>
          <pre>{email.body}</pre>
        </div>
      </div>
    </div>
  );
};

export default EmailDetailsModal;
