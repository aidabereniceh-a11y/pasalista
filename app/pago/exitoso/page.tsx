"use client";
export const runtime = "edge";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function PagoExitoso() {
  const searchParams = useSearchParams();
  const maestroId = searchParams.get("maestro");
  const [confirmando, setConfirmando] = useState(true);

  useEffect(() => {
    if (!maestroId) {
      setConfirmando(false);
      return;
    }

    let intentos = 0;
    const maxIntentos = 8;

    const revisar = async () => {
      intentos++;
      try {
        const res = await fetch("/api/verificar-vigencia", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ maestroId }),
        });
        const data = await res.json();

        if (res.ok && data.maestro?.plan === "premium") {
          localStorage.setItem("maestro", JSON.stringify(data.maestro));
          setConfirmando(false);
          return;
        }
      } catch {
        // seguimos intentando
      }

      if (intentos < maxIntentos) {
        setTimeout(revisar, 1000);
      } else {
        // Si tarda demasiado, dejamos de esperar; el webhook seguira activando
        // el plan en segundo plano aunque el usuario ya haya avanzado.
        setConfirmando(false);
      }
    };

    revisar();
  }, [maestroId]);

  if (confirmando) {
    return (
      <main style={{ minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Arial, sans-serif" }}>
        <div style={{ background: "white", borderRadius: "24px", padding: "40px 32px", maxWidth: "400px", width: "100%", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>⏳</div>
          <h1 style={{ color: "#1e293b", fontSize: "20px", fontWeight: "700", margin: "0 0 8px 0" }}>Confirmando tu pago...</h1>
          <p style={{ color: "#64748b", margin: 0 }}>Esto toma unos segundos, no cierres esta pantalla.</p>
        </div>
      </main>
    );
  }

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