import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFound = () => {
  const { t } = useTranslation();
  
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
      className="h-[80vh] flex flex-col items-center justify-center text-center px-4"
    >
      <motion.div
        variants={itemVariants}
        className="text-9xl font-bold text-primary/20 mb-4"
      >
        404
      </motion.div>
      
      <motion.h1 
        variants={itemVariants}
        className="text-3xl md:text-4xl font-bold mb-4"
      >
        {t('notFound.title')}
      </motion.h1>
      
      <motion.p
        variants={itemVariants}
        className="text-xl text-muted-foreground mb-8 max-w-lg"
      >
        {t('notFound.subtitle')}
      </motion.p>
      
      <motion.div variants={itemVariants}>
        <Link
          to="/"
          className="btn btn-primary inline-flex items-center gap-2"
        >
          <Home size={18} />
          {t('notFound.backHome')}
        </Link>
      </motion.div>
    </motion.div>
  );
};

export default NotFound;