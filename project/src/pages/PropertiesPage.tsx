import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import PropertyCard from '../components/PropertyCard/PropertyCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './PropertiesPage.css';

interface Broker {
  name: string;
  phone: string;
  email: string;
}

interface Property {
  id: string;
  title: string;
  address: string;
  submarket?: string;
  property_type?: string;
  built_year?: number;
  size_sf?: number;
  available_sf?: number;
  rent: string;
  status: 'Available' | 'Pending' | 'Leased';
  brokers: Broker[];
  notes?: string;
  image_url?: string;
  emailSent: boolean;
}

const normalizeStatus = (status?: string): 'Available' | 'Pending' | 'Leased' => {
  if (!status) return 'Available';
  const lower = status.toLowerCase();
  if (lower === 'available' || lower === 'vacant' || lower === 'proposed') return 'Available';
  if (lower === 'pending') return 'Pending';
  if (lower === 'leased') return 'Leased';
  return 'Available';
};

const PropertiesPage: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    setLoading(true);
    try {
      const dataString = localStorage.getItem('propertyData');
      if (dataString) {
        const data: Property[] = JSON.parse(dataString);
        const dataWithNormalizedStatus = data.map(prop => ({
          ...prop,
          status: normalizeStatus(prop.status),
          emailSent: false,
        }));
        setProperties(dataWithNormalizedStatus);
      } else {
        setProperties([]);
      }
    } catch (error) {
      console.error('Failed to parse property data from localStorage', error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSendEmail = (propertyId: string) => {
    setProperties(prev =>
      prev.map(p => (p.id === propertyId ? { ...p, emailSent: true } : p))
    );
  };

  const filteredProperties = properties.filter(property => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      property.title.toLowerCase().includes(search) ||
      property.address.toLowerCase().includes(search) ||
      property.brokers.some(broker => broker.name.toLowerCase().includes(search));

    const matchesFilter =
      filter === 'all' || property.status.toLowerCase() === filter.toLowerCase();

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="container properties-page">
      <div className="properties-header">
        <h1>Available Properties</h1>
        <p className="properties-subheader">
          {properties.length} properties found from your uploaded documents
        </p>
      </div>

      <div className="properties-controls">
        <div className="search-container">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search properties, addresses, or brokers..."
            className="search-input"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-container">
          <select
            className="filter-select"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="proposed">Proposed</option>
            <option value="leased">Leased</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <LoadingSpinner size="large" />
          <p>Loading properties...</p>
        </div>
      ) : filteredProperties.length > 0 ? (
        <div className="properties-grid">
          {filteredProperties.map(property => (
            <div key={property.id} className="property-card-wrapper">
              <Link
                to={`/properties/${property.id}`}
                className="property-link"
              >
                <PropertyCard
                  property={property}
                  onSendEmail={() => handleSendEmail(property.id)}
                />
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-properties">
          <p>No properties found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default PropertiesPage;