import { useState, useEffect } from 'react';
import { studentService } from './studentService';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  BookOpen, 
  User, 
  Loader2,
  ChevronLeft,
  ChevronRight,
  Info
} from 'lucide-react';
import { cn } from '../../lib/utils';

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
const HOURS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00'
];

const StudentSchedule = () => {
  const [cursos, setCursos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCursos = async () => {
      try {
        const res = await studentService.getMyCursos();
        setCursos(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCursos();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Cargando tu horario escolar...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 blur-[100px] rounded-full" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-md">
            <CalendarIcon className="w-3.5 h-3.5" />
            Agenda Académica
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
            Mi <span className="text-blue-400">Horario</span> Escolar
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">
            Organiza tu semana y asegúrate de no perder ninguna clase. Aquí puedes ver la distribución de tus cursos asignados.
          </p>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
        {/* Days Header */}
        <div className="grid grid-cols-6 border-b border-slate-100 bg-slate-50/50">
          <div className="p-6 border-r border-slate-100 flex items-center justify-center">
            <Clock className="w-5 h-5 text-slate-400" />
          </div>
          {DAYS.map((day) => (
            <div key={day} className="p-6 text-center border-r border-slate-100 last:border-r-0">
              <span className="text-xs font-black uppercase tracking-widest text-slate-500">{day}</span>
            </div>
          ))}
        </div>

        {/* Schedule Body */}
        <div className="relative">
          {HOURS.map((hour, idx) => (
            <div key={hour} className="grid grid-cols-6 border-b border-slate-100 last:border-b-0 min-h-[120px]">
              {/* Hour Label */}
              <div className="p-4 border-r border-slate-100 flex items-start justify-center pt-6 bg-slate-50/20">
                <span className="text-xs font-black text-slate-400">{hour}</span>
              </div>

              {/* Day Cells */}
              {DAYS.map((day) => {
                // Simplified matching logic for the demo
                // In a real app, we'd parse the 'horario' string properly
                const cursoInSlot = cursos.find(c => {
                  const h = (c.horario || '').toLowerCase();
                  return h.includes(day.toLowerCase()) && h.includes(hour);
                });

                return (
                  <div key={`${day}-${hour}`} className="p-3 border-r border-slate-100 last:border-r-0 relative group">
                    {cursoInSlot && (
                      <div className={cn(
                        "h-full w-full rounded-2xl p-4 flex flex-col justify-between transition-all hover:scale-[1.02] shadow-sm",
                        idx % 2 === 0 ? "bg-blue-50 text-blue-900 border border-blue-100" : "bg-indigo-50 text-indigo-900 border border-indigo-100"
                      )}>
                        <div>
                          <p className="text-[10px] font-black uppercase opacity-60 mb-1">Clase</p>
                          <h4 className="font-black text-sm leading-tight mb-2">{cursoInSlot.nombre}</h4>
                        </div>
                        <div className="flex items-center gap-2 pt-2 border-t border-current/10">
                          <User className="w-3 h-3 opacity-60" />
                          <span className="text-[10px] font-bold truncate">
                            {cursoInSlot.teacher?.nombre} {cursoInSlot.teacher?.apellido}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-100 rounded-[2rem] p-8 flex flex-col md:flex-row items-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-600/20">
          <Info className="w-8 h-8" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-blue-900 font-black text-xl mb-1">¿Dudas con tu horario?</h3>
          <p className="text-blue-700/80 font-medium leading-relaxed">
            Si notas que falta alguna materia o el horario es incorrecto, por favor contacta con el administrador académico o con tu director de sección.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentSchedule;
