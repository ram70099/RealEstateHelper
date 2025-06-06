import React, { useState, useEffect, useRef } from 'react';
import './CommunicationSection.css';

type Message = {
  from: string;
  body: string;
  date: string;
};

type Conversation = {
  threadId: string;
  messages: Message[];
};

type Props = {
  property: {
    title: string;
    address: string;
  };
};

const CommunicationSection: React.FC<Props> = ({ property }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [openThreadId, setOpenThreadId] = useState<string | null>(null);

  const fetchedOnce = useRef(false);

  useEffect(() => {
    if (fetchedOnce.current) return;
    fetchedOnce.current = true;

    const fetchConversations = async () => {
      setLoading(true);
      try {
        const res = await fetch('http://localhost:8000/api/get-email-history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: property.title, address: property.address }),
        });

        if (!res.ok) throw new Error('Network error');

        const data = await res.json();

        // Map API data to expected format
        if (Array.isArray(data.conversations)) {
          const mapped = data.conversations.map((conv: any) => ({
            threadId: conv.thread_id,
            messages: conv.messages.map((msg: any) => ({
              from: msg.from_email,
              body: msg.body,
              date: msg.timestamp,
            })),
          }));
          setConversations(mapped);
        } else {
          setConversations([]);
        }
      } catch (e) {
        setConversations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [property.title, property.address]);

  const toggleConversation = (threadId: string) => {
    setOpenThreadId(prev => (prev === threadId ? null : threadId));
  };

  if (loading) {
    return <div className="communication-section">Loading email conversations...</div>;
  }

  return (
    <section className="communication-section">
      <h3>Email History</h3>
      {conversations.length === 0 && (
        <div className="no-emails">No email conversations found for this property.</div>
      )}
      {conversations.map(({ threadId, messages }) => (
        <div key={threadId} className="conversation">
          <div className="conversation-header" onClick={() => toggleConversation(threadId)}>
            Thread ID: {threadId}
            <span className="toggle-icon">{openThreadId === threadId ? '▲' : '▼'}</span>
          </div>
          {openThreadId === threadId &&
            messages.map((msg, idx) => (
              <div key={idx} className="message-item">
                <strong>From:</strong> {msg.from} <br />
                <small>{new Date(msg.date).toLocaleString()}</small>
                <p>{msg.body}</p>
              </div>
            ))}
        </div>
      ))}
    </section>
  );
};

export default CommunicationSection;
