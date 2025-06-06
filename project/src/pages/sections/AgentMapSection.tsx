// src/pages/sections/AgentMapSection.tsx
import React from 'react';
import { MapPin } from 'lucide-react';

type Props = {
  address: string;
};

const AgentMapSection: React.FC<Props> = ({ address }) => {
  return (
    <div className="map-section">
      <h3><MapPin size={20} /> Property Location</h3>
 <iframe
  title="Property Map"
  width="100%"
  height="470"
  loading="lazy"
  style={{ border: 0 }}
  src={`https://www.google.com/maps?q=${encodeURIComponent(address)}&z=16&t=k&layer=c&hl=en&output=embed&iwloc=near&marker=label:P|${encodeURIComponent(address)}`}
/>


    </div>
  );
};

export default AgentMapSection;
