"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Alumno {
  id: number;
  nombre: string;
  grupo?: { nombre: string; grado: string; turno: string };
}

interface ConductaData {
  periodo: string;
  comentarios: string[];
  observacion: string;
}

interface Calificacion {
  tarea: string;
  tipo: string;
  fecha: string;
  calificacion: number | null;
}

const POSITIVOS = [
  "Participa con entusiasmo",
  "Respeta las reglas del salón",
  "Entrega trabajos a tiempo",
  "Es colaborativo con sus compañeros",
  "Muestra interés en aprender",
  "Ayuda a sus compañeros",
  "Sigue instrucciones correctamente",
];

const MEJORA = [
  "Habla durante la explicación",
  "Se levanta de su lugar sin permiso",
  "No trae cuaderno",
  "No trae material necesario",
  "Interrumpe la clase",
  "No entrega tareas",
  "Distrae a sus compañeros",
];

export default function ReportePage() {
  const params = useParams();
  const token = params?.token as string;

  const [alumno, setAlumno] = useState<Alumno | null>(null);
  const [conductas, setConductas] = useState<ConductaData[]>([]);
  const [calificaciones, setCalificaciones] = useState<Calificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    fetch(`/api/reporte-publico?token=${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setError(data.error); setLoading(false); return; }
        setAlumno(data.alumno);
        setConductas(data.conductas || []);
        setCalificaciones(data.calificaciones || []);
        setLoading(false);
      })
      .catch(() => { setError("Error al cargar el reporte"); setLoading(false); });
  }, [token]);

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f172a", color: "white", fontFamily: "sans-serif" }}>
      Cargando reporte...
    </div>
  );

  if (error) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f172a", color: "#f87171", fontFamily: "sans-serif", flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: 48 }}>⚠️</div>
      <div>{error}</div>
    </div>
  );

  const positivos = conductas.flatMap(c => c.comentarios.filter(cm => POSITIVOS.includes(cm)));
  const mejoras = conductas.flatMap(c => c.comentarios.filter(cm => MEJORA.includes(cm)));
  const promedio = calificaciones.filter(c => c.calificacion !== null).length > 0
    ? (calificaciones.filter(c => c.calificacion !== null).reduce((s, c) => s + (c.calificacion || 0), 0) / calificaciones.filter(c => c.calificacion !== null).length).toFixed(1)
    : null;

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", fontFamily: "'Segoe UI', sans-serif", color: "#e2e8f0", padding: "24px 16px" }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>📋</div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "white" }}>Reporte del Alumno</h1>
          <p style={{ margin: "8px 0 0", color: "#94a3b8", fontSize: 14 }}>Pasalista · Sistema de Evaluación Docente</p>
        </div>

        {/* Datos alumno */}
        <div style={{ background: "#1e293b", borderRadius: 16, padding: 24, marginBottom: 20, border: "1px solid #334155" }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: "white", marginBottom: 4 }}>{alumno?.nombre}</div>
          {alumno?.grupo && (
            <div style={{ color: "#94a3b8", fontSize: 14 }}>
              {alumno.grupo.grado} · {alumno.grupo.nombre} · {alumno.grupo.turno}
            </div>
          )}
          {promedio && (
            <div style={{ marginTop: 16, display: "inline-block", background: "#6366f1", borderRadius: 12, padding: "8px 20px" }}>
              <span style={{ fontWeight: 800, fontSize: 20 }}>{promedio}</span>
              <span style={{ color: "#c7d2fe", fontSize: 13, marginLeft: 6 }}>promedio general</span>
            </div>
          )}
        </div>

        {/* Conducta */}
        {conductas.length > 0 && (
          <div style={{ background: "#1e293b", borderRadius: 16, padding: 24, marginBottom: 20, border: "1px solid #334155" }}>
            <h2 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "#6366f1" }}>📝 Conducta</h2>

            {conductas.map((c, i) => (
              <div key={i} style={{ marginBottom: 20 }}>
                <div style={{ fontWeight: 700, color: "#94a3b8", fontSize: 13, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>{c.periodo}</div>

                {c.comentarios.filter(cm => POSITIVOS.includes(cm)).length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ color: "#4ade80", fontWeight: 700, fontSize: 12, marginBottom: 6 }}>✅ POSITIVOS</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {c.comentarios.filter(cm => POSITIVOS.includes(cm)).map((cm, j) => (
                        <span key={j} style={{ background: "#14532d", color: "#86efac", padding: "4px 12px", borderRadius: 20, fontSize: 13 }}>{cm}</span>
                      ))}
                    </div>
                  </div>
                )}

                {c.comentarios.filter(cm => MEJORA.includes(cm)).length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ color: "#fbbf24", fontWeight: 700, fontSize: 12, marginBottom: 6 }}>⚠️ ÁREAS DE MEJORA</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {c.comentarios.filter(cm => MEJORA.includes(cm)).map((cm, j) => (
                        <span key={j} style={{ background: "#451a03", color: "#fcd34d", padding: "4px 12px", borderRadius: 20, fontSize: 13 }}>{cm}</span>
                      ))}
                    </div>
                  </div>
                )}

                {c.observacion && (
                  <div style={{ background: "#0f172a", borderRadius: 10, padding: "12px 16px", marginTop: 8, color: "#cbd5e1", fontSize: 14, fontStyle: "italic" }}>
                    "{c.observacion}"
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Calificaciones */}
        {calificaciones.length > 0 && (
          <div style={{ background: "#1e293b", borderRadius: 16, padding: 24, marginBottom: 20, border: "1px solid #334155" }}>
            <h2 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "#6366f1" }}>📊 Calificaciones</h2>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #334155" }}>
                    <th style={{ textAlign: "left", padding: "8px 12px", color: "#94a3b8", fontWeight: 600 }}>Actividad</th>
                    <th style={{ textAlign: "left", padding: "8px 12px", color: "#94a3b8", fontWeight: 600 }}>Tipo</th>
                    <th style={{ textAlign: "right", padding: "8px 12px", color: "#94a3b8", fontWeight: 600 }}>Calificación</th>
                  </tr>
                </thead>
                <tbody>
                  {calificaciones.map((cal, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #1e293b" }}>
                      <td style={{ padding: "10px 12px", color: "white" }}>{cal.tarea}</td>
                      <td style={{ padding: "10px 12px", color: "#94a3b8", textTransform: "capitalize" }}>{cal.tipo}</td>
                      <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 700, color: cal.calificacion !== null ? (cal.calificacion >= 7 ? "#4ade80" : "#f87171") : "#475569" }}>
                        {cal.calificacion !== null ? cal.calificacion : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div style={{ textAlign: "center", color: "#475569", fontSize: 12, marginTop: 24 }}>
          Reporte generado por Pasalista · pasalista.mx
        </div>
      </div>
    </div>
  );
}
