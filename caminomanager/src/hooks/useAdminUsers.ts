import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { queryKeys } from "@/lib/queryKeys";

export interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  role: "viewer" | "contributor" | "admin";
  created_at: string;
  last_sign_in_at: string | null;
}

async function fetchAdminUsers(): Promise<AdminUser[]> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_admin_users_list");

  if (error) throw error;
  return (data as AdminUser[]) ?? [];
}

export function useAdminUsers(enabled = true) {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.admin.users(),
    queryFn: fetchAdminUsers,
    enabled,
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({
      targetUserId,
      newRole,
    }: {
      targetUserId: string;
      newRole: "viewer" | "contributor" | "admin";
    }) => {
      const supabase = createClient();
      const { error } = await supabase.rpc("set_user_role", {
        target_user_id: targetUserId,
        new_role: newRole,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users() });
    },
  });

  return {
    users: data ?? [],
    loading: isLoading,
    error,
    updateRole: updateRoleMutation.mutate,
    isUpdatingRole: updateRoleMutation.isPending,
  };
}
