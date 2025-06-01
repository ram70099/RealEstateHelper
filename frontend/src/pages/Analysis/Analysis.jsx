import { useLocation, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Clock, ArrowRight, Building, MapPin, Calendar, Ruler, User, Home, Sparkles } from 'lucide-react';

const StatCard = ({ title, value, color }) => (
  <div className={`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 w-full`}> 
    <div className={`text-2xl font-bold text-${color}-600 dark:text-${color}-400 mb-1`}>{value}</div>
    <div className="text-sm text-gray-600 dark:text-gray-400">{title}</div>
  </div>
);

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

  const total = properties.length;
  const available = properties.filter(p => p.status?.toLowerCase() === 'available').length;
  const withBrokers = properties.filter(p => p.brokers?.length > 0).length;

  if (!properties.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl text-center max-w-md w-full animate-fade-in">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <Home className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">No Properties Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">No extracted property data found. Please upload a PDF first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8 animate-slide-down">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white">Extracted Properties</h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-6">
            Curated premium properties with smart extraction and broker insights.
          </p>

          {/* Stat Cards */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 max-w-4xl mx-auto">
            <StatCard title="Total Properties" value={total} color="blue" />
            <StatCard title="Available Now" value={available} color="green" />
            <StatCard title="With Brokers" value={withBrokers} color="purple" />
          </div>
        </div>

        {/* Properties Grid */}
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group"
            >
              <Link to={`/property/${i}`} state={{ property }} className="block">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700 overflow-hidden">
                  {property.image_url && (
                    <div className="relative overflow-hidden">
                      <img
                        src={`http://localhost:8000${property.image_url}`}
                        alt={property.title || 'Property Image'}
                        className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      {property.status && (
                        <div className="absolute top-4 left-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            property.status?.toLowerCase() === 'available'
                              ? 'bg-green-500 text-white'
                              : 'bg-red-500 text-white'
                          }`}>
                            {property.status}
                          </span>
                        </div>
                      )}
                      {property.rent && (
                        <div className="absolute top-4 right-4">
                          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg px-3 py-1">
                            <span className="text-sm font-bold text-gray-800 dark:text-white">{property.rent}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-6">
                    <h3 className="font-bold text-xl text-gray-800 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                      {property.title || 'No Title'}
                    </h3>

                    <div className="flex items-start gap-2 text-gray-600 dark:text-gray-400 text-sm mb-4">
                      <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                      <div>
                        <p>{property.address || '-'}</p>
                        {property.submarket && (
                          <p className="text-xs text-gray-500 dark:text-gray-500">{property.submarket}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar size={14} className="text-green-600 dark:text-green-400" />
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Built Year</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-white">{property.built_year || '-'}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Ruler size={14} className="text-purple-600 dark:text-purple-400" />
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Total Size</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-white">{property.size_sf ? `${property.size_sf} SF` : '-'}</p>
                      </div>
                    </div>

                    {property.brokers?.length > 0 && (
                      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-2 mb-2">
                          <User size={14} className="text-blue-600 dark:text-blue-400" />
                          <h4 className="font-semibold text-sm text-blue-800 dark:text-blue-200">Contact Brokers</h4>
                        </div>
                        <div className="space-y-1 max-h-20 overflow-y-auto">
                          {property.brokers.slice(0, 2).map((broker, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300">
                              <Phone size={12} />
                              <span className="truncate">{broker.name} - {broker.phone}</span>
                            </div>
                          ))}
                          {property.brokers.length > 2 && (
                            <p className="text-xs text-blue-600 dark:text-blue-400">+{property.brokers.length - 2} more</p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-end">
                      <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm font-medium group-hover:gap-3 transition-all duration-200">
                        <span>View Details</span>
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideDown {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .animate-fade-in {
          animation: fadeIn 0.6s ease-out;
        }

        .animate-slide-down {
          animation: slideDown 0.6s ease-out;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default Analysis;
