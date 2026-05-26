import { useState } from "react";
import { Zap, Server, Shield, Check } from "lucide-react";
import { useTenant } from "../lib/TenantContext";

export default function UpgradePlan() {
  const { activeTeam, updateTeam } = useTenant();
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  if (!activeTeam) return null;
  const currentPlan = activeTeam.plan || "Free";

  const handleUpgrade = async (plan: string) => {
    if (plan === currentPlan) return;
    setIsUpdating(plan);
    try {
      const res = await fetch(`http://localhost:5000/teams/${activeTeam.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan })
      });
      if (res.ok) {
        updateTeam({ ...activeTeam, plan });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="text-center max-w-2xl mx-auto space-y-4 pt-10">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Upgrade your workspace</h1>
        <p className="text-lg text-muted-foreground">Choose the plan that best fits your needs. Scale securely and seamlessly.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto pt-8">
        
        {/* Free Plan */}
        <div className={`glass-panel p-8 rounded-2xl border flex flex-col relative group transition-all duration-300 ${currentPlan === 'Free' ? 'border-primary shadow-lg shadow-primary/5 bg-primary/5' : 'border-border hover:border-border/80'}`}>
          {currentPlan === 'Free' && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full z-10">
              ACTIVE PLAN
            </div>
          )}
          <div className="mb-6">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${currentPlan === 'Free' ? 'bg-primary/20' : 'bg-muted'}`}>
              <Zap className={`w-6 h-6 ${currentPlan === 'Free' ? 'text-primary' : 'text-foreground'}`} />
            </div>
            <h3 className="text-xl font-bold">Free Tier</h3>
            <p className="text-muted-foreground text-sm mt-2">Perfect for side projects and evaluating the platform.</p>
          </div>
          <div className="mb-6">
            <span className="text-4xl font-bold">$0</span>
            <span className="text-muted-foreground text-sm">/month</span>
          </div>
          <ul className="space-y-3 mb-8 flex-1">
            {["Up to 2 projects", "Community support", "Basic analytics", "48-hour data retention"].map((feature, i) => (
              <li key={i} className="flex items-center gap-3 text-sm">
                <Check className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">{feature}</span>
              </li>
            ))}
          </ul>
          <button 
            onClick={() => handleUpgrade('Free')}
            disabled={currentPlan === 'Free' || isUpdating !== null}
            className={`w-full py-3 rounded-xl font-medium transition-colors border ${
              currentPlan === 'Free' ? 'border-primary/50 text-primary cursor-default' : 
              'border-border hover:bg-muted text-foreground'
            } disabled:opacity-50`}
          >
            {isUpdating === 'Free' ? 'Updating...' : currentPlan === 'Free' ? 'Current Plan' : 'Downgrade to Free'}
          </button>
        </div>

        {/* Pro Plan */}
        <div className={`glass-panel p-8 rounded-2xl flex flex-col relative transform md:-translate-y-4 transition-all duration-300 ${currentPlan === 'Pro' ? 'border-2 border-primary shadow-2xl shadow-primary/20 bg-primary/10' : 'border border-primary/50 bg-primary/5 shadow-2xl shadow-primary/10'}`}>
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50 rounded-t-2xl"></div>
          {currentPlan === 'Pro' ? (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full z-10">
              ACTIVE PLAN
            </div>
          ) : (
            <div className="absolute top-4 right-4 bg-primary/20 text-primary text-xs font-bold px-3 py-1 rounded-full">
              MOST POPULAR
            </div>
          )}
          <div className="mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <Server className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Pro Plan</h3>
            <p className="text-muted-foreground text-sm mt-2">Advanced features and scaling for growing teams.</p>
          </div>
          <div className="mb-6">
            <span className="text-4xl font-bold">$0</span>
            <span className="text-muted-foreground text-sm">/month</span>
          </div>
          <ul className="space-y-3 mb-8 flex-1">
            {["Unlimited projects", "Priority email support", "Advanced analytics", "30-day data retention", "Custom domains", "API access"].map((feature, i) => (
              <li key={i} className="flex items-center gap-3 text-sm">
                <Check className="w-4 h-4 text-primary" />
                <span className="text-foreground">{feature}</span>
              </li>
            ))}
          </ul>
          <button 
            onClick={() => handleUpgrade('Pro')}
            disabled={currentPlan === 'Pro' || isUpdating !== null}
            className={`w-full py-3 rounded-xl font-medium transition-all duration-300 ${
              currentPlan === 'Pro' ? 'border border-primary/50 text-primary cursor-default' : 
              'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20'
            } disabled:opacity-50`}
          >
            {isUpdating === 'Pro' ? 'Updating...' : currentPlan === 'Pro' ? 'Current Plan' : currentPlan === 'Enterprise' ? 'Downgrade to Pro' : 'Upgrade to Pro'}
          </button>
        </div>

        {/* Enterprise Plan */}
        <div className={`glass-panel p-8 rounded-2xl border flex flex-col relative group transition-all duration-300 ${currentPlan === 'Enterprise' ? 'border-primary shadow-lg shadow-primary/5 bg-primary/5' : 'border-border hover:border-border/80'}`}>
          {currentPlan === 'Enterprise' && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full z-10">
              ACTIVE PLAN
            </div>
          )}
          <div className="mb-6">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${currentPlan === 'Enterprise' ? 'bg-primary/20' : 'bg-muted'}`}>
              <Shield className={`w-6 h-6 ${currentPlan === 'Enterprise' ? 'text-primary' : 'text-foreground'}`} />
            </div>
            <h3 className="text-xl font-bold">Enterprise</h3>
            <p className="text-muted-foreground text-sm mt-2">Maximum performance, security, and dedicated support.</p>
          </div>
          <div className="mb-6">
            <span className="text-4xl font-bold">$0</span>
            <span className="text-muted-foreground text-sm">/month</span>
          </div>
          <ul className="space-y-3 mb-8 flex-1">
            {["Everything in Pro", "24/7 phone support", "Dedicated success manager", "Unlimited data retention", "Custom contracts", "SSO integration"].map((feature, i) => (
              <li key={i} className="flex items-center gap-3 text-sm">
                <Check className="w-4 h-4 text-foreground" />
                <span className="text-foreground">{feature}</span>
              </li>
            ))}
          </ul>
          <button 
            onClick={() => handleUpgrade('Enterprise')}
            disabled={currentPlan === 'Enterprise' || isUpdating !== null}
            className={`w-full py-3 rounded-xl font-medium transition-colors border ${
              currentPlan === 'Enterprise' ? 'border-primary/50 text-primary cursor-default' : 
              'border-border hover:bg-muted text-foreground'
            } disabled:opacity-50`}
          >
            {isUpdating === 'Enterprise' ? 'Updating...' : currentPlan === 'Enterprise' ? 'Current Plan' : 'Upgrade to Enterprise'}
          </button>
        </div>

      </div>
    </div>
  );
}
