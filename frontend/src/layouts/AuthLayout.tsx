import { Outlet } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center items-center text-primary-dark space-x-2">
          <BookOpen className="w-10 h-10" />
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">EduManage Pro</h2>
        </div>
        <h2 className="mt-4 text-center text-lg text-slate-600">
          Sistema de Gestión Escolar Centralizado
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
