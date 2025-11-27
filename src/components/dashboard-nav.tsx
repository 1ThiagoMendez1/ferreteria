'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Package, Home, icons, ShoppingCart, Handshake, DollarSign, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from './ui/button';
import { Badge } from './ui/badge';
import { createElement } from 'react';

const allNavLinks = [
  { href: '/dashboard', label: 'Panel de Control', icon: 'Home', permission: 'dashboard' },
  { href: '/dashboard/products', label: 'Productos', icon: 'Package', permission: 'products' },
  { href: '/dashboard/orders', label: 'Pedidos', icon: 'ShoppingCart', permission: 'orders', showBadge: true },
  { href: '/dashboard/sales', label: 'Ventas en Tienda', icon: 'DollarSign', permission: 'sales' },
  { href: '/dashboard/consultations', label: 'Asesorías', icon: 'Handshake', permission: 'consultations' },
  { href: '/dashboard/almacen', label: 'Almacén', icon: 'Package', permission: 'warehouse' },
  { href: '/dashboard/accounting', label: 'Contabilidad', icon: 'Calculator', permission: 'accounting' },
  { href: '/dashboard/users', label: 'Usuarios', icon: 'Users', permission: 'users' },
];

export default function DashboardNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);

  useEffect(() => {
    const fetchPendingOrdersCount = async () => {
      try {
        const response = await fetch('/api/orders/pending-count');
        const data = await response.json();
        setPendingOrdersCount(data.count);
      } catch (error) {
        console.error('Error fetching pending orders count:', error);
      }
    };

    fetchPendingOrdersCount();

    // Actualizar cada 30 segundos
    const interval = setInterval(fetchPendingOrdersCount, 30000);

    return () => clearInterval(interval);
  }, []);

  // Filter nav links based on user permissions
  const navLinks = allNavLinks.filter(link => {
    if (!session?.user) return false;
    if (session.user.role === 'admin') return true; // Admins see all
    return session.user.permissions.includes(link.permission);
  });

  return (
    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
      {navLinks.map(({ href, label, icon: IconName, showBadge }) => {
        const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
        const Icon = (icons as any)[IconName] || Home;
        const hasPendingOrders = showBadge && pendingOrdersCount > 0;

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              buttonVariants({ variant: 'ghost' }),
              'justify-start gap-3 my-1 relative',
              isActive
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : hasPendingOrders
                ? 'text-red-600 hover:bg-red-50 hover:text-red-700'
                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="flex-1">{label}</span>
            {showBadge && pendingOrdersCount > 0 && (
              <Badge
                variant="destructive"
                className="ml-auto h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {pendingOrdersCount > 99 ? '99+' : pendingOrdersCount}
              </Badge>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
