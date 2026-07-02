import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth-store';
import type { LoginPayload, RegisterPayload } from '@/types';
import { toast } from 'react-hot-toast';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { 
    user, 
    accessToken, 
    isAuthenticated, 
    isLoading, 
    setUser, 
    setToken, 
    clearAuth, 
    setLoading 
  } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: (data) => {
      setUser(data.user);
      setToken(data.accessToken);
      queryClient.setQueryData(['auth', 'me'], data.user);
      toast.success('Welcome back!');
      router.push('/dashboard');
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || 'Failed to login. Please check your credentials.');
    },
  });

  const registerMutation = useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
    onSuccess: (data) => {
      setUser(data.user);
      setToken(data.accessToken);
      queryClient.setQueryData(['auth', 'me'], data.user);
      toast.success('Account created successfully!');
      router.push('/dashboard');
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || 'Failed to register. Please try again.');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      clearAuth();
      queryClient.clear();
      toast.success('Logged out successfully!');
      router.push('/login');
    },
  });

  const getMeQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      setLoading(true);
      try {
        const me = await authService.getMe();
        setUser(me);
        return me;
      } catch (error) {
        clearAuth();
        return null;
      } finally {
        setLoading(false);
      }
    },
    enabled: !!accessToken && !user,
    retry: 1,
    staleTime: 1000 * 60 * 5, 
  });

  return {
    user,
    isAuthenticated,
    isLoading: isLoading || getMeQuery.isLoading,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    isLoginPending: loginMutation.isPending,
    isRegisterPending: registerMutation.isPending,
  };
};
