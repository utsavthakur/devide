import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeatureSection from './components/FeatureSection';
import IdeDemo from './components/IdeDemo';
import Pricing from './components/Pricing';
import Footer from './components/Footer';
import WebIde from './components/WebIde';

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'ide'>('landing');

  if (view === 'ide') {
    return <WebIde onExit={() => setView('landing')} />;
  }

  return (
    <div className="min-h-screen bg-background text-white selection:bg-purple-500/30 selection:text-purple-200">
      <Navbar onStartCoding={() => setView('ide')} />
      <main>
        <Hero onStartCoding={() => setView('ide')} />
        <FeatureSection />
        <IdeDemo />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
};

export default App;