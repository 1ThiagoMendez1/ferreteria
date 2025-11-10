'use client';

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface ExportButtonsProps {
    status: string;
    count: number;
    statusName: string;
}

export default function ExportButtons({ status, count, statusName }: ExportButtonsProps) {
    const handleExportExcel = () => {
        const url = `/api/orders/export?status=${status}`;
        window.open(url, '_blank');
    };

    return (
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">{statusName}</h3>
            <Button
                onClick={handleExportExcel}
                variant="outline"
                size="sm"
                disabled={count === 0}
            >
                <Download className="h-4 w-4 mr-2" />
                Descargar Excel
            </Button>
        </div>
    );
}