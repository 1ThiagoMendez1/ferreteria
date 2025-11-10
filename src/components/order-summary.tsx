'use client';
import { useCart } from '@/hooks/use-cart';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Separator } from './ui/separator';
import Image from 'next/image';

type OrderSummaryProps = {
    children?: React.ReactNode;
}

export default function OrderSummary({ children }: OrderSummaryProps) {
  const { items, total, itemCount } = useCart();

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle>Resumen del Pedido ({itemCount})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="max-h-64 overflow-y-auto space-y-4 pr-2">
            {items.map(({product, quantity}) => (
                <div key={product.id} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Image src={product.imageUrl} alt={product.name} width={48} height={48} className="rounded-md object-cover" />
                        <div>
                            <p className="text-sm font-medium leading-tight">{product.name}</p>
                            <p className="text-xs text-muted-foreground">Cant: {quantity}</p>
                        </div>
                    </div>
                    <p className="text-sm font-medium">{formatCurrency(product.price * quantity)}</p>
                </div>
            ))}
        </div>
        <Separator />
        <div className="flex justify-between font-bold text-lg">
          <span>Total del Pedido:</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </CardContent>
      {children && (
        <CardFooter>
            <div className="w-full">
                {children}
            </div>
        </CardFooter>
      )}
    </Card>
  );
}
