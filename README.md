# TresEtapas

Sistema completo de gestión para ferreterías con sitio web público y panel de administración.

## Características

- 🛠️ Catálogo de productos con descripciones detalladas
- 🛒 Carrito de compras funcional
- 📊 Panel de administración para gestionar productos, pedidos y consultas
- 🗄️ Base de datos PostgreSQL con Prisma ORM
- 🎨 Interfaz moderna con Tailwind CSS y componentes Radix UI
- 📱 Diseño responsivo

## Tecnologías

- **Frontend**: Next.js 15, React 18, TypeScript
- **Backend**: Next.js API Routes, Server Actions
- **Base de datos**: PostgreSQL con Prisma ORM
- **UI**: Tailwind CSS, Radix UI, Lucide Icons
- **IA**: Google AI (Gemini) para generación de descripciones de productos

## Instalación

1. Clona el repositorio
2. Instala las dependencias: `npm install`
3. Configura la base de datos PostgreSQL (ver DATABASE_SETUP.md)
4. Ejecuta las migraciones: `npm run db:migrate`
5. Ejecuta el seeder: `npm run db:seed`
6. Inicia el servidor de desarrollo: `npm run dev`

Para más detalles, consulta el archivo `DATABASE_SETUP.md`.
