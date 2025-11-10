'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MoreHorizontal, Truck, CheckCircle, Package, Eye, Search } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Order, OrderStatus } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { updateOrderStatusAction } from '@/lib/actions';
import { useState, useMemo } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import Image from 'next/image';

type OrdersTableProps = {
  orders: Order[];
};

const statusConfig: Record<OrderStatus, { label: string; color: 'secondary' | 'default' | 'destructive'; icon: React.ElementType }> = {
    'solicitado': { label: 'Solicitado', color: 'secondary', icon: Package },
    'en-proceso': { label: 'En Proceso', color: 'default', icon: Truck },
    'entregado': { label: 'Entregado', color: 'destructive', icon: CheckCircle },
}

export default function OrdersTable({ orders }: OrdersTableProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
        const result = await updateOrderStatusAction(orderId, newStatus);
        if (!result.success) {
            console.error('Error updating order status:', result.error);
            // Here you could show a toast notification or alert to the user
        }
    };

    const filteredOrders = useMemo(() => {
        if (!debouncedSearchQuery.trim()) return orders;

        const query = debouncedSearchQuery.toLowerCase();
        return orders.filter(order =>
            order.orderCode.toLowerCase().includes(query) ||
            order.customer.fullName?.toLowerCase().includes(query) ||
            order.customer.phone?.toLowerCase().includes(query) ||
            order.customer.address?.toLowerCase().includes(query) ||
            order.items.some(item =>
                item.product.name.toLowerCase().includes(query) ||
                item.product.description.toLowerCase().includes(query)
            )
        );
    }, [orders, debouncedSearchQuery]);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar pedidos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            {filteredOrders.length} de {orders.length} pedidos
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]"></TableHead>
              <TableHead>Pedido ID</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map(order => (
                <TableRow key={order.id}>
                    <TableCell>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                    <Eye className="h-4 w-4" />
                                    <span className="sr-only">Ver detalles</span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Detalles del Pedido #{order.orderCode}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="font-semibold mb-2">Información del Cliente</h4>
                                            <p><strong>Nombre:</strong> {order.customer.fullName}</p>
                                            <p><strong>Teléfono:</strong> {order.customer.phone}</p>
                                            <p><strong>Dirección:</strong> {order.customer.address || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold mb-2">Información del Pedido</h4>
                                            <p><strong>Fecha:</strong> {formatDate(order.date)}</p>
                                            <p><strong>Método de pago:</strong> {order.paymentMethod === 'cash-on-delivery' ? 'Contraentrega' : 'Recoger en tienda'}</p>
                                            <p><strong>Estado:</strong> <Badge variant={statusConfig[order.status].color}>{statusConfig[order.status].label}</Badge></p>
                                            <p><strong>Total:</strong> {formatCurrency(order.total)}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-4">Productos</h4>
                                        <div className="space-y-3">
                                        {order.items.map(({ product, quantity }) => (
                                            <div key={product.id} className="flex items-center gap-4 p-3 border rounded-lg">
                                                <Image src={product.imageUrl || '/placeholder-image.png'} alt={product.name} width={60} height={60} className="rounded-md object-cover" />
                                                <div className="flex-1">
                                                    <p className="font-medium">{product.name}</p>
                                                    <p className="text-sm text-muted-foreground">{product.description}</p>
                                                    <p className="text-sm">Cantidad: {quantity} x {formatCurrency(product.price)}</p>
                                                </div>
                                                <p className="font-medium">{formatCurrency(product.price * quantity)}</p>
                                            </div>
                                        ))}
                                        </div>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </TableCell>
                    <TableCell className="font-medium font-mono text-sm">#{order.orderCode}</TableCell>
                    <TableCell>{order.customer.fullName || 'N/A'}</TableCell>
                    <TableCell>{formatDate(order.date)}</TableCell>
                    <TableCell>
                        <Badge variant={statusConfig[order.status].color}>
                            {statusConfig[order.status].label}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(order.total)}</TableCell>
                    <TableCell>
                        {order.status !== 'entregado' ? (
                            <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Alternar menú</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Cambiar Estado</DropdownMenuLabel>
                                {order.status === 'solicitado' && (
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                <Truck className="h-4 w-4 mr-2" />
                                                Marcar como En Proceso
                                            </DropdownMenuItem>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Confirmar Cambio de Estado</DialogTitle>
                                            </DialogHeader>
                                            <p>¿Estás seguro de que quieres cambiar el estado de este pedido a "En Proceso"?</p>
                                            <div className="flex justify-end gap-2 mt-4">
                                                <Button variant="outline">Cancelar</Button>
                                                <Button onClick={() => handleStatusChange(order.id, 'en-proceso')}>Confirmar</Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                )}
                                {order.status === 'en-proceso' && (
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                Marcar como Entregado
                                            </DropdownMenuItem>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Confirmar Cambio de Estado</DialogTitle>
                                            </DialogHeader>
                                            <p>¿Estás seguro de que quieres marcar este pedido como "Entregado"? Esta acción no se puede deshacer.</p>
                                            <div className="flex justify-end gap-2 mt-4">
                                                <Button variant="outline">Cancelar</Button>
                                                <Button onClick={() => handleStatusChange(order.id, 'entregado')}>Confirmar Entrega</Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                )}
                            </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <span className="text-muted-foreground text-sm">Finalizado</span>
                        )}
                    </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No se encontraron pedidos.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
