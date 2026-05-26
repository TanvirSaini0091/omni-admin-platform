import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check, Building, Plus, X, Zap, Server, Shield } from "lucide-react";
import { useTenant } from "../lib/TenantContext";

export default function TeamSwitcher({ isExpanded = true }: { isExpanded?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamPlan, setNewTeamPlan] = useState("Free");
  const [mounted, setMounted] = useState(false);
  const { activeTeam, setActiveTeam, teams, refreshTeams } = useTenant();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCreateTeam = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newTeamName || !newTeamName.trim()) return;

    setIsCreating(true);
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      const newTeam = {
        name: newTeamName,
        plan: newTeamPlan,
        members: [{ userId: userId, role: "Owner" }]
      };

      const res = await fetch('http://localhost:5000/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTeam)
      });
      const createdTeam = await res.json();

      const userRes = await fetch(`http://localhost:5000/users/${userId}`);
      const user = await userRes.json();
      const updatedUserTeams = [...(user.teams || []), createdTeam.id];

      await fetch(`http://localhost:5000/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teams: updatedUserTeams })
      });

      await refreshTeams();
      setActiveTeam(createdTeam);
      
      setIsOpen(false);
      setShowCreateModal(false);
      setNewTeamName("");
      setNewTeamPlan("Free");
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  if (!activeTeam) return null;

  return (
    <>
      <div className="relative w-full">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center ${isExpanded ? 'justify-between px-3' : 'justify-center px-0'} w-full py-2 rounded-md bg-background border border-border hover:bg-muted hover:border-border transition-all duration-300`}
          title={!isExpanded ? activeTeam.name : undefined}
        >
          <div className={`flex items-center ${isExpanded ? 'gap-3' : 'justify-center'}`}>
            <div className="w-8 h-8 shrink-0 rounded bg-muted flex items-center justify-center border border-border">
              <Building className="w-4 h-4 text-foreground" />
            </div>
            {isExpanded && (
              <div className="flex flex-col items-start whitespace-nowrap overflow-hidden">
                <span className="text-sm font-semibold text-foreground leading-none truncate w-28 text-left">{activeTeam.name}</span>
                <span className="text-xs text-muted-foreground mt-1 truncate w-28 text-left">{activeTeam.plan} Plan</span>
              </div>
            )}
          </div>
          {isExpanded && <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />}
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 w-full min-w-[240px] mt-2 p-1 glass-panel rounded-md z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="text-xs font-medium text-muted-foreground px-2 py-1.5 truncate">Switch Workspace</div>
            {teams.map((team) => (
              <button
                key={team.id}
                onClick={() => {
                  setActiveTeam(team);
                  setIsOpen(false);
                }}
                className="flex items-center justify-between w-full px-2 py-2 rounded hover:bg-muted transition-colors text-left"
              >
                <span className="text-sm font-medium truncate">{team.name}</span>
                {activeTeam.id === team.id && <Check className="w-4 h-4 shrink-0 text-foreground" />}
              </button>
            ))}
            <div className="h-px w-full bg-border my-1"></div>
            <button 
              onClick={() => {
                setShowCreateModal(true);
                setIsOpen(false);
              }}
              className="flex items-center gap-2 w-full px-2 py-2 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors text-left text-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="font-medium truncate">Create New Workspace...</span>
            </button>
          </div>
        )}
      </div>

      {showCreateModal && mounted && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-card border border-border shadow-lg rounded-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
              <h3 className="font-semibold text-lg text-foreground">Create New Workspace</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateTeam} className="p-5 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Workspace Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Acme Corp" 
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition-all text-foreground placeholder:text-muted-foreground"
                  autoFocus
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Select Plan</label>
                <div className="grid grid-cols-1 gap-2">
                  <label className={`relative flex cursor-pointer rounded-lg border p-3 focus:outline-none transition-colors ${newTeamPlan === 'Free' ? 'bg-primary/5 border-primary/50' : 'bg-background border-border hover:border-border/80'}`}>
                    <input type="radio" name="plan" value="Free" className="sr-only" checked={newTeamPlan === 'Free'} onChange={() => setNewTeamPlan('Free')} />
                    <span className="flex w-full items-center justify-between">
                      <span className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-md flex items-center justify-center ${newTeamPlan === 'Free' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                          <Zap className="w-4 h-4" />
                        </div>
                        <span className="flex flex-col">
                          <span className={`block text-sm font-medium ${newTeamPlan === 'Free' ? 'text-foreground' : 'text-muted-foreground'}`}>Free Tier</span>
                          <span className="block text-xs text-muted-foreground">Basic features for personal use</span>
                        </span>
                      </span>
                      {newTeamPlan === 'Free' && <Check className="w-4 h-4 text-primary" />}
                    </span>
                  </label>
                  
                  <label className={`relative flex cursor-pointer rounded-lg border p-3 focus:outline-none transition-colors ${newTeamPlan === 'Pro' ? 'bg-primary/5 border-primary/50' : 'bg-background border-border hover:border-border/80'}`}>
                    <input type="radio" name="plan" value="Pro" className="sr-only" checked={newTeamPlan === 'Pro'} onChange={() => setNewTeamPlan('Pro')} />
                    <span className="flex w-full items-center justify-between">
                      <span className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-md flex items-center justify-center ${newTeamPlan === 'Pro' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                          <Server className="w-4 h-4" />
                        </div>
                        <span className="flex flex-col">
                          <span className={`block text-sm font-medium ${newTeamPlan === 'Pro' ? 'text-foreground' : 'text-muted-foreground'}`}>Pro Plan</span>
                          <span className="block text-xs text-muted-foreground">Advanced features for teams</span>
                        </span>
                      </span>
                      {newTeamPlan === 'Pro' && <Check className="w-4 h-4 text-primary" />}
                    </span>
                  </label>

                  <label className={`relative flex cursor-pointer rounded-lg border p-3 focus:outline-none transition-colors ${newTeamPlan === 'Enterprise' ? 'bg-primary/5 border-primary/50' : 'bg-background border-border hover:border-border/80'}`}>
                    <input type="radio" name="plan" value="Enterprise" className="sr-only" checked={newTeamPlan === 'Enterprise'} onChange={() => setNewTeamPlan('Enterprise')} />
                    <span className="flex w-full items-center justify-between">
                      <span className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-md flex items-center justify-center ${newTeamPlan === 'Enterprise' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                          <Shield className="w-4 h-4" />
                        </div>
                        <span className="flex flex-col">
                          <span className={`block text-sm font-medium ${newTeamPlan === 'Enterprise' ? 'text-foreground' : 'text-muted-foreground'}`}>Enterprise</span>
                          <span className="block text-xs text-muted-foreground">Maximum security and support</span>
                        </span>
                      </span>
                      {newTeamPlan === 'Enterprise' && <Check className="w-4 h-4 text-primary" />}
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border mt-2">
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isCreating || !newTeamName.trim()}
                  className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {isCreating ? (
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                  ) : null}
                  {isCreating ? "Creating..." : "Create Workspace"}
                </button>
              </div>
            </form>
          </div>
        </div>, document.body
      )}
    </>
  );
}
