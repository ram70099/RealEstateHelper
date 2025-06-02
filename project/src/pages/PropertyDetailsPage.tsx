import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PropertyDetailsContent from './PropertyDetailsContent';
import './PropertyDetailsPage.css';

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
  rent: string;
  status: string;
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

const API_EMAIL_LOGS_URL = "http://localhost:8000/api/email_logs";

const PropertyDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState<Property | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [propertyEmails, setPropertyEmails] = useState<EmailLog[]>([]);

  useEffect(() => {
    const fetchPropertyAndEmails = async () => {
      setLoading(true);

      // Load properties from localStorage or elsewhere
      const storedProperties = localStorage.getItem('propertyData');
      if (!storedProperties || !id) {
        navigate('/properties');
        return;
      }

      try {
        const parsedProperties: Property[] = JSON.parse(storedProperties);
        const found = parsedProperties.find(p => p.id === id);

        if (!found) {
          navigate('/properties');
          return;
        }

        // Fix missing broker emails
        found.brokers = found.brokers.map(broker => ({
          ...broker,
          email: broker.email || `${broker.name.toLowerCase().replace(/ /g, '.')}@example.com`
        }));

        // Fetch emails from API filtered by property ID
        const response = await fetch(API_EMAIL_LOGS_URL);
        if (!response.ok) throw new Error('Failed to fetch emails');
        const allEmails: EmailLog[] = await response.json();

        const relatedEmails = allEmails.filter(e => e.propertyId === id);

        setProperty(found);
        setPropertyEmails(relatedEmails);
      } catch (error) {
        console.error('Error fetching data', error);
        navigate('/properties');
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyAndEmails();
  }, [id, navigate]);

  // Update property email_sent flag & persist in localStorage (same as before)
  const updateEmailSent = () => {
    if (!property) return;

    const updatedProperty = { ...property, email_sent: true };

    const storedProperties = localStorage.getItem('properties');
    if (storedProperties) {
      try {
        const parsedProperties: Property[] = JSON.parse(storedProperties);
        const index = parsedProperties.findIndex(p => p.id === property.id);
        if (index !== -1) {
          parsedProperties[index] = updatedProperty;
          localStorage.setItem('properties', JSON.stringify(parsedProperties));
        }
      } catch (e) {
        console.error('Failed to update properties in localStorage', e);
      }
    }
    setProperty(updatedProperty);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <LoadingSpinner size="large" />
        <p>Loading property dashboard...</p>
      </div>
    );
  }

  return (
    <motion.div
      className="property-dashboard container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="dashboard-header">
        <button
          className="back-button"
          onClick={() => navigate('/properties')}
          aria-label="Back to Properties"
        >
          <ArrowLeft size={20} />
          <span>Back to Properties</span>
        </button>

        <div className="header-actions">
          <button className="action-button">
            <Download size={18} />
            Export Details
          </button>
         
        </div>
      </div>

      {property && (
        <PropertyDetailsContent
          property={property}
          propertyEmails={propertyEmails}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onEmailSent={updateEmailSent}
        />
      )}

    </motion.div>
  );
};

export default PropertyDetailsPage;
