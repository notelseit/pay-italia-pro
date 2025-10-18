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
import { Loader2, Shield, UserCog } from "lucide-react";

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

  const handleRoleChange = (
    userId: string,
    roleId: string,
    newRole: UserRole
  ) => {
    setUpdatingUserId(userId);
    updateRoleMutation.mutate({ userId, roleId, newRole });
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
