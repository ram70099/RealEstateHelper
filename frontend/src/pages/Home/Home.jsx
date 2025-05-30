// src/components/Home.tsx
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

import {
  containerVariants,
  itemVariants,
  features,
  testimonials,
  getSteps,
  Star
} from './HomeData';

const Home = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const steps = getSteps(t);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-20"
    >
      {/* Hero Section */}
      <motion.section 
        variants={itemVariants}
        className="bg-card rounded-2xl overflow-hidden relative p-8 md:p-12"
      >
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('home.title')}</h1>
          <p className="text-xl text-muted-foreground mb-8">{t('home.subtitle')}</p>
          <button 
            onClick={() => navigate('/upload')}
            className="btn btn-primary inline-flex items-center gap-2"
          >
            {t('home.getStarted')}
            <ArrowRight size={16} />
          </button>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section variants={itemVariants} className="space-y-12">
        <h2 className="text-3xl font-bold text-center">Key Features</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -5 }}
              className="bg-card rounded-xl p-6 border border-border transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-secondary/50 flex items-center justify-center mb-4 text-primary">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* How It Works Section */}
      <motion.section variants={itemVariants} className="space-y-12">
        <h2 className="text-3xl font-bold text-center">{t('home.howItWorks')}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -5 }}
              className="bg-card rounded-xl p-6 border border-border transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-secondary/50 flex items-center justify-center mb-4 text-primary">
                {step.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Testimonials Section */}
      <motion.section variants={itemVariants} className="space-y-12">
        <h2 className="text-3xl font-bold text-center">What Our Users Say</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -5 }}
              className="bg-card rounded-xl p-6 border border-border transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-4">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-xl object-cover"
                />
                <div>
                  <h4 className="font-semibold">{testimonial.name}</h4>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-muted-foreground mb-4">{testimonial.comment}</p>
              <div className="flex gap-1">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={16} className="text-yellow-500 fill-yellow-500" />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        variants={itemVariants}
        className="bg-card rounded-2xl p-8 md:p-12 text-center"
      >
        <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Join thousands of users who trust PropAI for their real estate decisions.
        </p>
        <button 
          onClick={() => navigate('/upload')}
          className="btn btn-primary inline-flex items-center gap-2"
        >
          Start Analyzing Properties
          <ArrowRight size={16} />
        </button>
      </motion.section>
    </motion.div>
  );
};

export default Home;
