import React, { useState, FormEvent, ChangeEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Send, Phone, ArrowLeft, MapPin, User } from 'lucide-react';
import './ContactBrokerPage.css';

// TypeScript interface for broker type safety
interface Broker {
  name: string;
  email?: string;
  phone?: string;
}

// Generate fallback email from broker's name if email is missing or empty
const generateEmailFromName = (name: string) => {
  if (!name) return 'default@example.com';
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '.')     // spaces to dots
      .replace(/[^a-z.]/g, '')  // remove invalid chars
    + '@example.com'
  );
};

const ContactBrokerPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get property data passed via state from react-router
  const property = location.state?.property;
  
  // If no property found, show a fallback message early
  if (!property) {
    return (
      <div className="contact-page error-state">
        <div className="error-content">
          <h2>No Property Data Found</h2>
          <p>Please go back and try again.</p>
          <button 
            className="back-button"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={16} /> Go Back
          </button>
        </div>
      </div>
    );
  }
  
  // Brokers list with type annotation and fallback empty array
  const brokers: Broker[] = property?.brokers || [];
  
  // State for currently selected broker and message text
  const [selectedBroker, setSelectedBroker] = useState<Broker | null>(brokers[0] || null);
  const [message, setMessage] = useState(
    "Hi, I'm interested in this property. Please get in touch with me with more details."
  );

  // Submit handler with proper FormEvent type
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedBroker) return alert('Please select a broker.');

    try {
      const response = await fetch('http://localhost:8000/api/contact-broker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brokerEmail: selectedBroker.email || generateEmailFromName(selectedBroker.name),
          brokerName: selectedBroker.name,
          propertyTitle: property.title,
          message,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        // Optionally navigate back or clear form here
      } else {
        alert(`Error: ${data.message || 'Failed to send message'}`);
      }
    } catch (err) {
      alert('Network error, please try again later.');
    }
  };

  // Select change handler with proper ChangeEvent type
  const handleBrokerChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const broker = brokers.find((b) => b.name === e.target.value) || null;
    setSelectedBroker(broker);
  };

  return (
    <div className="contact-page">
      <div className="page-header">
        <button 
          className="back-nav-buttons"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="header-content">
          <h1>Contact Broker</h1>
          <div className="property-info1">
            <h2 className="property-title">{property.title}</h2>
            <p className="property-address">
              <MapPin size={16} className="address-icon" /> 
              {property.address}
            </p>
          </div>
        </div>
      </div>

      <div className="form-container">
        <form
          className="contact-form"
          onSubmit={handleSubmit}  
        >
          <div className="form-section">
            <label htmlFor="broker-select" className="form-label">
              <User size={16} className="label-icon" />
              Choose a broker
            </label>
            
            <select
              id="broker-select"
              className="broker-select"
              value={selectedBroker?.name || ''}
              onChange={handleBrokerChange}  
            >
              {brokers.length === 0 && <option value="">No brokers available</option>}
              {brokers.map((broker) => (
                <option key={broker.email || broker.name} value={broker.name}>
                  {broker.name}
                </option>
              ))}
            </select>
          </div>

          {selectedBroker && (
            <div className="broker-info">
              <h3 className="broker-name">{selectedBroker.name}</h3>
              <div className="contact-details">
                <div className="contact-item">
                  <Mail size={16} className="contact-icon" />
                  <span className="contact-text">
                    {selectedBroker.email?.trim()
                      ? selectedBroker.email
                      : generateEmailFromName(selectedBroker.name)}
                  </span>
                </div>
                <div className="contact-item">
                  <Phone size={16} className="contact-icon" />
                  <span className="contact-text">
                    {selectedBroker.phone || 'Phone not available'}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="form-section">
            <label htmlFor="message" className="form-label">
              Your message
            </label>
            <textarea
              id="message"
              className="message-textarea"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
            />
          </div>

          <div className="form-buttons">
            <button type="submit" className="send-button">
              <Send size={16} />
              Send Message
            </button>
            <button
              type="button"
              className="cancel-button"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactBrokerPage;
