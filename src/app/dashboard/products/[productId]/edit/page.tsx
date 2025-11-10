import { getProductById, getCategories, getLocations } from "@/lib/data";
import ProductForm from "@/components/product-form";
import { notFound } from "next/navigation";
import PageHeader from "@/components/page-header";

export default async function EditProductPage({
  params,
}: {
  params: { productId: string };
}) {
  const product = await getProductById(params.productId);
  if (!product) {
    notFound();
  }

  const categories = await getCategories();
  const locations = await getLocations();

  return (
    <>
      <PageHeader title="Editar Producto" />
      <ProductForm
        product={product}
        categories={categories}
        locations={locations}
      />
    </>
  );
}
