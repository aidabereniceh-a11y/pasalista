// Colocar en: app/robots.ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/api/", "/asistencia", "/qr", "/checkin", "/grupo", "/admin", "/pago", "/restablecer", "/recuperar"],
    },
    sitemap: "https://pasalista.mx/sitemap.xml",
    host: "https://pasalista.mx",
  };
}