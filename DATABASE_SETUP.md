# Configuración de Base de Datos PostgreSQL

Este proyecto ha sido configurado para usar PostgreSQL con Prisma ORM. Sigue estos pasos para configurar la base de datos.

## 1. Instalar PostgreSQL

### Windows
1. Descarga PostgreSQL desde: https://www.postgresql.org/download/windows/
2. Ejecuta el instalador y sigue las instrucciones
3. Recuerda la contraseña que configures para el usuario `postgres`

### Usando Docker (Recomendado)
```bash
# Instalar PostgreSQL con Docker
docker run --name ferreteria-postgres \
  -e POSTGRES_DB=ferreteria_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=your_password \
  -p 5432:5432 \
  -d postgres:15

# Para detener el contenedor
docker stop ferreteria-postgres

# Para iniciar el contenedor
docker start ferreteria-postgres
```

## 2. Configurar Variables de Entorno

Edita el archivo `.env` y actualiza la variable `DATABASE_URL`:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/ferreteria_db?schema=public"
```

Reemplaza:
- `username`: tu usuario de PostgreSQL (normalmente `postgres`)
- `password`: tu contraseña de PostgreSQL
- `localhost:5432`: la dirección y puerto de tu servidor PostgreSQL

## 3. Crear la Base de Datos y Ejecutar Migraciones

```bash
# Crear la migración inicial
npm run db:migrate

# Esto creará las tablas en tu base de datos
```

## 4. Poblar la Base de Datos

```bash
# Ejecutar el seed para crear las categorías y ubicaciones base
npm run db:seed
```

**Nota**: El seed ahora solo crea las categorías y ubicaciones base. **No incluye productos simulados**. Los productos deben ser agregados manualmente a través de la interfaz de administración del dashboard.

## 5. Verificar la Configuración

```bash
# Abrir Prisma Studio para ver los datos
npm run db:studio
```

## Comandos Útiles

```bash
# Resetear la base de datos (elimina todos los datos y vuelve a crear las tablas)
npm run db:reset

# Generar el cliente de Prisma después de cambios en el schema
npx prisma generate

# Crear una nueva migración después de cambios en el schema
npx prisma migrate dev --name nombre_de_la_migracion

# Ver el estado de las migraciones
npx prisma migrate status
```

## Estructura de la Base de Datos

### Tablas Principales

- **products**: Productos con información de inventario *(inicialmente vacía)*
- **categories**: Categorías de productos *(6 categorías base creadas por seed)*
- **locations**: Ubicaciones en la tienda *(7 ubicaciones base creadas por seed)*
- **orders**: Pedidos de clientes
- **order_items**: Items de cada pedido
- **consultations**: Solicitudes de asesoría

### Datos Iniciales del Seed

El comando `npm run db:seed` crea automáticamente:
- ✅ **6 Categorías**: Herramientas, Plomería, Electricidad, Pintura, Materiales de Construcción, Asesorías
- ✅ **7 Ubicaciones**: Pasillos 1, 3, 5, 7, Departamento de Pintura, Patio Exterior, Almacén A
- ❌ **0 Productos**: Deben agregarse manualmente a través del dashboard de administración

### Relaciones

- Un producto pertenece a una categoría y una ubicación
- Un pedido puede tener múltiples items
- Cada item de pedido está asociado a un producto

## Solución de Problemas

### Error de Conexión
Si obtienes errores de conexión:
1. Verifica que PostgreSQL esté ejecutándose
2. Confirma que las credenciales en `DATABASE_URL` sean correctas
3. Asegúrate de que el puerto 5432 no esté bloqueado

### Error de Migración
Si las migraciones fallan:
1. Elimina la base de datos y vuelve a crearla
2. Ejecuta `npm run db:reset` para resetear completamente

### Puerto Ocupado
Si el puerto 5432 está ocupado:
1. Cambia el puerto en Docker: `-p 5433:5432`
2. O actualiza el `DATABASE_URL` para usar el nuevo puerto

## Configuración de Producción

Para producción, considera usar:
- **Supabase**: PostgreSQL como servicio
- **Neon**: PostgreSQL serverless
- **PlanetScale**: Compatible con Prisma
- **AWS RDS**: PostgreSQL en la nube

Actualiza el `DATABASE_URL` con la cadena de conexión de tu proveedor.