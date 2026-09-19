"use client";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function FormularioRestablecer() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [listo, setListo] = useState(false);
  const [error, setError] = useState("");

  const guardar = async () => {
    if (!token) {
      setError("Enlace invalido");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (password !== confirmar) {
      setError("Las contraseñas no coinciden");
      return;
    }
    setEnviando(true);
    setError("");
    try {
      const res = await fetch("/api/restablecer-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al restablecer");
        setEnviando(false);
        return;
      }
      setListo(true);
      setTimeout(() => { window.location.href = "/login"; }, 2500);
    } catch {
      setError("Ocurrio un error, intenta de nuevo");
      setEnviando(false);
    }
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
        <div style={{ fontSize: "48px", marginBottom: "8px" }}>🔒</div>
        <h1 style={{ margin: "0 0 4px 0", fontSize: "20px", color: "#1e293b", fontWeight: "700" }}>
          Nueva contraseña
        </h1>

        {!token ? (
          <div style={{ background: "#fee2e2", color: "#991b1b", padding: "16px", borderRadius: "12px", fontSize: "14px", marginTop: "16px" }}>
            Este enlace no es válido. <a href="/recuperar" style={{ color: "#991b1b", fontWeight: "700" }}>Solicita uno nuevo</a>.
          </div>
        ) : listo ? (
          <div style={{ background: "#dcfce7", color: "#166534", padding: "16px", borderRadius: "12px", fontSize: "14px", marginTop: "16px" }}>
            ¡Contraseña actualizada! Te llevamos al login...
          </div>
        ) : (
          <>
            <p style={{ margin: "0 0 20px 0", color: "#94a3b8", fontSize: "14px" }}>
              Escribe tu nueva contraseña
            </p>
            <input
              type="password"
              placeholder="Nueva contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%", padding: "14px", marginBottom: "12px",
                border: "2px solid #e2e8f0", borderRadius: "12px",
                fontSize: "15px", outline: "none", boxSizing: "border-box",
              }}
            />
            <input
              type="password"
              placeholder="Confirma tu contraseña"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && guardar()}
              style={{
                width: "100%", padding: "14px", marginBottom: "16px",
                border: "2px solid #e2e8f0", borderRadius: "12px",
                fontSize: "15px", outline: "none", boxSizing: "border-box",
              }}
            />
            <button
              onClick={guardar}
              disabled={enviando}
              style={{
                width: "100%", padding: "16px",
                background: enviando ? "#cbd5e1" : "linear-gradient(135deg, #667eea, #764ba2)",
                color: "white", border: "none", borderRadius: "12px",
                fontSize: "16px", fontWeight: "700",
                cursor: enviando ? "not-allowed" : "pointer",
              }}
            >
              {enviando ? "Guardando..." : "Guardar contraseña"}
            </button>
            {error && (
              <div style={{ marginTop: "16px", background: "#fee2e2", color: "#991b1b", padding: "12px", borderRadius: "12px", fontSize: "13px" }}>
                {error}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

export default function RestablecerPassword() {
  return (
    <Suspense fallback={null}>
      <FormularioRestablecer />
    </Suspense>
  );
}