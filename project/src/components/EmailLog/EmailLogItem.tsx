import React from 'react';
import { Check, AlertTriangle, Clock, RefreshCw } from 'lucide-react';
import { EmailLog } from '../../types/email';
import './EmailLogItem.css';

interface EmailLogItemProps {
  log: EmailLog;
  onResend: (emailId: string) => void;
}

const EmailLogItem: React.FC<EmailLogItemProps> = ({ log, onResend }) => {
  const getStatusIcon = () => {
    switch (log.status) {
      case 'sent':
        return <Check size={16} className="status-icon sent" />;
      case 'failed':
        return <AlertTriangle size={16} className="status-icon failed" />;
      case 'pending':
        return <Clock size={16} className="status-icon pending" />;
      default:
        return null;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className={`email-log-item ${log.status}`}>
      <div className="email-log-status">
        {getStatusIcon()}
        <span className="status-text">{log.status}</span>
      </div>
      
      <div className="email-log-content">
        <div className="email-log-header">
          <div className="email-addresses">
            <div className="email-to">
              <span className="label">To:</span>
              <span className="value">{log.to}</span>
            </div>
            <div className="email-from">
              <span className="label">From:</span>
              <span className="value">{log.from}</span>
            </div>
          </div>
          <div className="email-timestamp">
            {formatDate(log.timestamp)}
          </div>
        </div>
        
        <div className="email-subject">
          <span className="label">Subject:</span>
          <span className="value">{log.subject}</span>
        </div>
        
        {log.propertyTitle && (
          <div className="email-property">
            <span className="label">Property:</span>
            <span className="value">{log.propertyTitle}</span>
          </div>
        )}
      </div>
      
      {log.status === 'failed' && (
        <button 
          className="resend-button"
          onClick={() => onResend(log.id)}
          aria-label="Resend email"
        >
          <RefreshCw size={16} />
          <span>Resend</span>
        </button>
      )}
    </div>
  );
};

export default EmailLogItem;