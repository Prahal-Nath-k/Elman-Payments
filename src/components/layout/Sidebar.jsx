import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Receipt, Settings, CreditCard, Building2 } from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Payments', href: '/payments', icon: Receipt },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="hidden border-r bg-white md:block md:w-64 md:shrink-0 md:flex-col shadow-soft z-10 relative">
      <div className="flex h-16 items-center px-6 border-b border-muted">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary">
          <CreditCard className="h-6 w-6" />
          <span>ElmanPay</span>
        </div>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid gap-1 px-4 text-sm font-medium">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all hover:text-primary",
                  isActive
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  );
}
