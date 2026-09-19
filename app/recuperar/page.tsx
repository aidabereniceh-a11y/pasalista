"use client";
import { useState } from "react";

export default function RecuperarPassword() {
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");

  const enviar = async () => {
    if (!email.trim()) {
      setError("Escribe tu correo");
      return;
    }
    setEnviando(true);
    setError("");
    try {
      const res = await fetch("/api/solicitar-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok) throw new Error();
      setEnviado(true);
    } catch {
      setError("Ocurrio un error, intenta de nuevo");
    }
    setEnviando(false);
  };

  return (
    <main style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "Arial, sans-serif", padding: "20px",
    }}>
      <div style={{
        background: "white", borderRadius: "24px", padding: "40px 32px",
        width: "100%", maxWidth: "380px", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", textAlign: "center",
      }}>
        <div style={{ fontSize: "48px", marginBottom: "8px" }}>🔑</div>
        <h1 style={{ margin: "0 0 4px 0", fontSize: "20px", color: "#1e293b", fontWeight: "700" }}>
          Recuperar contraseña
        </h1>
        <p style={{ margin: "0 0 24px 0", color: "#94a3b8", fontSize: "14px" }}>
          Te enviaremos un enlace para restablecerla
        </p>

        {enviado ? (
          <div style={{ background: "#dcfce7", color: "#166534", padding: "16px", borderRadius: "12px", fontSize: "14px" }}>
            Si el correo está registrado, te llegará un enlace en unos minutos. Revisa también tu carpeta de spam.
          </div>
        ) : (
          <>
            <input
              type="email"
              placeholder="Tu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && enviar()}
              style={{
                width: "100%", padding: "14px", marginBottom: "16px",
                border: "2px solid #e2e8f0", borderRadius: "12px",
                fontSize: "15px", outline: "none", boxSizing: "border-box",
              }}
            />
            <button
              onClick={enviar}
              disabled={enviando}
              style={{
                width: "100%", padding: "16px",
                background: enviando ? "#cbd5e1" : "linear-gradient(135deg, #667eea, #764ba2)",
                color: "white", border: "none", borderRadius: "12px",
                fontSize: "16px", fontWeight: "700",
                cursor: enviando ? "not-allowed" : "pointer",
              }}
            >
              {enviando ? "Enviando..." : "Enviar enlace"}
            </button>
            {error && (
              <div style={{ marginTop: "16px", background: "#fee2e2", color: "#991b1b", padding: "12px", borderRadius: "12px", fontSize: "13px" }}>
                {error}
              </div>
            )}
          </>
        )}

        <p style={{ marginTop: "20px", color: "#64748b", fontSize: "14px" }}>
          <a href="/login" style={{ color: "#667eea", fontWeight: "600", textDecoration: "none" }}>Volver a iniciar sesión</a>
        </p>
      </div>
    </main>
  );
}