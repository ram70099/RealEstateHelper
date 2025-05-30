// src/components/HomeData.tsx
import {
  FileUp,
  FileSearch,
  FileCheck,
  FileSpreadsheet,
  Star,
  Building2,
  TrendingUp,
  Shield,
  Zap,
  Clock,
  Users,
  Award
} from 'lucide-react';

// Animation Variants
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: 'easeOut'
    }
  }
};

export const fadeInUp = {
  hidden: { 
    y: 40, 
    opacity: 0 
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.7,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

export const slideInLeft = {
  hidden: { 
    x: -50, 
    opacity: 0 
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: 'easeOut'
    }
  }
};

export const slideInRight = {
  hidden: { 
    x: 50, 
    opacity: 0 
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: 'easeOut'
    }
  }
};

export const scaleIn = {
  hidden: { 
    scale: 0.8, 
    opacity: 0 
  },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut'
    }
  }
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

// Stats Data
export const stats = [
  {
    value: '10,000+',
    label: 'Properties Verified'
  },
  {
    value: '98.5%',
    label: 'Accuracy Rate'
  },
  {
    value: '5 Min',
    label: 'Average Processing'
  },
  {
    value: '5,000+',
    label: 'Happy Users'
  }
];

// Enhanced Features with more detailed descriptions
export const features = [
  {
    icon: <Building2 size={28} />,
    title: 'AI-Powered Property Analysis',
    description: 'Advanced machine learning algorithms analyze property documents, market data, and location factors to provide comprehensive insights about property value, growth potential, and investment viability.'
  },
  {
    icon: <Shield size={28} />,
    title: 'Document Verification & Fraud Detection',
    description: 'Our AI system detects forged documents, validates property ownership, checks legal compliance, and identifies potential fraud risks to protect your investment decisions.'
  },
  {
    icon: <TrendingUp size={28} />,
    title: 'Real-Time Market Intelligence',
    description: 'Access live market trends, price comparisons, neighborhood analytics, and future growth predictions powered by big data and market intelligence algorithms.'
  },
  {
    icon: <Zap size={28} />,
    title: 'Instant Processing',
    description: 'Upload your property documents and receive detailed analysis reports within minutes. Our cloud infrastructure ensures fast, reliable processing 24/7.'
  },
  {
    icon: <Clock size={28} />,
    title: 'Historical Analysis',
    description: 'Track property value changes over time, analyze market cycles, and understand long-term investment potential with our comprehensive historical data analysis.'
  },
  {
    icon: <Award size={28} />,
    title: 'Investment Scoring',
    description: 'Get a comprehensive investment score based on multiple factors including location, market trends, property condition, and potential returns to make informed decisions.'
  }
];

// Enhanced Testimonials with more diverse users
export const testimonials = [
  {
    name: 'Rahul Sharma',
    role: 'Property Investor & Developer',
    comment: 'PropAI has completely transformed my investment strategy. The AI insights helped me identify undervalued properties and avoid risky investments. I\'ve seen a 40% improvement in my investment returns since using this platform.',
    rating: 5,
    image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?w=200&h=200&fit=crop'
  },
  {
    name: 'Priya Patel',
    role: 'Senior Real Estate Agent',
    comment: 'As a real estate professional, I need reliable verification tools. PropAI\'s document verification has saved me countless hours and helped me build trust with clients. The fraud detection feature is exceptional.',
    rating: 5,
    image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?w=200&h=200&fit=crop'
  },
  {
    name: 'Arun Kumar',
    role: 'First-time Homebuyer',
    comment: 'Buying my first home was overwhelming until I found PropAI. The detailed property analysis and market insights gave me confidence in my decision. The investment score feature is incredibly helpful for beginners.',
    rating: 5,
    image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?w=200&h=200&fit=crop'
  },
  {
    name: 'Sneha Reddy',
    role: 'Property Management Company',
    comment: 'We process hundreds of property documents monthly. PropAI\'s bulk processing and verification capabilities have streamlined our operations significantly. The accuracy is outstanding.',
    rating: 5,
    image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?w=200&h=200&fit=crop'
  },
  {
    name: 'Vikram Singh',
    role: 'Real Estate Consultant',
    comment: 'The market intelligence features are game-changing. I can now provide my clients with data-driven recommendations backed by AI analysis. It\'s like having a research team at your fingertips.',
    rating: 5,
    image: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?w=200&h=200&fit=crop'
  },
  {
    name: 'Meera Joshi',
    role: 'Property Lawyer',
    comment: 'The legal document verification is remarkably accurate. It helps me quickly identify potential issues and ensures all property transactions are legally sound. Highly recommended for legal professionals.',
    rating: 5,
    image: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?w=200&h=200&fit=crop'
  }
];

// Enhanced Steps with more detailed descriptions
export const getSteps = (t: any) => [
  {
    icon: <FileUp size={32} />,
    title: t('home.step1.title') || 'Upload Documents',
    description: t('home.step1.description') || 'Securely upload property documents, PDFs, images, or legal papers. Our platform supports multiple formats and ensures data encryption.'
  },
  {
    icon: <FileSearch size={32} />,
    title: t('home.step2.title') || 'AI Analysis',
    description: t('home.step2.description') || 'Our advanced AI algorithms analyze documents, extract key information, verify authenticity, and cross-reference with market databases.'
  },
  {
    icon: <FileCheck size={32} />,
    title: t('home.step3.title') || 'Verification & Scoring',
    description: t('home.step3.description') || 'Get comprehensive verification results, fraud detection alerts, and investment scoring based on multiple risk and opportunity factors.'
  },
  {
    icon: <FileSpreadsheet size={32} />,
    title: t('home.step4.title') || 'Detailed Report',
    description: t('home.step4.description') || 'Receive a detailed analysis report with market insights, recommendations, risk assessment, and actionable investment guidance.'
  }
];

// Additional data for enhanced sections
export const processFeatures = [
  {
    icon: <Shield size={20} />,
    title: 'Bank-Level Security',
    description: 'Your documents are protected with enterprise-grade encryption'
  },
  {
    icon: <Zap size={20} />,
    title: 'Lightning Fast',
    description: 'Get results in under 5 minutes with our optimized AI processing'
  },
  {
    icon: <Users size={20} />,
    title: '24/7 Support',
    description: 'Expert support team available round the clock for assistance'
  }
];

export const industryPartners = [
  'RERA Certified',
  'ISO 27001 Compliant',
  'Government Approved',
  'Banking Partners',
  'Legal Network'
];

export { Star };