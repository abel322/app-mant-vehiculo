'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wrench,
  X,
  Plus,
  Gauge,
  DollarSign,
  Calendar,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Tag,
} from 'lucide-react';
import { addMaintenanceLog } from '@/app/actions';

const CATEGORIAS = ['Aceite', 'Frenos', 'Cauchos', 'Motor', 'General'];

export default function QuickMaintenanceDrawer({ vehicleId, triggerLabel = 'Registrar Mantenimiento' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [serviceName, setServiceName] = useState('');
  const [category, setCategory] = useState('Aceite');
  const [mileageAtService, setMileageAtService] = useState('');
  const [cost, setCost] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const resetForm = () => {
    setServiceName('');
    setCategory('Aceite');
    setMileageAtService('');
    setCost('');
    setNotes('');
    setDate(new Date().toISOString().split('T')[0]);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleOpen = () => {
    resetForm();
    setIsOpen(true);
  };

  const handleClose = () => {
    if (loading) return;
    setIsOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    const payload = {
      vehicleId,
      serviceName,
      category,
      mileageAtService,
      cost,
      notes,
      date,
    };

    try {
      const res = await addMaintenanceLog(payload);

      if (res.success) {
        setSuccessMsg('¡Mantenimiento registrado exitosamente!');
        setTimeout(() => {
          setIsOpen(false);
          resetForm();
        }, 1000);
      } else {
        setErrorMsg(res.error || 'No se pudo guardar el registro.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Error de conexión o del servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Botón Disparador */}
      <button
        onClick={handleOpen}
        type="button"
        className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-sm shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/35 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 focus:outline-none"
      >
        <Plus className="w-4 h-4 stroke-[2.5]" />
        <span>{triggerLabel}</span>
      </button>

      {/* Drawer / Modal Deslizable con Framer Motion */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-end sm:p-4 overflow-hidden">
            {/* Backdrop Blur y Fade */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={handleClose}
              className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md"
            />

            {/* Panel Lateral Deslizable */}
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative w-full max-w-lg h-full sm:h-auto sm:max-h-[90vh] bg-zinc-900 border-l sm:border border-zinc-800 sm:rounded-2xl shadow-2xl z-10 flex flex-col text-zinc-100 overflow-y-auto"
            >
              {/* Header del Panel */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 bg-zinc-900/80 sticky top-0 backdrop-blur-md z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">
                      Registrar Mantenimiento
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Servicios, reparación o cambio de repuestos
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleClose}
                  disabled={loading}
                  type="button"
                  className="p-2 text-zinc-400 hover:text-white rounded-xl bg-zinc-800/60 hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Formulario */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4 flex-1">
                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{errorMsg}</span>
                  </motion.div>
                )}

                {successMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium"
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>{successMsg}</span>
                  </motion.div>
                )}

                {/* Servicio */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-zinc-300">
                    Servicio o Reparación <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Cambio de Aceite Sintético 5W-30"
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                  />
                </div>

                {/* Categoría */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Categoría</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    disabled={loading}
                    className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                  >
                    {CATEGORIAS.map((cat) => (
                      <option key={cat} value={cat} className="bg-zinc-900 text-zinc-100">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Kilometraje actual del servicio & Costo ($) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-zinc-300">
                      Kilometraje en Servicio <span className="text-cyan-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                        <Gauge className="w-4 h-4" />
                      </div>
                      <input
                        type="number"
                        min="0"
                        placeholder="Ej. 45000"
                        value={mileageAtService}
                        onChange={(e) => setMileageAtService(e.target.value)}
                        required
                        disabled={loading}
                        className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-zinc-300">
                      Costo ($) <span className="text-cyan-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                        <DollarSign className="w-4 h-4" />
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={cost}
                        onChange={(e) => setCost(e.target.value)}
                        required
                        disabled={loading}
                        className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Fecha */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-zinc-300">
                    Fecha del Servicio
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                      disabled={loading}
                      className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all [color-scheme:dark]"
                    />
                  </div>
                </div>

                {/* Notas / Observaciones */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-zinc-300">
                    Notas u Observaciones
                  </label>
                  <div className="relative">
                    <div className="absolute top-3 left-0 pl-3.5 flex items-start pointer-events-none text-zinc-400">
                      <FileText className="w-4 h-4" />
                    </div>
                    <textarea
                      rows={3}
                      placeholder="Marca de lubricante, proveedor, garantía o repuestos..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      disabled={loading}
                      className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all resize-none"
                    />
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={loading}
                    className="px-4 py-2.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-white bg-zinc-800/60 hover:bg-zinc-800 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <>
                        <Wrench className="w-4 h-4" />
                        <span>Guardar Registro</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
