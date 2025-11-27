'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useState, useRef } from 'react';

import type { Product, Category, Location } from '@/lib/types';
import { saveProduct } from '@/lib/actions';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Upload, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

type ProductFormProps = {
  product?: Product;
  categories: Category[];
  locations: Location[];
};

const ProductFormSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().min(1, 'El nombre es requerido'),
    category: z.string().min(1, 'La categoría es requerida'),
    location: z.string().min(1, 'La ubicación es requerida'),
    // basePrice = costo del producto
    basePrice: z.coerce.number().positive('El costo debe ser positivo'),
    quantity: z
      .coerce.number()
      .int()
      .nonnegative('La cantidad no puede ser negativa'),
    minStock: z
      .coerce.number()
      .int()
      .nonnegative('El stock mín. no puede ser negativo'),
    description: z.string().min(1, 'La descripción es requerida'),
    imageType: z.enum(['URL', 'FILE']).optional(),
    imageUrl: z.string().optional(),
    imageFile: z.string().optional(),
  })
  .refine(
    (data) => {
      // Validate based on image type
      if (data.imageType === 'URL' && data.imageUrl) {
        try {
          new URL(data.imageUrl);
          return true;
        } catch {
          return false;
        }
      }
      if (data.imageType === 'FILE' && data.imageFile) {
        return data.imageFile.startsWith('/uploads/');
      }
      // Allow no image
      return !data.imageType || (!data.imageUrl && !data.imageFile);
    },
    {
      message: 'Imagen inválida',
      path: ['imageUrl'],
    }
  );

type ProductFormData = z.infer<typeof ProductFormSchema>;

export default function ProductForm({
  product,
  categories,
  locations,
}: ProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(
    product?.imageType === 'FILE' && product?.imageFile
      ? product.imageFile
      : product?.imageType === 'URL' && product?.imageUrl
      ? product.imageUrl
      : null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProductFormData>({
    resolver: zodResolver(ProductFormSchema),
    defaultValues: {
      id: product?.id,
      name: product?.name ?? '',
      category: product?.category ?? '',
      location: product?.location ?? '',
      // Para productos existentes, si hay basePrice úsalo; si no, usar price como aproximación de costo
      basePrice: ((product?.basePrice ?? product?.price) as any),
      quantity: (product?.quantity as any),
      minStock: (product?.minStock as any),
      description: product?.description ?? '',
      imageType: product?.imageType,
      imageUrl: product?.imageUrl ?? '',
      imageFile: product?.imageFile ?? '',
    },
  });

  // Estados locales para el cálculo de ganancia
  const [profitPercentage, setProfitPercentage] = useState<string>('');
 
  const watchedImageUrl = watch('imageUrl');
  const watchedBasePrice = watch('basePrice');
 
  // Cálculo en tiempo real del precio final según la fórmula:
  // precioFinal = precioBase / (1 - porcentaje/100)
  const finalPricePreview = (() => {
    const base = Number(watchedBasePrice);
    const pct = Number(profitPercentage.replace(',', '.'));

    if (!base || Number.isNaN(base) || base <= 0) return null;
    if (Number.isNaN(pct) || pct <= 0 || pct >= 100) return null;

    const margin = pct / 100;
    const final = base / (1 - margin);
    if (!Number.isFinite(final) || final <= 0) return null;

    return Math.round(final);
  })();

  // Update image preview when imageUrl changes
  useEffect(() => {
    setImagePreview(watchedImageUrl || null);
  }, [watchedImageUrl]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        variant: 'destructive',
        title: 'Tipo de archivo no válido',
        description: 'Solo se permiten imágenes JPEG, PNG y WebP.',
      });
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        variant: 'destructive',
        title: 'Archivo demasiado grande',
        description: 'El tamaño máximo permitido es 5MB.',
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        // Set file type and file path, clear URL
        setValue('imageType', 'FILE');
        setValue('imageFile', result.url);
        setValue('imageUrl', '');
        setImagePreview(result.url);
        toast({
          title: 'Imagen subida exitosamente',
          description: 'La imagen se ha subido correctamente.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error al subir imagen',
          description: result.error || 'No se pudo subir la imagen.',
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        variant: 'destructive',
        title: 'Error al subir imagen',
        description: 'Ocurrió un error inesperado.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlChange = (url: string) => {
    if (url.trim()) {
      // Set URL type and URL, clear file
      setValue('imageType', 'URL');
      setValue('imageUrl', url);
      setValue('imageFile', '');
      setImagePreview(url);
    } else {
      // Clear all image fields if URL is empty
      setValue('imageType', undefined);
      setValue('imageUrl', '');
      setValue('imageFile', '');
      setImagePreview(null);
    }
    // Clear file input when user types URL manually
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = () => {
    setValue('imageType', undefined);
    setValue('imageUrl', '');
    setValue('imageFile', '');
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processForm = async (data: ProductFormData) => {
    setIsSubmitting(true);
 
    try {
      // Calculamos costo (basePrice), margen (marginPct) y precio final (price)
      const rawBase = Number(data.basePrice);
      if (Number.isNaN(rawBase) || rawBase <= 0) {
        throw new Error('Costo inválido');
      }
 
      let basePrice = rawBase;
      let marginDecimal: number | undefined;
      let finalPrice: number;
 
      const trimmedPct = profitPercentage.trim();
      const existingMargin =
        typeof product?.marginPct === 'number' && product.marginPct > 0
          ? product.marginPct
          : undefined;
 
      if (trimmedPct) {
        // Usuario indicó un nuevo porcentaje de ganancia
        const pctNumber = Number(trimmedPct.replace(',', '.'));
        if (!Number.isNaN(pctNumber) && pctNumber > 0 && pctNumber < 100) {
          marginDecimal = pctNumber / 100;
          finalPrice = basePrice / (1 - marginDecimal);
        } else {
          marginDecimal = undefined;
          finalPrice = basePrice;
        }
      } else if (product && existingMargin) {
        // Editando producto: sin nuevo porcentaje, conservar margen existente
        marginDecimal = existingMargin;
        finalPrice = basePrice / (1 - marginDecimal);
      } else {
        // Producto nuevo sin porcentaje: vender al costo (sin ganancia)
        marginDecimal = undefined;
        finalPrice = basePrice;
      }
 
      // Redondeamos al entero más cercano para el precio de venta
      const roundedFinalPrice = Math.max(1, Math.round(finalPrice));
 
      const formData = new FormData();
 
      // Add basic fields
      if (data.id) formData.append('id', data.id);
      formData.append('name', data.name);
      formData.append('description', data.description);
      // Enviamos al backend:
      // - price: precio final de venta
      // - basePrice: costo
      // - marginPct: porcentaje en decimal (0.3 = 30%)
      formData.append('price', String(roundedFinalPrice));
      formData.append('basePrice', String(basePrice));
      if (marginDecimal !== undefined) {
        formData.append('marginPct', String(marginDecimal));
      }
      formData.append('quantity', String(data.quantity));
      formData.append('minStock', String(data.minStock));
      formData.append('category', data.category);
      formData.append('location', data.location);

      // Add image fields only if they exist
      if (data.imageType) {
        formData.append('imageType', data.imageType);
        if (data.imageType === 'URL' && data.imageUrl) {
          formData.append('imageUrl', data.imageUrl);
        } else if (data.imageType === 'FILE' && data.imageFile) {
          formData.append('imageFile', data.imageFile);
        }
      }

      const result = await saveProduct({ message: '', errors: {} }, formData);

      if (result.message.startsWith('Validation')) {
        toast({
          variant: 'destructive',
          title: 'Error de Validación',
          description: 'Por favor, revise el formulario por errores.',
        });
      } else if (result.message.startsWith('Error de base de datos')) {
        toast({
          variant: 'destructive',
          title: 'Error de Base de Datos',
          description: result.message,
        });
      } else if (result.message) {
        // Success case - redirect should happen automatically from the server action
        toast({
          title: 'Producto guardado',
          description: 'El producto se ha guardado exitosamente.',
        });
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        variant: 'destructive',
        title: 'Error al guardar',
        description: 'Ocurrió un error inesperado al guardar el producto.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(processForm)} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detalles del Producto</CardTitle>
              <CardDescription>
                Ingrese los detalles principales de su producto.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre del Producto</Label>
                <Input
                  id="name"
                  placeholder="Ej. Taladro percutor 1/2"
                  {...register('name')}
                />
                {errors.name && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Categoría</Label>
                  <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Seleccione una categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.category && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.category.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="location">Ubicación</Label>
                  <Controller
                    name="location"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger id="location">
                          <SelectValue placeholder="Seleccione una ubicación" />
                        </SelectTrigger>
                        <SelectContent>
                          {locations.map((loc) => (
                            <SelectItem key={loc.id} value={loc.id}>
                              {loc.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.location && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.location.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label>Imagen del Producto</Label>
                <div className="mt-2">
                  {/* Image Preview */}
                  {imagePreview && (
                    <div className="relative mb-4">
                      <div className="relative w-full h-48 border border-border rounded-lg overflow-hidden">
                        <Image
                          src={imagePreview}
                          alt="Vista previa"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={removeImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {/* File Upload */}
                  <div className="space-y-2">
                    <Input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      ref={fileInputRef}
                      className="hidden"
                      id="image-file"
                    />
                    <Label
                      htmlFor="image-file"
                      className="flex items-center justify-center w-full h-24 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-accent transition-colors"
                    >
                      <div className="text-center">
                        {isUploading ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>Subiendo...</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Upload className="h-5 w-5 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {imagePreview ? 'Cambiar imagen' : 'Seleccionar imagen'}
                            </span>
                          </div>
                        )}
                      </div>
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Formatos permitidos: JPEG, PNG, WebP. Tamaño máximo: 5MB
                    </p>
                  </div>

                  {/* URL Input as Alternative */}
                  <div className="mt-4 pt-4 border-t">
                    <Label className="text-sm text-muted-foreground">
                      O ingresa una URL de imagen externa
                    </Label>
                    <Input
                      id="imageUrl"
                      value={watch('imageUrl') || ''}
                      onChange={(e) => handleUrlChange(e.target.value)}
                      placeholder="https://ejemplo.com/imagen.jpg"
                      className="mt-1"
                    />
                    {errors.imageUrl && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.imageUrl.message}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Ingresa la URL completa de una imagen alojada en otro
                      sitio web
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label htmlFor="description">Descripción</Label>
                </div>
                <Textarea
                  id="description"
                  {...register('description')}
                  rows={6}
                  placeholder="Describe el producto, sus características y usos principales"
                />
                {errors.description && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.description.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Stock y Precios</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="basePrice">Precio base (costo)</Label>
                <Input
                  id="basePrice"
                  type="number"
                  step="0.01"
                  placeholder="Ej. 20000"
                  {...register('basePrice')}
                />
                {errors.basePrice && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.basePrice.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="profitPercent">Porcentaje de ganancia (%)</Label>
                <Input
                  id="profitPercent"
                  type="number"
                  step="0.01"
                  value={profitPercentage}
                  onChange={(e) => setProfitPercentage(e.target.value)}
                  placeholder="Ej. 30 para 30%"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Fórmula: precio final = precio base / (1 - porcentaje/100).
                </p>
                {finalPricePreview !== null && (
                  <p className="text-sm mt-1">
                    Precio final estimado:{' '}
                    <span className="font-semibold">
                      $
                      {finalPricePreview.toLocaleString('es-CO', {
                        maximumFractionDigits: 0,
                      })}
                    </span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">Cantidad</Label>
                  <Input
                    id="quantity"
                    type="number"
                    placeholder="Ej. 10"
                    {...register('quantity')}
                  />
                  {errors.quantity && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.quantity.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="minStock">Stock Mín.</Label>
                  <Input
                    id="minStock"
                    type="number"
                    placeholder="Ej. 2"
                    {...register('minStock')}
                  />
                  {errors.minStock && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.minStock.message}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/dashboard/products')}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {product ? 'Guardar Cambios' : 'Crear Producto'}
        </Button>
      </div>
    </form>
  );
}
