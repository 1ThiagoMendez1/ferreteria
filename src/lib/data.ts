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

    return products.map(product => {
      const p = product as any;
      return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        basePrice: p.basePrice ?? undefined,
        marginPct: p.marginPct ?? undefined,
        quantity: product.quantity,
        minStock: product.minStock,
        category: product.category.id,
        location: product.location.id,
        imageType: product.imageType,
        imageUrl: product.imageUrl,
        imageFile: product.imageFile,
        imageHint: product.imageHint
      };
    });
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

    const p = product as any;
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      basePrice: p.basePrice ?? undefined,
      marginPct: p.marginPct ?? undefined,
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

/**
 * Crea una nueva categoría sencilla (nombre + icono).
 * El id se genera automáticamente (cuid).
 */
export async function addCategory(name: string, icon: string) {
  try {
    const category = await prisma.category.create({
      data: {
        name,
        icon,
      },
    });

    return category;
  } catch (error) {
    console.error('Error adding category:', error);
    throw error;
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

/**
 * Crea una nueva ubicación sencilla (solo nombre).
 * El id se genera automáticamente (cuid).
 */
export async function addLocation(name: string) {
  try {
    const location = await prisma.location.create({
      data: {
        name,
      },
    });

    return location;
  } catch (error) {
    console.error('Error adding location:', error);
    throw error;
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

export async function addProduct(product: Omit<Product, 'id'>, userId?: string) {
  try {
    const newProduct = await prisma.product.create({
      data: {
        name: product.name,
        description: product.description,
        // price ya viene calculado (con ganancia)
        price: product.price,
        // guardamos la información de contabilidad si viene del formulario
        basePrice: product.basePrice ?? product.price,
        marginPct: typeof product.marginPct === 'number' ? product.marginPct : null,
        quantity: product.quantity,
        minStock: product.minStock,
        categoryId: product.category,
        locationId: product.location,
        imageType: product.imageType,
        imageUrl: product.imageUrl,
        imageFile: product.imageFile,
        imageHint: product.imageHint || 'product',
        createdById: userId || null,
        updatedById: userId || null,
      } as any,
      include: {
        category: true,
        location: true,
      },
    }) as any;

    return {
      id: newProduct.id,
      name: newProduct.name,
      description: newProduct.description,
      price: newProduct.price,
      basePrice: newProduct.basePrice ?? undefined,
      marginPct: newProduct.marginPct ?? undefined,
      quantity: newProduct.quantity,
      minStock: newProduct.minStock,
      category: newProduct.category?.id ?? product.category,
      location: newProduct.location?.id ?? product.location,
      imageType: newProduct.imageType,
      imageUrl: newProduct.imageUrl,
      imageFile: newProduct.imageFile,
      imageHint: newProduct.imageHint,
    };
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
}

export async function updateProduct(id: string, productUpdate: Partial<Product>, userId?: string) {
  try {
    const updateData: any = {};

    if (productUpdate.name) updateData.name = productUpdate.name;
    if (productUpdate.description) updateData.description = productUpdate.description;
    if (productUpdate.price !== undefined) updateData.price = productUpdate.price;
    if (productUpdate.basePrice !== undefined) updateData.basePrice = productUpdate.basePrice;
    if (productUpdate.marginPct !== undefined) updateData.marginPct = productUpdate.marginPct;
    if (productUpdate.quantity !== undefined) updateData.quantity = productUpdate.quantity;
    if (productUpdate.minStock !== undefined) updateData.minStock = productUpdate.minStock;
    if (productUpdate.category) updateData.categoryId = productUpdate.category;
    if (productUpdate.location) updateData.locationId = productUpdate.location;
    if (productUpdate.imageType) updateData.imageType = productUpdate.imageType;
    if (productUpdate.imageUrl !== undefined) updateData.imageUrl = productUpdate.imageUrl;
    if (productUpdate.imageFile !== undefined) updateData.imageFile = productUpdate.imageFile;
    if (productUpdate.imageHint) updateData.imageHint = productUpdate.imageHint;
    if (userId) updateData.updatedById = userId;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        location: true,
      },
    });

    const up = updatedProduct as any;
    return {
      id: updatedProduct.id,
      name: updatedProduct.name,
      description: updatedProduct.description,
      price: updatedProduct.price,
      basePrice: up.basePrice ?? undefined,
      marginPct: up.marginPct ?? undefined,
      quantity: updatedProduct.quantity,
      minStock: updatedProduct.minStock,
      category: updatedProduct.category.id,
      location: updatedProduct.location.id,
      imageType: updatedProduct.imageType,
      imageUrl: updatedProduct.imageUrl,
      imageFile: updatedProduct.imageFile,
      imageHint: updatedProduct.imageHint,
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

export async function addOrder(orderData: NewOrderData, userId?: string) {
  try {
    // Generate unique order code
    const orderCode = await generateOrderCode();

    const order = (await prisma.order.create({
      data: {
        orderCode,
        status: 'SOLICITADO',
        total: orderData.total,
        paymentMethod: PAYMENT_METHOD_MAP[orderData.paymentMethod],
        customerName: orderData.customer.fullName,
        customerAddress: orderData.customer.address,
        customerPhone: orderData.customer.phone,
        createdById: userId || null,
        updatedById: userId || null,
        items: {
          create: orderData.items.map((item) => {
            const p = item.product;
            let unitBase: number | null = null;
            let unitMargin: number | null = null;

            if (typeof p.basePrice === 'number' && p.basePrice > 0) {
              unitBase = p.basePrice;
            }

            if (typeof p.marginPct === 'number' && !Number.isNaN(p.marginPct)) {
              unitMargin = p.marginPct;
              // Si no tenemos base pero sí precio y margen, lo calculamos hacia atrás
              if (!unitBase && p.price && p.price > 0) {
                unitBase = Math.round(p.price * (1 - p.marginPct));
              }
            }

            return {
              quantity: item.quantity,
              productId: p.id,
              unitPrice: p.price,
              unitBase,
              unitMargin,
            };
          }),
        },
      } as any,
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })) as any;

    // Update product quantities
    for (const item of orderData.items) {
      await prisma.product.update({
        where: { id: item.product.id },
        data: {
          quantity: {
            decrement: item.quantity,
          },
        },
      });
    }

    const statusKey = order.status as keyof typeof ORDER_STATUS_REVERSE_MAP;
    const paymentKey = order.paymentMethod as keyof typeof PAYMENT_METHOD_REVERSE_MAP;

    return {
      id: order.id,
      orderCode: order.orderCode,
      date: order.date.toISOString(),
      status: ORDER_STATUS_REVERSE_MAP[statusKey],
      total: order.total,
      paymentMethod: PAYMENT_METHOD_REVERSE_MAP[paymentKey],
      customer: {
        fullName: order.customerName || undefined,
        address: order.customerAddress || undefined,
        phone: order.customerPhone || undefined,
      },
      items: (order.items || []).map((item: any) => ({
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
          imageHint: item.product.imageHint,
        },
        quantity: item.quantity,
      })),
    };
  } catch (error) {
    console.error('Error adding order:', error);
    throw error;
  }
}

export async function updateOrderStatus(id: string, status: OrderStatus, userId?: string) {
  try {
    const data: any = {
      status: ORDER_STATUS_MAP[status],
    };
    if (userId) {
      data.updatedById = userId;
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data,
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
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
        phone: updatedOrder.customerPhone || undefined,
      },
      items: updatedOrder.items.map((item) => ({
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
          imageHint: item.product.imageHint,
        },
        quantity: item.quantity,
      })),
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

export async function addConsultation(consultationData: NewConsultationData, userId?: string) {
  try {
    const consultation = (await prisma.consultation.create({
      data: {
        name: consultationData.name,
        email: consultationData.email,
        phone: consultationData.phone,
        diagnosis: consultationData.diagnosis,
        createdById: userId || null,
        updatedById: userId || null,
      } as any,
    })) as any;

    return {
      id: consultation.id,
      date: consultation.date.toISOString(),
      name: consultation.name,
      email: consultation.email,
      phone: consultation.phone,
      diagnosis: consultation.diagnosis,
      status: consultation.status.toLowerCase() as 'pending' | 'contacted',
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

// --- Accounting Functions ---

export type AccountingOrderSummary = {
  id: string;
  orderCode: string;
  date: string;
  status: string;
  totalSale: number;
  totalCost: number;
  totalProfit: number;
  itemCount: number;
};

export type AccountingOrderDetail = {
  id: string;
  orderCode: string;
  date: string;
  status: string;
  customerName?: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    unitBase: number | null;
    unitMargin: number | null;
    lineTotal: number;
    lineCost: number;
    lineProfit: number;
  }[];
  totalSale: number;
  totalCost: number;
  totalProfit: number;
};

/**
 * Get accounting summary for all delivered orders
 */
export async function getAccountingSummary(): Promise<AccountingOrderSummary[]> {
  try {
    const orders = await prisma.order.findMany({
      where: {
        status: 'ENTREGADO'
      },
      include: {
        items: true
      },
      orderBy: {
        date: 'desc'
      }
    });

    return orders.map(order => {
      let totalSale = 0;
      let totalCost = 0;

      for (const item of order.items) {
        const i = item as any;
        const lineTotal = (i.unitPrice ?? 0) * item.quantity;
        totalSale += lineTotal;

        if (i.unitBase !== null && i.unitBase !== undefined) {
          totalCost += i.unitBase * item.quantity;
        } else {
          // If no base cost recorded, assume no profit (cost = sale price)
          totalCost += lineTotal;
        }
      }

      return {
        id: order.id,
        orderCode: order.orderCode,
        date: order.date.toISOString(),
        status: ORDER_STATUS_REVERSE_MAP[order.status],
        totalSale,
        totalCost,
        totalProfit: totalSale - totalCost,
        itemCount: order.items.length
      };
    });
  } catch (error) {
    console.error('Error fetching accounting summary:', error);
    return [];
  }
}

/**
 * Get detailed accounting for a specific order
 */
export async function getAccountingOrderDetail(orderId: string): Promise<AccountingOrderDetail | null> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) return null;

    let totalSale = 0;
    let totalCost = 0;

    const items = order.items.map(item => {
      const i = item as any;
      const lineTotal = (i.unitPrice ?? item.product.price) * item.quantity;
      const lineCost = i.unitBase !== null && i.unitBase !== undefined ? i.unitBase * item.quantity : lineTotal;
      const lineProfit = lineTotal - lineCost;

      totalSale += lineTotal;
      totalCost += lineCost;

      return {
        productId: item.productId,
        productName: item.product.name,
        quantity: item.quantity,
        unitPrice: i.unitPrice ?? item.product.price,
        unitBase: i.unitBase ?? null,
        unitMargin: i.unitMargin ?? null,
        lineTotal,
        lineCost,
        lineProfit
      };
    });

    return {
      id: order.id,
      orderCode: order.orderCode,
      date: order.date.toISOString(),
      status: ORDER_STATUS_REVERSE_MAP[order.status],
      customerName: order.customerName || undefined,
      items,
      totalSale,
      totalCost,
      totalProfit: totalSale - totalCost
    };
  } catch (error) {
    console.error('Error fetching accounting order detail:', error);
    return null;
  }
}

/**
 * Get overall accounting totals
 */
export async function getAccountingTotals() {
  try {
    const orders = await prisma.order.findMany({
      where: {
        status: 'ENTREGADO'
      },
      include: {
        items: true
      }
    });

    let totalSales = 0;
    let totalCosts = 0;
    let totalOrders = orders.length;
    let totalItems = 0;

    for (const order of orders) {
      for (const item of order.items) {
        const i = item as any;
        const lineTotal = (i.unitPrice ?? 0) * item.quantity;
        totalSales += lineTotal;
        totalItems += item.quantity;

        if (i.unitBase !== null && i.unitBase !== undefined) {
          totalCosts += i.unitBase * item.quantity;
        } else {
          totalCosts += lineTotal;
        }
      }
    }

    return {
      totalSales,
      totalCosts,
      totalProfit: totalSales - totalCosts,
      totalOrders,
      totalItems,
      profitMargin: totalSales > 0 ? ((totalSales - totalCosts) / totalSales) * 100 : 0
    };
  } catch (error) {
    console.error('Error fetching accounting totals:', error);
    return {
      totalSales: 0,
      totalCosts: 0,
      totalProfit: 0,
      totalOrders: 0,
      totalItems: 0,
      profitMargin: 0
    };
  }
}

// --- Warehouse / Rotation Functions ---

export type RotationCategory = 'alta' | 'media' | 'baja';

export type ProductRotation = {
  productId: string;
  name: string;
  categoryName: string;
  quantitySold: number;
  currentStock: number;
  rotation: RotationCategory;
};

export type WarehouseRotationSummary = {
  periodDays: number;
  totals: {
    alta: number;
    media: number;
    baja: number;
  };
  products: ProductRotation[];
};

/**
 * Calcula la rotación de productos en un periodo dado (por defecto 30 días),
 * clasificando en alta / media / baja rotación según las unidades vendidas.
 *
 * - Alta rotación: >= 50 unidades vendidas en el periodo
 * - Media rotación: >= 10 y < 50 unidades vendidas
 * - Baja rotación: >= 1 y < 10 unidades vendidas
 *
 * Solo se consideran pedidos con estado ENTREGADO.
 */
export async function getWarehouseRotation(periodDays = 30): Promise<WarehouseRotationSummary> {
  try {
    const since = new Date();
    since.setDate(since.getDate() - periodDays);

    const orders = await prisma.order.findMany({
      where: {
        status: 'ENTREGADO',
        date: {
          gte: since,
        },
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    const byProduct = new Map<
      string,
      {
        product: any;
        quantitySold: number;
      }
    >();

    for (const order of orders) {
      for (const item of order.items) {
        const existing = byProduct.get(item.productId);
        if (existing) {
          existing.quantitySold += item.quantity;
        } else {
          byProduct.set(item.productId, {
            product: item.product,
            quantitySold: item.quantity,
          });
        }
      }
    }

    const products: ProductRotation[] = [];

    for (const [productId, entry] of byProduct.entries()) {
      const { product, quantitySold } = entry;

      let rotation: RotationCategory;
      if (quantitySold >= 50) {
        rotation = 'alta';
      } else if (quantitySold >= 10) {
        rotation = 'media';
      } else {
        rotation = 'baja';
      }

      products.push({
        productId,
        name: product.name,
        categoryName: product.category?.name ?? '',
        quantitySold,
        currentStock: product.quantity,
        rotation,
      });
    }

    const totals = {
      alta: 0,
      media: 0,
      baja: 0,
    };

    for (const p of products) {
      totals[p.rotation] += 1;
    }

    return {
      periodDays,
      totals,
      products,
    };
  } catch (error) {
    console.error('Error fetching warehouse rotation:', error);
    return {
      periodDays,
      totals: {
        alta: 0,
        media: 0,
        baja: 0,
      },
      products: [],
    };
  }
}
