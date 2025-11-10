import Image from 'next/image';
import type { Product } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { Button } from './ui/button';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';

type ProductCardProps = {
  product: Product;
  addToCart?: (product: Product, quantity?: number) => void;
};

export default function ProductCard({ product, addToCart: customAddToCart }: ProductCardProps) {
  const { addToCart: defaultAddToCart } = useCart();
  const addToCart = customAddToCart || defaultAddToCart;

  // Get the correct image URL based on image type
  const imageUrl = product.imageType === 'FILE' && product.imageFile
    ? product.imageFile
    : product.imageType === 'URL' && product.imageUrl
    ? product.imageUrl
    : product.imageUrl || "https://picsum.photos/seed/placeholder/600/400";

  const stockStatus =
    product.quantity <= 0
      ? 'Agotado'
      : product.quantity <= product.minStock
      ? 'Poco Stock'
      : 'En Stock';
  
  const stockBadgeVariant =
    product.quantity <= 0
      ? 'destructive'
      : product.quantity <= product.minStock
      ? 'secondary'
      : 'outline';

  const canAddToCart = product.quantity > 0;

  const handleAddToCart = () => {
    if (canAddToCart) {
      addToCart(product);
    }
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-card/50 hover:bg-card/90">
      <CardHeader className="p-0">
        <div className="aspect-[3/2] relative w-full">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            data-ai-hint={product.imageHint}
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex flex-col flex-grow">
        <CardTitle className="text-lg leading-tight mb-2 font-headline h-14">
            {product.name}
        </CardTitle>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-grow">
          {product.description}
        </p>
        <div className="flex justify-between items-center mt-auto">
          <p className="text-2xl font-bold text-foreground">
            {formatCurrency(product.price)}
          </p>
          <Badge variant={stockBadgeVariant} className="capitalize">
            {stockStatus}
          </Badge>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={!canAddToCart} onClick={handleAddToCart}>
          <ShoppingCart className="mr-2 h-4 w-4" />
          {canAddToCart ? 'Agregar al Carrito' : 'Agotado'}
        </Button>
      </CardFooter>
    </Card>
  );
}
