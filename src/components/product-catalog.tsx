'use client';

import { useState, useMemo, useContext } from 'react';
import type { Product, Category, Location } from '@/lib/types';
import ProductCard from './product-card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { SalesCartContext } from '@/hooks/use-sales-cart';

type ProductCatalogProps = {
  products: Product[];
  categories: Category[];
  locations: Location[];
};

export default function ProductCatalog({ products, categories }: ProductCatalogProps) {
  const { addToCart: customerAddToCart } = useCart();
  const salesCartContext = useContext(SalesCartContext);
  const addToCart = salesCartContext?.addToCart || customerAddToCart;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === 'all' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  return (
    <div>
      <div className="mb-12 p-6 bg-card/60 rounded-lg shadow-md border border-border">
        <h1 className="text-4xl font-extrabold text-foreground mb-2 font-headline tracking-tight">
          Catálogo de Productos
        </h1>
        <p className="text-muted-foreground text-lg">
          Encuentra todas las herramientas y materiales que necesitas para tu próximo proyecto.
        </p>
        <div className="mt-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar productos..."
              className="pl-10 w-full"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-[240px]">
              <SelectValue placeholder="Filtrar por categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las Categorías</SelectItem>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} addToCart={addToCart} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-xl">No se encontraron productos.</p>
        </div>
      )}
    </div>
  );
}
