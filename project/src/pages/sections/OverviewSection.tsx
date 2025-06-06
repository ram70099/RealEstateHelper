import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  DollarSign,
  MapPin,
  Square,
  Calendar,
  Building,
  Home,
  Send,
  CheckCircle,
  Mail,
  TrendingUp
} from 'lucide-react';

type Broker = {
  name: string;
  phone: string;
  email: string;
};

type Property = {
  id: string;
  title: string;
  notes: string;
  image_url: string;
  address: string;
  rent: string | { amount: string | number; frequency: string };
  status: string;
  property_type: string;
  submarket: string;
  available_sf: number;
  size_sf: number;
  built_year: number;
  brokers: Broker[];
  email_sent: boolean;
  email_error: string | null;
};

type EmailLog = {
  id: string;
  propertyId: string;
  subject: string;
  to: string;
  from: string;
  status: 'sent' | 'pending' | 'failed';
  timestamp: string;
};

type Props = {
  property: Property;
  propertyEmails: EmailLog[];
  onEmailSent: () => void;
};

const OverviewSection: React.FC<Props> = ({ property }) => {
  const navigate = useNavigate();

  const handleContactBroker = () => {
    navigate('/contact-broker', { state: { property } });
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
    <div className="overview-section">
      <div className="overview-grid">
        {/* LEFT SECTION - Property Details */}
        <div className="overview-main">
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
                   {property.rent && typeof property.rent === 'object' && 'amount' in property.rent && 'frequency' in property.rent ? (
  <span>{property.rent.amount} / {property.rent.frequency}</span>
) : (
  <span>{property.rent}</span> // fallback if it's just a string
)}
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

          {/* Property Description */}
          <div className="info-card description-card">
            <div className="card-header">
              <h3>Property Description</h3>
              <TrendingUp size={20} className="card-icon" />
            </div>
            <p className="property-description">{property.notes || 'No description available.'}</p>
          </div>
        </div>

        {/* RIGHT SIDEBAR - Summary & Contact Broker CTA */}
        <div className="overview-sidebar">
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

          {/* Contact Broker Button */}
          <div className="info-card contact-prompt-card">
            <div className="card-header">
              <h3>Interested in this property?</h3>
              <Mail size={20} className="card-icon" />
            </div>
            <p className="contact-prompt">Get more details and schedule a viewing</p>
            <button className="contact-cta-button" onClick={handleContactBroker}>
              <Send size={16} />
              Contact Broker
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewSection;
