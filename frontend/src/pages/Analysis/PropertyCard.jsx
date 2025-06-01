import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building, MapPin, Calendar, Ruler, Phone, User, ArrowRight } from 'lucide-react';

const PropertyCard = ({ property, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: index * 0.1 }}
    className="group"
  >
    <Link to={`/property/${index}`} state={{ property }} className="block">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700 overflow-hidden">
        
        {/* Property Image */}
        {property.image_url && (
          <div className="relative overflow-hidden">
            <img
              src={`http://localhost:8000${property.image_url}`}
              alt={property.title || 'Property Image'}
              className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            {property.status && (
              <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-medium ${
                property.status.toLowerCase() === 'available' ? 'bg-green-500' : 'bg-red-500'
              } text-white`}>
                {property.status}
              </span>
            )}

            {property.rent && (
              <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg px-3 py-1">
                <span className="text-sm font-bold text-gray-800 dark:text-white">{property.rent}</span>
              </div>
            )}
          </div>
        )}

        {/* Card Body */}
        <div className="p-6">
          <h3 className="font-bold text-xl text-gray-800 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
            {property.title || 'No Title'}
          </h3>

          {/* Address */}
          <div className="flex items-start gap-2 text-gray-600 dark:text-gray-400 text-sm mb-4">
            <MapPin size={16} className="mt-0.5 flex-shrink-0" />
            <p>{property.address || '-'}</p>
          </div>

          {/* Property Type */}
          {property.property_type && (
            <div className="mb-4">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">
                <Building size={12} />
                {property.property_type}
              </span>
            </div>
          )}

          {/* Core Details */}
          <div className="grid grid-cols-2 gap-4 mb-4">
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

          {/* Broker Contact */}
          {property.brokers?.length > 0 && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <User size={14} className="text-blue-600 dark:text-blue-400" />
                <h4 className="font-semibold text-sm text-blue-800 dark:text-blue-200">Contact Brokers</h4>
              </div>
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
          )}

          {/* View Details CTA */}
          <div className="mt-4 flex items-center justify-end">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm font-medium group-hover:gap-3 transition-all duration-200">
              <span>View Details</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  </motion.div>
);

export default PropertyCard;
