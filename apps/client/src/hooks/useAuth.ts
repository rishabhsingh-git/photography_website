import { useAuthContext } from "../state/AuthProvider";

export const useAuth = () => {
  return useAuthContext();
};


