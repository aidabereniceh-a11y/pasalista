"use client";
export const runtime = "edge";

import { useState, useEffect } from "react";

export default function PerfilPage() {
  const [maestro, setMaestro] = useState<any>(null);
  const [tokenInput, setTokenInput] = useState("");
  const [tieneToken, setTieneToken] = useState(false);
  const [tokenMasked, setTokenMasked] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [color, setColor] = useState("");
  const [mostrarInput, setMostrarInput] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem("maestro");
    if (!data) { window.location.href = "/login"; return; }
    const m = JSON.parse(data);
    setMaestro(m);
    cargarPerfil(m.id);
  }, []);

  const cargarPerfil = async (id: number) => {
    const res = await fetch(`/api/perfil?maestroId=${id}`);
    const data = await res.json();
    if (res.ok) {
      setTieneToken(data.maestro.tiene_token);
      setTokenMasked(data.maestro.token_masked || "");
    }
  };

  const guardarToken = async () => {
    if (guardando) return;
    if (!tokenInput.trim()) { setColor("#ef4444"); setMensaje("Pega tu Access Token"); return; }
    if (!tokenInput.trim().startsWith("APP_USR-")) {
      setColor("#ef4444");
      setMensaje("El token debe empezar con APP_USR-. Verifica que copiaste el correcto.");
      return;
    }
    setGuardando(true); setMensaje("");
    const res = await fetch("/api/perfil", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ maestroId: maestro.id, mp_access_token: tokenInput.trim() }),
    });
    const data = await res.json();
    setGuardando(false);
    if (!res.ok) { setColor("#ef4444"); setMensaje(data.error || "Error al guardar"); return; }
    setColor("#22c55e");
    setMensaje("✅ Token guardado. Ya puedes generar links de pago para tus alumnos.");
    setTokenInput("");
    setMostrarInput(false);
    cargarPerfil(maestro.id);
  };

  if (!maestro) return null;

  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0a0f1e 0%, #0f2027 100%)", fontFamily: "Arial, sans-serif", padding: "24px", color: "white" }}>
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: "700", margin: 0 }}>Mi perfil</h1>
            <p style={{ color: "#94a3b8", fontSize: "14px", margin: "4px 0 0 0" }}>{maestro.nombre}</p>
          </div>
          <a href="/dashboard/academia" style={{ background: "rgba(99,102,241,0.15)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.3)", padding: "8px 14px", borderRadius: "10px", fontSize: "13px", fontWeight: "600", textDecoration: "none" }}>
            ← Academia
          </a>
        </div>

        {/* Tarjeta MercadoPago */}
        <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "24px", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <div style={{ fontSize: "28px" }}>💳</div>
            <div>
              <h2 style={{ margin: 0, fontSize: "16px", fontWeight: "700" }}>MercadoPago</h2>
              <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#94a3b8" }}>Conecta tu cuenta para cobrarle a tus alumnos</p>
            </div>
          </div>

          {tieneToken ? (
            <div>
              <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: "10px", padding: "12px 16px", marginBottom: "14px", display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ color: "#4ade80", fontSize: "16px" }}>✅</span>
                <div>
                  <p style={{ margin: 0, fontSize: "13px", fontWeight: "700", color: "#4ade80" }}>Cuenta conectada</p>
                  <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b", fontFamily: "monospace" }}>{tokenMasked}</p>
                </div>
              </div>
              <button
                onClick={() => { setMostrarInput(!mostrarInput); setMensaje(""); }}
                style={{ background: "rgba(255,255,255,0.08)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.15)", padding: "8px 16px", borderRadius: "8px", fontSize: "13px", cursor: "pointer" }}
              >
                {mostrarInput ? "Cancelar" : "🔄 Cambiar token"}
              </button>
            </div>
          ) : (
            <div style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: "10px", padding: "12px 16px", marginBottom: "14px" }}>
              <p style={{ margin: 0, fontSize: "13px", color: "#fbbf24", fontWeight: "600" }}>⚠️ Sin cuenta conectada</p>
              <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#94a3b8" }}>Conecta MercadoPago para enviar links de cobro a tus alumnos.</p>
            </div>
          )}

          {(!tieneToken || mostrarInput) && (
            <div style={{ marginTop: "16px" }}>
              {/* Instrucciones */}
              <div style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "10px", padding: "14px", marginBottom: "16px" }}>
                <p style={{ margin: "0 0 8px", fontSize: "13px", fontWeight: "700", color: "#a5b4fc" }}>¿Cómo obtener tu Access Token?</p>
                <ol style={{ margin: 0, paddingLeft: "18px", fontSize: "12px", color: "#94a3b8", lineHeight: "1.8" }}>
                  <li>Entra a <a href="https://www.mercadopago.com.mx/developers/panel/app" target="_blank" rel="noopener noreferrer" style={{ color: "#818cf8" }}>mercadopago.com.mx/developers</a></li>
                  <li>Crea una aplicación (o usa una existente)</li>
                  <li>Ve a <strong style={{ color: "#e2e8f0" }}>Credenciales de producción</strong></li>
                  <li>Copia el <strong style={{ color: "#e2e8f0" }}>Access Token</strong> (empieza con APP_USR-)</li>
                </ol>
              </div>

              <label style={{ fontSize: "13px", color: "#94a3b8", display: "block", marginBottom: "6px" }}>Access Token de producción</label>
              <input
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="APP_USR-XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
                style={{ width: "100%", padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "white", fontSize: "13px", boxSizing: "border-box", fontFamily: "monospace", marginBottom: "10px" }}
              />
              <button
                onClick={guardarToken}
                disabled={guardando}
                style={{ width: "100%", padding: "13px", background: guardando ? "#475569" : "linear-gradient(135deg, #667eea, #764ba2)", color: "white", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "700", cursor: guardando ? "not-allowed" : "pointer" }}
              >
                {guardando ? "Guardando..." : "Conectar MercadoPago"}
              </button>
              {mensaje && (
                <div style={{ marginTop: "12px", background: color, color: "white", padding: "12px", borderRadius: "10px", fontSize: "13px", fontWeight: "600" }}>
                  {mensaje}
                </div>
              )}
            </div>
          )}
          {mensaje && tieneToken && (
            <div style={{ marginTop: "12px", background: color, color: "white", padding: "12px", borderRadius: "10px", fontSize: "13px", fontWeight: "600" }}>
              {mensaje}
            </div>
          )}
        </div>

        {/* Info de la cuenta */}
        <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "20px" }}>
          <h2 style={{ margin: "0 0 14px", fontSize: "15px", fontWeight: "700" }}>Datos de la cuenta</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
              <span style={{ color: "#94a3b8" }}>Nombre</span>
              <span style={{ fontWeight: "600" }}>{maestro.nombre}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
              <span style={{ color: "#94a3b8" }}>Email</span>
              <span style={{ fontWeight: "600" }}>{maestro.email}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
              <span style={{ color: "#94a3b8" }}>Plan</span>
              <span style={{ fontWeight: "700", color: maestro.plan === "premium" ? "#a5b4fc" : "#94a3b8" }}>
                {maestro.plan === "premium" ? "Premium ✓" : "Gratis"}
              </span>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
