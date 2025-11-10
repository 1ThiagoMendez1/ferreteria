import Link from 'next/link';
import { Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CartSheet } from './cart-sheet';

export default function MainHeader() {
  return (
    <header className="bg-card/80 border-b border-border/50 sticky top-0 z-20 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="flex items-center gap-2 group">
            <Wrench className="h-7 w-7 text-accent group-hover:rotate-[-15deg] transition-transform" />
            <span className="text-xl font-bold tracking-tight text-foreground">
              TresEtapas
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost">
              <Link href="/dashboard">Ir al Panel de Control</Link>
            </Button>
            <CartSheet />
          </div>
        </div>
      </div>
    </header>
  );
}
