import React from 'react';

type Props = {
  activeSection: string;
  setActiveSection: (section: string) => void;
};

const SectionHeader: React.FC<Props> = ({ activeSection, setActiveSection }) => {
  const sections = [
    { id: 'overview', title: 'Overview' },
    { id: 'communication', title: 'Communication' },
    { id: 'suggestions', title: 'Agent Suggestions' }
  ];

  return (
    <div className="section-header">
      <div className="section-nav-text">
        {sections.map((section) => (
          <button
            key={section.id}
            className={`section-nav-text-item ${
              activeSection === section.id ? 'active' : ''
            }`}
            onClick={() => setActiveSection(section.id)}
          >
            {section.title}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SectionHeader;
