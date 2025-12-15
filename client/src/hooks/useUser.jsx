import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchCurrentUser, logoutUser } from "../api/user.js";

export function useUser() {
  const queryClient = useQueryClient();

  const userQuery = useQuery({
    queryKey: ["user"],
    queryFn: fetchCurrentUser,
  });

  const logoutMutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.invalidateQueries(["user"]);
    },
  });

  return {
    ...userQuery,
    logout: logoutMutation,
  };
}
