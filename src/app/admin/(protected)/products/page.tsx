import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ProductEditor } from "@/components/admin/ProductEditor";
import { updateProductAction } from "@/app/admin/actions/management";
import { listProductsForAdmin } from "@/lib/admin/products";
import { requireAdminPage } from "@/lib/auth/page";

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  await requireAdminPage();
  const [products, query] = await Promise.all([listProductsForAdmin(), searchParams]);
  return (
    <>
      <AdminPageHeader eyebrow="产品数据 / Product data" title="产品与美元价格" description="维护参考美元价格和已审批的双语产品说明。" />
      {query.saved ? <p className="admin-toast" role="status">已保存 {query.saved} / Changes saved</p> : null}
      <section className="admin-product-grid">
        {products.map((product) => {
          const zh = product.translations.find((item) => item.locale === "zh-CN");
          const en = product.translations.find((item) => item.locale === "en");
          return <ProductEditor key={product.id} action={updateProductAction} product={{ id: product.id, capacityMl: product.capacityMl, usdPrice: product.usdPrice.toFixed(2), imagePath: product.imagePath, zhDescription: zh?.description ?? "", enDescription: en?.description ?? "" }} />;
        })}
      </section>
    </>
  );
}
