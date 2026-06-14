"use client";
export const runtime = "edge";
export default function PagoFallido() {
  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Arial, sans-serif" }}>
      <div style={{ background: "white", borderRadius: "24px", padding: "40px 32px", maxWidth: "400px", width: "100%", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ fontSize: "64px", marginBottom: "16px" }}>😕</div>
        <h1 style={{ color: "#1e293b", fontSize: "24px", fontWeight: "700", margin: "0 0 8px 0" }}>Pago fallido</h1>
        <p style={{ color: "#64748b", marginBottom: "24px" }}>Hubo un problema con tu pago. Intenta de nuevo.</p>
        <a href="/dashboard" style={{ background: "linear-gradient(135deg, #667eea, #764ba2)", color: "white", padding: "14px 28px", borderRadius: "12px", textDecoration: "none", fontWeight: "700", fontSize: "16px", display: "inline-block" }}>Volver al dashboard</a>
      </div>
    </main>
  );
}