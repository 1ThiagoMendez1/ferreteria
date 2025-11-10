import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { getOrders } from '@/lib/data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    if (!status) {
      return NextResponse.json(
        { error: 'Se requiere el parámetro status' },
        { status: 400 }
      );
    }

    // Validar que el status sea válido
    const validStatuses = ['solicitado', 'en-proceso', 'entregado'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Status inválido. Valores permitidos: solicitado, en-proceso, entregado' },
        { status: 400 }
      );
    }

    // Obtener todos los pedidos
    const allOrders = await getOrders();

    // Filtrar por status
    const filteredOrders = allOrders.filter(order => order.status === status);

    // Preparar datos para Excel
    const excelData = filteredOrders.map(order => ({
      'Código de Pedido': order.orderCode,
      'Fecha': new Date(order.date).toLocaleDateString('es-CO'),
      'Estado': order.status === 'solicitado' ? 'Solicitado' :
                order.status === 'en-proceso' ? 'En Proceso' : 'Entregado',
      'Total': order.total,
      'Método de Pago': (() => {
        const paymentMap: Record<string, string> = {
          'efectivo': 'Efectivo',
          'nequi': 'Nequi',
          'daviplata': 'Daviplata',
          'tarjeta': 'Tarjeta',
          'cash-on-delivery': 'Pago Contraentrega'
        };
        return paymentMap[order.paymentMethod] || order.paymentMethod;
      })(),
      'Nombre del Cliente': order.customer?.fullName || '',
      'Dirección': order.customer?.address || '',
      'Teléfono': order.customer?.phone || '',
      'Productos': order.items.map(item =>
        `${item.product.name} (x${item.quantity})`
      ).join('; '),
      'Cantidades Totales': order.items.reduce((sum, item) => sum + item.quantity, 0)
    }));

    // Crear libro de Excel
    const wb = XLSX.utils.book_new();

    // Crear hoja de trabajo
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Ajustar ancho de columnas
    const colWidths = [
      { wch: 15 }, // Código de Pedido
      { wch: 12 }, // Fecha
      { wch: 12 }, // Estado
      { wch: 10 }, // Total
      { wch: 18 }, // Método de Pago
      { wch: 20 }, // Nombre del Cliente
      { wch: 25 }, // Dirección
      { wch: 12 }, // Teléfono
      { wch: 50 }, // Productos
      { wch: 15 }  // Cantidades Totales
    ];
    ws['!cols'] = colWidths;

    // Agregar hoja al libro
    const statusName = status === 'solicitado' ? 'Solicitados' :
                      status === 'en-proceso' ? 'En_Proceso' : 'Entregados';
    XLSX.utils.book_append_sheet(wb, ws, statusName);

    // Generar buffer del archivo Excel
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Crear respuesta con el archivo
    const response = new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="pedidos_${statusName}_${new Date().toISOString().split('T')[0]}.xlsx"`
      }
    });

    return response;

  } catch (error) {
    console.error('Error generando Excel:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}