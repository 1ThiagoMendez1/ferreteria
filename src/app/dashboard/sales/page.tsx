import PageHeader from '@/components/page-header';
import ManualSaleForm from '@/components/manual-sale-form';
import ProductCatalog from '@/components/product-catalog';
import { SalesCartProvider } from '@/hooks/use-sales-cart';
import { getProducts, getCategories, getLocations } from '@/lib/data';
import type { Product as ProductType } from '@/lib/types';

// Forzamos esta página a ser dinámica para que siempre muestre ventas y productos actualizados en producción
export const dynamic = 'force-dynamic';
 
export default async function SalesPage() {
  const products = await getProducts();
  const categories = await getCategories();
  const locations = await getLocations();

  // Normalizamos productos para que coincidan con el tipo ProductType (evitar null en imageType/imageUrl/imageFile)
  const normalizedProducts: ProductType[] = products.map((p: any) => ({
    ...p,
    imageType: p.imageType ?? undefined,
    imageUrl: p.imageUrl ?? undefined,
    imageFile: p.imageFile ?? undefined,
  }));
 
  return (
    <SalesCartProvider>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mb-6">
          <h1 className="text-2xl font-bold font-headline">Ventas en Tienda</h1>
          <p className="text-muted-foreground mt-1">Registra ventas realizadas directamente en la tienda física</p>
        </div>
        <div className="mb-8">
          <ProductCatalog
            products={normalizedProducts}
            categories={categories}
            locations={locations}
          />
        </div>
        <ManualSaleForm />
      </div>
    </SalesCartProvider>
  );
}