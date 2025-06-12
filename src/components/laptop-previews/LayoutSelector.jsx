import React, { useState } from 'react';
import ModernLayout from './ModernLayout';
import GridLayout from './GridLayout';
import CommandCenterLayout from './CommandCenterLayout';
import MinimalLayout from './MinimalLayout';
import TechnicalLayout from './TechnicalLayout';

const layouts = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean, modern layout with focus on performance metrics',
    component: ModernLayout
  },
  {
    id: 'grid',
    name: 'Grid',
    description: 'Grid-based layout with multiple charts and metrics',
    component: GridLayout
  },
  {
    id: 'command',
    name: 'Command Center',
    description: 'Command center style with multiple panels and controls',
    component: CommandCenterLayout
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Minimal layout focusing on essential information',
    component: MinimalLayout
  },
  {
    id: 'technical',
    name: 'Technical',
    description: 'Technical analysis focused with multiple indicators',
    component: TechnicalLayout
  }
];

const LayoutSelector = ({ data }) => {
  const [selectedLayout, setSelectedLayout] = useState('modern');
  
  const SelectedLayout = layouts.find(layout => layout.id === selectedLayout).component;

  return (
    <div className="space-y-8">
      {/* Layout Selector */}
      <div className="bg-gray-800/30 rounded-lg p-4">
        <div className="text-gray-400 text-sm mb-4">Select Layout</div>
        <div className="grid grid-cols-5 gap-4">
          {layouts.map((layout) => (
            <button
              key={layout.id}
              onClick={() => setSelectedLayout(layout.id)}
              className={`p-4 rounded-lg transition-all ${
                selectedLayout === layout.id
                  ? 'bg-indigo-500/20 border border-indigo-500/50'
                  : 'bg-gray-700/30 hover:bg-gray-700/50'
              }`}
            >
              <div className="text-white font-medium mb-1">{layout.name}</div>
              <div className="text-gray-400 text-xs">{layout.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Layout */}
      <div className="relative">
        <SelectedLayout data={data} />
      </div>
    </div>
  );
};

export default LayoutSelector; 