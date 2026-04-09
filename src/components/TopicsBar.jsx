import { Tag } from 'lucide-react';

const TOPICS = [
  { id: 'nbfc', label: 'NBFC Only', color: '#fa8c16' },
  { id: 'ICAAP', label: 'ICAAP', color: '#60a5fa' },
  { id: 'ECL', label: 'ECL', color: '#4ade80' },
  { id: 'IRACP', label: 'IRACP', color: '#a78bfa' },
  { id: 'CAPITAL_ADEQUACY', label: 'Capital', color: '#2dd4bf' },
  { id: 'PROVISIONING', label: 'Provisioning', color: '#f87171' },
  { id: 'LIQUIDITY', label: 'Liquidity', color: '#22d3ee' },
];

export default function TopicsBar({ activeTopics, onTopicToggle }) {
  return (
    <div className="flex flex-wrap items-center gap-2 mt-2">
      <div className="text-[10px] uppercase font-semibold text-white/30 tracking-wider mr-2 flex items-center gap-1.5">
        <Tag size={10} />
        Tags
      </div>
      {TOPICS.map((topic) => {
        const isActive = activeTopics.includes(topic.id);
        return (
          <button
            key={topic.id}
            onClick={() => onTopicToggle(topic.id)}
            className={`chip ${isActive ? 'chip-active' : ''}`}
            style={isActive ? {
              color: topic.color
            } : {}}
          >
            {isActive && (
              <span 
                className="w-1.5 h-1.5 rounded-full" 
                style={{ background: topic.color }} 
              />
            )}
            {topic.label}
          </button>
        );
      })}
    </div>
  );
}
