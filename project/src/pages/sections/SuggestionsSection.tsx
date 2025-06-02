// src/pages/sections/SuggestionsSection.tsx
import React from 'react';
import { Lightbulb, TrendingUp, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

type AgentSuggestion = {
  id: string;
  propertyId: string;
  recommendation: 'buy' | 'hold' | 'pass';
  reasoning: string;
  marketInsights: string[];
  timeline: string;
  riskLevel: 'low' | 'medium' | 'high';
  expectedROI?: string;
};

type Broker = {
  name: string;
  phone: string;
  email: string;
  company?: string;
  experience?: string;
};

type Property = {
  id: string;
  title: string;
  notes: string;
  image_url: string;
  address: string;
  rent: string;
  status: string;
  property_type: string;
  submarket: string;
  available_sf?: number;
  size_sf?: number;
  built_year?: number;
  brokers: Broker[];
  email_sent: boolean;
  email_error: string | null;
};

type Props = {
  property: Property;
  suggestions: AgentSuggestion[];
};

const SuggestionsSection: React.FC<Props> = ({ property, suggestions }) => {
  return (
    <div className="suggestions-section">
      <h3>Agent Recommendations</h3>
      {suggestions.length === 0 ? (
        <p>No suggestions available for this property.</p>
      ) : (
        <div className="suggestions-list">
          {suggestions.map((suggestion) => (
            <motion.div
              key={suggestion.id}
              className="suggestion-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="suggestion-header">
                <Lightbulb size={20} />
                <span className={`recommendation ${suggestion.recommendation}`}>
                  {suggestion.recommendation.toUpperCase()}
                </span>
              </div>
              <p className="reasoning">{suggestion.reasoning}</p>
              <div className="market-insights">
                <h4>Market Insights</h4>
                <ul>
                  {suggestion.marketInsights.map((insight, index) => (
                    <li key={index}>
                      <TrendingUp size={16} />
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="additional-info">
                <p>
                  <strong>Timeline:</strong> {suggestion.timeline}
                </p>
                <p>
                  <strong>Risk Level:</strong>{' '}
                  <span className={`risk-level ${suggestion.riskLevel}`}>
                    {suggestion.riskLevel}
                  </span>
                </p>
                {suggestion.expectedROI && (
                  <p>
                    <strong>Expected ROI:</strong> {suggestion.expectedROI}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SuggestionsSection;
