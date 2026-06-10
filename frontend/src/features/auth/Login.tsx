import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from './useAuthStore';
import api from '../../api/axios';
import axios from 'axios';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;

const Login = () => {
  const [errorMsg, setErrorMsg] = useState('');
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setErrorMsg('');
      const res = await api.post('/auth/login', data);
      
      if (res.data.success) {
        setAuth(res.data.data.user, res.data.data.token);
        navigate(`/dashboard/${res.data.data.user.role.toLowerCase()}`);
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setErrorMsg(
          err.response?.data?.message || 'Error al conectar con el servidor.'
        );
      } else {
        setErrorMsg('Error inesperado de red.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800">Iniciar Sesión</h2>
        <p className="text-sm text-slate-500 mt-1">Ingresa a tu cuenta institucional</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Correo Electrónico"
          placeholder="ejemplo@colegio.edu"
          type="email"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Contraseña"
          placeholder="••••••••"
          type="password"
          error={errors.password?.message}
          {...register('password')}
        />

        {errorMsg && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm border border-red-200">
            {errorMsg}
          </div>
        )}

        <Button type="submit" isLoading={isSubmitting} className="w-full">
          Acceder
        </Button>
      </form>

      <div className="text-center mt-4">
        <p className="text-sm text-slate-600">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="font-medium text-primary hover:text-primary-dark hover:underline transition-colors">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
