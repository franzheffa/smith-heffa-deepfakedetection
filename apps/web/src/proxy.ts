export { auth as proxy } from "@/auth";

export const config = {
  matcher: ["/workspace/:path*", "/billing/:path*", "/api/chat", "/api/detect", "/api/checkout"],
};
