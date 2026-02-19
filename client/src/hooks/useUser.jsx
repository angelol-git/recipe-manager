import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchCurrentUser, logoutUser } from "../api/user.js";

export function useUser() {
  const queryClient = useQueryClient();

  const userQuery = useQuery({
    queryKey: ["user"],
    queryFn: fetchCurrentUser,
    retry: false,
    staleTime: 1000 * 60 * 10,
  });

  const logoutMutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      // Clear user data and local recipes if needed (or keep them)
      queryClient.setQueryData(["user"], null);
      queryClient.invalidateQueries(["recipes"]);
    },
  });

  return {
    user: userQuery.data ?? null,
    isLoading: userQuery.isLoading,
    isError: userQuery.isError,
    logout: logoutMutation,
  };
}
