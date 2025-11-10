import Link from 'next/link';
import { PlusCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { getProducts, getCategories, getLocations } from '@/lib/data';
import ProductTable from '@/components/product-table';
import PageHeader from '@/components/page-header';

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  const products = await getProducts();
  const categories = await getCategories();
  const locations = await getLocations();

  return (
    <>
      <PageHeader title="Productos"
        actions={
          <Button asChild>
            <Link href="/dashboard/products/new">
              <PlusCircle className="mr-2 h-4 w-4" /> Agregar Nuevo Producto
            </Link>
          </Button>
        }
      />
      <ProductTable products={products} categories={categories} locations={locations} />
    </>
  );
}
