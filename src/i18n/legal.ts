export type LegalSection = Readonly<{
  zhTitle: string;
  enTitle: string;
  zhBody: string;
  enBody: string;
}>;

export const privacySections: readonly LegalSection[] = [
  {
    zhTitle: "我们收集的信息",
    enTitle: "Information we collect",
    zhBody: "当您提交商业询价或考察申请时，公司、国家、联系人、邮箱或微信、采购或参观需求、留言及同意状态将通过 EmailJS 及其连接的邮件服务发送给 GANLAN GOLD，以便处理申请。您也可选择在浏览器中准备 WhatsApp 或微信消息并自行发送。",
    enBody: "When you submit a quotation or visit request, your company, country, contact details, purchasing or visit requirements, message and consent status are sent to GANLAN GOLD through EmailJS and its connected email provider to handle your request. You may alternatively prepare a WhatsApp or WeChat message in your browser and send it yourself.",
  },
  {
    zhTitle: "使用目的",
    enTitle: "Purpose",
    zhBody: "您提交的信息用于处理询价或安排考察，并通过您提供的联系方式跟进。提交申请不构成商业订单、正式报价或考察日期确认。",
    enBody: "Submitted information is used to handle your inquiry or coordinate a visit and follow up using your contact details. A submission does not create an order, formal quotation or confirmed visit.",
  },
  {
    zhTitle: "存储与接收方",
    enTitle: "Storage and recipients",
    zhBody: "本网站没有数据库或表单接收后端。提交时，EmailJS、连接的邮件服务及授权业务接收方会处理申请资料，可能涉及跨境处理。若选择 WhatsApp 或微信，相应平台按其政策处理信息。",
    enBody: "The website has no database or form-receiving backend. EmailJS, the connected email provider and authorized business recipients process submitted requests, potentially across borders. If you choose WhatsApp or WeChat, that platform processes your message under its policies.",
  },
  {
    zhTitle: "保留、更正与删除",
    enTitle: "Retention and your choices",
    zhBody: "本站本身不持久保存表单内容。提交后，邮件及相关记录的保留取决于 EmailJS、邮件服务和业务接收方的政策；其他通信平台适用各自政策。您可通过公开联系方式申请查询、更正或删除；详细法律文本仍需审核。",
    enBody: "This site does not persist form content. Retention of submitted emails and associated records depends on EmailJS, the email provider and business recipients; alternative messaging platforms apply their own policies. Use the published contact channels to request access, correction or deletion; the detailed legal text still requires review.",
  },
  {
    zhTitle: "联系",
    enTitle: "Contact",
    zhBody: "隐私请求可先通过公开联系页所列团队渠道提出。正式隐私负责人和法定联系地址尚待企业确认，公开上线前必须补充。",
    enBody: "Privacy requests may be raised through the team channels on the public contact page. The formal privacy contact and legal address still require company confirmation before public launch.",
  },
];

export const legalNoticeSections: readonly LegalSection[] = [
  {
    zhTitle: "网站运营信息",
    enTitle: "Website operator",
    zhBody: "品牌：GANLAN GOLD。经营主体法定名称、注册号、税务编号、注册地址、法定代表人及正式电子联系地址尚未提供。上述资料属于发布阻断项，不得以推测内容替代。",
    enBody: "Brand: GANLAN GOLD. The operator’s legal name, registration and tax numbers, registered address, legal representative, and formal electronic contact have not yet been provided. These are launch-blocking details and must not be replaced with assumptions.",
  },
  {
    zhTitle: "内容范围",
    enTitle: "Scope of content",
    zhBody: "本网站面向专业进口商、经销商及采购商提供摩洛哥橄榄油商业合作信息。网页内容不构成认证、医疗或营养声明，也不证明任何尚未提供的监管批准或进口许可。",
    enBody: "This website presents Moroccan olive-oil partnership information for professional importers, distributors, and buyers. Its content is not a certification, medical or nutritional claim, or evidence of any regulatory approval or import authorization not provided here.",
  },
  {
    zhTitle: "图像与商标",
    enTitle: "Images and marks",
    zhBody: "GANLAN GOLD 名称及视觉元素仅用于本项目品牌展示。现有部分产品和产地图像为待审批参考素材，最终上线前必须确认使用权、产品标签和高分辨率生产图片。",
    enBody: "The GANLAN GOLD name and visual elements are used for this brand presentation. Some current product and origin images are approval-pending reference assets; usage rights, product labels, and high-resolution production photography must be confirmed before launch.",
  },
  {
    zhTitle: "责任边界",
    enTitle: "Limitations",
    zhBody: "手工设置的人民币参考金额仅作指示，最终商业条件以双方确认的美元报价及适用 Incoterm 为准。外部通信服务、银行、承运人与海关机构不由本网站控制。",
    enBody: "Manually maintained CNY amounts are indicative only. Final commercial terms are governed by the agreed USD quotation and applicable Incoterm. This website does not control external communication services, banks, carriers, or customs authorities.",
  },
];

export const termsSections: readonly LegalSection[] = [
  {
    zhTitle: "询价性质",
    enTitle: "Nature of inquiries",
    zhBody: "网站表单用于提交非约束性商业询价或考察申请。点击发送将通过 EmailJS 发送给授权业务接收方；您也可自行通过 WhatsApp 或微信发送准备好的消息。提交不构成订单接受、供货承诺、考察确认或正式报价。",
    enBody: "The website forms submit non-binding quotation or visit requests. Clicking send transmits the request through EmailJS to authorized business recipients; you may alternatively send a prepared message through WhatsApp or WeChat. Submission does not constitute order acceptance, a supply commitment, visit confirmation or a formal quotation.",
  },
  {
    zhTitle: "价格与汇率",
    enTitle: "Prices and exchange rates",
    zhBody: "人民币和美元价格均为手工维护的固定参考值，不进行自动汇率计算。最终报价以美元确认，除非报价另有说明，正式报价有效期为 15 天。",
    enBody: "CNY and USD prices are fixed reference values maintained manually; no automatic exchange-rate calculation is used. Final quotations are confirmed in USD and remain valid for 15 days unless the quotation states otherwise.",
  },
  {
    zhTitle: "交付与费用",
    enTitle: "Delivery and costs",
    zhBody: "适用的 Incoterm 必须在报价中确认。网站所示出口价格不包含国际运费、适用的国际运输保险、中国清关、关税、进口税费或送达买方中国仓库的费用。",
    enBody: "The applicable Incoterm must be confirmed in the quotation. Displayed export prices exclude international freight, applicable transport insurance, Chinese customs clearance, duties, import taxes, and delivery to the buyer’s warehouse in China.",
  },
  {
    zhTitle: "文件与供应",
    enTitle: "Documents and supply",
    zhBody: "商业发票、装箱单、原产地证书、质量控制资料及出口或海关文件，仅在确认可取得且适用后提供。批次来源、装柜方案和全部商业条件均以最终文件为准。",
    enBody: "Commercial invoices, packing lists, certificates of origin, quality-control records, and export or customs documents are provided only when confirmed available and applicable. Lot origin, loading plans, and all commercial terms remain subject to final documentation.",
  },
];

