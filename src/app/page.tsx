
import MainHeader from '@/components/main-header';
import ProductCatalog from '@/components/product-catalog';
import { getProducts, getCategories, getLocations } from '@/lib/data';
import type { Product as ProductType } from '@/lib/types';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { HardHat, Users, Wrench, CalendarCheck } from 'lucide-react';
import MainFooter from '@/components/main-footer';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import ConsultationRequestForm from '@/components/consultation-request-form';


export default async function Home() {
  const products = await getProducts();
  const categories = await getCategories();
  const locations = await getLocations();

  // Use a static hero image
  const heroImage = {
    imageUrl: "https://images.pexels.com/photos/159358/construction-site-build-construction-work-159358.jpeg",
    description: "Sitio de construcción profesional",
    imageHint: "construction site"
  };

  // Use fallback images for brand logos since we start with empty database
  type BrandLogo = { src: string; alt: string; hint: string };

  const brandLogos: BrandLogo[] = [
    { src: "https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg", alt: "Herramientas profesionales", hint: "professional tools" },
    { src: "https://images.pexels.com/photos/209235/pexels-photo-209235.jpeg", alt: "Materiales de construcción", hint: "building materials" },
    { src: "https://images.pexels.com/photos/569158/pexels-photo-569158.jpeg", alt: "Pintura y acabados", hint: "paint and finishes" },
    { src: "https://images.pexels.com/photos/39691/pexels-photo-39691.jpeg", alt: "Plomería profesional", hint: "professional plumbing" },
    { src: "https://images.pexels.com/photos/39693/pexels-photo-39693.jpeg", alt: "Electricidad residencial", hint: "residential electricity" },
    { src: "https://images.pexels.com/photos/39694/pexels-photo-39694.jpeg", alt: "Herramientas eléctricas", hint: "power tools" },
  ];

  // If we have products in the database, use some of them for brand logos.
  // Solo usamos productos que tengan una imageUrl no vacía para evitar src = "".
  if (products.length > 0) {
    const productLogos: BrandLogo[] = products
      .filter((product) => product.imageUrl && product.imageUrl.trim() !== '')
      .slice(0, 3)
      .map((product) => ({
        src: product.imageUrl!, // no puede ser null/"" gracias al filter
        alt: product.name,
        hint: product.imageHint,
      }));

    if (productLogos.length > 0) {
      brandLogos.splice(0, productLogos.length, ...productLogos);
    }
  }

  const logosToRender = brandLogos;

  // Normalizamos productos para que coincidan con el tipo ProductType
  // (evitamos null en imageType/imageUrl/imageFile)
  const normalizedProducts: ProductType[] = products.map((p: any) => ({
    ...p,
    imageType: p.imageType ?? undefined,
    imageUrl: p.imageUrl ?? undefined,
    imageFile: p.imageFile ?? undefined,
  }));

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <MainHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[70vh] w-full flex items-center justify-center text-center text-white bg-black">
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            fill
            className="object-cover opacity-30"
            priority
            data-ai-hint={heroImage.imageHint}
          />
          <div className="relative z-10 p-4">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-4 text-shadow">
              TU PROYECTO COMIENZA AQUÍ
            </h1>
            <p className="text-lg md:text-2xl max-w-3xl mx-auto mb-8 text-shadow-sm text-foreground">
              Herramientas y materiales de calidad para profesionales y aficionados por igual.
            </p>
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 text-lg font-bold">
              <Link href="#catalog">Comprar Ahora</Link>
            </Button>
          </div>
        </section>
        
        {/* About Us Section */}
        <section id="about" className="py-20 lg:py-28 concrete-texture">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-extrabold mb-4 tracking-tight">QUIÉNES SOMOS</h2>
                <p className="text-muted-foreground mb-4 text-lg">
                  TresEtapas es más que una tienda; somos un socio en tus proyectos de construcción y renovación. Fundados en los principios de calidad, confiabilidad y servicio, hemos estado suministrando a nuestra comunidad las mejores herramientas y materiales durante más de 20 años.
                </p>
                <p className="text-muted-foreground text-lg">
                  Nuestro equipo de expertos es un apasionado de la construcción y siempre está listo para ofrecer consejos y soluciones para ayudarte a hacer el trabajo bien.
                </p>
              </div>
              <div className="relative group">
                 <div className="absolute -inset-0.5 bg-gradient-to-r from-accent to-yellow-600 rounded-lg blur opacity-50 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                 <Image
                    src="https://images.pexels.com/photos/175039/pexels-photo-175039.jpeg"
                    alt="Frente de la tienda TresEtapas"
                    width={600}
                    height={400}
                    className="rounded-lg shadow-lg relative object-cover"
                    data-ai-hint="storefront building"
                  />
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-20 lg:py-28 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-extrabold mb-12 tracking-tight">TU SOCIO EN LA CONSTRUCCIÓN</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center p-6 border border-border rounded-lg bg-card/5">
                <div className="bg-accent/10 p-4 rounded-full mb-4 ring-2 ring-accent">
                   <HardHat className="h-10 w-10 text-accent" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Selección Profesional</h3>
                <p className="text-muted-foreground">Desde los cimientos hasta el acabado, tenemos materiales de calidad profesional en los que puedes confiar.</p>
              </div>
              <div className="flex flex-col items-center p-6 border border-border rounded-lg bg-card/5">
                <div className="bg-accent/10 p-4 rounded-full mb-4 ring-2 ring-accent">
                  <Users className="h-10 w-10 text-accent" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Asesoramiento Experto</h3>
                <p className="text-muted-foreground">Nuestro personal experimentado ofrece recomendaciones personalizadas para las necesidades específicas de tu proyecto.</p>
              </div>
              <div className="flex flex-col items-center p-6 border border-border rounded-lg bg-card/5">
                <div className="bg-accent/10 p-4 rounded-full mb-4 ring-2 ring-accent">
                  <Wrench className="h-10 w-10 text-accent" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Las Mejores Marcas</h3>
                <p className="text-muted-foreground">Contamos con las herramientas más confiables e innovadoras de la industria para garantizar que trabajes de manera eficiente.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Consulting and Quotes Section */}
        <section id="consulting" className="py-20 lg:py-28 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-accent to-yellow-600 rounded-lg blur opacity-50 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                <Image
                  src="https://images.pexels.com/photos/8482551/pexels-photo-8482551.jpeg"
                  alt="Maestro de obra revisando planos"
                  width={600}
                  height={400}
                  className="rounded-lg shadow-lg relative object-cover"
                  data-ai-hint="construction worker plans"
                />
              </div>
              <div>
                <h2 className="text-4xl font-extrabold mb-4 tracking-tight">ASESORÍA Y COTIZACIONES A TU MEDIDA</h2>
                <p className="text-muted-foreground mb-4 text-lg">
                  ¿Tienes un gran proyecto en mente pero no sabes por dónde empezar? Nuestros maestros de construcción están aquí para guiarte. Ofrecemos asesoría completa para planificar tu obra y te ayudamos a cotizar todos los materiales que necesitas, optimizando tu presupuesto y tiempo.
                </p>
                <div className="flex items-start gap-4 p-4 rounded-lg bg-card/50 border border-border">
                    <CalendarCheck className="h-8 w-8 text-accent mt-1" />
                    <div>
                        <h4 className="font-bold text-lg">Agenda una Cita</h4>
                        <p className="text-muted-foreground">
                            Ponte en contacto con nosotros y coordina una reunión con uno de nuestros expertos para discutir los detalles de tu proyecto.
                        </p>
                    </div>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="lg" className="mt-6">Contactar a un Experto</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Solicitar Asesoría</DialogTitle>
                      <DialogDescription>
                        Completa el formulario y uno de nuestros expertos se pondrá en contacto contigo a la brevedad.
                      </DialogDescription>
                    </DialogHeader>
                    <ConsultationRequestForm />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </section>

        {/* Animated Brands Section */}
        <div className="py-16 brushed-metal overflow-hidden">
           <div className="relative">
             <div className="flex animate-marquee-infinite">
                {[...logosToRender, ...logosToRender].map((logo, index) => (
                  <div key={index} className="mx-12 flex-shrink-0 flex items-center justify-center">
                    <Image
                      src={logo.src}
                      alt={logo.alt}
                      width={120}
                      height={80}
                      className="object-contain"
                      data-ai-hint={logo.hint}
                    />
                  </div>
                ))}
             </div>
           </div>
        </div>

        {/* Product Catalog Section */}
        <section id="catalog" className="py-20 lg:py-28">
            <div className="container mx-auto px-4">
            <ProductCatalog
              products={normalizedProducts}
              categories={categories}
              locations={locations}
            />
          </div>
        </section>
      </main>
      <MainFooter />
    </div>
  );
}
