import Link from 'next/link';
import { PlusCircle, FolderPlus, MapPin } from 'lucide-react';
import { revalidatePath } from 'next/cache';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getProducts, getCategories, getLocations, addLocation } from '@/lib/data';
import ProductTable from '@/components/product-table';
import PageHeader from '@/components/page-header';
import { createCategoryAction } from '@/lib/actions';

export const dynamic = 'force-dynamic';

async function createLocationAction(formData: FormData) {
  'use server';

  const name = String(formData.get('name') ?? '').trim();

  if (!name) {
    console.error('Nombre de ubicación vacío');
    return;
  }

  try {
    await addLocation(name);
  } catch (error) {
    console.error('Error creating location:', error);
    return;
  }

  revalidatePath('/dashboard/products');
}

export default async function ProductsPage() {
  const products = await getProducts();
  const categories = await getCategories();
  const locations = await getLocations();

  return (
    <>
      <PageHeader
        title="Productos"
        actions={
          <div className="flex gap-2">
            {/* Botón para nueva categoría */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <FolderPlus className="mr-2 h-4 w-4" />
                  Nueva Categoría
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear nueva categoría</DialogTitle>
                </DialogHeader>
                <form action={createCategoryAction} className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="category-name">Nombre de la categoría</Label>
                    <Input
                      id="category-name"
                      name="name"
                      placeholder="Ej. Herramientas eléctricas"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="category-icon">Icono (nombre de icono de Lucide)</Label>
                    <Input
                      id="category-icon"
                      name="icon"
                      placeholder="Ej. Wrench"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Guardar categoría
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            {/* Botón para nueva ubicación */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <MapPin className="mr-2 h-4 w-4" />
                  Nueva Ubicación
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear nueva ubicación</DialogTitle>
                </DialogHeader>
                <form action={createLocationAction} className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="location-name">Nombre de la ubicación</Label>
                    <Input
                      id="location-name"
                      name="name"
                      placeholder="Ej. Pasillo 9, Bodega B"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Guardar ubicación
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            <Button asChild>
              <Link href="/dashboard/products/new">
                <PlusCircle className="mr-2 h-4 w-4" /> Agregar Nuevo Producto
              </Link>
            </Button>
          </div>
        }
      />
      <ProductTable products={products} categories={categories} locations={locations} />
    </>
  );
}
