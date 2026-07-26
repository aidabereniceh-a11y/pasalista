"use client";
import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [color, setColor] = useState("");
  const [cargando, setCargando] = useState(false);

  const iniciarSesion = async () => {
    if (cargando) return;
    if (!email || !password) {
      setColor("#ef4444");
      setMensaje("Por favor llena todos los campos");
      return;
    }
    setCargando(true);
    setMensaje("");

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      setColor("#ef4444");
      setMensaje(data.error || "Email o contrasena incorrectos");
    } else {
      localStorage.setItem("maestro", JSON.stringify(data.maestro));
      setColor("#22c55e");
      setMensaje("Bienvenido " + data.maestro.nombre + "!");
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
    }
    setCargando(false);
  };

  return (
    <main style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Arial, sans-serif",
      padding: "20px",
    }}>
      <div style={{
        background: "white",
        borderRadius: "24px",
        padding: "40px 32px",
        width: "100%",
        maxWidth: "400px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        textAlign: "center",
      }}>
        <div style={{ fontSize: "48px", marginBottom: "8px" }}>📚</div>
        <h1 style={{ margin: "0 0 4px 0", fontSize: "22px", color: "#1e293b", fontWeight: "700" }}>
          Iniciar sesion
        </h1>
        <p style={{ margin: "0 0 28px 0", color: "#94a3b8", fontSize: "14px" }}>
          Asistencia QR Escolar
        </p>

        <input
          type="email"
          placeholder="Tu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%", padding: "14px", marginBottom: "12px",
            border: "2px solid #e2e8f0", borderRadius: "12px",
            fontSize: "15px", outline: "none", boxSizing: "border-box",
          }}
        />
        <input
          type="password"
          placeholder="Contrasena"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%", padding: "14px", marginBottom: "20px",
            border: "2px solid #e2e8f0", borderRadius: "12px",
            fontSize: "15px", outline: "none", boxSizing: "border-box",
          }}
        />

        <button
          onClick={iniciarSesion}
          disabled={cargando}
          style={{
            width: "100%", padding: "16px",
            background: cargando ? "#cbd5e1" : "linear-gradient(135deg, #667eea, #764ba2)",
            color: "white", border: "none", borderRadius: "12px",
            fontSize: "16px", fontWeight: "700",
            cursor: cargando ? "not-allowed" : "pointer",
            marginBottom: "16px",
          }}
        >
          {cargando ? "Entrando..." : "Iniciar sesion"}
        </button>

        <p style={{ color: "#64748b", fontSize: "14px" }}>
          No tienes cuenta?{" "}
          <a href="/registro" style={{ color: "#667eea", fontWeight: "600", textDecoration: "none" }}>
            Registrate gratis
          </a>
        </p>

        {mensaje && (
          <div style={{
            marginTop: "16px", background: color, color: "white",
            padding: "14px", borderRadius: "12px", fontSize: "14px", fontWeight: "600",
          }}>
            {mensaje}
          </div>
        )}
      </div>
    </main>
  );
}