import { useState, useEffect, useCallback } from 'react';
import { studentService, type MyPagosResponse } from './studentService';
import type { MetodoPago, EstadoPago } from '../../@types';
import {
  CreditCard,
  Loader2,
  AlertCircle,
  FileText,
  DollarSign,
  Briefcase,
  CheckCircle,
  Clock,
  CircleOff,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const METODO_PAGO_ICONS: Record<MetodoPago, typeof CreditCard> = {
  EFECTIVO: DollarSign,
  TRANSFERENCIA: Briefcase,
  TARJETA: CreditCard,
  OTRO: FileText,
};

const ESTADO_STYLING: Record<EstadoPago, { color: string; icon: typeof CheckCircle }> = {
  PAGADO: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle },
  PENDIENTE: { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
  ANULADO: { color: 'bg-red-100 text-red-700 border-red-200', icon: CircleOff },
};

const StudentPayments = () => {
  const [data, setData] = useState<MyPagosResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPagos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await studentService.getMyPagos();
      setData(res.data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cargar tus pagos';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPagos();
  }, [fetchPagos]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Pagos y Pensiones</h2>
          <p className="text-sm text-slate-500 mt-1">
            Revisa el estado de tus pagos y pensiones académicas
          </p>
        </div>
        
        {data && (
          <div className="bg-white px-5 py-3 rounded-2xl border border-slate-200 flex items-center gap-4 shadow-sm">
            <div className={cn(
               "w-12 h-12 rounded-xl flex items-center justify-center text-white",
               data.estadoPago ? "bg-gradient-to-br from-emerald-500 to-teal-600" : "bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-500/20"
            )}>
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className={cn("text-lg font-bold uppercase tracking-wide", data.estadoPago ? "text-emerald-600" : "text-red-600")}>
                {data.estadoPago ? 'AL DÍA' : 'PENDIENTE'}
              </p>
              <p className="text-xs text-slate-500 font-medium">Estado de Cuenta</p>
            </div>
          </div>
        )}
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center mt-24">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
            <p className="text-sm text-slate-500">Cargando historial de pagos...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center mt-24 px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-4">
              <AlertCircle className="w-8 h-8" />
            </div>
            <p className="text-slate-700 font-semibold mb-2">{error}</p>
            <button onClick={fetchPagos} className="text-blue-600 font-medium hover:underline text-sm">
              Reintentar
            </button>
          </div>
        ) : !data || data.pagos.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-24 text-slate-400 px-6 text-center">
            <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-6">
              <CreditCard className="w-10 h-10 opacity-30" />
            </div>
            <p className="text-lg font-medium text-slate-600">Sin historial</p>
            <p className="text-sm max-w-xs mx-auto mt-2 text-slate-500">
              Aún no tienes registros de pagos cargados en el sistema.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left py-4 px-6 font-semibold text-slate-600">Concepto</th>
                  <th className="text-center py-4 px-6 font-semibold text-slate-600">Monto</th>
                  <th className="text-center py-4 px-6 font-semibold text-slate-600">Fecha de Pago</th>
                  <th className="text-center py-4 px-6 font-semibold text-slate-600">Método</th>
                  <th className="text-center py-4 px-6 font-semibold text-slate-600">Estado</th>
                  <th className="text-center py-4 px-6 font-semibold text-slate-600">Comprobante</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.pagos.map((pago) => {
                   const estado = ESTADO_STYLING[pago.estado];
                   const EstadoIcon = estado.icon;
                   const MethodIcon = METODO_PAGO_ICONS[pago.metodoPago];
                   return (
                  <tr key={pago.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="py-4 px-6">
                       <span className="font-bold text-slate-800">{pago.concepto}</span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="text-slate-900 font-bold font-mono">
                        S/ {Number(pago.monto).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center text-slate-600 font-medium italic">
                      {new Date(pago.fechaPago + 'T00:00:00').toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex flex-col items-center">
                        <MethodIcon className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                        <span className="text-[10px] uppercase font-bold text-slate-400 mt-1">{pago.metodoPago}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={cn(
                        'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border transition-all',
                        estado.color
                      )}>
                        <EstadoIcon className="w-4 h-4" />
                        {pago.estado}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      {pago.comprobante ? (
                        <button className="text-blue-600 hover:text-blue-700 font-medium text-xs underline underline-offset-2">
                           Ver recíbo
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs italic">No disponible</span>
                      )}
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-3xl p-6 relative overflow-hidden group">
           <div className="absolute -top-6 -right-6 w-24 h-24 bg-blue-100/50 rounded-full group-hover:scale-110 transition-transform" />
           <DollarSign className="w-10 h-10 text-blue-400 mb-4" />
           <h3 className="text-blue-800 font-bold mb-2">Pensiones 2026</h3>
           <p className="text-sm text-blue-600 leading-relaxed">
             Recuerda pagar tus pensiones antes del día 05 de cada mes para evitar recargos.
           </p>
        </div>
        
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-3xl p-6 relative overflow-hidden group">
           <div className="absolute -top-6 -right-6 w-24 h-24 bg-emerald-100/50 rounded-full group-hover:scale-110 transition-transform" />
           <CreditCard className="w-10 h-10 text-emerald-400 mb-4" />
           <h3 className="text-emerald-800 font-bold mb-2">Métodos de Pago</h3>
           <p className="text-sm text-emerald-600 leading-relaxed">
             Aceptamos transferencias BCP, BBVA e Interbank. También pagos con tarjeta en ventanilla.
           </p>
        </div>
        
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-3xl p-6 relative overflow-hidden group md:col-span-2 lg:col-span-1">
           <div className="absolute -top-6 -right-6 w-24 h-24 bg-amber-100/50 rounded-full group-hover:scale-110 transition-transform" />
           <FileText className="w-10 h-10 text-amber-400 mb-4" />
           <h3 className="text-amber-800 font-bold mb-2">Facturación Electrónica</h3>
           <p className="text-sm text-amber-600 leading-relaxed">
             Todas tus facturas se encuentran disponibles para descarga 24 horas después del pago.
           </p>
        </div>
      </div>
    </div>
  );
};

export default StudentPayments;
