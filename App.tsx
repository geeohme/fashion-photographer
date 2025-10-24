
import React, { useState } from 'react';
import ImageGenerator from './components/ImageGenerator';
import ImageEditor from './components/ImageEditor';
import { CameraIcon, PencilSquareIcon, SparklesIcon } from './components/ui/Icons';

type Tab = 'generator' | 'editor';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('generator');

  const renderContent = () => {
    switch (activeTab) {
      case 'generator':
        return <ImageGenerator />;
      case 'editor':
        return <ImageEditor />;
      default:
        return null;
    }
  };

  const TabButton: React.FC<{ tabName: Tab; label: string; icon: React.ReactNode }> = ({ tabName, label, icon }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-pink-500 ${
        activeTab === tabName
          ? 'bg-gray-800 text-white border-b-2 border-pink-500'
          : 'bg-transparent text-gray-400 hover:bg-gray-800 hover:text-white'
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-2">
            <SparklesIcon className="w-10 h-10 text-pink-400" />
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500">
              Virtual Fashion Photographer
            </h1>
          </div>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Your personal AI-powered studio for high-end fashion photography and creative editing.
          </p>
        </header>

        <main>
          <div className="border-b border-gray-700 mb-6">
            <nav className="flex -mb-px space-x-4" aria-label="Tabs">
              <TabButton tabName="generator" label="Generate Photos" icon={<CameraIcon className="w-5 h-5" />} />
              <TabButton tabName="editor" label="Edit Images" icon={<PencilSquareIcon className="w-5 h-5" />} />
            </nav>
          </div>
          <div>{renderContent()}</div>
        </main>
      </div>
    </div>
  );
};

export default App;
