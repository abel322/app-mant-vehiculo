'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Car, LayoutDashboard, History, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Historial', href: '/history', icon: History },
    { label: 'Recordatorios', href: '/reminders', icon: Bell },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Marca */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="p-2 rounded-xl bg-cyan-500 text-zinc-950 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-200">
            <Car className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
              AutoCare <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-medium">Pro</span>
            </span>
            <p className="text-[10px] text-zinc-400 font-medium hidden sm:block">
              Registro de Mantenimiento Vehicular
            </p>
          </div>
        </Link>

        {/* Navegación */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                  isActive
                    ? 'text-white'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-zinc-400'}`} />
                <span>{item.label}</span>

                {isActive && (
                  <motion.div
                    layoutId="navbar-active-pill"
                    className="absolute inset-0 bg-zinc-900 border border-zinc-800 rounded-xl -z-10"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
