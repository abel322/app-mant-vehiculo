'use client';

import { motion } from 'framer-motion';
import {
  Car,
  Gauge,
  DollarSign,
  Calendar,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import QuickMaintenanceDrawer from '@/components/QuickMaintenanceDrawer';
import UpdateMileageModal from '@/components/UpdateMileageModal';

const CATEGORY_ICONS = {
  Aceite: '🛢️',
  Frenos: '🛑',
  Cauchos: '🛞',
  Motor: '⚡',
  General: '🔧',
};

export default function DashboardClient({ initialVehicle }) {
  const vehicle = initialVehicle;
  const maintenances = vehicle.maintenances || [];
  const reminders = vehicle.reminders || [];

  const totalCost = maintenances.reduce((acc, item) => acc + (item.cost || 0), 0);
  const pendingReminders = reminders.filter((r) => !r.isCompleted);
  const nextReminder = pendingReminders.length > 0 ? pendingReminders[0] : null;

  return (
    <div className="space-y-8">
      {/* 1. Header con Información del Vehículo y Acción de Kilometraje */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative overflow-hidden rounded-2xl bg-zinc-900/50 border border-zinc-800 p-6 sm:p-8 shadow-xl"
      >
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shadow-inner">
              <Car className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {vehicle.make} {vehicle.model}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {vehicle.year}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1 flex items-center gap-3">
                <span className="font-mono bg-zinc-800 px-2 py-0.5 rounded text-cyan-300 border border-zinc-700">
                  Placa: {vehicle.plate}
                </span>
                <span>•</span>
                <span className="text-zinc-300">
                  Odómetro: <strong className="text-white">{vehicle.currentMileage?.toLocaleString()} km</strong>
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <UpdateMileageModal vehicleId={vehicle.id} currentMileage={vehicle.currentMileage} />
            <QuickMaintenanceDrawer vehicleId={vehicle.id} triggerLabel="+ Registrar Mantenimiento" />
          </div>
        </div>
      </motion.div>

      {/* 2. 3 Stat Cards Animadas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Stat Card 1: Próximo Mantenimiento / Alerta */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-colors shadow-lg flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-zinc-400">Próximo Mantenimiento / Alerta</span>
              <h3 className="text-lg font-bold text-white mt-1 line-clamp-1">
                {nextReminder ? nextReminder.title : 'Servicios al día'}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Calendar className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs">
            {nextReminder?.targetMileage ? (
              <span className="text-amber-300 font-medium">
                Meta: {nextReminder.targetMileage.toLocaleString()} km
              </span>
            ) : (
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Estado Óptimo
              </span>
            )}
            <Link href="/reminders" className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1">
              Ver Alertas <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </motion.div>

        {/* Stat Card 2: Gasto Acumulado Total ($) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-colors shadow-lg flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-zinc-400">Gasto Acumulado Total</span>
              <h3 className="text-2xl font-black text-white mt-1">
                ${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
            <span className="flex items-center gap-1 text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" /> {maintenances.length} servicios registrados
            </span>
            <Link href="/history" className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1">
              Historial <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </motion.div>

        {/* Stat Card 3: Kilometraje Actual */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-colors shadow-lg flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-zinc-400">Kilometraje Actual</span>
              <h3 className="text-2xl font-black text-white mt-1">
                {vehicle.currentMileage?.toLocaleString()} <span className="text-sm font-normal text-zinc-400">km</span>
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Gauge className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
            <span>Última lectura registrada</span>
            <UpdateMileageModal vehicleId={vehicle.id} currentMileage={vehicle.currentMileage} />
          </div>
        </motion.div>
      </div>

      {/* 3. Sección de Recordatorios Pendientes con Barras de Progreso Animadas */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.2 }}
        className="rounded-2xl bg-zinc-900/50 border border-zinc-800 p-6 shadow-lg space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Recordatorios y Garantías</h2>
              <p className="text-xs text-zinc-400">Alertas por límite de kilometraje o fecha objetivo</p>
            </div>
          </div>

          <Link
            href="/reminders"
            className="text-xs font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            Ver todos <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {pendingReminders.length === 0 ? (
            <div className="col-span-2 p-8 text-center rounded-xl bg-zinc-950/50 border border-zinc-800">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
              <p className="text-sm font-medium text-zinc-300">¡No hay recordatorios pendientes!</p>
              <p className="text-xs text-zinc-500 mt-1">El vehículo no presenta mantenimientos urgentes.</p>
            </div>
          ) : (
            pendingReminders.slice(0, 4).map((rem) => {
              const currentKm = vehicle.currentMileage || 0;
              const targetKm = rem.targetMileage || currentKm + 5000;
              const progress = Math.min(100, Math.max(0, Math.round((currentKm / targetKm) * 100)));
              const isClose = progress >= 85;

              return (
                <div
                  key={rem.id}
                  className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800 hover:border-zinc-700 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">🔧</span>
                      <div>
                        <h4 className="text-xs font-bold text-white line-clamp-1">{rem.title}</h4>
                        <span className="inline-block text-[10px] px-2 py-0.5 rounded-full border mt-1 font-medium bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
                          Alerta Programada
                        </span>
                      </div>
                    </div>

                    {isClose && (
                      <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold animate-pulse">
                        <AlertTriangle className="w-3 h-3" /> Próximo
                      </span>
                    )}
                  </div>

                  {/* Barra de Progreso */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-zinc-400 font-medium">
                      <span>Progreso: {progress}%</span>
                      <span>Meta: {targetKm.toLocaleString()} km</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className={`h-full rounded-full ${
                          isClose ? 'bg-gradient-to-r from-amber-500 to-rose-500' : 'bg-gradient-to-r from-cyan-500 to-emerald-500'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </motion.div>

      {/* 4. Sección de Mantenimientos Recientes */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.25 }}
        className="rounded-2xl bg-zinc-900/50 border border-zinc-800 p-6 shadow-lg space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Wrench className="w-4 h-4 text-cyan-400" />
            <span>Mantenimientos Recientes</span>
          </h2>
          <div className="flex items-center gap-3">
            <QuickMaintenanceDrawer vehicleId={vehicle.id} triggerLabel="+ Registrar Servicio" />
            <Link href="/history" className="text-xs font-medium text-cyan-400 hover:text-cyan-300">
              Ver todo
            </Link>
          </div>
        </div>

        {maintenances.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-zinc-950/40 border border-zinc-800 text-zinc-500 text-xs">
            No se han registrado servicios aún.
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/80">
            {maintenances.slice(0, 4).map((log) => {
              const icon = CATEGORY_ICONS[log.category] || '🔧';
              return (
                <div key={log.id} className="py-3.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-zinc-800 text-lg">
                      {icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">{log.serviceName}</h4>
                      <p className="text-xs text-zinc-400 flex items-center gap-2 mt-0.5">
                        <span>{new Date(log.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        <span>•</span>
                        <span>{log.mileageAtService?.toLocaleString()} km</span>
                        <span>•</span>
                        <span className="text-cyan-400 font-medium">{log.category}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-bold text-emerald-400">
                      ${log.cost?.toFixed(2)}
                    </span>
                    {log.notes && (
                      <p className="text-[10px] text-zinc-500 truncate max-w-[150px]">{log.notes}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
