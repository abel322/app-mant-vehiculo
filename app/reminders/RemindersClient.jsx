'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Plus,
  CheckCircle2,
  Calendar,
  Gauge,
  Trash2,
  X,
  Loader2,
  AlertTriangle,
  Tag,
} from 'lucide-react';
import { toggleReminder, createReminder, deleteReminder } from '@/app/actions/reminderActions';

const CATEGORY_ICONS = {
  OIL_CHANGE: '🛢️',
  TIRES: '🛞',
  BRAKES: '🛑',
  FILTER: '💨',
  BATTERY: '⚡',
  FLUIDS: '🧪',
  GENERAL: '🔧',
  OTHER: '📝',
};

export default function RemindersClient({ vehicleId, currentMileage, initialReminders }) {
  const [reminders, setReminders] = useState(initialReminders);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('OIL_CHANGE');
  const [targetMileage, setTargetMileage] = useState('');
  const [targetDate, setTargetDate] = useState('');

  const handleToggle = async (id) => {
    // Optimistic UI update
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isCompleted: !r.isCompleted } : r))
    );

    try {
      await toggleReminder(id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Deseas eliminar este recordatorio?')) return;
    setReminders((prev) => prev.filter((r) => r.id !== id));
    try {
      await deleteReminder(id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await createReminder({
        vehicleId,
        title,
        category,
        targetMileage,
        targetDate,
      });

      if (res.success && res.reminder) {
        setReminders((prev) => [res.reminder, ...prev]);
        setIsModalOpen(false);
        setTitle('');
        setTargetMileage('');
        setTargetDate('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-indigo-400" />
            <span>Configuración y Recordatorios</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Programa alertas para el mantenimiento de tu vehículo y márcalas al realizarlas
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-medium shadow-lg shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Recordatorio</span>
        </button>
      </div>

      {/* Lista Interactiva de Recordatorios */}
      {reminders.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-400 text-sm">
          No tienes recordatorios creados. ¡Crea el primero para estar al día!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {reminders.map((item) => {
              const icon = CATEGORY_ICONS[item.category] || '🔧';
              const isCompleted = item.isCompleted;

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`relative p-5 rounded-2xl border transition-all ${
                    isCompleted
                      ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                      : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      {/* Checkbox Animado con Framer Motion */}
                      <button
                        onClick={() => handleToggle(item.id)}
                        type="button"
                        className={`p-1 rounded-xl transition-all ${
                          isCompleted
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-slate-800 text-slate-400 hover:bg-indigo-600 hover:text-white'
                        }`}
                      >
                        <CheckCircle2 className={`w-5 h-5 ${isCompleted ? 'fill-emerald-500/20' : ''}`} />
                      </button>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{icon}</span>
                          <h3
                            className={`text-sm font-bold text-white transition-all ${
                              isCompleted ? 'line-through text-slate-500' : ''
                            }`}
                          >
                            {item.title}
                          </h3>
                        </div>

                        {/* Detalles de fecha/kilometraje */}
                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
                          {item.targetMileage && (
                            <span className="flex items-center gap-1">
                              <Gauge className="w-3.5 h-3.5 text-indigo-400" />
                              Meta: {item.targetMileage.toLocaleString()} km
                            </span>
                          )}

                          {item.targetDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                              {new Date(item.targetDate).toLocaleDateString('es-ES')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Modal para Crear Recordatorio */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl z-10 text-slate-100 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Bell className="w-4 h-4 text-indigo-400" />
                  <span>Crear Recordatorio</span>
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Título del Recordatorio *</label>
                  <input
                    type="text"
                    placeholder="Ej. Cambio de bujías e inyectores"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Categoría</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="OIL_CHANGE">🛢️ Cambio de Aceite</option>
                    <option value="TIRES">🛞 Neumáticos</option>
                    <option value="BRAKES">🛑 Frenos</option>
                    <option value="FILTER">💨 Filtros</option>
                    <option value="BATTERY">⚡ Batería</option>
                    <option value="FLUIDS">🧪 Fluidos</option>
                    <option value="GENERAL">🔧 General</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Km Objetivo</label>
                    <input
                      type="number"
                      placeholder="Ej. 60000"
                      value={targetMileage}
                      onChange={(e) => setTargetMileage(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Fecha Objetivo</label>
                    <input
                      type="date"
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 [color-scheme:dark]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-500/20"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar Recordatorio'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
