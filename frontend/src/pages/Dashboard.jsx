import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { File, Clock, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';

const Dashboard = () => {
  const { t } = useTranslation();
  
  const properties = [
    {
      id: 1,
      title: "Luxury Villa in Koramangala",
      price: "₹4.5 Cr",
      location: "Koramangala, Bangalore",
      specs: "4 BHK • 3500 sq.ft",
      image: "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg",
      status: "Verified",
      date: "2 days ago"
    },
    {
      id: 2,
      title: "Modern Apartment in HSR Layout",
      price: "₹1.8 Cr",
      location: "HSR Layout, Bangalore",
      specs: "3 BHK • 1800 sq.ft",
      image: "https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg",
      status: "Pending",
      date: "1 week ago"
    },
    {
      id: 3,
      title: "Premium Villa in Whitefield",
      price: "₹3.2 Cr",
      location: "Whitefield, Bangalore",
      specs: "4 BHK • 3200 sq.ft",
      image: "https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg",
      status: "Verified",
      date: "2 weeks ago"
    }
  ];
  
  const stats = [
    {
      label: t('dashboard.uploaded'),
      value: 8,
      icon: <File size={20} />
    },
    {
      label: t('dashboard.verified'),
      value: 6,
      icon: <CheckCircle size={20} />
    },
    {
      label: t('dashboard.issues'),
      value: 2,
      icon: <AlertCircle size={20} />
    }
  ];
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };
  
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold mb-2">{t('dashboard.title')}</h1>
        <p className="text-muted-foreground">{t('dashboard.subtitle')}</p>
      </motion.div>
      
      {/* Stats */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-card border border-border rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm mb-1">{stat.label}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-secondary/50 flex items-center justify-center text-primary">
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </motion.div>
      
      {/* Property Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <div 
            key={property.id}
            className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-colors"
          >
            <div className="relative h-48 overflow-hidden">
              <img 
                src={property.image} 
                alt={property.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  property.status === 'Verified' 
                    ? 'bg-green-500/20 text-green-500' 
                    : 'bg-yellow-500/20 text-yellow-500'
                }`}>
                  {property.status}
                </span>
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold">{property.title}</h3>
                <p className="text-primary font-medium">{property.price}</p>
              </div>
              
              <p className="text-sm text-muted-foreground mb-2">{property.location}</p>
              <p className="text-sm text-muted-foreground mb-4">{property.specs}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock size={14} className="mr-1" />
                  {property.date}
                </div>
                <button className="text-sm text-primary flex items-center gap-1 hover:opacity-80">
                  View Details
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;