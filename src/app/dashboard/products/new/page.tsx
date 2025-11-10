import { getCategories, getLocations } from "@/lib/data";
import ProductForm from "@/components/product-form";
import PageHeader from "@/components/page-header";

export default async function NewProductPage() {
  const categories = await getCategories();
  const locations = await getLocations();

  return (
    <>
      <PageHeader title="Agregar Nuevo Producto" />
      <ProductForm categories={categories} locations={locations} />
    </>
  );
}
