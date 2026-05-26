import { useState, useEffect } from "react";
import { Activity, CreditCard, DollarSign, Package2, ArrowUpRight, ArrowDownRight, MoreHorizontal } from "lucide-react";
import { useTenant } from "../lib/TenantContext";

export default function DashboardOverview() {
  const [products, setProducts] = useState<any[]>([]);
  const { activeTeam } = useTenant();

  useEffect(() => {
    if (!activeTeam) return;
    fetch(`http://localhost:5000/products?teamId=${activeTeam.id}`)
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(console.error);
  }, [activeTeam]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Welcome back. Here's your infrastructure overview.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 rounded-lg bg-card/50 border border-border/50 text-sm font-medium hover:bg-card transition-colors">
            Download Report
          </button>
          <button className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-colors neon-glow">
            Provision Resource
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Total Revenue" 
          value="$45,231.89" 
          trend="+20.1% from last month" 
          icon={DollarSign}
          positive={true}
        />
        <MetricCard 
          title="Active Subscriptions" 
          value="+2350" 
          trend="+180.1% from last month" 
          icon={CreditCard}
          positive={true}
        />
        <MetricCard 
          title="Compute Usage" 
          value="8,432 hrs" 
          trend="-12% from last month" 
          icon={Activity}
          positive={false}
        />
        <MetricCard 
          title="Deployed Products" 
          value="42" 
          trend="+4 since last week" 
          icon={Package2}
          positive={true}
        />
      </div>

      {/* Products Table Area */}
      <div className="glass-panel rounded-xl overflow-hidden mt-8">
        <div className="p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Recent Data</h2>
            <p className="text-sm text-muted-foreground">Latest entries from your workspace products.</p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {products.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground text-sm">
              <Package2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No data yet</p>
              <p className="text-xs mt-1">Import data or add products from the Products page.</p>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-background border-b border-border sticky top-0 z-20">
                <tr>
                  <th className="px-6 py-4 font-semibold">ID</th>
                  {(() => {
                    const keys = new Set<string>();
                    products.slice(0, 5).forEach(p => Object.keys(p).forEach(k => {
                      if (k !== 'id' && k !== 'teamId') keys.add(k);
                    }));
                    return Array.from(keys).slice(0, 5).map(h => (
                      <th key={h} className="px-6 py-4 font-semibold whitespace-nowrap">{h}</th>
                    ));
                  })()}
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.slice(0, 5).map((product) => {
                  const keys = new Set<string>();
                  products.slice(0, 5).forEach(p => Object.keys(p).forEach(k => {
                    if (k !== 'id' && k !== 'teamId') keys.add(k);
                  }));
                  const headers = Array.from(keys).slice(0, 5);
                  return (
                    <tr key={product.id} className="hover:bg-muted/50 transition-colors group">
                      <td className="px-6 py-4 font-mono text-xs font-medium text-muted-foreground">{product.id}</td>
                      {headers.map(h => (
                        <td key={h} className="px-6 py-4 whitespace-nowrap text-foreground">
                          {h === 'status' ? (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                              product[h] === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                              product[h] === 'Warning' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                              'bg-slate-500/10 text-slate-500 border-slate-500/20'
                            }`}>
                              {product[h] || "-"}
                            </span>
                          ) : (
                            <span className={h === 'revenue' || h === 'TotalPrice' ? 'font-mono' : ''}>
                              {product[h] !== undefined ? String(product[h]) : "-"}
                            </span>
                          )}
                        </td>
                      ))}
                      <td className="px-6 py-4 text-right">
                        <button className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors opacity-0 group-hover:opacity-100">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, trend, icon: Icon, positive }: any) {
  return (
    <div className="glass-panel p-6 rounded-xl relative overflow-hidden group">
      {/* Decorative background glow on hover */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-primary/20 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className="p-2 bg-card rounded-md border border-border/50 text-muted-foreground">
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="relative z-10">
        <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
        <p className={`text-xs flex items-center mt-1 ${positive ? 'text-emerald-400' : 'text-rose-400'}`}>
          {positive ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
          {trend}
        </p>
      </div>
    </div>
  );
}
