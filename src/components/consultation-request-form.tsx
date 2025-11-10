'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useRef } from 'react';
import { createConsultationAction } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { DialogClose } from './ui/dialog';

const consultationSchema = z.object({
  name: z.string().min(2, "El nombre es requerido."),
  email: z.string().email("El correo electrónico no es válido."),
  phone: z.string().min(7, "El teléfono no es válido."),
  diagnosis: z.string().optional(),
});

type ConsultationFormData = z.infer<typeof consultationSchema>;

export default function ConsultationRequestForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  
  const form = useForm<ConsultationFormData>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      diagnosis: '',
    },
  });

  const onSubmit = async (data: ConsultationFormData) => {
    setIsSubmitting(true);
    const result = await createConsultationAction(data);

    if (result.success) {
      toast({
        title: '¡Solicitud Enviada!',
        description: 'Gracias por contactarnos. Un experto te responderá pronto.',
      });
      form.reset();
      closeBtnRef.current?.click();
    } else {
      toast({
        variant: 'destructive',
        title: 'Error al enviar',
        description: result.error || 'Por favor, inténtalo de nuevo.',
      });
    }
    setIsSubmitting(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Nombre</Label>
              <FormControl>
                <Input id="name" {...field} className="col-span-3" />
              </FormControl>
              <div className="col-start-2 col-span-3">
                 <FormMessage />
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">Correo</Label>
              <FormControl>
                <Input id="email" type="email" {...field} className="col-span-3" />
              </FormControl>
               <div className="col-start-2 col-span-3">
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">Teléfono</Label>
              <FormControl>
                <Input id="phone" {...field} className="col-span-3" />
              </FormControl>
                <div className="col-start-2 col-span-3">
                  <FormMessage />
                </div>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="diagnosis"
          render={({ field }) => (
            <FormItem className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="diagnosis" className="text-right pt-2">Diagnóstico</Label>
              <FormControl>
                <Textarea
                  id="diagnosis"
                  placeholder="Describe el problema o diagnóstico de la motocicleta..."
                  className="col-span-3 min-h-[80px]"
                  {...field}
                />
              </FormControl>
                <div className="col-start-2 col-span-3">
                  <FormMessage />
                </div>
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 mt-4">
            <DialogClose asChild>
                <Button type="button" variant="outline">Cancelar</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
                <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
                </>
            ) : (
                'Enviar Solicitud'
            )}
            </Button>
        </div>
         <DialogClose ref={closeBtnRef} className="hidden" />
      </form>
    </Form>
  );
}
