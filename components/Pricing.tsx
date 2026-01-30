import React from 'react';
import { Check } from 'lucide-react';
import Button from './Button';

const tiers = [
  {
    name: 'Hobby',
    price: '$0',
    description: 'Perfect for side projects and learning.',
    features: ['Unlimited public projects', '500MB storage', '2GB RAM per container', 'Community support'],
    cta: 'Start Free',
    variant: 'outline' as const
  },
  {
    name: 'Pro',
    price: '$15',
    description: 'For professional developers and freelancers.',
    features: ['Unlimited private projects', '10GB storage', '8GB RAM per container', 'Always-on containers', 'Priority support', 'AI Assistant (Unlimited)'],
    cta: 'Go Pro',
    recommended: true,
    variant: 'primary' as const
  },
  {
    name: 'Team',
    price: '$49',
    description: 'Collaborate with your team securely.',
    features: ['Everything in Pro', 'Shared team workspaces', 'Audit logs', 'SSO & SAML', 'Dedicated support manager', 'Custom contracts'],
    cta: 'Contact Sales',
    variant: 'secondary' as const
  }
];

const Pricing: React.FC = () => {
  return (
    <section id="pricing" className="py-24 border-t border-zinc-900 bg-black">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Simple, transparent pricing</h2>
          <p className="text-zinc-400 text-lg">Choose the plan that's right for you.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {tiers.map((tier) => (
            <div 
              key={tier.name}
              className={`relative rounded-2xl p-8 flex flex-col ${
                tier.recommended 
                  ? 'bg-zinc-900 border-2 border-red-500 shadow-2xl shadow-red-900/20' 
                  : 'bg-black border border-zinc-800'
              }`}
            >
              {tier.recommended && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-red-600 to-purple-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                  Most Popular
                </div>
              )}
              
              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-2">{tier.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">{tier.price}</span>
                  {tier.price !== 'Custom' && <span className="text-zinc-500">/month</span>}
                </div>
                <p className="text-zinc-400 mt-2 text-sm">{tier.description}</p>
              </div>

              <div className="flex-1 mb-8">
                <ul className="space-y-4">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-zinc-300 text-sm">
                      <Check className="w-5 h-5 text-red-500 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button variant={tier.variant} className="w-full">
                {tier.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;