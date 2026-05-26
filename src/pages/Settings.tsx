import { useState, useEffect } from "react";
import { Users, Building, ShieldCheck, Lock, Trash2 } from "lucide-react";
import { useTenant } from "../lib/TenantContext";
import { usePermissions } from "../lib/usePermissions";

export default function Settings() {
  const { activeTeam, updateTeam } = useTenant();
  const { canEditSettings, canInviteUsers } = usePermissions();
  const [teamName, setTeamName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [usersInfo, setUsersInfo] = useState<Record<string, any>>({});

  useEffect(() => {
    if (activeTeam) {
      setTeamName(activeTeam.name);
    }
  }, [activeTeam]);

  useEffect(() => {
    fetch('http://localhost:5000/users')
      .then(res => res.json())
      .then(data => {
        const map: any = {};
        data.forEach((u: any) => map[u.id] = u);
        setUsersInfo(map);
      })
      .catch(console.error);
  }, []);

  const handleSaveTeamName = async () => {
    if (!activeTeam || !teamName.trim() || teamName === activeTeam.name || !canEditSettings) return;
    setIsSaving(true);
    try {
      const res = await fetch(`http://localhost:5000/teams/${activeTeam.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: teamName })
      });
      if (res.ok) {
        updateTeam({ ...activeTeam, name: teamName });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInvite = async () => {
    if (!activeTeam || !inviteEmail.trim() || !canInviteUsers) return;
    setIsInviting(true);
    
    try {
      const newMember = { userId: inviteEmail, role: "Member" };
      const updatedMembers = [...(activeTeam.members || []), newMember];
      
      const res = await fetch(`http://localhost:5000/teams/${activeTeam.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ members: updatedMembers })
      });
      if (res.ok) {
        updateTeam({ ...activeTeam, members: updatedMembers });
        setInviteEmail("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsInviting(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    if (!activeTeam || !canEditSettings) return;
    const newMembers = activeTeam.members.map((m: any) => 
      m.userId === userId ? { ...m, role: newRole } : m
    );
    try {
      const res = await fetch(`http://localhost:5000/teams/${activeTeam.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ members: newMembers })
      });
      if (res.ok) updateTeam({ ...activeTeam, members: newMembers });
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePermission = async (userId: string, permission: string) => {
    if (!activeTeam || !canEditSettings) return;
    const newMembers = activeTeam.members.map((m: any) => {
      if (m.userId === userId) {
        const currentPerms = m.permissions || [];
        const newPerms = currentPerms.includes(permission) 
          ? currentPerms.filter((p: string) => p !== permission)
          : [...currentPerms, permission];
        return { ...m, permissions: newPerms };
      }
      return m;
    });
    try {
      const res = await fetch(`http://localhost:5000/teams/${activeTeam.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ members: newMembers })
      });
      if (res.ok) updateTeam({ ...activeTeam, members: newMembers });
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!activeTeam || !canEditSettings) return;
    if (!confirm("Are you sure you want to remove this member?")) return;
    const newMembers = activeTeam.members.filter((m: any) => m.userId !== userId);
    try {
      const res = await fetch(`http://localhost:5000/teams/${activeTeam.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ members: newMembers })
      });
      if (res.ok) updateTeam({ ...activeTeam, members: newMembers });
    } catch (err) {
      console.error(err);
    }
  };

  if (!activeTeam) return <div className="p-8 animate-pulse flex space-x-4"><div className="h-4 bg-muted rounded w-3/4"></div></div>;

  if (!canEditSettings && !canInviteUsers) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-2">
          <Lock className="w-8 h-8 text-muted-foreground opacity-70" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Access Restricted</h2>
        <p className="text-muted-foreground max-w-md text-center text-sm">
          You do not have permission to view or modify workspace settings. Please contact your workspace owner or administrator to request access.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Workspace Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your workspace configuration and team members.</p>
      </div>

      <div className="space-y-6">
        <div className="glass-panel rounded-xl overflow-hidden">
          <div className="p-6 border-b border-border bg-card">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg border border-border">
                <Building className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">General</h2>
                <p className="text-sm text-muted-foreground">Update your workspace name and core settings.</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div className="space-y-2 max-w-md">
              <label className="text-sm font-medium">Workspace Name</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 bg-card border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm disabled:opacity-50" 
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                disabled={!canEditSettings}
              />
            </div>
            <button 
              onClick={handleSaveTeamName}
              disabled={!canEditSettings || isSaving || teamName === activeTeam.name}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-4 py-2 rounded-md transition-colors shadow-sm text-sm disabled:opacity-50 flex items-center gap-2"
            >
              {!canEditSettings && <Lock className="w-4 h-4" />}
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        <div className="glass-panel rounded-xl overflow-hidden">
          <div className="p-6 border-b border-border bg-card">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg border border-border">
                <Users className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Team Access</h2>
                <p className="text-sm text-muted-foreground">Manage who has access to this workspace.</p>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase tracking-wider text-muted-foreground bg-muted border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-semibold">User</th>
                  <th className="px-6 py-4 font-semibold">Role</th>
                  <th className="px-6 py-4 font-semibold">Specific Permissions</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {activeTeam.members?.map((member: any) => {
                  const userInfo = usersInfo[member.userId];
                  return (
                    <tr key={member.userId} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold uppercase text-xs">
                            {userInfo?.email ? userInfo.email.charAt(0) : member.userId.charAt(0)}
                          </div>
                          <span className="font-medium text-foreground">{userInfo?.email || member.userId}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select 
                          value={member.role}
                          onChange={(e) => handleUpdateRole(member.userId, e.target.value)}
                          disabled={!canEditSettings}
                          className="bg-background border border-border rounded-md px-2 py-1 text-sm focus:ring-1 focus:ring-primary focus:outline-none disabled:opacity-50"
                        >
                          <option value="Owner">Owner</option>
                          <option value="Admin">Admin</option>
                          <option value="Member">Member</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="flex items-center gap-2 text-xs text-muted-foreground">
                            <input 
                              type="checkbox" 
                              className="rounded border-border bg-background focus:ring-primary w-3.5 h-3.5 accent-primary disabled:opacity-50 cursor-pointer"
                              disabled={!canEditSettings || member.role === 'Owner'} 
                              checked={member.role === 'Owner' || (member.permissions || []).includes('canEditSettings')} 
                              onChange={() => handleTogglePermission(member.userId, 'canEditSettings')} 
                            />
                            Edit Settings
                          </label>
                          <label className="flex items-center gap-2 text-xs text-muted-foreground">
                            <input 
                              type="checkbox" 
                              className="rounded border-border bg-background focus:ring-primary w-3.5 h-3.5 accent-primary disabled:opacity-50 cursor-pointer"
                              disabled={!canEditSettings || member.role === 'Owner'} 
                              checked={member.role === 'Owner' || member.role === 'Admin' || (member.permissions || []).includes('canImportData')} 
                              onChange={() => handleTogglePermission(member.userId, 'canImportData')} 
                            />
                            Import Data
                          </label>
                          <label className="flex items-center gap-2 text-xs text-muted-foreground">
                            <input 
                              type="checkbox" 
                              className="rounded border-border bg-background focus:ring-primary w-3.5 h-3.5 accent-primary disabled:opacity-50 cursor-pointer"
                              disabled={!canEditSettings || member.role === 'Owner'} 
                              checked={member.role === 'Owner' || (member.permissions || []).includes('canInviteUsers')} 
                              onChange={() => handleTogglePermission(member.userId, 'canInviteUsers')} 
                            />
                            Invite Users
                          </label>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleRemoveMember(member.userId)}
                          disabled={!canEditSettings}
                          className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-6 bg-muted/30 border-t border-border space-y-4">
            <label className="text-sm font-medium">Invite New Member</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                type="text" 
                placeholder="Email address"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                disabled={!canInviteUsers}
                className="px-3 py-2 bg-card border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent text-sm flex-1 sm:w-64 disabled:opacity-50"
              />
              <button 
                onClick={handleInvite}
                disabled={!canInviteUsers || isInviting || !inviteEmail.trim()}
                className="bg-secondary text-secondary-foreground hover:bg-muted font-medium px-4 py-2 rounded-md transition-colors text-sm shadow-sm border border-border disabled:opacity-50 flex items-center gap-2 justify-center"
              >
                {!canInviteUsers && <Lock className="w-4 h-4" />}
                {isInviting ? "Sending..." : "Send Invite"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
