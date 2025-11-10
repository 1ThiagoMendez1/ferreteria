'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { addProduct, updateProduct, deleteProduct as deleteProductFromDb, addOrder, addConsultation, updateOrderStatus } from './data';
import type { Product, CartItem } from './types';

const ProductSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres.'),
  price: z.coerce.number().positive('El precio debe ser un número positivo.'),
  quantity: z.coerce.number().int().nonnegative('La cantidad debe ser un número entero.'),
  minStock: z.coerce.number().int().nonnegative('El stock mínimo debe ser un número entero.'),
  category: z.string().min(1, 'Por favor seleccione una categoría.'),
  location: z.string().min(1, 'Por favor seleccione una ubicación.'),
  imageType: z.enum(['URL', 'FILE']).optional(),
  imageUrl: z.string().optional(),
  imageFile: z.string().optional(),
}).refine(data => {
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
}, {
  message: 'Imagen inválida',
  path: ['imageUrl'],
});

export type FormState = {
  message: string;
  errors?: Record<string, string[] | undefined>;
};

export async function saveProduct(prevState: FormState, formData: FormData): Promise<FormState> {
  const rawData = Object.fromEntries(formData.entries());
  console.log('Raw form data:', rawData);

  const validatedFields = ProductSchema.safeParse(rawData);

  if (!validatedFields.success) {
    console.log('Validation errors:', validatedFields.error.flatten().fieldErrors);
    return {
      message: 'Error de validación: no se pudo guardar el producto.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { data } = validatedFields;
  console.log('Validated data:', data);

  try {
    if (data.id) {
      // Update existing product
      console.log('Updating product:', data.id);
      await updateProduct(data.id, data as Partial<Product>);
    } else {
      // Create new product
      console.log('Creating new product');
      await addProduct(data as Omit<Product, 'id'>);
    }
    console.log('Product saved successfully');
  } catch (e) {
    console.error('Database error:', e);
    return { message: 'Error de base de datos: no se pudo guardar el producto.' };
  }

  revalidatePath('/dashboard/products');
  redirect('/dashboard/products');
}


export async function deleteProduct(id: string) {
    if (!id) {
        return { message: 'Error: Falta el ID del producto.' };
    }
    try {
        await deleteProductFromDb(id);
        revalidatePath('/dashboard/products');
        return { message: 'Producto eliminado exitosamente.' };
    } catch (e) {
        return { message: 'Error de base de datos: no se pudo eliminar el producto.' };
    }
}

const CheckoutSchema = z.object({
  paymentMethod: z.enum(['efectivo', 'nequi', 'daviplata', 'tarjeta', 'cash-on-delivery']),
  fullName: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  items: z.string(),
  total: z.coerce.number(),
}).refine(data => {
  if (data.paymentMethod === 'cash-on-delivery') {
    return !!data.fullName && !!data.address && !!data.phone;
  }
  return true;
}, {
  message: 'Nombre, dirección y teléfono son requeridos para pago contraentrega.',
  path: ['fullName'],
});


export async function createOrderAction(data: { [key: string]: any }) {
    const validatedFields = CheckoutSchema.safeParse(data);

    if (!validatedFields.success) {
        return { success: false, error: 'Datos de pedido inválidos.', details: validatedFields.error.flatten() };
    }
    
    const { items, total, paymentMethod, fullName, address, phone } = validatedFields.data;

    try {
        const parsedItems: CartItem[] = JSON.parse(items);

        const newOrder = await addOrder({
            items: parsedItems,
            total,
            paymentMethod,
            customer: { fullName, address, phone }
        });

        revalidatePath('/dashboard/orders');
        return { success: true, orderId: newOrder.id, orderCode: newOrder.orderCode };
    } catch (error) {
        console.error('Failed to create order:', error);
        return { success: false, error: 'No se pudo crear el pedido.' };
    }
}

const ConsultationSchema = z.object({
  name: z.string().min(2, "El nombre es requerido."),
  email: z.string().email("El correo electrónico no es válido."),
  phone: z.string().min(7, "El teléfono no es válido."),
  diagnosis: z.string().optional(),
});


export async function createConsultationAction(data: { [key: string]: any }) {
  const validatedFields = ConsultationSchema.safeParse(data);

  if (!validatedFields.success) {
      return { success: false, error: 'Datos inválidos.', details: validatedFields.error.flatten() };
  }

  try {
      const newConsultation = await addConsultation(validatedFields.data);
      revalidatePath('/dashboard/consultations');
      return { success: true, consultation: newConsultation };
  } catch (error) {
      console.error('Failed to create consultation request:', error);
      return { success: false, error: 'No se pudo enviar la solicitud.' };
  }
}

export async function updateOrderStatusAction(orderId: string, status: 'solicitado' | 'en-proceso' | 'entregado') {
  try {
    const updatedOrder = await updateOrderStatus(orderId, status);
    if (!updatedOrder) {
      return { success: false, error: 'No se pudo actualizar el estado del pedido.' };
    }
    revalidatePath('/dashboard/orders');
    return { success: true, order: updatedOrder };
  } catch (error) {
    console.error('Failed to update order status:', error);
    return { success: false, error: 'Error al actualizar el estado del pedido.' };
  }
}

const ManualSaleSchema = z.object({
  paymentMethod: z.enum(['efectivo', 'nequi', 'daviplata', 'tarjeta', 'cash-on-delivery']),
  customerName: z.string().optional(),
  customerAddress: z.string().optional(),
  customerPhone: z.string().optional(),
  items: z.string(),
  total: z.coerce.number(),
}).refine(data => {
  if (data.paymentMethod === 'cash-on-delivery') {
    return !!data.customerName && !!data.customerAddress && !!data.customerPhone;
  }
  return true;
}, {
  message: 'Nombre, dirección y teléfono son requeridos para pago contraentrega.',
  path: ['customerName'],
});

export async function createManualSaleAction(data: { [key: string]: any }) {
  const validatedFields = ManualSaleSchema.safeParse(data);

  if (!validatedFields.success) {
    return { success: false, error: 'Datos de venta inválidos.', details: validatedFields.error.flatten() };
  }

  const { items, total, paymentMethod, customerName, customerAddress, customerPhone } = validatedFields.data;

  try {
    const parsedItems: CartItem[] = JSON.parse(items);

    const newOrder = await addOrder({
      items: parsedItems,
      total,
      paymentMethod,
      customer: { fullName: customerName, address: customerAddress, phone: customerPhone }
    });

    revalidatePath('/dashboard/orders');
    revalidatePath('/dashboard/sales');
    return { success: true, orderId: newOrder.id, orderCode: newOrder.orderCode };
  } catch (error) {
    console.error('Failed to create manual sale:', error);
    return { success: false, error: 'No se pudo registrar la venta.' };
  }
}
