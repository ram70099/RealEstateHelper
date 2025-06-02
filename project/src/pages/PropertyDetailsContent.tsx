import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  DollarSign,
  MapPin,
  BarChart2,
  Send,
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  Square,
  Phone,
  Mail,
  User,
  TrendingUp,
  Building,
  Home,
} from 'lucide-react';

import type { Property, Broker, EmailLog } from '../types/types';

type Props = {
  property: Property;
  propertyEmails: EmailLog[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onEmailSent: () => void;
};

const PropertyDetailsContent: React.FC<Props> = ({
  property,
  propertyEmails,
  activeTab,
  setActiveTab,
  onEmailSent,
}) => {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [message, setMessage] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const broker: Broker = property.brokers?.[0] || {
    name: 'N/A',
    phone: 'N/A',
    email: 'N/A',
  };

  const handleContactBroker = () => {
    setShowEmailForm(true);
    setEmailSent(false);
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate sending email delay
    setTimeout(() => {
      onEmailSent();
      setShowEmailForm(false);
      setMessage('');
      setEmailSent(true);
    }, 1000);
  };

  const renderTabIcon = (tab: 'overview') => {
    const icons: Record<'overview', React.ReactNode> = {
      overview: <Building2 size={18} />,
    };
    return icons[tab] || null;
  };

  const formatStatusIcon = (status: 'sent' | 'pending' | 'failed') => {
    const icons: Record<'sent' | 'pending' | 'failed', React.ReactNode> = {
      sent: <CheckCircle color="green" />,
      pending: <Clock color="orange" />,
      failed: <XCircle color="red" />,
    };
    return icons[status] || null;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'vacant': return 'status-vacant';
      case 'proposed': return 'status-proposed';
      case 'under renovation': return 'status-renovation';
      default: return 'status-default';
    }
  };

  const getPropertyTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'office': return <Building size={20} />;
      case 'retail': return <Home size={20} />;
      case 'warehouse': return <Square size={20} />;
      default: return <Building2 size={20} />;
    }
  };

  return (
    <div className="dashboard-grid">
      {/* LEFT SECTION */}
      <div className="dashboard-main">
        <motion.div
          className="property-overview-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="property-image-container">
            <img
              src={`http://localhost:8000${property.image_url}`}
              alt={property.title}
              className="property-main-image"
            />
            <div className="property-image-overlay">
              <span className={`status-badge ${getStatusColor(property.status)}`}>
                {property.status}
              </span>
              <div className="property-type-badge">
                {getPropertyTypeIcon(property.property_type)}
                <span>{property.property_type}</span>
              </div>
            </div>
          </div>

          <div className="property-main-info">
            <div className="property-header">
              <h1>{property.title}</h1>
              <div className="property-submarket">
                <MapPin size={16} />
                <span>{property.submarket}</span>
              </div>
            </div>
            
            <div className="property-stats">
              <div className="stat-item">
                <DollarSign size={20} />
                <div className="stat-content">
                  <span className="stat-label">Rent</span>
                  <span className="stat-value">{property.rent || 'Withheld'}</span>
                </div>
              </div>
              <div className="stat-item">
                <Square size={20} />
                <div className="stat-content">
                  <span className="stat-label">Available Space</span>
                  <span className="stat-value">{property.available_sf ? `${property.available_sf.toLocaleString()} SF` : 'N/A'}</span>
                </div>
              </div>
              <div className="stat-item">
                <Building size={20} />
                <div className="stat-content">
                  <span className="stat-label">Total Size</span>
                  <span className="stat-value">{property.size_sf ? `${property.size_sf.toLocaleString()} SF` : 'N/A'}</span>
                </div>
              </div>
              <div className="stat-item">
                <Calendar size={20} />
                <div className="stat-content">
                  <span className="stat-label">Built Year</span>
                  <span className="stat-value">{property.built_year || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="dashboard-tabs">
          {(['overview'] as Array<'overview'>).map((tab) => (
            <button
              key={tab}
              className={`tab-button ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {renderTabIcon(tab)}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            className="dashboard-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && (
              <div className="overview-section">
                <div className="info-card description-card">
                  <div className="card-header">
                    <h3>Property Description</h3>
                    <TrendingUp size={20} className="card-icon" />
                  </div>
                  <p className="property-description">{property.notes || 'No description available.'}</p>
                </div>

                <div className="broker-cards-grid">
                  {property.brokers && property.brokers.length > 0 ? (
                    property.brokers.map((broker, index) => (
                      <div key={index} className="info-card broker-card">
                        <div className="broker-header">
                          <div className="broker-avatar">
                            <User size={24} />
                          </div>
                          <div>
                            <h4>{broker.name}</h4>
                            <span className="broker-title">Real Estate Broker</span>
                          </div>
                        </div>
                        <div className="broker-contact">
                          <div className="contact-item">
                            <Phone size={16} />
                            <span>{broker.phone}</span>
                          </div>
                          {broker.email && (
                            <div className="contact-item">
                              <Mail size={16} />
                              <span>{broker.email}</span>
                            </div>
                          )}
                        </div>
                        {/* {index === 0 && (
                          <button className="contact-button primary-contact" onClick={handleContactBroker}>
                            <Send size={16} />
                            Contact Primary Broker
                          </button>
                        )} */}
                        
                      </div>
                    ))
                  ) : (
                    <div className="info-card broker-card">
                      <h3>No Broker Information Available</h3>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* RIGHT SIDEBAR */}
      <div className="dashboard-sidebar">
        <div className="info-card property-summary-card">
          <div className="card-header">
            <h3>Property Summary</h3>
            <Building2 size={20} className="card-icon" />
          </div>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-label">Address</span>
              <span className="summary-value">{property.address}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Property Type</span>
              <span className="summary-value">{property.property_type}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Submarket</span>
              <span className="summary-value">{property.submarket}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Status</span>
              <span className={`summary-value status-text ${getStatusColor(property.status)}`}>
                {property.status}
              </span>
            </div>
          </div>
        </div>

        {/* Email form UI */}
{!emailSent && showEmailForm && (
  <motion.div 
    className="info-card email-form-card"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.2 }}
  >
    <div className="card-header">
      <h3>Contact the Broker</h3>
      <Mail size={20} className="card-icon" />
    </div>

    <p className="form-intro">💬 Interested in this property? Drop a quick message below:</p>

    <form onSubmit={handleSendEmail} className="email-form">
      <textarea
        required
        rows={4}
        placeholder="Hi! I'm interested in this property. Could you provide more details about availability and pricing?"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="message-textarea"
      />

      <div className="form-actions">
        <button type="submit" className="send-button primary">
          <Send size={16} /> Send Message
        </button>
        <button
          type="button"
          className="send-button secondary"
          onClick={() => setShowEmailForm(false)}
        >
          Cancel
        </button>
      </div>
    </form>
  </motion.div>
)}


        {emailSent && (
          <motion.div 
            className="info-card email-sent-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="success-header">
              <CheckCircle size={24} className="success-icon" />
              <h3>Message Sent Successfully!</h3>
            </div>
            <p className="success-message">
              Your inquiry has been sent to {broker.name}. They will contact you shortly with more information about this property.
            </p>
            
            <div className="market-insights">
              <h4>Market Insights</h4>
              <div className="insights-grid">
                <div className="insight-item">
                  <TrendingUp size={16} />
                  <span>High demand in {property.submarket}</span>
                </div>
              
                <div className="insight-item">
                  <Calendar size={16} />
                  <span>Average response time: 24 hours</span>
                </div>
              </div>
            </div>
            
            <button
              className="send-button secondary"
              onClick={() => {
                setEmailSent(false);
                setShowEmailForm(true);
              }}
            >
              <Send size={16} />
              Send Another Message
            </button>
          </motion.div>
        )}

        {/* Property Analytics Card */}
        {!showEmailForm && !emailSent && (
          <div className="info-card analytics-card">
            <div className="card-header">
              <h3>Property Analytics</h3>
              <BarChart2 size={20} className="card-icon" />
            </div>
            <div className="analytics-grid">
              <div className="analytics-item">
                <div className="analytics-value">
                  {property.built_year && property.built_year > 2020 ? 'New' : 
                   property.built_year && property.built_year > 2000 ? 'Modern' : 'Classic'}
                </div>
                <div className="analytics-label">Building Age</div>
              </div>
              <div className="analytics-item">
                <div className="analytics-value">
                  {property.available_sf && property.size_sf ? 
                    Math.round((property.available_sf / property.size_sf) * 100) + '%' : 'N/A'}
                </div>
                <div className="analytics-label">Availability</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyDetailsContent;