import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { CartSheet } from './cart-sheet';

export default function MainHeader() {
  return (
    <header className="bg-card/80 border-b border-border/50 sticky top-0 z-20 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/uploads/logo.png"
              alt="Logo del sistema"
              width={48}
              height={48}
              className="rounded-sm group-hover:scale-105 transition-transform"
            />
            <span className="text-2xl font-bold tracking-tight text-foreground">
              TresEtapas
            </span>
          </Link>
          <div className="flex items-center gap-4">
            {/* Acceso directo al panel ocultado a petición del usuario */}
            <CartSheet />
          </div>
        </div>
      </div>
    </header>
  );
}
