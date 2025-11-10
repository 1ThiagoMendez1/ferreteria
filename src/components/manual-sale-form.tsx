'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createManualSaleAction } from '@/lib/actions';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Separator } from './ui/separator';
import { Loader2, Plus, Minus, Trash2, Store, Truck, CreditCard, DollarSign, Smartphone, CreditCardIcon } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormMessage } from './ui/form';
import { useToast } from '@/hooks/use-toast';
import { useSalesCart } from '@/hooks/use-sales-cart';
import { formatCurrency } from '@/lib/utils';
import Image from 'next/image';

const manualSaleSchema = z.object({
  paymentMethod: z.enum(['efectivo', 'nequi', 'daviplata', 'tarjeta', 'cash-on-delivery'], {
    required_error: "Debes seleccionar un método de pago."
  }),
  customerName: z.string().optional(),
  customerAddress: z.string().optional(),
  customerPhone: z.string().optional(),
});

type ManualSaleFormData = z.infer<typeof manualSaleSchema>;

export default function ManualSaleForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { items: cart, updateQuantity, removeFromCart, clearCart, total } = useSalesCart();

  const form = useForm<ManualSaleFormData>({
    resolver: zodResolver(manualSaleSchema),
    defaultValues: {
      paymentMethod: 'efectivo',
    },
  });

  const paymentMethod = form.watch('paymentMethod');


  const onSubmit = async (data: ManualSaleFormData) => {
    if (cart.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Carrito vacío',
        description: 'Agrega productos al carrito antes de procesar la venta.',
      });
      return;
    }

    setIsSubmitting(true);
    const saleData = {
      ...data,
      items: JSON.stringify(cart),
      total,
    };

    const result = await createManualSaleAction(saleData);

    if (result.success) {
      clearCart();
      form.reset();
      toast({
        title: 'Venta registrada',
        description: `Código de venta: ${result.orderCode}`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Error al registrar venta',
        description: result.error || 'Por favor, inténtalo de nuevo.',
      });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
        {/* Cart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Carrito de Venta
              {cart.length > 0 && (
                <Button variant="outline" size="sm" onClick={clearCart}>
                  Limpiar
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {cart.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No hay productos en el carrito
              </p>
            ) : (
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.product.id} className="flex items-center gap-3">
                    <Image
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      width={40}
                      height={40}
                      className="rounded-md object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">{formatCurrency(item.product.price)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.quantity}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFromCart(item.product.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between items-center font-bold">
                  <span>Total:</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Checkout Form */}
        {cart.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Procesar Venta</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="space-y-3"
                          >
                            {/* Efectivo con sub-opciones */}
                            <div className="space-y-2">
                              <FormItem>
                                <FormControl>
                                  <Label
                                    htmlFor="efectivo-sale"
                                    className={`flex items-center gap-3 border rounded-lg p-3 cursor-pointer transition-colors ${['efectivo', 'nequi', 'daviplata', 'tarjeta'].includes(paymentMethod) ? 'bg-accent/10 border-accent' : 'hover:bg-muted/50'}`}
                                  >
                                    <RadioGroupItem value="efectivo" id="efectivo-sale" />
                                    <DollarSign className="h-5 w-5" />
                                    <div className="flex-1">
                                      <p className="font-semibold text-sm">Pago en Efectivo</p>
                                      <p className="text-xs text-muted-foreground">Cliente paga en efectivo en la tienda</p>
                                    </div>
                                  </Label>
                                </FormControl>
                              </FormItem>

                              {/* Sub-opciones de efectivo */}
                              {['efectivo', 'nequi', 'daviplata', 'tarjeta'].includes(paymentMethod) && (
                                <div className="ml-8 space-y-2 animate-in fade-in duration-300">
                                  <FormItem>
                                    <FormControl>
                                      <Label
                                        htmlFor="efectivo-cash"
                                        className={`flex items-center gap-3 border rounded-lg p-2 cursor-pointer transition-colors ${paymentMethod === 'efectivo' ? 'bg-green-50 border-green-500' : 'hover:bg-muted/50'}`}
                                      >
                                        <RadioGroupItem value="efectivo" id="efectivo-cash" />
                                        <DollarSign className="h-4 w-4 text-green-600" />
                                        <div className="flex-1">
                                          <p className="font-medium text-sm">Efectivo</p>
                                          <p className="text-xs text-muted-foreground">Billetes y monedas</p>
                                        </div>
                                      </Label>
                                    </FormControl>
                                  </FormItem>
                                  <FormItem>
                                    <FormControl>
                                      <Label
                                        htmlFor="nequi"
                                        className={`flex items-center gap-3 border rounded-lg p-2 cursor-pointer transition-colors ${paymentMethod === 'nequi' ? 'bg-blue-50 border-blue-500' : 'hover:bg-muted/50'}`}
                                      >
                                        <RadioGroupItem value="nequi" id="nequi" />
                                        <Smartphone className="h-4 w-4 text-blue-600" />
                                        <div className="flex-1">
                                          <p className="font-medium text-sm">Nequi</p>
                                          <p className="text-xs text-muted-foreground">Transferencia por Nequi</p>
                                        </div>
                                      </Label>
                                    </FormControl>
                                  </FormItem>
                                  <FormItem>
                                    <FormControl>
                                      <Label
                                        htmlFor="daviplata"
                                        className={`flex items-center gap-3 border rounded-lg p-2 cursor-pointer transition-colors ${paymentMethod === 'daviplata' ? 'bg-purple-50 border-purple-500' : 'hover:bg-muted/50'}`}
                                      >
                                        <RadioGroupItem value="daviplata" id="daviplata" />
                                        <Smartphone className="h-4 w-4 text-purple-600" />
                                        <div className="flex-1">
                                          <p className="font-medium text-sm">Daviplata</p>
                                          <p className="text-xs text-muted-foreground">Transferencia por Daviplata</p>
                                        </div>
                                      </Label>
                                    </FormControl>
                                  </FormItem>
                                  <FormItem>
                                    <FormControl>
                                      <Label
                                        htmlFor="tarjeta"
                                        className={`flex items-center gap-3 border rounded-lg p-2 cursor-pointer transition-colors ${paymentMethod === 'tarjeta' ? 'bg-orange-50 border-orange-500' : 'hover:bg-muted/50'}`}
                                      >
                                        <RadioGroupItem value="tarjeta" id="tarjeta" />
                                        <CreditCardIcon className="h-4 w-4 text-orange-600" />
                                        <div className="flex-1">
                                          <p className="font-medium text-sm">Tarjeta</p>
                                          <p className="text-xs text-muted-foreground">Pago con tarjeta de débito/crédito</p>
                                        </div>
                                      </Label>
                                    </FormControl>
                                  </FormItem>
                                </div>
                              )}
                            </div>

                            <FormItem>
                              <FormControl>
                                <Label
                                  htmlFor="cash-on-delivery-sale"
                                  className={`flex items-center gap-3 border rounded-lg p-3 cursor-pointer transition-colors ${paymentMethod === 'cash-on-delivery' ? 'bg-accent/10 border-accent' : 'hover:bg-muted/50'}`}
                                >
                                  <RadioGroupItem value="cash-on-delivery" id="cash-on-delivery-sale" />
                                  <Truck className="h-5 w-5" />
                                  <div className="flex-1">
                                    <p className="font-semibold text-sm">Pago Contraentrega</p>
                                    <p className="text-xs text-muted-foreground">Cliente paga al recibir el pedido</p>
                                  </div>
                                </Label>
                              </FormControl>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {paymentMethod === 'cash-on-delivery' && (
                    <div className="space-y-3 animate-in fade-in duration-300">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="customerName">Nombre del Cliente</Label>
                          <Input
                            id="customerName"
                            {...form.register('customerName')}
                            placeholder="Nombre completo"
                          />
                        </div>
                        <div>
                          <Label htmlFor="customerPhone">Teléfono</Label>
                          <Input
                            id="customerPhone"
                            {...form.register('customerPhone')}
                            placeholder="Número de teléfono"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="customerAddress">Dirección de Entrega</Label>
                        <Input
                          id="customerAddress"
                          {...form.register('customerAddress')}
                          placeholder="Dirección completa"
                        />
                      </div>
                    </div>
                  )}

                  <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Registrar Venta
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
    </div>
  );
}