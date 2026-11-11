"use client";
export const runtime = "edge";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function ReportePage() {
  const params = useParams();
  const token = params.token as string;
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    fetch(`/api/reporte/${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error);
        else setData(d);
      });
  }, [token]);

  if (error) return (
    <main style={{ minHeight: "100vh", background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontFamily: "system-ui" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔒</div>
        <h1 style={{ fontSize: "20px", marginBottom: "8px" }}>Reporte no encontrado</h1>
        <p style={{ color: "#64748b", fontSize: "14px" }}>Este link no es válido o ya no está disponible.</p>
      </div>
    </main>
  );

  if (!data) return (
    <main style={{ minHeight: "100vh", background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontFamily: "system-ui" }}>
      <p>Cargando reporte...</p>
    </main>
  );

  const promedio = data.calificaciones.length > 0
    ? (data.calificaciones.reduce((s: number, c: any) => s + Number(c.calificacion), 0) / data.calificaciones.length).toFixed(1)
    : null;

  return (
    <main style={{ minHeight: "100vh", background: "#0f172a", color: "white", fontFamily: "system-ui, sans-serif", padding: "24px" }}>
      <div style={{ maxWidth: "480px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ fontSize: "40px", marginBottom: "8px" }}>📋</div>
          <h1 style={{ fontSize: "22px", fontWeight: "800", margin: "0 0 4px" }}>Reporte del Alumno</h1>
          <p style={{ color: "#94a3b8", fontSize: "13px", margin: 0 }}>PasaLista.mx</p>
        </div>

        {/* Info alumno */}
        <div style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(118,75,162,0.2))", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "16px", padding: "20px", marginBottom: "16px" }}>
          <h2 style={{ margin: "0 0 12px", fontSize: "18px", fontWeight: "800" }}>{data.alumno}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            <div>
              <p style={{ margin: 0, fontSize: "11px", color: "#94a3b8", textTransform: "uppercase" }}>Grupo</p>
              <p style={{ margin: "2px 0 0", fontSize: "14px", fontWeight: "600" }}>{data.grupo}</p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "11px", color: "#94a3b8", textTransform: "uppercase" }}>Maestra</p>
              <p style={{ margin: "2px 0 0", fontSize: "14px", fontWeight: "600" }}>{data.maestro}</p>
            </div>
          </div>
        </div>

        {/* Asistencia */}
        <div style={{ background: "#1e293b", borderRadius: "16px", padding: "20px", marginBottom: "16px" }}>
          <h3 style={{ margin: "0 0 16px", fontSize: "15px", fontWeight: "700" }}>📅 Asistencia del mes</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", textAlign: "center" }}>
            {[
              { label: "Presentes", valor: data.asistencia.presentes, color: "#4ade80" },
              { label: "Faltas", valor: data.asistencia.faltas, color: "#f87171" },
              { label: "Total", valor: data.asistencia.total, color: "#94a3b8" },
            ].map(item => (
              <div key={item.label} style={{ background: "rgba(255,255,255,0.05)", borderRadius: "10px", padding: "12px 8px" }}>
                <p style={{ margin: 0, fontSize: "24px", fontWeight: "800", color: item.color }}>{item.valor}</p>
                <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#64748b" }}>{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Calificaciones */}
        {data.calificaciones.length > 0 && (
          <div style={{ background: "#1e293b", borderRadius: "16px", padding: "20px", marginBottom: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "700" }}>📝 Calificaciones</h3>
              {promedio && (
                <span style={{ background: "rgba(99,102,241,0.2)", color: "#a5b4fc", padding: "4px 12px", borderRadius: "20px", fontSize: "13px", fontWeight: "700" }}>
                  Promedio: {promedio}
                </span>
              )}
            </div>
            {data.calificaciones.map((c: any, i: number) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < data.calificaciones.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                <div>
                  <p style={{ margin: 0, fontSize: "14px", fontWeight: "600" }}>{c.evaluacion}</p>
                  {c.observacion && <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#94a3b8" }}>{c.observacion}</p>}
                </div>
                <span style={{
                  fontSize: "20px", fontWeight: "800",
                  color: Number(c.calificacion) >= 8 ? "#4ade80" : Number(c.calificacion) >= 6 ? "#fbbf24" : "#f87171"
                }}>{c.calificacion}</span>
              </div>
            ))}
          </div>
        )}

        {/* Conducta */}
        {data.conducta.length > 0 && (
          <div style={{ background: "#1e293b", borderRadius: "16px", padding: "20px", marginBottom: "24px" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: "15px", fontWeight: "700" }}>🌟 Conducta</h3>
            {data.conducta.map((c: any, i: number) => (
              <div key={i} style={{ marginBottom: i < data.conducta.length - 1 ? "16px" : 0 }}>
                <p style={{ margin: "0 0 8px", fontSize: "12px", color: "#6366f1", fontWeight: "700", textTransform: "uppercase" }}>{c.periodo}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: c.observacion ? "8px" : 0 }}>
                  {(c.comentarios || []).map((com: string, j: number) => (
                    <span key={j} style={{
                      padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600",
                      background: ["Participa con entusiasmo", "Respeta las reglas del salón", "Entrega trabajos a tiempo"].includes(com)
                        ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                      color: ["Participa con entusiasmo", "Respeta las reglas del salón", "Entrega trabajos a tiempo"].includes(com)
                        ? "#4ade80" : "#f87171",
                    }}>{com}</span>
                  ))}
                </div>
                {c.observacion && <p style={{ margin: 0, fontSize: "13px", color: "#cbd5e1", fontStyle: "italic" }}>{c.observacion}</p>}
              </div>
            ))}
          </div>
        )}

        <p style={{ textAlign: "center", color: "#334155", fontSize: "12px" }}>
          Generado por PasaLista.mx
        </p>
      </div>
    </main>
  );
}