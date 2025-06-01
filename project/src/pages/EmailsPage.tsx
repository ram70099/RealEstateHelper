import React, { useState, useEffect } from 'react';
import { Filter, Mail } from 'lucide-react';
import EmailLogItem from '../components/EmailLog/EmailLogItem';
import EmailDetailsModal from '../components/EmailLog/EmailDetailsModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './EmailsPage.css';

interface EmailLog {
  id: string;
  from: string;
  to?: string;
  subject: string;
  status: 'sent' | 'failed' | 'pending';
  timestamp: string;
  body: string;
}

const API_EMAIL_LOGS_URL = "http://localhost:8000/api/email_logs";

const EmailsPage: React.FC = () => {
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'sent' | 'failed' | 'pending'>('all');
  const [selectedEmail, setSelectedEmail] = useState<EmailLog | null>(null);

  // Fetch email logs
  useEffect(() => {
    const fetchEmailLogs = async () => {
      setLoading(true);
      try {
        const response = await fetch(API_EMAIL_LOGS_URL);
        if (!response.ok) throw new Error("Failed to fetch email logs");
        const data: EmailLog[] = await response.json();
        console.log("Fetched emails:", data);
        setEmailLogs(data);
      } catch (err) {
        console.error("Error fetching email logs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmailLogs();
  }, []);

  // Detect duplicate IDs and print warning once emailLogs updated
  useEffect(() => {
    const ids = emailLogs.map(log => log.id);
    const duplicates = ids.filter((id, idx) => ids.indexOf(id) !== idx);
    if (duplicates.length > 0) {
      console.warn("Duplicate email log ids found:", duplicates);
    }
  }, [emailLogs]);

  // Resend email (dummy logic)
  const handleResendEmail = (emailId: string) => {
    setEmailLogs(prev =>
      prev.map(log =>
        log.id === emailId
          ? { ...log, status: 'pending', timestamp: new Date().toISOString() }
          : log
      )
    );

    setTimeout(() => {
      setEmailLogs(prev =>
        prev.map(log =>
          log.id === emailId
            ? { ...log, status: 'sent', timestamp: new Date().toISOString() }
            : log
        )
      );
    }, 2000);
  };

  // Filter with trimming and case normalization
  const filteredLogs = emailLogs.filter(log => {
    if (filter === 'all') return true;
    return log.status === filter;
  });

  console.log("Current filter:", filter);
  console.log("Filtered emails:", filteredLogs);

  return (
    <div className="container emails-page">
      <div className="emails-header">
        <div className="emails-title">
          <Mail size={24} />
          <h1>Email Logs</h1>
        </div>
        <p className="emails-subheader">
          Track all communications with property brokers
        </p>
      </div>

      <div className="emails-filters">
        {(['all', 'sent', 'pending', 'failed'] as const).map(f => (
          <button
            key={f}
            className={`filter-button ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-container">
          <LoadingSpinner size="large" />
          <p>Loading email logs...</p>
        </div>
      ) : filteredLogs.length > 0 ? (
        <div className="email-logs-list">
          {filteredLogs.map((log, index) => (
            <div
              key={`${log.id}-${index}`}  // Use composite key to ensure uniqueness
              onClick={() => setSelectedEmail(log)}
              style={{ cursor: 'pointer' }}
            >
              <EmailLogItem
                log={log}
                onResend={handleResendEmail}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="no-emails">
          <Filter size={48} className="no-emails-icon" />
          <p>No emails found matching the selected filter.</p>
          {filter !== 'all' && (
            <button className="button" onClick={() => setFilter('all')}>
              Show All Emails
            </button>
          )}
        </div>
      )}

      {selectedEmail && (
        <EmailDetailsModal
          email={selectedEmail}
          onClose={() => setSelectedEmail(null)}
        />
      )}
    </div>
  );
};

export default EmailsPage;
