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
    zhBody: "当您填写商业询价或考察申请时，您输入的信息只在当前浏览器中用于准备 WhatsApp 或微信消息。本静态网站不会在服务器端接收或保存表单资料。您主动使用 WhatsApp 或微信发送时，相关平台根据各自的隐私政策处理信息。",
    enBody: "When you complete a quotation or visit request, the information is used in your browser only to prepare a WhatsApp or WeChat message. This static website does not receive or store form data on a server. If you choose to send the message, the selected platform processes it under its own privacy policy.",
  },
  {
    zhTitle: "使用目的",
    enTitle: "Purpose",
    zhBody: "表单用于组织商业联系内容。仅当您明确选择通过 WhatsApp 发送或复制至微信并自行发送后，联系人员才有可能收到您的信息。填写表单不构成商业订单、正式报价或考察确认。",
    enBody: "The forms organize a commercial inquiry. The team can receive your information only after you choose WhatsApp or copy and send the message through WeChat. Completing a form does not create an order, formal quotation, or confirmed visit.",
  },
  {
    zhTitle: "存储与接收方",
    enTitle: "Storage and recipients",
    zhBody: "网站没有数据库或表单接收后端。消息由您选择的通信平台传输，可能涉及跨境处理。发送之前请自行核对信息和对方的联系方式。",
    enBody: "The website has no database or form-receiving backend. Your chosen communication platform transmits the message and may process it across borders. Review the information and recipient details before sending.",
  },
  {
    zhTitle: "保留、更正与删除",
    enTitle: "Retention and your choices",
    zhBody: "本站本身不保存询价表单内容。通过 WhatsApp 或微信发送后的保存期限取决于通信平台及接收方的相关政策。您可通过公开联系方式提出信息查询、更正或删除请求；详细法律文本仍需审核。",
    enBody: "This site does not retain inquiry-form content. Retention after sending through WhatsApp or WeChat depends on the platform and recipient policies. You may use the published contact channels to request access, correction, or deletion; the detailed legal text still requires review.",
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
    zhBody: "网站表单用于准备非约束性商业询价消息。本网站不自动发送或存储询价。您须主动通过 WhatsApp 或微信发送消息；发送也不构成订单接受、供货承诺、考察确认或正式报价。",
    enBody: "The website forms prepare non-binding commercial inquiry messages. This site does not send or store inquiries automatically. You must send the message through WhatsApp or WeChat, and doing so does not constitute order acceptance, a supply commitment, visit confirmation, or a formal quotation.",
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

