import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";

export const metadata: Metadata = { title: "商业信息 | GANLAN GOLD", robots: { index: false, follow: true } };

export default function TermsPage() {
  return (
    <LegalPage title="商业信息" english="Commercial Information">
      <section><h2>询价性质 <small lang="en">Nature of inquiries</small></h2><p>网站表单用于提交非约束性商业询价。自动确认仅表示系统收到请求，不构成接受订单、承诺供应、确认考察日期或具有法律约束力的报价。</p></section>
      <section><h2>价格与汇率 <small lang="en">Prices and exchange rates</small></h2><p>美元为参考价格和最终报价确认币种。人民币金额依据欧洲中央银行公布的欧元参考汇率间接计算并向上取整，仅供参考。除非报价另有说明，最终报价有效期为 15 天。</p></section>
      <section><h2>交付与费用 <small lang="en">Delivery and costs</small></h2><p>适用的 Incoterm 必须在报价中确认。网站所示出口价格不包含国际运费、适用的国际运输保险、中国清关、关税、进口税费或送达买方中国仓库的费用。</p></section>
      <section><h2>文件与供应 <small lang="en">Documents and supply</small></h2><p>商业发票、装箱单、原产地证书、质量控制资料及出口或海关文件，仅在确认可取得且适用后提供。批次来源、装柜方案和全部商业条件均以最终文件为准。</p></section>
    </LegalPage>
  );
}
