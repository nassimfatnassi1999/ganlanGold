import Image from "next/image";
import { AdminSubmitButton } from "./AdminSubmitButton";

type EditableProduct = Readonly<{
  id: string;
  capacityMl: number;
  usdPrice: string;
  imagePath: string;
  zhDescription: string;
  enDescription: string;
}>;

function label(id: string) {
  return id === "5l" ? "5 L" : id.replace("ml", " ml");
}

export function ProductEditor({ product, action }: { product: EditableProduct; action?: (formData: FormData) => void | Promise<void> }) {
  return (
    <article className="admin-product-card">
      <div className="admin-product-image"><Image src={product.imagePath} alt={`${label(product.id)} 产品参考图`} width={180} height={220} /></div>
      <form action={action} className="admin-edit-form">
        <header><div><p>固定产品标识 / Stable product identity</p><h2>{label(product.id)}</h2></div><code>{product.id}</code></header>
        <input type="hidden" name="id" value={product.id} />
        <label>美元参考价 / Reference USD<input name="usdPrice" type="number" min="0.01" max="9999.99" step="0.01" defaultValue={product.usdPrice} required /></label>
        <label>中文说明 / Chinese description<textarea name="zhDescription" rows={4} defaultValue={product.zhDescription} required /></label>
        <label>英文说明 / English description<textarea name="enDescription" rows={4} defaultValue={product.enDescription} required /></label>
        <p className="admin-lock-note">容量、产品标识及全局商业政策在此界面中不可编辑。</p>
        <AdminSubmitButton />
      </form>
    </article>
  );
}
