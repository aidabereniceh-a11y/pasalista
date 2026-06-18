import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/checkin/",
        "/asistencia/",
        "/qr/",
        "/pago/",
        "/api/",
      ],
    },
    sitemap: "https://pasalista.mx/sitemap.xml",
  };
}
