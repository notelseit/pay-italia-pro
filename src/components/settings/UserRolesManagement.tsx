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
import { Loader2, Shield, UserCog, UserPlus, Trash2, Pencil } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [invitePassword, setInvitePassword] = useState("");
  const [inviteFullName, setInviteFullName] = useState("");
  const [inviteRole, setInviteRole] = useState<UserRole>("employee");
  const [userToDelete, setUserToDelete] = useState<UserWithRole | null>(null);
  const [userToEdit, setUserToEdit] = useState<UserWithRole | null>(null);
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");

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
      password,
      fullName,
      role,
    }: {
      email: string;
      password: string;
      fullName: string;
      role: UserRole;
    }) => {
      if (!companyId) throw new Error("No company");

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Non autenticato");

      const response = await supabase.functions.invoke("create-user", {
        body: {
          email,
          password,
          fullName,
          role,
          companyId,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || "Errore nella creazione dell'utente");
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-users", companyId] });
      toast({
        title: "Successo",
        description: "Utente creato correttamente",
      });
      setIsInviteDialogOpen(false);
      setInviteEmail("");
      setInvitePassword("");
      setInviteFullName("");
      setInviteRole("employee");
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: error.message || "Impossibile creare l'utente",
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      if (!companyId) throw new Error("No company");

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Non autenticato");

      const response = await supabase.functions.invoke("delete-user", {
        body: {
          userId,
          companyId,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || "Errore nell'eliminazione dell'utente");
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-users", companyId] });
      toast({
        title: "Successo",
        description: "Utente eliminato correttamente",
      });
      setUserToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: error.message || "Impossibile eliminare l'utente",
        variant: "destructive",
      });
      setUserToDelete(null);
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({
      userId,
      email,
      password,
    }: {
      userId: string;
      email?: string;
      password?: string;
    }) => {
      if (!companyId) throw new Error("No company");

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Non autenticato");

      const response = await supabase.functions.invoke("update-user", {
        body: {
          userId,
          companyId,
          email,
          password,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || "Errore nell'aggiornamento dell'utente");
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-users", companyId] });
      toast({
        title: "Successo",
        description: "Utente aggiornato correttamente",
      });
      setUserToEdit(null);
      setEditEmail("");
      setEditPassword("");
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: error.message || "Impossibile aggiornare l'utente",
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
    
    if (!inviteEmail.trim() || !invitePassword.trim() || !inviteFullName.trim()) {
      toast({
        title: "Errore",
        description: "Tutti i campi sono obbligatori",
        variant: "destructive",
      });
      return;
    }

    if (invitePassword.length < 6) {
      toast({
        title: "Errore",
        description: "La password deve essere di almeno 6 caratteri",
        variant: "destructive",
      });
      return;
    }

    addUserMutation.mutate({
      email: inviteEmail.trim(),
      password: invitePassword,
      fullName: inviteFullName.trim(),
      role: inviteRole,
    });
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
                <DialogTitle>Crea Nuovo Utente</DialogTitle>
                <DialogDescription>
                  Compila i dati per creare un nuovo utente nell'azienda
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddUser}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nome Completo</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Mario Rossi"
                      value={inviteFullName}
                      onChange={(e) => setInviteFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="mario.rossi@esempio.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Minimo 6 caratteri"
                      value={invitePassword}
                      onChange={(e) => setInvitePassword(e.target.value)}
                      required
                      minLength={6}
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
                    Crea Utente
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
              {isAdmin && <TableHead className="w-[250px]">Azioni</TableHead>}
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
                    <div className="flex items-center gap-2">
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
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setUserToEdit(user);
                          setEditEmail(user.email);
                          setEditPassword("");
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setUserToDelete(user)}
                        disabled={deleteUserMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
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

      <Dialog open={!!userToEdit} onOpenChange={(open) => !open && setUserToEdit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifica Utente</DialogTitle>
            <DialogDescription>
              Modifica email e/o password per <strong>{userToEdit?.full_name}</strong>
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!userToEdit) return;

              const updates: { userId: string; email?: string; password?: string } = {
                userId: userToEdit.id,
              };

              if (editEmail && editEmail !== userToEdit.email) {
                updates.email = editEmail;
              }

              if (editPassword.trim()) {
                if (editPassword.length < 6) {
                  toast({
                    title: "Errore",
                    description: "La password deve essere di almeno 6 caratteri",
                    variant: "destructive",
                  });
                  return;
                }
                updates.password = editPassword;
              }

              if (!updates.email && !updates.password) {
                toast({
                  title: "Errore",
                  description: "Nessuna modifica da salvare",
                  variant: "destructive",
                });
                return;
              }

              updateUserMutation.mutate(updates);
            }}
          >
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="nuova.email@esempio.com"
                />
                <p className="text-xs text-muted-foreground">
                  Lascia invariato per non modificare
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-password">Nuova Password</Label>
                <Input
                  id="edit-password"
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Lascia vuoto per non modificare"
                  minLength={6}
                />
                <p className="text-xs text-muted-foreground">
                  Minimo 6 caratteri. Lascia vuoto per non modificare.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setUserToEdit(null)}
              >
                Annulla
              </Button>
              <Button type="submit" disabled={updateUserMutation.isPending}>
                {updateUserMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Salva Modifiche
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare l'utente <strong>{userToDelete?.full_name}</strong>? 
              Questa azione è irreversibile e eliminerà tutti i dati associati all'utente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteUserMutation.isPending}>
              Annulla
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => userToDelete && deleteUserMutation.mutate(userToDelete.id)}
              disabled={deleteUserMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteUserMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
