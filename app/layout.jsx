import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'AutoCare Pro - Registro y Mantenimiento de Vehículo',
  description: 'Aplicación web moderna y minimalista para el registro de mantenimiento vehicular.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className="dark scroll-smooth">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased selection:bg-cyan-500 selection:text-zinc-950 flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {children}
        </main>

        <footer className="border-t border-zinc-900 bg-zinc-950 py-6 text-center text-xs text-zinc-500">
          <p>© 2026 AutoCare Pro. Desarrollado con Next.js, Prisma & Tailwind CSS.</p>
        </footer>
      </body>
    </html>
  );
}
