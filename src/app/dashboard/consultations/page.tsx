import PageHeader from "@/components/page-header";
import { getConsultations } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export const dynamic = 'force-dynamic';

export default async function ConsultationsPage() {
  const consultations = await getConsultations();

  return (
    <>
      <PageHeader title="Solicitudes de Asesoría" />
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Diagnóstico</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {consultations.length > 0 ? (
                consultations.map((consultation) => (
                  <TableRow key={consultation.id}>
                    <TableCell>{formatDate(consultation.date)}</TableCell>
                    <TableCell className="font-medium">{consultation.name}</TableCell>
                    <TableCell>{consultation.email}</TableCell>
                    <TableCell>{consultation.phone}</TableCell>
                    <TableCell className="max-w-xs truncate" title={consultation.diagnosis || ''}>
                      {consultation.diagnosis || 'No especificado'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={consultation.status === 'pending' ? 'secondary' : 'default'}>
                        {consultation.status === 'pending' ? 'Pendiente' : 'Contactado'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No se han recibido solicitudes de asesoría.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
