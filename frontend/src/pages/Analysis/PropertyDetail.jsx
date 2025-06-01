import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import PropertyInfo from './PropertyInfo';

const PropertyDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const property = location.state?.property;

  if (!property) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl text-center max-w-md w-full animate-fade-in">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <Home className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">Property Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">No property data found. Please go back and select a property.</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 flex items-center gap-2 mx-auto"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 animate-slide-down">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center gap-2 border border-gray-200 dark:border-gray-700"
          >
            <ArrowLeft size={16} />
            Back to List
          </button>

          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2 animate-fade-in">
            {property.title || 'Property Details'}
          </h1>

          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 animate-fade-in-delay">
            <span className="text-lg">{property.address || 'Address not available'}</span>
          </div>
        </div>

        <PropertyInfo property={property} />
      </div>

      {/* Keep animations here if shared */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideDown {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeInRight {
          from { transform: translateX(20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .animate-fade-in { animation: fadeIn 0.6s ease-out; }
        .animate-fade-in-delay { animation: fadeIn 0.6s ease-out 0.2s both; }
        .animate-slide-down { animation: slideDown 0.6s ease-out; }
      `}</style>
    </div>
  );
};

export default PropertyDetail;
