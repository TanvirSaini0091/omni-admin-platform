import { useTenant } from "./TenantContext";

export function usePermissions() {
  const { activeTeam } = useTenant();
  
  const userId = localStorage.getItem("userId");
  
  if (!activeTeam || !userId) {
    return {
      role: null,
      isOwner: false,
      canEditSettings: false,
      canImportData: false,
      canInviteUsers: false
    };
  }

  const member = activeTeam.members?.find((m: any) => m.userId === userId || m.userId === localStorage.getItem("userEmail"));
  const role = member ? member.role : null;
  const isOwner = role === "Owner";
  
  const hasPermission = (perm: string) => {
    if (isOwner) return true;
    if (member?.permissions?.includes(perm)) return true;
    if (role === "Admin" && perm === "canImportData") return true;
    return false;
  };

  return {
    role,
    isOwner,
    canEditSettings: isOwner || hasPermission('canEditSettings'),
    canImportData: isOwner || role === "Admin" || hasPermission('canImportData'),
    canInviteUsers: isOwner || hasPermission('canInviteUsers')
  };
}
