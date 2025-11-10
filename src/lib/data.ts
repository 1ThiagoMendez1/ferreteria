import type { Product, Category, Location, Order, CartItem, OrderStatus, Consultation } from './types';
import { prisma } from './prisma';

// Enum mapping constants
const PAYMENT_METHOD_MAP = {
  'efectivo': 'EFECTIVO' as const,
  'nequi': 'NEQUI' as const,
  'daviplata': 'DAVIPLATA' as const,
  'tarjeta': 'TARJETA' as const,
  'store-pickup': 'STORE_PICKUP' as const,
  'cash-on-delivery': 'CASH_ON_DELIVERY' as const
};

const PAYMENT_METHOD_REVERSE_MAP = {
  'EFECTIVO': 'efectivo' as const,
  'NEQUI': 'nequi' as const,
  'DAVIPLATA': 'daviplata' as const,
  'TARJETA': 'tarjeta' as const,
  'CASH_ON_DELIVERY': 'cash-on-delivery' as const,
  // Legacy mappings for backward compatibility
  'STORE_PICKUP': 'efectivo' as const,
};

const ORDER_STATUS_MAP = {
  'solicitado': 'SOLICITADO' as const,
  'en-proceso': 'EN_PROCESO' as const,
  'entregado': 'ENTREGADO' as const
};

const ORDER_STATUS_REVERSE_MAP = {
  'SOLICITADO': 'solicitado' as const,
  'EN_PROCESO': 'en-proceso' as const,
  'ENTREGADO': 'entregado' as const
};

// Generate unique order code
async function generateOrderCode(): Promise<string> {
  let code: string;
  let exists: any;

  do {
    // Generate 8-character alphanumeric code
    code = Math.random().toString(36).substring(2, 10).toUpperCase();
    exists = await prisma.order.findUnique({
      where: { orderCode: code }
    });
  } while (exists);

  return code;
}

// --- Data Access Functions ---

// Server-side data access functions
export async function getProducts(query?: string, category?: string) {
  try {
    const where: any = {};

    if (query) {
      where.name = {
        contains: query,
        mode: 'insensitive'
      };
    }

    if (category) {
      where.categoryId = category;
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        location: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      quantity: product.quantity,
      minStock: product.minStock,
      category: product.category.id,
      location: product.location.id,
      imageType: product.imageType,
      imageUrl: product.imageUrl,
      imageFile: product.imageFile,
      imageHint: product.imageHint
    }));
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export async function getProductById(id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        location: true
      }
    });

    if (!product) return null;

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      quantity: product.quantity,
      minStock: product.minStock,
      category: product.category.id,
      location: product.location.id,
      imageType: product.imageType,
      imageUrl: product.imageUrl,
      imageFile: product.imageFile,
      imageHint: product.imageHint
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

export async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    return categories.map(category => ({
      id: category.id,
      name: category.name,
      icon: category.icon
    }));
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export async function getLocations() {
  try {
    const locations = await prisma.location.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    return locations.map(location => ({
      id: location.id,
      name: location.name
    }));
  } catch (error) {
    console.error('Error fetching locations:', error);
    return [];
  }
}

export async function getStockAlerts() {
  try {
    const products = await prisma.product.findMany({
      where: {
        quantity: {
          lte: prisma.product.fields.minStock
        }
      },
      include: {
        category: true,
        location: true
      }
    });

    return products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      quantity: product.quantity,
      minStock: product.minStock,
      category: product.category.id,
      location: product.location.id,
      imageType: product.imageType,
      imageUrl: product.imageUrl,
      imageFile: product.imageFile,
      imageHint: product.imageHint
    }));
  } catch (error) {
    console.error('Error fetching stock alerts:', error);
    return [];
  }
}

export async function getOrders() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return orders.map(order => ({
      id: order.id,
      orderCode: order.orderCode,
      date: order.date.toISOString(),
      status: ORDER_STATUS_REVERSE_MAP[order.status],
      total: order.total,
      paymentMethod: PAYMENT_METHOD_REVERSE_MAP[order.paymentMethod],
      customer: {
        fullName: order.customerName || undefined,
        address: order.customerAddress || undefined,
        phone: order.customerPhone || undefined
      },
      items: order.items.map(item => ({
        product: {
          id: item.product.id,
          name: item.product.name,
          description: item.product.description,
          price: item.product.price,
          quantity: item.product.quantity,
          minStock: item.product.minStock,
          category: item.product.categoryId,
          location: item.product.locationId,
          imageType: item.product.imageType,
          imageUrl: item.product.imageUrl,
          imageFile: item.product.imageFile,
          imageHint: item.product.imageHint
        },
        quantity: item.quantity
      }))
    }));
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
}

export async function getConsultations() {
  try {
    const consultations = await prisma.consultation.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    return consultations.map(consultation => ({
      id: consultation.id,
      date: consultation.date.toISOString(),
      name: consultation.name,
      email: consultation.email,
      phone: consultation.phone,
      diagnosis: consultation.diagnosis,
      status: consultation.status.toLowerCase() as 'pending' | 'contacted'
    }));
  } catch (error) {
    console.error('Error fetching consultations:', error);
    return [];
  }
}

// --- Data Mutation Functions (for server actions) ---

export async function addProduct(product: Omit<Product, 'id'>) {
  try {
    const newProduct = await prisma.product.create({
      data: {
        name: product.name,
        description: product.description,
        price: product.price,
        quantity: product.quantity,
        minStock: product.minStock,
        categoryId: product.category,
        locationId: product.location,
        imageType: product.imageType,
        imageUrl: product.imageUrl,
        imageFile: product.imageFile,
        imageHint: product.imageHint || "product"
      },
      include: {
        category: true,
        location: true
      }
    });

    return {
      id: newProduct.id,
      name: newProduct.name,
      description: newProduct.description,
      price: newProduct.price,
      quantity: newProduct.quantity,
      minStock: newProduct.minStock,
      category: newProduct.category.id,
      location: newProduct.location.id,
      imageType: newProduct.imageType,
      imageUrl: newProduct.imageUrl,
      imageFile: newProduct.imageFile,
      imageHint: newProduct.imageHint
    };
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
}

export async function updateProduct(id: string, productUpdate: Partial<Product>) {
  try {
    const updateData: any = {};

    if (productUpdate.name) updateData.name = productUpdate.name;
    if (productUpdate.description) updateData.description = productUpdate.description;
    if (productUpdate.price !== undefined) updateData.price = productUpdate.price;
    if (productUpdate.quantity !== undefined) updateData.quantity = productUpdate.quantity;
    if (productUpdate.minStock !== undefined) updateData.minStock = productUpdate.minStock;
    if (productUpdate.category) updateData.categoryId = productUpdate.category;
    if (productUpdate.location) updateData.locationId = productUpdate.location;
    if (productUpdate.imageType) updateData.imageType = productUpdate.imageType;
    if (productUpdate.imageUrl !== undefined) updateData.imageUrl = productUpdate.imageUrl;
    if (productUpdate.imageFile !== undefined) updateData.imageFile = productUpdate.imageFile;
    if (productUpdate.imageHint) updateData.imageHint = productUpdate.imageHint;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        location: true
      }
    });

    return {
      id: updatedProduct.id,
      name: updatedProduct.name,
      description: updatedProduct.description,
      price: updatedProduct.price,
      quantity: updatedProduct.quantity,
      minStock: updatedProduct.minStock,
      category: updatedProduct.category.id,
      location: updatedProduct.location.id,
      imageType: updatedProduct.imageType,
      imageUrl: updatedProduct.imageUrl,
      imageFile: updatedProduct.imageFile,
      imageHint: updatedProduct.imageHint
    };
  } catch (error) {
    console.error('Error updating product:', error);
    return null;
  }
}

export async function deleteProduct(id: string) {
  try {
    await prisma.product.delete({
      where: { id }
    });
    return true;
  } catch (error) {
    console.error('Error deleting product:', error);
    return false;
  }
}

type NewOrderData = {
  items: CartItem[];
  total: number;
  paymentMethod: 'efectivo' | 'nequi' | 'daviplata' | 'tarjeta' | 'cash-on-delivery';
  customer: {
      fullName?: string;
      address?: string;
      phone?: string;
  };
}

export async function addOrder(orderData: NewOrderData) {
  try {
    // Generate unique order code
    const orderCode = await generateOrderCode();

    const order = await prisma.order.create({
      data: {
        orderCode,
        status: 'SOLICITADO',
        total: orderData.total,
        paymentMethod: PAYMENT_METHOD_MAP[orderData.paymentMethod],
        customerName: orderData.customer.fullName,
        customerAddress: orderData.customer.address,
        customerPhone: orderData.customer.phone,
        items: {
          create: orderData.items.map(item => ({
            quantity: item.quantity,
            productId: item.product.id
          }))
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    // Update product quantities
    for (const item of orderData.items) {
      await prisma.product.update({
        where: { id: item.product.id },
        data: {
          quantity: {
            decrement: item.quantity
          }
        }
      });
    }

    return {
      id: order.id,
      orderCode: order.orderCode,
      date: order.date.toISOString(),
      status: ORDER_STATUS_REVERSE_MAP[order.status],
      total: order.total,
      paymentMethod: PAYMENT_METHOD_REVERSE_MAP[order.paymentMethod],
      customer: {
        fullName: order.customerName || undefined,
        address: order.customerAddress || undefined,
        phone: order.customerPhone || undefined
      },
      items: order.items.map(item => ({
        product: {
          id: item.product.id,
          name: item.product.name,
          description: item.product.description,
          price: item.product.price,
          quantity: item.product.quantity,
          minStock: item.product.minStock,
          category: item.product.categoryId,
          location: item.product.locationId,
          imageUrl: item.product.imageUrl,
          imageHint: item.product.imageHint
        },
        quantity: item.quantity
      }))
    };
  } catch (error) {
    console.error('Error adding order:', error);
    throw error;
  }
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  try {
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: ORDER_STATUS_MAP[status]
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    return {
      id: updatedOrder.id,
      orderCode: updatedOrder.orderCode,
      date: updatedOrder.date.toISOString(),
      status: ORDER_STATUS_REVERSE_MAP[updatedOrder.status],
      total: updatedOrder.total,
      paymentMethod: PAYMENT_METHOD_REVERSE_MAP[updatedOrder.paymentMethod],
      customer: {
        fullName: updatedOrder.customerName || undefined,
        address: updatedOrder.customerAddress || undefined,
        phone: updatedOrder.customerPhone || undefined
      },
      items: updatedOrder.items.map(item => ({
        product: {
          id: item.product.id,
          name: item.product.name,
          description: item.product.description,
          price: item.product.price,
          quantity: item.product.quantity,
          minStock: item.product.minStock,
          category: item.product.categoryId,
          location: item.product.locationId,
          imageUrl: item.product.imageUrl,
          imageHint: item.product.imageHint
        },
        quantity: item.quantity
      }))
    };
  } catch (error) {
    console.error('Error updating order status:', error);
    return null;
  }
}

type NewConsultationData = {
  name: string;
  email: string;
  phone: string;
  diagnosis?: string;
}

export async function addConsultation(consultationData: NewConsultationData) {
  try {
    const consultation = await prisma.consultation.create({
      data: {
        name: consultationData.name,
        email: consultationData.email,
        phone: consultationData.phone,
        diagnosis: consultationData.diagnosis
      }
    });

    return {
      id: consultation.id,
      date: consultation.date.toISOString(),
      name: consultation.name,
      email: consultation.email,
      phone: consultation.phone,
      diagnosis: consultation.diagnosis,
      status: consultation.status.toLowerCase() as 'pending' | 'contacted'
    };
  } catch (error) {
    console.error('Error adding consultation:', error);
    throw error;
  }
}

export async function getPendingOrdersCount() {
  try {
    const count = await prisma.order.count({
      where: {
        status: 'SOLICITADO'
      }
    });

    return count;
  } catch (error) {
    console.error('Error fetching pending orders count:', error);
    return 0;
  }
}
