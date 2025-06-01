import {
  Phone, Clock, MapPin, Building, Calendar,
  Ruler, DollarSign, User, FileText
} from 'lucide-react';

const PropertyInfo = ({ property }) => {
  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Left: Image + Details */}
      <div className="lg:col-span-2 space-y-6">
        {property.image_url && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden animate-scale-in">
            <img
              src={`http://localhost:8000${property.image_url}`}
              alt={property.title || 'Property Image'}
              className="w-full h-96 object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
        )}

        {/* Grid Details */}
        <div className="grid md:grid-cols-2 gap-4 animate-slide-up">
          {[
            {
              label: 'Property Type', value: property.property_type || 'Not specified',
              icon: <Building className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
              bg: 'bg-blue-100 dark:bg-blue-900'
            },
            {
              label: 'Built Year', value: property.built_year || 'Not available',
              icon: <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />,
              bg: 'bg-green-100 dark:bg-green-900'
            },
            {
              label: 'Total Size', value: property.size_sf ? `${property.size_sf} SF` : 'Not specified',
              icon: <Ruler className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
              bg: 'bg-purple-100 dark:bg-purple-900'
            },
            {
              label: 'Available Space', value: property.available_sf ? `${property.available_sf} SF` : 'Not specified',
              icon: <Ruler className="w-5 h-5 text-orange-600 dark:text-orange-400" />,
              bg: 'bg-orange-100 dark:bg-orange-900'
            },
          ].map(({ label, value, icon, bg }, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center`}>
                  {icon}
                </div>
                <h3 className="font-semibold text-gray-800 dark:text-white">{label}</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-lg">{value}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-4 animate-slide-up-delay">
          {/* Submarket */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-white">Submarket</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-lg">{property.submarket || 'Not specified'}</p>
          </div>

          {/* Status */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-yellow-600 dark:bg-yellow-400 rounded-full"></div>
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-white">Status</h3>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              property.status?.toLowerCase() === 'available'
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
            }`}>
              {property.status || 'Unknown'}
            </span>
          </div>
        </div>

        {/* Notes */}
        {property.notes && (
          <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 animate-slide-up-final">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-white text-lg">Additional Notes</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{property.notes}</p>
          </div>
        )}
      </div>

      {/* Right: Sidebar */}
      <div className="space-y-6">
        {/* Price */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-2xl shadow-lg animate-fade-in-right">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-6 h-6" />
            <h3 className="font-semibold text-lg">Price</h3>
          </div>
          <p className="text-2xl font-bold">{property.rent || 'Contact for pricing'}</p>
        </div>

        {/* Brokers */}
        {property.brokers?.length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 animate-fade-in-right-delay">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-white">Contact Brokers</h3>
            </div>
            <div className="space-y-3">
              {property.brokers.map((broker, idx) => (
                <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="font-medium text-gray-800 dark:text-white mb-1">{broker.name}</div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <Phone size={14} />
                    <span className="text-sm">{broker.phone}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Listed Date */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 animate-fade-in-right-delay-2">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-800 dark:text-white">Listed Date</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-300">{property.date || 'Unknown date'}</p>
        </div>
      </div>
    </div>
  );
};

export default PropertyInfo;
