# EmailJS variable reference

All outgoing values are strings. Optional missing values are `未提供` or `Not provided`; unselected formats use `0`. HTML uses escaped double braces only. Newlines remain plain text, displayed using inline `white-space: pre-wrap`. No user-provided HTML or recipient parameters are sent.

## quote-request

<!-- quote-request -->
| Variable | Meaning |
| --- | --- |
| `company` | Company name / 公司名称 |
| `country` | Country or region / 国家或地区 |
| `contact_name` | Contact person / 联系人 |
| `contact_email` | Buyer email or localized missing value; display only |
| `wechat_id` | WeChat contact or localized missing value |
| `contact_method` | Localized contact preference |
| `message` | Plain multiline buyer message or localized missing value |
| `submission_date` | ISO 8601 UTC timestamp from visitor device |
| `site_language` | 简体中文 (zh-CN) or English (en) |
| `privacy_consent` | 已同意 or Consented; submission requires consent |
| `products_summary` | Plain multiline selected package counts |
| `quantity_250ml` | 250 ml package count; 0 when unselected |
| `quantity_500ml` | 500 ml package count; 0 when unselected |
| `quantity_750ml` | 750 ml package count; 0 when unselected |
| `quantity_5l` | 5 L package count; 0 when unselected |
| `total_litres` | Total volume with two decimals, using 0.25 / 0.5 / 0.75 / 5 L |
| `destination_port` | Destination port (required) |
<!-- end -->

## grove-visit-request

<!-- grove-visit-request -->
| Variable | Meaning |
| --- | --- |
| `company` | Company name / 公司名称 |
| `country` | Country or region / 国家或地区 |
| `contact_name` | Contact person / 联系人 |
| `contact_email` | Buyer email or localized missing value; display only |
| `wechat_id` | WeChat contact or localized missing value |
| `contact_method` | Localized contact preference |
| `message` | Plain multiline buyer message or localized missing value |
| `submission_date` | ISO 8601 UTC timestamp from visitor device |
| `site_language` | 简体中文 (zh-CN) or English (en) |
| `privacy_consent` | 已同意 or Consented; submission requires consent |
| `preferred_visit_period` | Requested period (required), never a confirmed appointment |
| `visitor_count` | Integer 1–50 or localized missing value |
<!-- end -->

Source contracts: `src/types/emailjs.ts`. Mappers and validation: `src/lib/forms/lead.ts`. Run `npm run verify:emailjs` to compare HTML variables, exact documented keys, TypeScript contracts and real generated string parameters.
