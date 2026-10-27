# Quotation template dashboard settings

- **Template name:** GANLAN GOLD — Quote Request
- **Subject:** `GANLAN GOLD | 新的报价申请 / New Quote Request — {{company}}`
- **Content:** switch to the HTML/code editor and paste the **entire** `quote-request.html` file; save it. Keep all double-braced variables as supplied.
- **To Email:** enter the actual authorized GANLAN GOLD business recipient directly in the dashboard. The frontend sends no destination address. Confirm the recipient with the business owner; no address is inferred from the site contacts.
- **From Name:** `GANLAN GOLD Website`
- **From Email:** use the connected provider's authorized sender/default sender. Never use the buyer's address as the sender.
- **Reply-To:** leave blank by default. `contact_email` is a display value and becomes `未提供` / `Not provided` for WeChat-only requests, so **do not** set Reply-To to `{{contact_email}}` for this mixed-contact workflow. Read the buyer email in the body and reply manually when valid; use WeChat otherwise. If you later implement conditional Reply-To, it must emit only a validated buyer email or omit the header, and must be tested against the provider before activation.
- **CC/BCC:** blank unless the owner has explicitly authorized fixed internal recipients. Never use visitor-supplied variables for these fields.
- **Auto-reply:** keep disabled; no buyer confirmation or quotation is generated.

Connect this template to the intended service, copy its Template ID into `NEXT_PUBLIC_EMAILJS_QUOTE_TEMPLATE_ID`, and rebuild. Keep it distinct from the grove visit Template ID. A submission is an inquiry, never a binding issued quotation.
