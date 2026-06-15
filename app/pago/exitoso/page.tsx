"use client";
export const runtime = "edge";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function PagoExitoso() {
  const searchParams = useSearchParams();
  const maestroId = searchParams.get("maestro");

  useEffect(() => {
    if (!maestroId) return;

    const premiumHasta = new Date();
    premiumHasta.setDate(premiumHasta.getDate() + 30);

    supabase
      .from("maestros")
      .update({ plan: "premium", premium_hasta: premiumHasta.toISOString() })
      .eq("id", maestroId)
      .then(() => {
        const data = localStorage.getItem("maestro");
        if (data) {
          const m = JSON.parse(data);
          m.plan = "premium";
          m.premium_hasta = premiumHasta.toISOString();
          localStorage.setItem("maestro", JSON.stringify(m));
        }
      });
  }, [maestroId]);

  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Arial, sans-serif" }}>
      <div style={{ background: "white", borderRadius: "24px", padding: "40px 32px", maxWidth: "400px", width: "100%", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ fontSize: "64px", marginBottom: "16px" }}>🎉</div>
        <h1 style={{ color: "#1e293b", fontSize: "24px", fontWeight: "700", margin: "0 0 8px 0" }}>Pago exitoso</h1>
        <p style={{ color: "#64748b", marginBottom: "24px" }}>Ya tienes acceso al plan Premium por 30 dias. Ahora puedes agregar grupos ilimitados.</p>
        <a href="/dashboard" style={{ background: "linear-gradient(135deg, #667eea, #764ba2)", color: "white", padding: "14px 28px", borderRadius: "12px", textDecoration: "none", fontWeight: "700", fontSize: "16px", display: "inline-block" }}>Ir al dashboard</a>
      </div>
    </main>
  );
}