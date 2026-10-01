import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { authService } from '../services/authService';
import { setCredentials, logout as clearCredentials } from '../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // Initial session check
  const { isLoading: isCheckingSession } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const data = await authService.getProfile();
      dispatch(setCredentials(data));
      return data;
    },
    retry: false,
    staleTime: Infinity,
  });

  const loginMutation = useMutation({
    mutationFn: ({ email, password }) => authService.login(email, password),
    onSuccess: async () => {
      const userData = await authService.getProfile();
      dispatch(setCredentials(userData));
      navigate('/');
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data) => authService.register(data),
    onSuccess: async () => {
      const userData = await authService.getProfile();
      dispatch(setCredentials(userData));
      navigate('/');
    }
  });

  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      dispatch(clearCredentials());
      queryClient.clear();
      navigate('/login');
    }
  });

  return {
    user,
    isAuthenticated,
    isCheckingSession,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,

    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
};
