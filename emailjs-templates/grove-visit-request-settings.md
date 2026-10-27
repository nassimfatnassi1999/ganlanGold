# Grove visit template dashboard settings

- **Template name:** GANLAN GOLD — Grove Visit
- **Subject:** `GANLAN GOLD | 橄榄园参观申请 / Grove Visit Request — {{company}}`
- **Content:** paste the **entire** `grove-visit-request.html` document into the EmailJS HTML/code editor and save.
- **To Email:** configure the actual authorized business recipient directly in EmailJS; confirm with the owner. The website cannot choose the recipient.
- **From Name:** `GANLAN GOLD Website`
- **From Email:** the sender authorized by the connected email provider; use its default sender where appropriate. Never the visitor's address.
- **Reply-To:** leave blank for the supported email-or-WeChat flow. `{{contact_email}}` may be a localized missing-value label and must not be used as an unconditional email header. Reply manually to a valid address in the body, or use the supplied WeChat contact.
- **CC/BCC:** blank or explicitly authorized fixed internal addresses; no visitor-controlled variables.
- **Auto-reply / linked confirmation template:** disabled. No appointment is automatically confirmed, and no date is promised.

Copy this template's ID into `NEXT_PUBLIC_EMAILJS_VISIT_TEMPLATE_ID` and rebuild. It must differ from the quote Template ID. The requested period is an expression of interest; the team must separately confirm arrangements.
