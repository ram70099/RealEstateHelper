import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Banknote, User, Phone, Mail, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { Property, Broker } from '../../types/property';
import './PropertyCard.css';

interface PropertyCardProps {
  property: Property;
  onSendEmail: (propertyId: string) => void;
}

const DEFAULT_IMAGE = '/default-image.png';  // put your default image in public folder or change path

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onSendEmail }) => {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  const toggleExpanded = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  const handleViewDetails = () => {
    navigate(`/properties/${property.id}`);
  };

  return (
    <motion.div 
      className={`property-card ${expanded ? 'expanded' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      onClick={handleViewDetails}
      style={{ cursor: 'pointer' }}
    >
      <div className="property-card-header">
        <div className="property-image-container">
          <img 
            src={`http://localhost:8000${property.image_url}`} 
            alt={property.title} 
            className="property-image" 
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = DEFAULT_IMAGE;
            }}
          />
          {property.emailSent && (
            <motion.div 
              className="email-sent-badge"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Mail size={12} />
              <span>Email Sent</span>
            </motion.div>
          )}
        </div>

        <div className="property-info">
          <h3 className="property-title">{property.title}</h3>
          <div className="property-details">
            <div className="property-detail">
              <MapPin size={16} />
              <span>{property.address}</span>
            </div>
            <div className="property-detail">
              <Banknote size={16} />
              <span>{property.rent}</span>
            </div>
          </div>

          <div className="property-status">
            <span className={`status-badge ${(property.status ?? 'Unknown').toLowerCase()}`}>
              {property.status ?? 'Unknown'}
            </span>
          </div>
        </div>

        <button 
          className="expand-button"
          onClick={toggleExpanded}
          aria-label={expanded ? "Collapse details" : "Expand details"}
        >
          {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {expanded && (
        <motion.div 
          className="property-card-expanded"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="broker-info">
            <h4>Broker Information</h4>
            {property.brokers.length > 0 ? (
              property.brokers.map((broker: Broker, idx) => (
                <div key={idx} className="broker-details">
                  <div className="broker-detail">
                    <User size={16} />
                    <span>{broker.name}</span>
                  </div>
                  <div className="broker-detail">
                    <Phone size={16} />
                    <span>{broker.phone}</span>
                  </div>
                  <div className="broker-detail">
                    <Mail size={16} />
                    <span>{broker.email}</span>
                  </div>
                </div>
              ))
            ) : (
              <p>No broker information available.</p>
            )}
          </div>

          <div className="property-actions">
            <button 
              className="button primary"
              onClick={(e) => {
                e.stopPropagation();
                onSendEmail(property.id);
              }}
              disabled={property.emailSent}
            >
              {property.emailSent ? 'Email Sent' : 'Send Interest Email'}
            </button>
            
            <button 
              className="button"
              onClick={(e) => {
                e.stopPropagation();
                handleViewDetails();
              }}
            >
              <ExternalLink size={16} />
              View Full Details
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default PropertyCard;
