import { getMaintenanceLogs } from '@/app/actions/maintenanceActions';
import HistoryClient from './HistoryClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HistoryPage() {
  let logs = [];
  let error = null;

  try {
    const res = await getMaintenanceLogs('ALL');
    if (res.error) {
      error = res.error;
    } else {
      logs = res.logs || [];
    }
  } catch (err) {
    console.error('Error al obtener el historial de mantenimientos:', err);
    error = 'No se pudo conectar a la base de datos o recuperar los registros.';
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="rounded-2xl bg-rose-500/10 border border-rose-500/20 p-6 text-center space-y-3">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-rose-500/20 text-rose-400 mb-2">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white">Error de Conexión a la Base de Datos</h2>
          <p className="text-slate-300 text-sm max-w-md mx-auto">
            {error}
          </p>
          <p className="text-xs text-slate-400">
            Asegúrate de configurar la variable <code className="bg-slate-800 text-indigo-300 px-1.5 py-0.5 rounded">DATABASE_URL</code> en tus variables de entorno.
          </p>
        </div>
      </div>
    );
  }

  return <HistoryClient initialLogs={logs} />;
}
