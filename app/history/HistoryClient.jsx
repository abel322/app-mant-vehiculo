'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  History,
  Search,
  ChevronDown,
  Calendar,
  Gauge,
  DollarSign,
  Trash2,
  Filter,
  FileText,
  Loader2,
} from 'lucide-react';
import { deleteMaintenanceLog } from '@/app/actions/maintenanceActions';

const CATEGORIES = [
  { id: 'ALL', label: 'Todos', icon: '📋' },
  { id: 'OIL_CHANGE', label: 'Aceite', icon: '🛢️' },
  { id: 'TIRES', label: 'Neumáticos', icon: '🛞' },
  { id: 'BRAKES', label: 'Frenos', icon: '🛑' },
  { id: 'FILTER', label: 'Filtros', icon: '💨' },
  { id: 'BATTERY', label: 'Batería', icon: '⚡' },
  { id: 'FLUIDS', label: 'Fluidos', icon: '🧪' },
  { id: 'GENERAL', label: 'General', icon: '🔧' },
  { id: 'OTHER', label: 'Otro', icon: '📝' },
];

export default function HistoryClient({ initialLogs }) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Filtrado dinámico
  const filteredLogs = initialLogs.filter((log) => {
    const matchesCategory = selectedCategory === 'ALL' || log.category === selectedCategory;
    const matchesSearch = log.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (log.provider && log.provider.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('¿Estás seguro de eliminar este registro de mantenimiento?')) return;
    setDeletingId(id);
    try {
      await deleteMaintenanceLog(id);
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const totalFilteredCost = filteredLogs.reduce((acc, l) => acc + (l.cost || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <History className="w-6 h-6 text-indigo-400" />
            <span>Historial de Mantenimientos</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Consulta, filtra y expande el historial de servicios realizados a tu vehículo
          </p>
        </div>

        <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 font-medium">
          Total Filtrado: <strong className="text-emerald-400 font-bold">${totalFilteredCost.toFixed(2)}</strong> ({filteredLogs.length} registros)
        </div>
      </div>

      {/* Buscador y Filtros por Categoría */}
      <div className="space-y-4">
        {/* Buscador */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar servicio, repuesto o taller..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Pills de Categoría */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                type="button"
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800 hover:bg-slate-800'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lista de Registros */}
      {filteredLogs.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-400 text-sm">
          No se encontraron registros de mantenimiento con los filtros seleccionados.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLogs.map((log) => {
            const isExpanded = expandedId === log.id;
            const categoryObj = CATEGORIES.find((c) => c.id === log.category) || CATEGORIES[0];

            return (
              <motion.div
                key={log.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 transition-all overflow-hidden shadow-sm"
              >
                {/* Fila Principal / Cabecera de Tarjeta */}
                <div
                  onClick={() => toggleExpand(log.id)}
                  className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="p-3 rounded-xl bg-slate-800 text-xl shrink-0">
                      {categoryObj.icon}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm sm:text-base font-bold text-white truncate">
                        {log.serviceName}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                          {new Date(log.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Gauge className="w-3.5 h-3.5 text-indigo-400" />
                          {log.mileageAtService?.toLocaleString()} km
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <span className="text-sm sm:text-base font-black text-emerald-400">
                        ${log.cost?.toFixed(2)}
                      </span>
                    </div>

                    <div className="p-1.5 rounded-lg bg-slate-800/60 text-slate-400">
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isExpanded ? 'rotate-180 text-indigo-400' : ''
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Panel Expandible con Detalles */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-5 pb-5 pt-2 border-t border-slate-800/80 bg-slate-950/40 text-xs text-slate-300 space-y-3"
                    >
                      {log.provider ? (
                        <div>
                          <span className="font-semibold text-slate-400 block mb-1">Notas / Proveedor:</span>
                          <p className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 leading-relaxed">
                            {log.provider}
                          </p>
                        </div>
                      ) : (
                        <p className="text-slate-500 italic">No hay notas u observaciones adicionales registradas.</p>
                      )}

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-[10px] text-slate-500">
                          Registrado el {new Date(log.createdAt).toLocaleString('es-ES')}
                        </span>

                        <button
                          onClick={(e) => handleDelete(log.id, e)}
                          disabled={deletingId === log.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-medium transition-colors"
                        >
                          {deletingId === log.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                          <span>Eliminar</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
