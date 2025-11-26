import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from 'sonner';
import { CartProvider } from '@/hooks/use-cart';
import Preloader from '@/components/preloader';
import { SessionProvider } from '@/components/session-provider';

export const metadata: Metadata = {
  title: 'TresEtapas',
  description:
    'El sistema completo de soluciones para tu ferretería, con un sitio web y un sitio para administrar productos.',
  icons: {
    icon: [
      { url: '/uploads/logo.png', sizes: '32x32', type: 'image/png' },
      { url: '/uploads/logo.png', sizes: '64x64', type: 'image/png' },
      { url: '/uploads/logo.png', rel: 'shortcut icon' },
    ],
    shortcut: '/uploads/logo.png',
    apple: '/uploads/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto+Condensed:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased min-h-screen">
        <Preloader />
        <SessionProvider>
          <CartProvider>
            {children}
            <Toaster />
            <SonnerToaster />
          </CartProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
