"use client";
export const runtime = "edge";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

const ESTATUS_ABREV: Record<string, { letra: string; color: string }> = {
  Presente: { letra: "P", color: "#22c55e" },
  Ausente: { letra: "A", color: "#ef4444" },
  Retardo: { letra: "R", color: "#eab308" },
  Justificado: { letra: "J", color: "#3b82f6" },
};

function toISODate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function inicioDeSemana(d: Date) {
  const dia = d.getDay(); // 0 domingo, 1 lunes...
  const diff = dia === 0 ? -6 : 1 - dia; // regresa al lunes
  const lunes = new Date(d);
  lunes.setDate(d.getDate() + diff);
  return lunes;
}

export default function ReporteAsistencia() {
  const params = useParams();
  const id = params.id as string;

  const [grupo, setGrupo] = useState<any>(null);
  const [alumnos, setAlumnos] = useState<any[]>([]);
  const [asistencias, setAsistencias] = useState<any[]>([]);
  const [periodo, setPeriodo] = useState<"dia" | "semana" | "mes">("semana");
  const [fechaRef, setFechaRef] = useState(toISODate(new Date()));
  const [cargando, setCargando] = useState(false);
  const [noAutorizado, setNoAutorizado] = useState(false);

  function calcularDias(periodo: "dia" | "semana" | "mes", ref: string): Date[] {
    const base = new Date(ref + "T00:00:00");
    if (periodo === "dia") return [base];
    if (periodo === "semana") {
      const lunes = inicioDeSemana(base);
      return Array.from({ length: 5 }, (_, i) => {
        const d = new Date(lunes);
        d.setDate(lunes.getDate() + i);
        return d;
      });
    }
    const anio = base.getFullYear();
    const mes = base.getMonth();
    const totalDias = new Date(anio, mes + 1, 0).getDate();
    return Array.from({ length: totalDias }, (_, i) => new Date(anio, mes, i + 1));
  }

  const dias = calcularDias(periodo, fechaRef);

  useEffect(() => {
    if (!id) return;
    cargarDatos();
  }, [id, periodo, fechaRef]);

  const cargarDatos = async () => {
    const data = localStorage.getItem("maestro");
    if (!data) { window.location.href = "/login"; return; }
    const maestro = JSON.parse(data);

    const diasCalc = calcularDias(periodo, fechaRef);
    const desde = new Date(diasCalc[0]);
    desde.setHours(0, 0, 0, 0);
    const hasta = new Date(diasCalc[diasCalc.length - 1]);
    hasta.setHours(23, 59, 59, 999);

    setCargando(true);
    const res = await fetch(
      `/api/asistencia-reporte?grupoId=${id}&maestroId=${maestro.id}&desde=${desde.toISOString()}&hasta=${hasta.toISOString()}`
    );
    if (!res.ok) { setNoAutorizado(true); setCargando(false); return; }
    const resultado = await res.json();
    setGrupo(resultado.grupo);
    setAlumnos(resultado.alumnos || []);
    setAsistencias(resultado.asistencias || []);
    setCargando(false);
  };

  const obtenerEstatus = (alumnoId: number, dia: Date) => {
    const inicioDia = new Date(dia); inicioDia.setHours(0, 0, 0, 0);
    const finDia = new Date(dia); finDia.setHours(23, 59, 59, 999);
    const registrosDelDia = asistencias
      .filter((a) => a.alumno_id === alumnoId && ["Presente", "Ausente", "Retardo", "Justificado"].includes(a.accion))
      .filter((a) => { const f = new Date(a.fecha); return f >= inicioDia && f <= finDia; })
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
    if (registrosDelDia.length === 0) {
      const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
      if (inicioDia > hoy) return null;
      return "Ausente";
    }
    return registrosDelDia[registrosDelDia.length - 1].accion;
  };

  const tituloPeriodo =
    periodo === "dia"
      ? dias[0]?.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
      : periodo === "semana"
      ? `Semana del ${dias[0]?.toLocaleDateString("es-MX", { day: "numeric", month: "short" })} al ${dias[dias.length - 1]?.toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}`
      : dias[0]?.toLocaleDateString("es-MX", { month: "long", year: "numeric" });

  if (noAutorizado) {
    return (
      <main style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Arial, sans-serif" }}>
        <p>No tienes acceso a este grupo.</p>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "Arial, sans-serif", padding: "24px", color: "#1e293b" }}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
        }
        table.reporte { border-collapse: collapse; width: 100%; }
        table.reporte th, table.reporte td { border: 1px solid #e2e8f0; padding: 6px 8px; text-align: center; font-size: 12px; }
        table.reporte th { background: #eef2ff; color: #4f46e5; font-weight: 700; }
        table.reporte td.nombre { text-align: left; font-weight: 600; white-space: nowrap; }
      `}</style>

      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
          <h1 style={{ fontSize: "22px", fontWeight: 700, margin: 0 }}>Reporte de asistencia {grupo ? "· " + grupo.nombre : ""}</h1>
          <a href={`/asistencia/${id}`} style={{ background: "#eef2ff", color: "#4f46e5", border: "1px solid #c7d2fe", padding: "8px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: 600, textDecoration: "none" }}>
            Volver
          </a>
        </div>

        <div className="no-print" style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap", alignItems: "center" }}>
          {(["dia", "semana", "mes"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriodo(p)}
              style={{
                padding: "8px 16px", borderRadius: "10px", border: "none", fontWeight: 700, fontSize: "13px", cursor: "pointer",
                background: periodo === p ? "#6366f1" : "#e2e8f0",
                color: periodo === p ? "white" : "#475569",
              }}
            >
              {p === "dia" ? "Diario" : p === "semana" ? "Semanal" : "Mensual"}
            </button>
          ))}
          <input
            type="date"
            value={fechaRef}
            onChange={(e) => setFechaRef(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: "10px", border: "1px solid #e2e8f0" }}
          />
          <button
            onClick={() => window.print()}
            style={{ padding: "8px 16px", borderRadius: "10px", border: "none", background: "#334155", color: "white", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}
          >
            🖨️ Imprimir / PDF
          </button>
        </div>

        <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "20px" }}>
          <p style={{ textTransform: "capitalize", fontWeight: 700, marginBottom: "16px" }}>{tituloPeriodo}</p>

          {cargando ? (
            <p style={{ color: "#94a3b8" }}>Cargando…</p>
          ) : alumnos.length === 0 ? (
            <p style={{ color: "#94a3b8" }}>No hay alumnos en este grupo.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="reporte">
                <thead>
                  <tr>
                    <th style={{ textAlign: "left" }}>Alumno</th>
                    {dias.map((d) => (
                      <th key={d.toISOString()}>
                        {d.toLocaleDateString("es-MX", { weekday: "short" }).slice(0, 3)}
                        <br />
                        {d.getDate()}/{d.getMonth() + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {alumnos.map((a) => (
                    <tr key={a.id}>
                      <td className="nombre">{a.nombre}</td>
                      {dias.map((d) => {
                        const estatus = obtenerEstatus(a.id, d);
                        const info = estatus ? ESTATUS_ABREV[estatus] : null;
                        return (
                          <td key={d.toISOString()}>
                            {info ? (
                              <span style={{ color: info.color, fontWeight: 800 }}>{info.letra}</span>
                            ) : (
                              <span style={{ color: "#cbd5e1" }}>—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ marginTop: "16px", fontSize: "12px", color: "#64748b", display: "flex", gap: "16px", flexWrap: "wrap" }}>
                <span><b style={{ color: "#22c55e" }}>P</b> Presente</span>
                <span><b style={{ color: "#ef4444" }}>A</b> Ausente</span>
                <span><b style={{ color: "#eab308" }}>R</b> Retardo</span>
                <span><b style={{ color: "#3b82f6" }}>J</b> Justificado</span>
                <span><b style={{ color: "#cbd5e1" }}>—</b> Sin registrar (dia futuro)</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}