import React from 'react';
import { FEATURES_DATA } from '../constants';
import { Zap, Users, Globe, Cpu } from 'lucide-react';

const icons = [Zap, Users, Cpu, Globe];

const FeatureSection: React.FC = () => {
  return (
    <section id="features" className="py-20 bg-zinc-900/30">
      <div className="container mx-auto px-6">
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to ship</h2>
          <p className="text-zinc-400 text-lg max-w-xl">
            Built for performance, designed for collaboration. Codexia provides a desktop-grade experience in your browser.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES_DATA.map((feature, index) => {
            const Icon = icons[index % icons.length];
            return (
              <div
                key={index}
                className="group p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-900 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-red-900/10 hover:border-red-900/30"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/10 to-red-500/10 flex items-center justify-center mb-4 group-hover:from-purple-500/20 group-hover:to-red-500/20 transition-colors">
                  <Icon className="w-6 h-6 text-purple-400 group-hover:text-red-400 transition-colors" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">{feature.title}</h3>
                <p className="text-zinc-400 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;