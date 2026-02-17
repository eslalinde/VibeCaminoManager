"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useAdminUsers, type AdminUser } from "@/hooks/useAdminUsers";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Shield, Search, RefreshCw } from "lucide-react";

type AppRole = "viewer" | "contributor" | "admin";

const ROLE_LABELS: Record<AppRole, string> = {
  viewer: "Viewer",
  contributor: "Contributor",
  admin: "Admin",
};

const ROLE_BADGE_CLASSES: Record<AppRole, string> = {
  viewer: "bg-gray-100 text-gray-700 border-gray-300",
  contributor: "bg-blue-100 text-blue-700 border-blue-300",
  admin: "bg-amber-100 text-amber-700 border-amber-300",
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdminPage() {
  const router = useRouter();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [authorized, setAuthorized] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<{
    user: AdminUser;
    newRole: AppRole;
  } | null>(null);

  const { users, loading, error, updateRole, isUpdatingRole } =
    useAdminUsers(authorized);

  // Check admin authorization
  useEffect(() => {
    async function checkAdmin() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setCurrentUserId(user.id);

      const { data: role } = await supabase.rpc("get_user_role");

      if (role !== "admin") {
        router.push("/");
        return;
      }

      setAuthorized(true);
      setAuthLoading(false);
    }

    checkAdmin();
  }, [router]);

  // Client-side search filter
  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users;
    const term = searchTerm.toLowerCase();
    return users.filter(
      (u) =>
        u.email?.toLowerCase().includes(term) ||
        u.full_name?.toLowerCase().includes(term) ||
        u.username?.toLowerCase().includes(term)
    );
  }, [users, searchTerm]);

  function handleRoleChange(user: AdminUser, newRole: string) {
    if (newRole === user.role) return;
    setConfirmDialog({ user, newRole: newRole as AppRole });
  }

  function confirmRoleChange() {
    if (!confirmDialog) return;
    updateRole(
      {
        targetUserId: confirmDialog.user.id,
        newRole: confirmDialog.newRole,
      },
      {
        onSettled: () => setConfirmDialog(null),
      }
    );
  }

  if (authLoading || !authorized) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-4" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Shield className="w-7 h-7 text-amber-600" />
        <h1 className="text-2xl font-bold text-gray-800">
          Administración de Usuarios
        </h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Usuarios del sistema</CardTitle>
            <Badge className="bg-amber-50 text-amber-700 border-amber-200">
              {users.length} usuario{users.length !== 1 ? "s" : ""}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, email o usuario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          {/* Loading state */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-amber-600" />
              <span className="ml-3 text-gray-600">Cargando usuarios...</span>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">
              Error al cargar usuarios: {(error as Error).message}
            </div>
          )}

          {/* Table */}
          {!loading && !error && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Último acceso</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <div className="text-center text-gray-500 py-8">
                        {searchTerm
                          ? "No se encontraron usuarios con ese criterio."
                          : "No hay usuarios registrados."}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => {
                    const isCurrentUser = user.id === currentUserId;
                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <span className="text-sm">{user.email}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {user.full_name || "—"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {user.username || "—"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {isCurrentUser ? (
                            <Badge
                              className={`${ROLE_BADGE_CLASSES[user.role]} cursor-not-allowed`}
                              title="No puedes cambiar tu propio rol"
                            >
                              {ROLE_LABELS[user.role]}
                            </Badge>
                          ) : (
                            <Select
                              value={user.role}
                              onValueChange={(val) =>
                                handleRoleChange(user, val)
                              }
                            >
                              <SelectTrigger
                                variant="ghost"
                                className="h-7 text-xs"
                              />
                              <SelectContent>
                                <SelectItem value="viewer">Viewer</SelectItem>
                                <SelectItem value="contributor">
                                  Contributor
                                </SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-500">
                            {formatDate(user.last_sign_in_at)}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog !== null}
        onOpenChange={(open) => !open && setConfirmDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar cambio de rol</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas cambiar el rol de{" "}
              <strong>
                {confirmDialog?.user.full_name || confirmDialog?.user.email}
              </strong>{" "}
              de{" "}
              <Badge
                className={
                  ROLE_BADGE_CLASSES[confirmDialog?.user.role ?? "viewer"]
                }
              >
                {ROLE_LABELS[confirmDialog?.user.role ?? "viewer"]}
              </Badge>{" "}
              a{" "}
              <Badge
                className={
                  ROLE_BADGE_CLASSES[confirmDialog?.newRole ?? "viewer"]
                }
              >
                {ROLE_LABELS[confirmDialog?.newRole ?? "viewer"]}
              </Badge>
              ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              color="gray"
              onClick={() => setConfirmDialog(null)}
              disabled={isUpdatingRole}
            >
              Cancelar
            </Button>
            <Button
              color="amber"
              highContrast
              onClick={confirmRoleChange}
              disabled={isUpdatingRole}
            >
              {isUpdatingRole ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Actualizando...
                </>
              ) : (
                "Confirmar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
