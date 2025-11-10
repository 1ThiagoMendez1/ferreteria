import type { LucideIcon } from "lucide-react";

export type ImageType = 'URL' | 'FILE';

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  minStock: number;
  category: string;
  location: string;
  imageType?: ImageType;
  imageUrl?: string;
  imageFile?: string;
  imageHint: string;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type Category = {
  id: string;
  name: string;
  icon: string;
};

export type Location = {
  id: string;
  name: string;
};

export type OrderStatus = 'solicitado' | 'en-proceso' | 'entregado';

export type PaymentMethod =
  | 'efectivo'
  | 'nequi'
  | 'daviplata'
  | 'tarjeta'
  | 'cash-on-delivery';

export type Order = {
  id: string;
  orderCode: string;
  date: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  customer: {
    fullName?: string;
    address?: string;
    phone?: string;
  };
};

export type Consultation = {
  id: string;
  date: string;
  name: string;
  email: string;
  phone: string;
  diagnosis?: string;
  status: 'pending' | 'contacted';
};
