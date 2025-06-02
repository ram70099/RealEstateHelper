// src/pages/sections/CommunicationSection.tsx
import React, { useState } from 'react';
import { Mail, Send } from 'lucide-react';
import { motion } from 'framer-motion';

type EmailLog = {
  id: string;
  propertyId: string;
  subject: string;
  to: string;
  from: string;
  status: 'sent' | 'pending' | 'failed';
  timestamp: string;
  message?: string;
};

type Broker = {
  name: string;
  phone: string;
  email: string;
  company?: string;
  experience?: string;
};

type Property = {
  id: string;
  title: string;
  notes: string;
  image_url: string;
  address: string;
  rent: string;
  status: string;
  property_type: string;
  submarket: string;
  available_sf?: number;
  size_sf?: number;
  built_year?: number;
  brokers: Broker[];
  email_sent: boolean;
  email_error: string | null;
};

type Props = {
  property: Property;
  propertyEmails: EmailLog[];
  onNewEmail: (email: EmailLog) => void;
};

const CommunicationSection: React.FC<Props> = ({ property, propertyEmails, onNewEmail }) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSending(true);

    // Simulate API call
    setTimeout(() => {
      const newEmail: EmailLog = {
        id: Date.now().toString(),
        propertyId: property.id,
        subject: `Inquiry about ${property.title}`,
        to: property.brokers[0]?.email || 'broker@example.com',
        from: 'user@example.com',
        status: 'sent',
        timestamp: new Date().toISOString(),
        message,
      };
      onNewEmail(newEmail);
      setMessage('');
      setIsSending(false);
    }, 1000);
  };

  return (
    <div className="communication-section">
      <motion.div
        className="email-history"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h3>Email History</h3>
        {propertyEmails.length === 0 ? (
          <p>No emails sent yet.</p>
        ) : (
          <ul className="email-list">
            {propertyEmails.map((email) => (
              <li key={email.id} className="email-item">
                <div className="email-header">
                  <span className="email-subject">{email.subject}</span>
                  <span className={`email-status ${email.status}`}>{email.status}</span>
                </div>
                <div className="email-meta">
                  <span>To: {email.to}</span>
                  <span>From: {email.from}</span>
                  <span>{new Date(email.timestamp).toLocaleString()}</span>
                </div>
                {email.message && <p className="email-message">{email.message}</p>}
              </li>
            ))}
          </ul>
        )}
      </motion.div>

      <motion.div
        className="email-form"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h3>Send a Message</h3>
        <form onSubmit={handleSendEmail}>
          <textarea
            rows={4}
            placeholder="Type your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isSending}
          />
          <button type="submit" disabled={isSending}>
            {isSending ? 'Sending...' : 'Send Message'}
            <Send size={16} />
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default CommunicationSection;
