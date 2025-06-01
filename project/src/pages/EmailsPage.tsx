import React, { useState, useEffect, useRef } from 'react';
import { Filter, Mail } from 'lucide-react';
import EmailLogItem from '../components/EmailLog/EmailLogItem';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './EmailsPage.css';

// Define the EmailLog type
interface EmailLog {
  id: string;
  from: string;
  subject: string;
  status: 'sent' | 'failed' | 'pending';
  timestamp: string;
  body: string;
}

const WS_URL = "ws://localhost:8000/ws/dealer_replies"; // Replace with your backend WS URL
const API_EMAIL_LOGS_URL = "http://localhost:8000/api/email_logs"; // Replace with your real API URL

const EmailsPage: React.FC = () => {
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'sent' | 'failed' | 'pending'>('all');
  const wsRef = useRef<WebSocket | null>(null);

  // Fetch initial email logs (sent emails + dealer replies)
  useEffect(() => {
    const fetchEmailLogs = async () => {
      setLoading(true);
      try {
        const response = await fetch(API_EMAIL_LOGS_URL);
        if (!response.ok) throw new Error("Failed to fetch email logs");
        const data: EmailLog[] = await response.json();
        setEmailLogs(data);
      } catch (err) {
        console.error("Error fetching email logs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEmailLogs();
  }, []);

  // WebSocket for live dealer replies
  useEffect(() => {
    wsRef.current = new WebSocket(WS_URL);

    wsRef.current.onopen = () => {
      console.log("WebSocket connected");
    };

    wsRef.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === "dealer_reply") {
          const newReply: EmailLog = {
            id: message.id || `reply-${Date.now()}`,
            from: message.from || "Dealer",
            subject: message.subject || "Dealer Reply",
            status: "sent",
            timestamp: message.timestamp || new Date().toISOString(),
            body: message.body || JSON.stringify(message.data, null, 2),
          };

          setEmailLogs(prevLogs => [newReply, ...prevLogs]);
        }
      } catch (err) {
        console.error("WebSocket message error:", err);
      }
    };

    wsRef.current.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    wsRef.current.onclose = () => {
      console.log("WebSocket disconnected");
    };

    return () => {
      wsRef.current?.close();
    };
  }, []);

  // Resend email handler (you may want to replace with actual API call)
  const handleResendEmail = (emailId: string) => {
    setEmailLogs(prevLogs =>
      prevLogs.map(log =>
        log.id === emailId
          ? { ...log, status: 'pending', timestamp: new Date().toISOString() }
          : log
      )
    );

    setTimeout(() => {
      setEmailLogs(prevLogs =>
        prevLogs.map(log =>
          log.id === emailId
            ? { ...log, status: 'sent', timestamp: new Date().toISOString() }
            : log
        )
      );
    }, 2000);
  };

  const filteredLogs = emailLogs.filter(log =>
    filter === 'all' || log.status === filter
  );

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
          {filteredLogs.map(log => (
            <EmailLogItem
              key={log.id}
              log={log}
              onResend={handleResendEmail}
            />
          ))}
        </div>
      ) : (
        <div className="no-emails">
          <Filter size={48} className="no-emails-icon" />
          <p>No emails found matching the selected filter.</p>
          {filter !== 'all' && (
            <button
              className="button"
              onClick={() => setFilter('all')}
            >
              Show All Emails
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmailsPage;
