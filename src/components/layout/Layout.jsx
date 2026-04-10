import { Sidebar } from './Sidebar';
import { Outlet } from 'react-router-dom';

export function Layout({ onLogout }) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar onLogout={onLogout} />
      <div className="flex flex-col sm:gap-4 w-full">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white/50 backdrop-blur px-6 shadow-sm md:hidden">
            {/* Mobile Header Can Be Expanded Later */}
            <h1 className="font-semibold text-lg">ElmanPay</h1>
        </header>
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
