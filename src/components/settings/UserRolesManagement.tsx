import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Shield, UserCog, UserPlus } from "lucide-react";

type UserRole = "admin" | "hr_manager" | "employee";

interface UserWithRole {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  role_id: string;
}

export function UserRolesManagement() {
  const { companyId, hasRole } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<UserRole>("employee");

  const isAdmin = hasRole("admin");

  const { data: users, isLoading } = useQuery({
    queryKey: ["company-users", companyId],
    queryFn: async () => {
      if (!companyId) throw new Error("No company");

      // Get all profiles in the company
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .eq("company_id", companyId);

      if (profilesError) throw profilesError;

      // Get roles for these users
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("id, user_id, role")
        .eq("company_id", companyId);

      if (rolesError) throw rolesError;

      // Combine profiles with roles
      const usersWithRoles: UserWithRole[] = profiles.map((profile) => {
        const userRole = roles.find((r) => r.user_id === profile.id);
        return {
          id: profile.id,
          full_name: profile.full_name,
          email: profile.email,
          role: (userRole?.role as UserRole) || "employee",
          role_id: userRole?.id || "",
        };
      });

      return usersWithRoles;
    },
    enabled: !!companyId,
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({
      userId,
      roleId,
      newRole,
    }: {
      userId: string;
      roleId: string;
      newRole: UserRole;
    }) => {
      if (!companyId) throw new Error("No company");

      if (roleId) {
        // Update existing role
        const { error } = await supabase
          .from("user_roles")
          .update({ role: newRole })
          .eq("id", roleId);

        if (error) throw error;
      } else {
        // Create new role
        const { error } = await supabase.from("user_roles").insert({
          user_id: userId,
          company_id: companyId,
          role: newRole,
        });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-users", companyId] });
      toast({
        title: "Successo",
        description: "Ruolo aggiornato correttamente",
      });
      setUpdatingUserId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: error.message || "Impossibile aggiornare il ruolo",
        variant: "destructive",
      });
      setUpdatingUserId(null);
    },
  });

  const addUserMutation = useMutation({
    mutationFn: async ({
      email,
      role,
    }: {
      email: string;
      role: UserRole;
    }) => {
      if (!companyId) throw new Error("No company");

      // Find user by email
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, company_id")
        .eq("email", email)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profile) {
        throw new Error("Utente non trovato. L'utente deve prima registrarsi alla piattaforma.");
      }

      if (profile.company_id && profile.company_id !== companyId) {
        throw new Error("Questo utente appartiene già ad un'altra azienda.");
      }

      // Update profile with company_id if not set
      if (!profile.company_id) {
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ company_id: companyId })
          .eq("id", profile.id);

        if (updateError) throw updateError;
      }

      // Check if user already has a role in this company
      const { data: existingRole } = await supabase
        .from("user_roles")
        .select("id")
        .eq("user_id", profile.id)
        .eq("company_id", companyId)
        .maybeSingle();

      if (existingRole) {
        throw new Error("Questo utente è già presente nell'azienda.");
      }

      // Add role
      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: profile.id,
        company_id: companyId,
        role: role,
      });

      if (roleError) throw roleError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-users", companyId] });
      toast({
        title: "Successo",
        description: "Utente aggiunto correttamente",
      });
      setIsInviteDialogOpen(false);
      setInviteEmail("");
      setInviteRole("employee");
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: error.message || "Impossibile aggiungere l'utente",
        variant: "destructive",
      });
    },
  });

  const handleRoleChange = (
    userId: string,
    roleId: string,
    newRole: UserRole
  ) => {
    setUpdatingUserId(userId);
    updateRoleMutation.mutate({ userId, roleId, newRole });
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) {
      toast({
        title: "Errore",
        description: "Inserisci un'email valida",
        variant: "destructive",
      });
      return;
    }
    addUserMutation.mutate({ email: inviteEmail.trim(), role: inviteRole });
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case "admin":
        return (
          <Badge variant="default" className="gap-1">
            <Shield className="h-3 w-3" />
            Amministratore
          </Badge>
        );
      case "hr_manager":
        return (
          <Badge variant="secondary" className="gap-1">
            <UserCog className="h-3 w-3" />
            HR Manager
          </Badge>
        );
      case "employee":
        return <Badge variant="outline">Dipendente</Badge>;
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "Amministratore";
      case "hr_manager":
        return "HR Manager";
      case "employee":
        return "Dipendente";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!users?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nessun utente trovato
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isAdmin && (
        <div className="flex justify-end">
          <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="hero">
                <UserPlus className="mr-2 h-4 w-4" />
                Aggiungi Utente
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Aggiungi Utente all'Azienda</DialogTitle>
                <DialogDescription>
                  Inserisci l'email di un utente già registrato per aggiungerlo alla tua azienda
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddUser}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Utente</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="utente@esempio.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Ruolo</Label>
                    <Select
                      value={inviteRole}
                      onValueChange={(value) => setInviteRole(value as UserRole)}
                    >
                      <SelectTrigger id="role">
                        <SelectValue placeholder="Seleziona ruolo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Amministratore</SelectItem>
                        <SelectItem value="hr_manager">HR Manager</SelectItem>
                        <SelectItem value="employee">Dipendente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsInviteDialogOpen(false)}
                  >
                    Annulla
                  </Button>
                  <Button
                    type="submit"
                    disabled={addUserMutation.isPending}
                  >
                    {addUserMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Aggiungi
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Ruolo</TableHead>
              {isAdmin && <TableHead className="w-[200px]">Azioni</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.full_name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{getRoleBadge(user.role)}</TableCell>
                {isAdmin && (
                  <TableCell>
                    <Select
                      value={user.role}
                      onValueChange={(value) =>
                        handleRoleChange(user.id, user.role_id, value as UserRole)
                      }
                      disabled={updatingUserId === user.id}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Seleziona ruolo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">
                          {getRoleLabel("admin")}
                        </SelectItem>
                        <SelectItem value="hr_manager">
                          {getRoleLabel("hr_manager")}
                        </SelectItem>
                        <SelectItem value="employee">
                          {getRoleLabel("employee")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {!isAdmin && (
        <p className="text-sm text-muted-foreground">
          Solo gli amministratori possono modificare i ruoli degli utenti
        </p>
      )}
    </div>
  );
}
