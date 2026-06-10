import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import api from '../../api/axios';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  nombre: z.string().min(2, 'Obligatorio'),
  apellido: z.string().min(2, 'Obligatorio'),
});

type RegisterForm = z.infer<typeof registerSchema>;

const Register = () => {
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      setErrorMsg('');
      setSuccessMsg('');
      const res = await api.post('/auth/register', { ...data, role: 'STUDENT' });
      
      if (res.data.success) {
        setSuccessMsg('Usuario registrado exitosamente. Será redirigido al login.');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
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
        <h2 className="text-2xl font-bold text-slate-800">Crear Cuenta</h2>
        <p className="text-sm text-slate-500 mt-1">Regístrate como alumno</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Nombre"
            error={errors.nombre?.message}
            {...register('nombre')}
          />
          <Input
            label="Apellido"
            error={errors.apellido?.message}
            {...register('apellido')}
          />
        </div>

        <Input
          label="Correo Electrónico"
          type="email"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Contraseña"
          type="password"
          error={errors.password?.message}
          {...register('password')}
        />

        {errorMsg && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm border border-red-200">
            {errorMsg}
          </div>
        )}
        
        {successMsg && (
          <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm border border-green-200">
            {successMsg}
          </div>
        )}

        <Button
          type="submit"
          disabled={!!successMsg}
          isLoading={isSubmitting}
          className="w-full"
        >
          Registrarse
        </Button>
      </form>

      <div className="text-center mt-4">
        <p className="text-sm text-slate-600">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-medium text-primary hover:text-primary-dark hover:underline transition-colors">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
