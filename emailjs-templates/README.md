# GANLAN GOLD EmailJS templates

Copy each complete HTML document into its own EmailJS template using the HTML/code editor:

| Template | HTML | Dashboard settings |
| --- | --- | --- |
| Quotation | [quote-request.html](quote-request.html) | [quote-request-settings.md](quote-request-settings.md) |
| Grove visit | [grove-visit-request.html](grove-visit-request.html) | [grove-visit-request-settings.md](grove-visit-request-settings.md) |

[VARIABLES_REFERENCE.md](VARIABLES_REFERENCE.md) lists the exact contracts. All inputs use escaped double braces. Multiline content is plain text with inline `white-space: pre-wrap`; clients that do not support this still display the escaped text safely. The two-column field tables, fixed table layout and wrapping protect mobile readability. No fonts, images, scripts or other external assets are required.

Run `npm run verify:emailjs` to check every template variable against the documented contract and actual TypeScript parameter builders. Run `npm run preview:emailjs` to regenerate the safe sample documents in `previews/`, then open those files locally in a browser. Samples use reserved `example.com` addresses and escape a deliberately hostile sample string to demonstrate safe rendering. They are review artifacts, not files to paste into EmailJS. Preview HTML in a browser does not replace testing Gmail, Outlook and mobile email clients with real delivery.

Use the source templates in the root of this directory for EmailJS. Subjects, actual recipients and authorized senders are configured in the dashboard. No email addresses or valid account IDs are invented here.

Full instructions: [setup](../docs/EMAILJS_SETUP.md), [testing](../docs/EMAILJS_TESTING.md).

Mobile screenshot samples: [quotation email](previews/quote-request-mobile.png), [visit email](previews/grove-visit-request-mobile.png), [website quotation form](previews/website-quote-mobile.png).
