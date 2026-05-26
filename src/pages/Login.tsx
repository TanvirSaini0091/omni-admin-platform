import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTenant } from "../lib/TenantContext";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'auth' | 'create_team'>('auth');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [teamName, setTeamName] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { refreshTeams } = useTenant();

  useEffect(() => {
    if (localStorage.getItem("userId")) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      const res = await fetch(`http://localhost:5000/users?email=${email}`);
      const users = await res.json();
      let finalUserId = email;

      if (users.length > 0) {
        const user = users[0];
        if (user.password && user.password !== password) {
          setError("Incorrect password");
          setIsLoading(false);
          return;
        } else if (!user.password) {
          // Set password for legacy users or users created before passwords were required
          await fetch(`http://localhost:5000/users/${user.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
          });
        }
        finalUserId = user.id;
      } else {
        const newUserRes = await fetch('http://localhost:5000/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: "u" + Date.now(), 
            email,
            password,
            name: email.split('@')[0],
            teams: []
          })
        });
        const newUser = await newUserRes.json();
        finalUserId = newUser.id;
      }

      const teamsRes = await fetch('http://localhost:5000/teams');
      const allTeams = await teamsRes.json();
      
      // Match invite by userId or email
      const invitedTeams = allTeams.filter((t: any) => t.members?.some((m: any) => m.userId === finalUserId || m.userId === email));

      if (invitedTeams.length > 0 || (users[0] && users[0].teams && users[0].teams.length > 0)) {
        
        if (invitedTeams.length > 0) {
          const currentTeams = users[0]?.teams || [];
          const newTeamIds = invitedTeams.map((t: any) => t.id);
          const mergedTeams = Array.from(new Set([...currentTeams, ...newTeamIds]));
          
          await fetch(`http://localhost:5000/users/${finalUserId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ teams: mergedTeams })
          });
        }
        
        localStorage.setItem("userId", finalUserId);
        await refreshTeams();
        navigate("/dashboard");
      } else {
        setUserId(finalUserId);
        setStep('create_team');
        setIsLoading(false);
      }
    } catch (error) {
      console.error(error);
      alert("Make sure json-server is running on port 5000");
      setIsLoading(false);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const newTeamRes = await fetch('http://localhost:5000/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: teamName,
          plan: "Pro",
          members: [
            { userId, role: "Owner" }
          ]
        })
      });
      const newTeam = await newTeamRes.json();
      const actualTeamId = newTeam.id;

      // Update user with the new team
      const userRes = await fetch(`http://localhost:5000/users/${userId}`);
      const user = await userRes.json();
      
      await fetch(`http://localhost:5000/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teams: [...(user.teams || []), actualTeamId]
        })
      });

      localStorage.setItem("userId", userId as string);
      await refreshTeams();
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex font-sans bg-background text-foreground transition-colors">
      
      {/* Left Panel: The Interaction Zone */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 md:px-24 lg:px-32 relative z-10 bg-background">
        
        {/* Simple Brand Header */}
        <div className="absolute top-8 left-8 sm:left-16 md:left-24 lg:left-32 flex items-center gap-2">
           <div className="w-8 h-8 bg-foreground rounded-md flex items-center justify-center shadow-sm">
            <svg className="w-4 h-4 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="font-semibold text-lg tracking-tight">Omni</span>
        </div>

        <div className="w-full max-w-sm mx-auto mt-16">
          <h1 className="text-3xl font-semibold tracking-tight mb-2">
            {step === 'create_team' 
              ? 'Create a Team' 
              : 'Welcome to Omni'}
          </h1>
          <p className="text-muted-foreground text-sm mb-8">
             {step === 'create_team' 
                ? "Let's set up a workspace for your new account."
                : 'Enter your email to sign in or create an account.'}
          </p>

          {step === 'auth' ? (
            <form onSubmit={handleAuth} className="space-y-5">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-foreground">Email address</label>
                  <input 
                    type="email" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm text-card-foreground"
                    placeholder="name@company.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-foreground">Password</label>
                  <input 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm text-card-foreground"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {error && <div className="text-sm text-destructive font-medium bg-destructive/10 px-3 py-2 rounded-md">{error}</div>}

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-foreground hover:bg-foreground/90 text-background font-medium py-2.5 rounded-md transition-colors disabled:opacity-70 flex justify-center items-center mt-2"
              >
                {isLoading ? (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : null}
                Continue
              </button>
            </form>
          ) : (
            <form onSubmit={handleCreateTeam} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">Team Name</label>
                <input 
                  type="text" 
                  required 
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full px-3 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm text-card-foreground"
                  placeholder="Acme Corp"
                />
              </div>
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-foreground hover:bg-foreground/90 text-background font-medium py-2.5 rounded-md transition-colors disabled:opacity-70 flex justify-center items-center mt-2"
              >
                {isLoading ? 'Creating...' : 'Create Workspace'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Right Panel: Refined Professional Aesthetics */}
      <div className="hidden lg:flex w-1/2 bg-[#020202] flex-col justify-between p-16 relative overflow-hidden">
        
        {/* Soft Ambient Light */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/[0.05] via-transparent to-transparent pointer-events-none"></div>
        
        <div className="relative z-10 w-full max-w-lg mx-auto flex-grow flex items-center justify-center">
          
          {/* Elegant Floating Dashboard Card */}
          <div className="w-full rounded-2xl bg-white/[0.02] border border-white/[0.05] p-8 shadow-2xl backdrop-blur-xl transition-all hover:bg-white/[0.03]">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/[0.05]">
              <div className="flex space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-white/20"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-white/20"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-white/20"></div>
              </div>
              <div className="text-xs text-white/40 tracking-wider">WORKSPACE</div>
            </div>
            
            <div className="space-y-5">
              <div className="w-full h-32 rounded-xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.05] p-4 flex flex-col justify-between">
                 <div className="w-1/3 h-2 rounded bg-white/10"></div>
                 <div className="w-full flex items-end gap-2">
                    <div className="w-1/4 h-12 rounded-t bg-white/10"></div>
                    <div className="w-1/4 h-16 rounded-t bg-white/20"></div>
                    <div className="w-1/4 h-8 rounded-t bg-white/5"></div>
                    <div className="w-1/4 h-14 rounded-t bg-white/10"></div>
                 </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1 h-20 rounded-xl bg-white/[0.02] border border-white/[0.05] p-4">
                   <div className="w-8 h-8 rounded-full bg-white/10 mb-2"></div>
                   <div className="w-1/2 h-2 rounded bg-white/10"></div>
                </div>
                <div className="flex-1 h-20 rounded-xl bg-white/[0.02] border border-white/[0.05] p-4">
                   <div className="w-8 h-8 rounded-full bg-white/10 mb-2"></div>
                   <div className="w-1/2 h-2 rounded bg-white/10"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Text */}
        <div className="relative z-10 w-full max-w-lg mx-auto">
          <h2 className="text-3xl font-light tracking-tight text-white mb-3">
            Elevate your workflow.
          </h2>
          <p className="text-white/50 leading-relaxed font-light text-sm">
            Experience a meticulously crafted platform that unifies your team's operations with uncompromising performance and elegant design.
          </p>
        </div>
      </div>
    </div>
  );
}