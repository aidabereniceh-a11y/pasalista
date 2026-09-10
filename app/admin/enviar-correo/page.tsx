"use client";
import { useState } from "react";

export default function EnviarCorreoMasivo() {
  const [secret, setSecret] = useState("");
  const [asunto, setAsunto] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<any>(null);
  const [error, setError] = useState("");

  const enviar = async () => {
    if (!secret || !asunto || !mensaje) {
      setError("Llena la contraseña, el asunto y el mensaje");
      return;
    }
    if (!confirm("Esto enviara el correo a TODOS los maestros registrados. Continuar?")) return;

    setEnviando(true);
    setError("");
    setResultado(null);

    try {
      const res = await fetch("/api/enviar-correo-masivo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret, asunto, mensaje }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al enviar");
      } else {
        setResultado(data);
      }
    } catch {
      setError("Error de conexion");
    }
    setEnviando(false);
  };

  return (
    <main style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "Arial, sans-serif", padding: "24px", color: "#1e293b" }}>
      <div style={{ maxWidth: "640px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "8px" }}>Enviar correo a todos los maestros</h1>
        <p style={{ color: "#64748b", fontSize: "13px", marginBottom: "24px" }}>
          Usa <code>{"{{nombre}}"}</code> o <code>{"{{primer_nombre}}"}</code> en el mensaje para personalizarlo automaticamente.
        </p>

        <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "24px" }}>
          <label style={{ fontSize: "13px", fontWeight: 600, display: "block", marginBottom: "6px" }}>Contrasena de administrador</label>
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "16px", boxSizing: "border-box" }}
          />

          <label style={{ fontSize: "13px", fontWeight: 600, display: "block", marginBottom: "6px" }}>Asunto</label>
          <input
            value={asunto}
            onChange={(e) => setAsunto(e.target.value)}
            placeholder="Nueva funcion en PasaLista"
            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "16px", boxSizing: "border-box" }}
          />

          <label style={{ fontSize: "13px", fontWeight: 600, display: "block", marginBottom: "6px" }}>Mensaje (admite HTML)</label>
          <textarea
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            rows={10}
            placeholder={"Hola {{primer_nombre}},\n\nTe escribimos para contarte..."}
            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "16px", boxSizing: "border-box", fontFamily: "inherit" }}
          />

          <button
            onClick={enviar}
            disabled={enviando}
            style={{ width: "100%", padding: "14px", background: enviando ? "#94a3b8" : "#6366f1", color: "white", border: "none", borderRadius: "10px", fontWeight: 700, cursor: enviando ? "not-allowed" : "pointer" }}
          >
            {enviando ? "Enviando…" : "Enviar a todos los maestros"}
          </button>

          {error && (
            <div style={{ marginTop: "16px", background: "#fee2e2", color: "#991b1b", padding: "12px", borderRadius: "10px", fontSize: "13px" }}>{error}</div>
          )}
          {resultado && (
            <div style={{ marginTop: "16px", background: "#dcfce7", color: "#166534", padding: "12px", borderRadius: "10px", fontSize: "13px" }}>
              Enviados: {resultado.enviados} de {resultado.total}.
              {resultado.fallidos?.length > 0 && (
                <div style={{ marginTop: "6px" }}>Fallaron: {resultado.fallidos.join(", ")}</div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}