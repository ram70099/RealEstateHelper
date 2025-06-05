import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, RefreshCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import LoadingSpinner from '../components/common/LoadingSpinner';
import SectionHeader from './sections/SectionHeader';
import OverviewSection from './sections/OverviewSection';
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

const API_EMAIL_LOGS_URL = "http://localhost:8000/api/email_logs";
const API_SYNC_URL = "http://localhost:8000/api/analyze-dealer-replies";

const PropertyDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState<Property | null>(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [propertyEmails, setPropertyEmails] = useState<EmailLog[]>([]);

 const syncPropertyWithBackend = async (prop: Property) => {
  try {
    const response = await fetch(API_SYNC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: prop.title,
        property_data: prop,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to sync property with backend');
    }

    const result = await response.json();
    console.log('Property synced successfully. Result:', result);
  } catch (error) {
    console.error('Error syncing property:', error);``
  }
};

  useEffect(() => {
    const fetchPropertyAndEmails = async () => {
      setLoading(true);

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

        // Ensure every broker has an email
        found.brokers = found.brokers.map(broker => ({
          ...broker,
          email: broker.email || `${broker.name.toLowerCase().replace(/ /g, '.')}@example.com`,
        }));

        // 🔄 Sync to backend on page load
        await syncPropertyWithBackend(found);

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

  const handleFetchLatest = async () => {
    if (property) {
      await syncPropertyWithBackend(property);
    }
  };

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

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <OverviewSection 
            property={property!} 
            propertyEmails={propertyEmails}
            onEmailSent={updateEmailSent}
          />
        );
      case 'communication':
        return <div className="section-placeholder">Communication section coming soon...</div>;
      case 'suggestions':
        return <div className="section-placeholder">Agent suggestions section coming soon...</div>;
      default:
        return (
          <OverviewSection 
            property={property!} 
            propertyEmails={propertyEmails}
            onEmailSent={updateEmailSent}
          />
        );
    }
  };

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
          <button className="back-button" onClick={handleFetchLatest}>
            <RefreshCcw size={18} />
            Fetch Latest Data
          </button>
        </div>
      </div>

      {property && (
        <>
          <SectionHeader 
            activeSection={activeSection}
            setActiveSection={setActiveSection}
          />
          
          <motion.div
            key={activeSection}
            className="section-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderActiveSection()}
          </motion.div>
        </>
      )}
    </motion.div>
  );
};

export default PropertyDetailsPage;
