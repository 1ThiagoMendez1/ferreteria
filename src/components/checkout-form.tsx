'use client';

import { useState } from 'react';
import { useCart } from '@/hooks/use-cart';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createOrderAction } from '@/lib/actions';
import OrderSummary from './order-summary';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Loader2, Store, Truck, CreditCard, Smartphone, Wallet, DollarSign } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormMessage } from './ui/form';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';


const checkoutSchema = z.object({
  paymentMethod: z.enum(['store-pickup', 'cash-on-delivery'], {
    required_error: "Debes seleccionar un método de pago."
  }),
  storePaymentMethod: z.enum(['efectivo', 'nequi', 'daviplata', 'tarjeta'], {
    required_error: "Debes seleccionar un método de pago en tienda."
  }).optional(),
  fullName: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
}).refine(data => {
  if (data.paymentMethod === 'cash-on-delivery') {
    return !!data.fullName && !!data.address && !!data.phone;
  }
  if (data.paymentMethod === 'store-pickup') {
    return !!data.storePaymentMethod;
  }
  return true;
}, {
  message: 'Debes seleccionar un método de pago para recoger en tienda.',
  path: ['storePaymentMethod'],
}).refine(data => {
  if (data.paymentMethod === 'cash-on-delivery') {
    return !!data.fullName && !!data.address && !!data.phone;
  }
  return true;
}, {
  message: 'Nombre, dirección y teléfono son requeridos para pago contraentrega.',
  path: ['fullName'],
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function CheckoutForm() {
  const { items, total, clearCart, itemCount } = useCart();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [orderCode, setOrderCode] = useState<string | null>(null);
  
  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: 'store-pickup',
    },
  });

  const paymentMethod = form.watch('paymentMethod');

  const onSubmit = async (data: CheckoutFormData) => {
    setIsSubmitting(true);

    // Determinar el método de pago final
    let finalPaymentMethod = data.paymentMethod;
    if (data.paymentMethod === 'store-pickup' && data.storePaymentMethod) {
      finalPaymentMethod = data.storePaymentMethod;
    }

    const orderData = {
      ...data,
      paymentMethod: finalPaymentMethod,
      items: JSON.stringify(items),
      total,
    };

    const result = await createOrderAction(orderData);

    if (result.success && result.orderCode) {
      clearCart();
      setOrderCode(result.orderCode);
      setShowSuccessDialog(true);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error al crear el pedido',
        description: result.error || 'Por favor, inténtalo de nuevo.',
      });
      setIsSubmitting(false);
    }
  };

  const handleDialogClose = () => {
    setShowSuccessDialog(false);
    router.push('/checkout/success');
  };

  if (itemCount === 0 && !isSubmitting) {
     return (
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold mb-4">Tu carrito está vacío</h2>
          <p className="text-muted-foreground mb-8">
            Agrega productos a tu carrito antes de proceder al pago.
          </p>
          <Button onClick={() => router.push('/')}>Volver a la Tienda</Button>
        </div>
     )
  }

  return (
    <>
       <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¡Pedido Confirmado!</AlertDialogTitle>
            <AlertDialogDescription>
              Tu código de pedido es:
              <strong className="block text-lg my-2 font-mono bg-muted p-2 rounded-md">#{orderCode}</strong>
              Por favor, ten este código a mano cuando vengas a recoger tu pedido a la tienda.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction onClick={handleDialogClose}>
            Entendido
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Método de Entrega y Pago</CardTitle>
                <CardDescription>
                  Selecciona cómo quieres recibir y pagar tu pedido.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="space-y-4"
                        >
                          <FormItem>
                            <FormControl>
                              <Label
                                htmlFor="store-pickup"
                                className={`flex items-center gap-4 border rounded-lg p-4 cursor-pointer transition-colors ${paymentMethod === 'store-pickup' ? 'bg-accent/10 border-accent' : 'hover:bg-muted/50'}`}
                              >
                                <RadioGroupItem value="store-pickup" id="store-pickup" />
                                <Store className="h-6 w-6" />
                                <div className="flex-1">
                                  <p className="font-semibold">Recoger en Tienda</p>
                                  <p className="text-sm text-muted-foreground">
                                    Realiza tu pedido ahora y págalo cuando lo recojas en nuestra ferretería. ¡Lo tendremos listo para cuando llegues! 🤩💪
                                  </p>
                                </div>
                              </Label>
                            </FormControl>
                          </FormItem>
                          <FormItem>
                            <FormControl>
                                <Label
                                  htmlFor="cash-on-delivery"
                                  className={`flex items-center gap-4 border rounded-lg p-4 cursor-pointer transition-colors ${paymentMethod === 'cash-on-delivery' ? 'bg-accent/10 border-accent' : 'hover:bg-muted/50'}`}
                                >
                                  <RadioGroupItem value="cash-on-delivery" id="cash-on-delivery" />
                                  <Truck className="h-6 w-6" />
                                  <div className="flex-1">
                                    <p className="font-semibold">Pago Contraentrega</p>
                                    <p className="text-sm text-muted-foreground">
                                      ¡Relájate! Recibe tu pedido en la puerta de tu casa o proyecto y paga en efectivo al momento de la entrega. Fácil y seguro. 😉✨
                                    </p>
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

                {paymentMethod === 'store-pickup' && (
                  <div className="mt-8 space-y-4 animate-in fade-in duration-300">
                    <h3 className="text-lg font-semibold">Método de Pago en Tienda</h3>
                    <FormField
                      control={form.control}
                      name="storePaymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="grid grid-cols-2 gap-4"
                            >
                              <FormItem>
                                <FormControl>
                                  <Label
                                    htmlFor="efectivo"
                                    className={`flex items-center gap-3 border rounded-lg p-4 cursor-pointer transition-colors ${field.value === 'efectivo' ? 'bg-accent/10 border-accent' : 'hover:bg-muted/50'}`}
                                  >
                                    <RadioGroupItem value="efectivo" id="efectivo" />
                                    <DollarSign className="h-5 w-5" />
                                    <div className="flex-1">
                                      <p className="font-semibold text-sm">Efectivo</p>
                                      <p className="text-xs text-muted-foreground">Paga en efectivo al recoger</p>
                                    </div>
                                  </Label>
                                </FormControl>
                              </FormItem>
                              <FormItem>
                                <FormControl>
                                  <Label
                                    htmlFor="nequi"
                                    className={`flex items-center gap-3 border rounded-lg p-4 cursor-pointer transition-colors ${field.value === 'nequi' ? 'bg-accent/10 border-accent' : 'hover:bg-muted/50'}`}
                                  >
                                    <RadioGroupItem value="nequi" id="nequi" />
                                    <Smartphone className="h-5 w-5" />
                                    <div className="flex-1">
                                      <p className="font-semibold text-sm">Nequi</p>
                                      <p className="text-xs text-muted-foreground">Transferencia por Nequi</p>
                                    </div>
                                  </Label>
                                </FormControl>
                              </FormItem>
                              <FormItem>
                                <FormControl>
                                  <Label
                                    htmlFor="daviplata"
                                    className={`flex items-center gap-3 border rounded-lg p-4 cursor-pointer transition-colors ${field.value === 'daviplata' ? 'bg-accent/10 border-accent' : 'hover:bg-muted/50'}`}
                                  >
                                    <RadioGroupItem value="daviplata" id="daviplata" />
                                    <Wallet className="h-5 w-5" />
                                    <div className="flex-1">
                                      <p className="font-semibold text-sm">Daviplata</p>
                                      <p className="text-xs text-muted-foreground">Transferencia por Daviplata</p>
                                    </div>
                                  </Label>
                                </FormControl>
                              </FormItem>
                              <FormItem>
                                <FormControl>
                                  <Label
                                    htmlFor="tarjeta"
                                    className={`flex items-center gap-3 border rounded-lg p-4 cursor-pointer transition-colors ${field.value === 'tarjeta' ? 'bg-accent/10 border-accent' : 'hover:bg-muted/50'}`}
                                  >
                                    <RadioGroupItem value="tarjeta" id="tarjeta" />
                                    <CreditCard className="h-5 w-5" />
                                    <div className="flex-1">
                                      <p className="font-semibold text-sm">Tarjeta</p>
                                      <p className="text-xs text-muted-foreground">Pago con tarjeta de débito/crédito</p>
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
                  </div>
                )}

                {paymentMethod === 'cash-on-delivery' && (
                  <div className="mt-8 space-y-4 animate-in fade-in duration-300">
                    <h3 className="text-lg font-semibold">Detalles de Envío</h3>
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <Label>Nombre Completo</Label>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <Label>Dirección de Entrega</Label>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <Label>Teléfono de Contacto</Label>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <OrderSummary>
              <Button type="submit" className="w-full mt-6" size="lg" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Confirmando...
                  </>
                ) : (
                  'Confirmar Pedido'
                )}
              </Button>
            </OrderSummary>
          </div>
        </form>
      </Form>
    </>
  );
}
