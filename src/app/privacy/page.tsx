import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";

export const metadata: Metadata = { title: "隐私政策 | GANLAN GOLD", robots: { index: false, follow: true } };

export default function PrivacyPage() {
  return (
    <LegalPage title="隐私政策" english="Privacy Policy">
      <section><h2>我们收集的信息 <small lang="en">Information we collect</small></h2><p>当您提交商业询价或考察申请时，我们会收集您主动提供的公司名称、联系人、国家或地区、电子邮箱或微信联系方式、采购或考察需求及补充说明。系统也可能以不可逆摘要形式记录网络地址，用于防滥用和安全控制。</p></section>
      <section><h2>使用目的 <small lang="en">Purpose</small></h2><p>这些信息仅用于处理您的请求、核实商业需求、协调后续沟通、维护服务安全及履行适用的记录义务。提交表单不会自动形成合同、报价或考察确认。</p></section>
      <section><h2>存储与接收方 <small lang="en">Storage and recipients</small></h2><p>请求存储在 GANLAN GOLD 的业务系统中，仅向负责商业跟进、产地协调、系统运维或依法需要处理信息的人员开放。若启用邮件通知，表单摘要可能经部署方配置的邮件服务发送。</p></section>
      <section><h2>保留、更正与删除 <small lang="en">Retention and your choices</small></h2><p>具体保留期限仍需业务与法律审核确认。在适用法律允许的范围内，您可通过网站列明的联系渠道提出查询、更正或删除请求。我们可能需要核实请求者身份并保留依法必须保存的记录。</p></section>
      <section><h2>联系 <small lang="en">Contact</small></h2><p>隐私请求可先通过公开联系页所列团队渠道提出。正式隐私负责人和法定联系地址尚待企业确认，公开上线前必须补充。</p></section>
    </LegalPage>
  );
}
