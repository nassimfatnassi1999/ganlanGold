export class RequestSecurityError extends Error {
  readonly status = 403;

  constructor(message = "Request origin is not allowed") {
    super(message);
    this.name = "RequestSecurityError";
  }
}

function proxyOrigin(request: Request): string {
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const forwardedProtocol = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const requestUrl = new URL(request.url);
  const host = forwardedHost ?? request.headers.get("host") ?? requestUrl.host;
  const protocol = forwardedProtocol ?? requestUrl.protocol.replace(":", "");
  return `${protocol}://${host}`;
}

export function assertSameOrigin(request: Request, publicUrl?: string): void {
  const origin = request.headers.get("origin");
  if (!origin) throw new RequestSecurityError("A mutation Origin header is required");

  let suppliedOrigin: string;
  try {
    suppliedOrigin = new URL(origin).origin;
  } catch {
    throw new RequestSecurityError("The mutation Origin header is invalid");
  }

  const expectedOrigin = publicUrl ? new URL(publicUrl).origin : proxyOrigin(request);
  if (suppliedOrigin !== expectedOrigin) throw new RequestSecurityError();
}
