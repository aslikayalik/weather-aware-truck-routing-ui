import { useState } from 'react';
import { LoginRequest, useLoginMutation } from '@app/services/authApi';
import { login } from '@app/store/slices/authSlice';
import { useDispatch } from '@app/store/store';

const extractErrorMessage = (err: any): string => {
  const d = err?.data;
  if (d?.email?.length) return d.email[0];
  if (d?.password?.length) return d.password[0];
  if (d?.non_field_errors?.length) return d.non_field_errors[0];
  return d?.detail || d?.message || d?.error || 'Sign-in failed.';
};

export const useLogin = () => {
  const [loginMutation, { isLoading, isError, isSuccess, data: loginData }] = useLoginMutation();
  const dispatch = useDispatch();
  const [error, setError] = useState<string>('');

  const onSubmit = async (email: string, password: string, remember = false) => {
    setError('');
    const loginRequest: LoginRequest = { email: email.trim(), password, remember };

    try {
      const data = await loginMutation(loginRequest).unwrap();
      dispatch(login(data));

      // With "remember me" the refresh token goes to localStorage, otherwise to sessionStorage
      if (data.remember) {
        localStorage.setItem('refresh_token', data.refresh);
        localStorage.setItem('remember_me', 'true');
      } else {
        sessionStorage.setItem('refresh_token', data.refresh);
        localStorage.removeItem('remember_me');
      }
    } catch (err: any) {
      setError(extractErrorMessage(err));
    }
  };

  return { onSubmit, isLoading, isError, isSuccess, loginData, error };
};

export default useLogin;
