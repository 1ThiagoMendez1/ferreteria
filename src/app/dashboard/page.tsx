import { getProducts, getStockAlerts } from '@/lib/data';
import StockAlerts from '@/components/stock-alerts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Package, AlertTriangle, CheckCircle } from 'lucide-react';
import PageHeader from '@/components/page-header';

// Forzamos esta página a ser dinámica para ver siempre datos actualizados en producción
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const products = await getProducts();
  const alerts = await getStockAlerts();

  const totalProducts = products.length;
  const lowStockItems = alerts.length;
  const inStockItems = totalProducts - lowStockItems;

  return (
    <>
      <PageHeader title="Panel de Control" />
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos Totales</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Productos totales en inventario
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Artículos con Poco Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{lowStockItems}</div>
            <p className="text-xs text-muted-foreground">
              Artículos en o por debajo del nivel mínimo de stock
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Saludable</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{inStockItems}</div>
            <p className="text-xs text-muted-foreground">
              Artículos con niveles de stock suficientes
            </p>
          </CardContent>
        </Card>
      </div>
      <div>
        <StockAlerts alerts={alerts} />
      </div>
    </>
  );
}
