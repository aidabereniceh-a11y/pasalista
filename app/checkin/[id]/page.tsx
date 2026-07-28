"use client";
export const runtime = "edge";
import { useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

export default function CheckIn() {
  const params = useParams();
  const searchParams = useSearchParams();
  const alumnoNombre = decodeURIComponent(params.id as string);
  const grupoId = searchParams.get("grupo");

  const [mensaje, setMensaje] = useState("");
  const [color, setColor] = useState("");
  const [cargando, setCargando] = useState(false);

  const guardar = async (accion: string) => {
    if (cargando) return;
    setCargando(true);
    setMensaje("");

    const res = await fetch("/api/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alumnoNombre, grupoId, accion }),
    });
    const data = await res.json();

    if (!res.ok) {
      setColor("#ef4444");
      setMensaje("Error: " + (data.error || "intenta de nuevo"));
    } else if (accion === "Presente") {
      setColor("#22c55e");
      setMensaje("Asistencia registrada correctamente");
    } else if (accion === "Salida al banio") {
      setColor("#f59e0b");
      setMensaje("Salida al banio registrada");
    } else {
      setColor("#3b82f6");
      setMensaje("Regreso del banio registrado");
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
        maxWidth: "380px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        textAlign: "center",
      }}>
        <div style={{ fontSize: "48px", marginBottom: "8px" }}>📚</div>
        <h1 style={{ margin: "0 0 4px 0", fontSize: "20px", color: "#1e293b", fontWeight: "700" }}>Asistencia QR Escolar</h1>
        <div style={{ background: "#f1f5f9", borderRadius: "16px", padding: "16px", marginBottom: "28px",marginTop: "16px" }}>
          <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px" }}>Alumno</p>
          <p style={{ margin: 0, fontSize: "20px", fontWeight: "700", color: "#2563eb" }}>{alumnoNombre}</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <button onClick={() => guardar("Presente")} disabled={cargando} style={{ padding: "16px", fontSize: "18px", fontWeight: "600", width: "100%", backgroundColor: cargando ? "#cbd5e1" : "#22c55e", color: "white", border: "none", borderRadius: "14px", cursor: cargando ? "not-allowed" : "pointer", boxShadow: cargando ? "none" : "0 4px 14px rgba(34,197,94,0.4)" }}>
            ✅ Presente
          </button>
          <button onClick={() => guardar("Salida al banio")} disabled={cargando} style={{ padding: "16px", fontSize: "18px", fontWeight: "600", width: "100%", backgroundColor: cargando ? "#cbd5e1" : "#f59e0b", color: "white", border: "none", borderRadius: "14px", cursor: cargando ? "not-allowed" : "pointer", boxShadow: cargando ? "none" : "0 4px 14px rgba(245,158,11,0.4)" }}>
            🚻 Salida al banio
          </button>
          <button onClick={() => guardar("Regreso del banio")} disabled={cargando} style={{ padding: "16px", fontSize: "18px", fontWeight: "600", width: "100%", backgroundColor: cargando ? "#cbd5e1" : "#3b82f6",color: "white", border: "none", borderRadius: "14px", cursor: cargando ? "not-allowed" : "pointer", boxShadow: cargando ? "none" : "0 4px 14px rgba(59,130,246,0.4)" }}>
            🔙 Regreso del banio
          </button>
        </div>
        {cargando && <p style={{ marginTop: "20px", color: "#94a3b8", fontSize: "14px" }}>Registrando...</p>}
        {mensaje && (
          <div style={{ marginTop: "24px", background: color, color: "white", padding: "20px", borderRadius: "16px", fontSize: "18px", fontWeight: "600" }}>
            {mensaje}
            <div style={{ marginTop: "8px", fontSize: "15px", opacity: 0.9 }}>{alumnoNombre}</div>
          </div>
        )}
      </div>
    </main>
  );
}