import PageHeader from "@/components/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getOrders } from "@/lib/data";
import OrdersTable from "@/components/orders-table";
import ExportButtons from "@/components/export-buttons";
import { Badge } from "@/components/ui/badge";

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
    const orders = await getOrders();

    const requestedOrders = orders.filter(o => o.status === 'solicitado');
    const inProcessOrders = orders.filter(o => o.status === 'en-proceso');
    const deliveredOrders = orders.filter(o => o.status === 'entregado');

    return (
        <>
            <PageHeader title="Pedidos" />
            <Tabs defaultValue="requested">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="requested">
                        Solicitados
                        <Badge variant="secondary" className="ml-2">{requestedOrders.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="in-process">
                        En Proceso
                        <Badge variant="secondary" className="ml-2">{inProcessOrders.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="delivered">
                        Historial (Entregados)
                        <Badge variant="secondary" className="ml-2">{deliveredOrders.length}</Badge>
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="requested">
                    <ExportButtons
                        status="solicitado"
                        count={requestedOrders.length}
                        statusName="Pedidos Solicitados"
                    />
                    <OrdersTable orders={requestedOrders} />
                </TabsContent>
                <TabsContent value="in-process">
                    <ExportButtons
                        status="en-proceso"
                        count={inProcessOrders.length}
                        statusName="Pedidos en Proceso"
                    />
                    <OrdersTable orders={inProcessOrders} />
                </TabsContent>
                <TabsContent value="delivered">
                    <ExportButtons
                        status="entregado"
                        count={deliveredOrders.length}
                        statusName="Historial (Pedidos Entregados)"
                    />
                    <OrdersTable orders={deliveredOrders} />
                </TabsContent>
            </Tabs>
        </>
    );
}
