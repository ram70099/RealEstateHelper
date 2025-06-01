import  { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Banknote, User, Phone, Mail, Building2 } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './PropertyDetailsPage.css';

interface Broker {
  name: string;
  email?: string;
  phone?: string;
}

interface Property {
  id: string;
  title: string;
  address: string;
  rent: string;
  status: string;
  image_url?: string;
  notes?: string;
  brokers: Broker[];
  emailSent?: boolean;
}

const PropertyDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState<Property | null>(null);

  useEffect(() => {
    const storedData = localStorage.getItem('propertyData');
    if (!storedData) {
      navigate('/properties');
      return;
    }

    let properties: Property[] = [];
    try {
      properties = JSON.parse(storedData);
    } catch (err) {
      console.error('Failed to parse propertyData from localStorage', err);
      navigate('/properties');
      return;
    }

    const found = properties.find(p => p.id === id);
    if (found) {
      setTimeout(() => {
        setProperty(found);
        setLoading(false);
      }, 500);
    } else {
      navigate('/properties');
    }
  }, [id, navigate]);

  if (loading || !property) {
    return (
      <div className="loading-container">
        <LoadingSpinner size="large" />
        <p>Loading property details...</p>
      </div>
    );
  }

  return (
    <motion.div
      className="property-details-page container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <button className="back-button" onClick={() => navigate('/properties')}>
        <ArrowLeft size={20} />
        Back to Properties
      </button>

      <div className="property-details-content">
        <motion.div
          className="property-image-section"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <img
            src={`http://localhost:8000${property.image_url} `|| ''}  
            alt={property.title}
            className="property-main-image"
          />
          <div className="property-status-badge">
            <span className={`status-indicator ${property.status.toLowerCase()}`}>
              {property.status}
            </span>
          </div>
        </motion.div>

        <div className="property-info-section">
          <motion.h1
            className="property-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {property.title}
          </motion.h1>

          <motion.div
            className="property-key-details"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="detail-item">
              <MapPin size={20} />
              <span>{property.address}</span>
            </div>
            <div className="detail-item">
              <Banknote size={20} />
              <span>{property.rent}</span>
            </div>
            <div className="detail-item">
              <Building2 size={20} />
              <span>Commercial Property</span>
            </div>
          </motion.div>

          <motion.div
            className="property-description"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2>Description</h2>
            <p>{property.notes || 'No description available.'}</p>
          </motion.div>

          <motion.div
            className="broker-details-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h2>Broker Information</h2>
            {property.brokers.map((broker, i) => (
              <div key={i} className="broker-details">
                <div className="broker-detail">
                  <User size={20} />
                  <span>{broker.name}</span>
                </div>
                {broker.email && (
                  <div className="broker-detail">
                    <Mail size={20} />
                    <span>{broker.email}</span>
                  </div>
                )}
                {broker.phone && (
                  <div className="broker-detail">
                    <Phone size={20} />
                    <span>{broker.phone}</span>
                  </div>
                )}
              </div>
            ))}
          </motion.div>

          <motion.div
            className="property-actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <button className="button primary" disabled={property.emailSent}>
              {property.emailSent ? 'Email Sent to Broker' : 'Contact Broker'}
            </button>
            <button className="button">Schedule Viewing</button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default PropertyDetailsPage;
