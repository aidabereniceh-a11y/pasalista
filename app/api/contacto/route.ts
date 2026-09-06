export const runtime = "edge";

export async function GET() {
  const numero = process.env.WHATSAPP_CONTACTO || "525545708011";
  return Response.redirect(`https://wa.me/${numero}`, 307);
}