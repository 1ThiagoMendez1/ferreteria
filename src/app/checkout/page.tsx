import MainHeader from '@/components/main-header';
import CheckoutForm from '@/components/checkout-form';
import PageHeader from '@/components/page-header';
import MainFooter from '@/components/main-footer';

export default function CheckoutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <MainHeader />
      <main className="flex-1 py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <PageHeader title="Finalizar Compra" />
          <CheckoutForm />
        </div>
      </main>
      <MainFooter />
    </div>
  );
}
