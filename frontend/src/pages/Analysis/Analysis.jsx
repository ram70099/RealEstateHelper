import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Phone } from 'lucide-react';

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
    <div className="max-w-7xl mx-auto py-10 px-4">
      <h1 className="text-4xl font-bold mb-8 text-center">Extracted Properties</h1>

      <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {properties.map((prop, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.1 }}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden flex flex-col"
          >
            {prop.image_url && (
              <img
                src={`http://localhost:8000${prop.image_url}`}
                alt={prop.title || 'Property Image'}
                className="h-48 w-full object-cover"
              />
            )}

            <div className="p-6 flex flex-col flex-grow">
              <h2 className="text-2xl font-semibold mb-2">{prop.title}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{prop.address}</p>

              <div className="grid grid-cols-2 gap-3 text-sm text-gray-700 dark:text-gray-300 mb-4 flex-grow">
                <div><strong>Submarket:</strong> {prop.submarket || '-'}</div>
                <div><strong>Property Type:</strong> {prop.property_type || '-'}</div>
                <div><strong>Built Year:</strong> {prop.built_year || '-'}</div>
                <div><strong>Total Size (SF):</strong> {prop.size_sf || '-'}</div>
                <div><strong>Available SF:</strong> {prop.available_sf || '-'}</div>
                <div><strong>Rent:</strong> {prop.rent || '-'}</div>
                <div><strong>Status:</strong> {prop.status || '-'}</div>
              </div>

              {prop.brokers?.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-medium mb-2 text-gray-800 dark:text-gray-200">Brokers</h3>
                  <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    {prop.brokers.map((b, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Phone size={14} /> {b.name} - {b.phone}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {prop.notes && (
                <div>
                  <h3 className="font-medium mb-1 text-gray-800 dark:text-gray-200">Notes</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{prop.notes}</p>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Analysis;
