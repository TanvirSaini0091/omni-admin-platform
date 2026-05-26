import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Team {
  id: string;
  name: string;
  plan: string;
  members: any[];
}

interface TenantContextType {
  activeTeam: Team | null;
  setActiveTeam: (team: Team) => void;
  teams: Team[];
  setTeams: (teams: Team[]) => void;
  refreshTeams: () => Promise<void>;
  updateTeam: (updatedTeam: Team) => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
  const [activeTeam, setActiveTeam] = useState<Team | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);

  const refreshTeams = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;
    try {
      const userRes = await fetch(`http://localhost:5000/users/${userId}`);
      const user = await userRes.json();
      
      if (user.email) {
        localStorage.setItem("userEmail", user.email);
      }
      
      if (user.teams && user.teams.length > 0) {
        const teamsPromises = user.teams.map((tid: string) => 
          fetch(`http://localhost:5000/teams/${tid}`).then(res => res.json())
        );
        const teamsData = await Promise.all(teamsPromises);
        setTeams(teamsData);
        
        if (teamsData.length > 0) {
          setActiveTeam(prev => {
            if (prev) {
              const updatedPrev = teamsData.find(t => t.id === prev.id);
              return updatedPrev || teamsData[0];
            }
            return teamsData[0];
          });
        }
      } else {
        setTeams([]);
        setActiveTeam(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateTeam = (updatedTeam: Team) => {
    setTeams(prev => prev.map(t => t.id === updatedTeam.id ? updatedTeam : t));
    if (activeTeam && activeTeam.id === updatedTeam.id) {
      setActiveTeam(updatedTeam);
    }
  };

  useEffect(() => {
    refreshTeams();
  }, []);

  return (
    <TenantContext.Provider value={{ activeTeam, setActiveTeam, teams, setTeams, refreshTeams, updateTeam }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}
