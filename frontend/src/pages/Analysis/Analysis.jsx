import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Clock, ArrowRight } from 'lucide-react';

const Analysis = () => {
  const location = useLocation();
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    if (location.state?.data) {
      setProperties(location.state.data);
      localStorage.setItem('extractedData', JSON.stringify(location.state.data));
    } else {
      const stored = localStorage.getItem('extractedData');
      if (stored) {
        try {
          setProperties(JSON.parse(stored));
        } catch {
          setProperties([]);
        }
      }
    }
  }, [location]);

  if (!properties.length) {
    return (
      <p className="text-center mt-10 text-muted-foreground">
        No extracted property data found. Please upload a PDF first.
      </p>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Extracted Properties</h1>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {properties.map((property, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.1 }}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden flex flex-col"
          >
            {property.image_url && (
              <img
                src={`http://localhost:8000${property.image_url}`}
                alt={property.title || 'Property Image'}
                className="h-60 w-full object-cover" // smaller image height
              />
            )}

            <div className="p-3 flex flex-col flex-grow">
              {/* Title & Rent/Price */}
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-base">{property.title || 'No Title'}</h3> {/* smaller font */}
                <p className="text-primary font-semibold text-base">{property.rent || '-'}</p>
              </div>

              {/* Location & Type */}
              <p className="text-xs text-muted-foreground mb-2">
                <span>{property.address || '-'}</span>
                {property.submarket && <span> • {property.submarket}</span>}
                {property.property_type && <span> • {property.property_type}</span>}
              </p>

              {/* Core Details Grid */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs mb-4 text-muted-foreground border-t border-border pt-3"> {/* smaller gaps and font */}
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-300">Built Year</p>
                  <p>{property.built_year || '-'}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-300">Total Size (SF)</p>
                  <p>{property.size_sf || '-'}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-300">Available SF</p>
                  <p>{property.available_sf || '-'}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-300">Status</p>
                  <p>{property.status || '-'}</p>
                </div>
              </div>

              {/* Brokers Section */}
              {property.brokers?.length > 0 && (
                <div className="mb-4 max-h-24 overflow-y-auto"> {/* limit height with scroll if needed */}
                  <h4 className="font-semibold mb-1 text-gray-800 dark:text-gray-200 text-sm">Brokers</h4>
                  <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                    {property.brokers.map((b, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Phone size={14} />
                        <span>{b.name} - {b.phone}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Notes Section */}
              {property.notes && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-1 text-gray-800 dark:text-gray-200 text-sm">Notes</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{property.notes}</p>
                </div>
              )}

              {/* Footer with Date & Button */}
              <div className="flex items-center justify-between mt-auto text-xs text-muted-foreground border-t border-border pt-2">
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span>{property.date || 'Unknown date'}</span>
                </div>
                <button className="text-sm text-primary flex items-center gap-1 hover:opacity-80">
                  View Details
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Analysis;
