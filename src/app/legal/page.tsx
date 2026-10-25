import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";

export const metadata: Metadata = { title: "法律声明 | GANLAN GOLD", robots: { index: false, follow: true } };

export default function LegalNoticePage() {
  return (
    <LegalPage title="法律声明与公司信息" english="Legal Notice / Company Information">
      <section><h2>网站运营信息 <small lang="en">Website operator</small></h2><p>品牌：GANLAN GOLD。经营主体法定名称、注册号、税务编号、注册地址、法定代表人及正式电子联系地址尚未提供。上述资料属于发布阻断项，不得以推测内容替代。</p></section>
      <section><h2>内容范围 <small lang="en">Scope of content</small></h2><p>本网站面向专业进口商、经销商及采购商提供摩洛哥橄榄油商业合作信息。网页内容不构成认证、医疗或营养声明，也不证明任何尚未提供的监管批准或进口许可。</p></section>
      <section><h2>图像与商标 <small lang="en">Images and marks</small></h2><p>GANLAN GOLD 名称及视觉元素仅用于本项目品牌展示。现有部分产品和产地图像为待审批参考素材，最终上线前必须确认使用权、产品标签和高分辨率生产图片。</p></section>
      <section><h2>责任边界 <small lang="en">Limitations</small></h2><p>动态人民币金额仅作参考，最终商业条件以双方确认的美元报价及适用 Incoterm 为准。外部通信服务、银行、承运人与海关机构不由本网站控制。</p></section>
    </LegalPage>
  );
}
