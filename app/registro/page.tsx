"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Registro() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [color, setColor] = useState("");
  const [cargando, setCargando] = useState(false);

  const registrar = async () => {
    if (cargando) return;
    if (!nombre || !email || !password) {
      setColor("#ef4444");
      setMensaje("Por favor llena todos los campos");
      return;
    }
    setCargando(true);
    setMensaje("");

    const { data: existente } = await supabase
      .from("maestros")
      .select("id")
      .eq("email", email)
      .single();

    if (existente) {
      setColor("#ef4444");
      setMensaje("Este email ya esta registrado");
      setCargando(false);
      return;
    }

    const { error } = await supabase
      .from("maestros")
      .insert({ nombre, email, password, plan: "gratis" });

    if (error) {
      setColor("#ef4444");
      setMensaje("Error al registrar, intenta de nuevo");
    } else {
      setColor("#22c55e");
      setMensaje("Registro exitoso! Redirigiendo...");
      setTimeout(() => {
        window.location.href = "/login";
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
          Crear cuenta
        </h1>
        <p style={{ margin: "0 0 28px 0", color: "#94a3b8", fontSize: "14px" }}>
          Asistencia QR Escolar
        </p>

        <input
          type="text"
          placeholder="Tu nombre completo"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          style={{
            width: "100%", padding: "14px", marginBottom: "12px",
            border: "2px solid #e2e8f0", borderRadius: "12px",
            fontSize: "15px", outline: "none", boxSizing: "border-box",
          }}
        />
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
          onClick={registrar}
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
          {cargando ? "Registrando..." : "Crear cuenta gratis"}
        </button>

        <p style={{ color: "#64748b", fontSize: "14px" }}>
          Ya tienes cuenta?{" "}
          <a href="/login" style={{ color: "#667eea", fontWeight: "600", textDecoration: "none" }}>
            Inicia sesion
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