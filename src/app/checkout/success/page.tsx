import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import MainHeader from '@/components/main-header';
import MainFooter from '@/components/main-footer';

export default function CheckoutSuccessPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
       <MainHeader />
       <main className="flex-1 flex items-center justify-center">
            <Card className="w-full max-w-lg text-center p-8">
                <CardHeader>
                    <div className="mx-auto bg-green-100 dark:bg-green-900/20 p-3 rounded-full mb-4">
                        <CheckCircle className="h-12 w-12 text-green-500" />
                    </div>
                    <CardTitle className="text-3xl">¡Pedido Confirmado!</CardTitle>
                    <CardDescription className="text-lg text-muted-foreground">
                        Gracias por tu compra. Hemos recibido tu pedido.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="mb-6">
                        Recibirás una notificación cuando tu pedido esté listo para ser recogido o en camino.
                    </p>
                    <Button asChild size="lg">
                        <Link href="/">Volver a la Tienda</Link>
                    </Button>
                </CardContent>
            </Card>
       </main>
       <MainFooter />
    </div>
  );
}
