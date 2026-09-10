"use client";
export const runtime = "edge";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import * as XLSX from "xlsx";

const ESTATUS = [
  { valor: "Presente", label: "Presente", color: "#22c55e" },
  { valor: "Ausente", label: "Ausente", color: "#ef4444" },
  { valor: "Retardo", label: "Retardo", color: "#eab308" },
  { valor: "Justificado", label: "Justificado", color: "#3b82f6" },
];

export default function AsistenciaPage() {
  const params = useParams();
  const id = params.id as string;
  const [grupo, setGrupo] = useState<any>(null);
  const [alumnos, setAlumnos] = useState<any[]>([]);
  const [asistencias, setAsistencias] = useState<any[]>([]);
  const [hora, setHora] = useState(new Date());
  const [noAutorizado, setNoAutorizado] = useState(false);
  const [marcando, setMarcando] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;
    const data = localStorage.getItem("maestro");
    if (!data) { window.location.href = "/login"; return; }
    cargarDatos();
    const intervalo = setInterval(cargarDatos, 10000);
    const timer = setInterval(() => setHora(new Date()), 1000);
    return () => { clearInterval(intervalo); clearInterval(timer); };
  }, [id]);

  const cargarDatos = async () => {
    const data = localStorage.getItem("maestro");
    if (!data) return;
    const maestro = JSON.parse(data);

    const res = await fetch(`/api/asistencia-vivo?grupoId=${id}&maestroId=${maestro.id}`);
    if (!res.ok) {
      setNoAutorizado(true);
      return;
    }
    const resultado = await res.json();
    setGrupo(resultado.grupo);
    setAlumnos(resultado.alumnos || []);
    setAsistencias(resultado.asistencias || []);
  };

  const marcarEstatus = async (alumnoId: number, accion: string) => {
    if (marcando) return;
    const data = localStorage.getItem("maestro");
    if (!data) return;
    const maestro = JSON.parse(data);

    setMarcando(alumnoId);
    await fetch("/api/asistencia-manual", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alumnoId, grupoId: id, maestroId: maestro.id, accion }),
    });
    await cargarDatos();
    setMarcando(null);
  };

  const marcarBanio = async (alumnoId: number, accion: string) => {
    if (marcando) return;
    const data = localStorage.getItem("maestro");
    if (!data) return;
    const maestro = JSON.parse(data);

    setMarcando(alumnoId);
    const res = await fetch("/api/banio-manual", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alumnoId, grupoId: id, maestroId: maestro.id, accion }),
    });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "No se pudo registrar");
    }
    await cargarDatos();
    setMarcando(null);
  };

  const valoresEstatus = ESTATUS.map((e) => e.valor);
  const estadoManual = new Map<number, string>();
  [...asistencias]
    .filter((a) => valoresEstatus.includes(a.accion))
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
    .forEach((a) => estadoManual.set(a.alumno_id, a.accion));

  const presentes = alumnos.filter((a) => estadoManual.get(a.id) === "Presente").map((a) => a.id);
  const retardos = alumnos.filter((a) => estadoManual.get(a.id) === "Retardo").map((a) => a.id);
  const justificados = alumnos.filter((a) => estadoManual.get(a.id) === "Justificado").map((a) => a.id);
  const ausentes = alumnos.filter((a) => !presentes.includes(a.id) && !retardos.includes(a.id) && !justificados.includes(a.id)).map((a) => a.id);

  const estadoBano = new Map<number, boolean>();
  asistencias.forEach((a) => {
    if (a.accion === "Salida al banio") estadoBano.set(a.alumno_id, true);
    if (a.accion === "Regreso del banio") estadoBano.set(a.alumno_id, false);
  });
  const enBano = Array.from(estadoBano.entries()).filter(([_, v]) => v).map(([id]) => id);

  const exportarExcel = () => {
    const filas = asistencias.map((a) => ({
      Fecha: new Date(a.fecha).toLocaleString("es-MX"),
      Alumno: getNombre(a.alumno_id),
      Accion: a.accion,
      Grupo: grupo?.nombre || "",
    }));
    const hoja = XLSX.utils.json_to_sheet(filas);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Asistencia");
    const fecha = new Date().toISOString().split("T")[0];
    XLSX.writeFile(libro, "Asistencia_" + grupo?.nombre + "_" + fecha + ".xlsx");
  };

  const getNombre = (alumnoId: number) => alumnos.find((a) => a.id === alumnoId)?.nombre || "";

  const today = hora.toLocaleDateString("es-MX", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const timeStr = hora.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  if (noAutorizado) {
    return (
      <main style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0a0f1e 0%, #1e1b4b 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontFamily: "Arial, sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <p>No tienes acceso a este grupo, o ya no existe.</p>
          <a href="/dashboard" style={{ color: "#818cf8" }}>Volver al dashboard</a>
        </div>
      </main>
    );
  }

  if (!grupo) {
    return (
      <main style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0a0f1e 0%, #1e1b4b 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontFamily: "Arial, sans-serif" }}>
        <div>Cargando...</div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0a0f1e 0%, #1e1b4b 100%)", fontFamily: "Arial, sans-serif", padding: "24px", color: "white" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: "700", margin: 0 }}>Asistencia en vivo</h1>
            <p style={{ color: "#94a3b8", fontSize: "13px", margin: "4px 0 0 0" }}>Grupo {grupo.nombre} ·{today} · {timeStr}</p>
          </div>
          <button onClick={exportarExcel} style={{ background: "linear-gradient(135deg, #166534, #15803d)", color: "white", border: "1px solid rgba(34,197,94,0.3)", padding: "10px 20px", borderRadius: "10px", fontSize: "13px", fontWeight: "600", cursor: "pointer", marginRight: "10px" }}>Exportar Excel</button>
          <a href="/dashboard" style={{ background: "rgba(99,102,241,0.2)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.3)", padding: "8px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: "600", textDecoration: "none", display: "inline-block" }}>Volver</a>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "16px", marginBottom: "32px" }}>
          <div style={{ background: "linear-gradient(135deg, rgba(21,128,61,0.35), rgba(20,83,45,0.2))", border: "1px solid rgba(34,197,94,0.25)", borderRadius: "18px", padding: "22px", position: "relative", overflow: "hidden" }}>
            <div style={{ fontSize: "22px", marginBottom: "8px" }}>✅</div>
            <div style={{ fontSize: "12px", opacity: 0.65, textTransform: "uppercase", letterSpacing: "1px" }}>Presentes</div>
            <div style={{ fontSize: "42px", fontWeight: "800", color: "#4ade80", lineHeight: 1 }}>{presentes.length}</div>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "3px", background: "linear-gradient(90deg, #22c55e, #86efac)" }} />
          </div>
          <div style={{ background: "linear-gradient(135deg, rgba(180,83,9,0.35), rgba(146,64,14,0.2))", border: "1px solid rgba(245,158,11,0.25)", borderRadius: "18px", padding: "22px", position: "relative", overflow: "hidden" }}>
            <div style={{ fontSize: "22px", marginBottom: "8px" }}>🚻</div>
            <div style={{ fontSize: "12px", opacity: 0.65, textTransform: "uppercase", letterSpacing: "1px" }}>En bano</div>
            <div style={{ fontSize: "42px", fontWeight: "800", color: "#fbbf24", lineHeight: 1 }}>{enBano.length}</div>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "3px", background: "linear-gradient(90deg, #f59e0b, #fde68a)" }} />
          </div>
          <div style={{ background: "linear-gradient(135deg, rgba(161,98,7,0.35), rgba(133,77,14,0.2))", border: "1px solid rgba(234,179,8,0.25)", borderRadius: "18px", padding: "22px", position: "relative", overflow: "hidden" }}>
            <div style={{ fontSize: "22px", marginBottom: "8px" }}>⏰</div>
            <div style={{ fontSize: "12px", opacity: 0.65, textTransform: "uppercase", letterSpacing: "1px" }}>Retardos</div>
            <div style={{ fontSize: "42px", fontWeight: "800", color: "#facc15", lineHeight: 1 }}>{retardos.length}</div>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "3px", background: "linear-gradient(90deg, #eab308, #fde047)" }} />
          </div>
          <div style={{ background: "linear-gradient(135deg, rgba(29,78,216,0.35), rgba(30,58,138,0.2))", border: "1px solid rgba(59,130,246,0.25)", borderRadius: "18px", padding: "22px", position: "relative", overflow: "hidden" }}>
            <div style={{ fontSize: "22px", marginBottom: "8px" }}>📝</div>
            <div style={{ fontSize: "12px", opacity: 0.65, textTransform: "uppercase", letterSpacing: "1px" }}>Justificados</div>
            <div style={{ fontSize: "42px", fontWeight: "800", color: "#60a5fa", lineHeight: 1 }}>{justificados.length}</div>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "3px", background: "linear-gradient(90deg, #3b82f6, #93c5fd)" }} />
          </div>
          <div style={{ background: "linear-gradient(135deg, rgba(185,28,28,0.35), rgba(153,27,27,0.2))",border: "1px solid rgba(239,68,68,0.25)", borderRadius: "18px", padding: "22px", position: "relative", overflow: "hidden" }}>
            <div style={{ fontSize: "22px", marginBottom: "8px" }}>❌</div>
            <div style={{ fontSize: "12px", opacity: 0.65, textTransform: "uppercase", letterSpacing: "1px" }}>Ausentes</div>
            <div style={{ fontSize: "42px", fontWeight: "800", color: "#f87171", lineHeight: 1 }}>{ausentes.length}</div>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "3px", background: "linear-gradient(90deg, #ef4444, #fca5a5)" }} />
          </div>
          <div style={{ background: "linear-gradient(135deg, rgba(51,65,85,0.5), rgba(30,41,59,0.3))", border: "1px solid rgba(100,116,139,0.25)", borderRadius: "18px", padding: "22px", position: "relative", overflow: "hidden" }}>
            <div style={{ fontSize: "22px", marginBottom: "8px" }}>🎓</div>
            <div style={{ fontSize: "12px", opacity: 0.65, textTransform: "uppercase", letterSpacing: "1px" }}>Total</div>
            <div style={{ fontSize: "42px", fontWeight: "800", color: "#94a3b8", lineHeight: 1 }}>{alumnos.length}</div>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "3px", background: "linear-gradient(90deg, #64748b, #94a3b8)" }} />
          </div>
        </div>

        <div style={{ background: "rgba(15,23,42,0.6)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px", overflow: "hidden", marginBottom: "24px" }}>
          <div style={{ padding: "18px 22px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <span style={{ fontSize: "14px", fontWeight: "700", color: "#e2e8f0" }}>Registrar asistencia</span>
          </div>
          <div style={{ padding: "8px" }}>
            {alumnos.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px", color: "#475569" }}>No hay alumnos en este grupo</div>
            ) : alumnos.map((a) => {
              const estatusActual = estadoManual.get(a.id);
              return (
                <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", padding: "12px 14px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <span style={{ fontSize: "14px", color: "#e2e8f0", fontWeight: "600" }}>{a.nombre}</span>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {ESTATUS.map((e) => {
                      const activo = estatusActual === e.valor;
                      return (
                        <button
                          key={e.valor}
                          onClick={() => marcarEstatus(a.id, e.valor)}
                          disabled={marcando === a.id}
                          style={{
                            padding: "6px 14px",
                            borderRadius: "10px",
                            fontSize: "12px",
                            fontWeight: "700",
                            cursor: marcando === a.id ? "not-allowed" : "pointer",
                            border: `1px solid ${e.color}`,
                            background: activo ? e.color : "transparent",
                            color: activo ? "#0a0f1e" : e.color,
                          }}
                        >
                          {e.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
          <div style={{ background: "rgba(15,23,42,0.6)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px", overflow: "hidden" }}>
            <div style={{ padding: "18px 22px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "14px", fontWeight: "700", color: "#86efac" }}>Presentes</span>
              <span style={{ background: "rgba(34,197,94,0.15)", color: "#4ade80", padding: "3px 10px", borderRadius: "20px", fontSize: "12px" }}>{presentes.length}</span>
            </div>
            <div style={{ padding: "12px", maxHeight: "300px", overflowY: "auto" }}>
              {presentes.length === 0 ? (
                <div style={{ textAlign: "center", padding: "20px", color: "#475569" }}>Sin registros</div>
              ) : presentes.map((alumnoId) => {
                const fueraDelSalon = enBano.includes(alumnoId);
                return (
                  <div key={alumnoId} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", padding:"8px 12px", borderRadius: "10px", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "rgba(34,197,94,0.15)", color: "#4ade80", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "700" }}>
                        {getNombre(alumnoId).slice(0, 2)}
                      </div>
                      <span style={{ fontSize: "12px", color: "#cbd5e1" }}>{getNombre(alumnoId)}</span>
                    </div>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        onClick={() => marcarBanio(alumnoId, "Salida al banio")}
                        disabled={marcando === alumnoId || fueraDelSalon}
                        style={{
                          padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: "700",
                          border: "1px solid #f59e0b", background: fueraDelSalon ? "rgba(245,158,11,0.1)" : "transparent",
                          color: "#fbbf24", cursor: fueraDelSalon || marcando === alumnoId ? "not-allowed" : "pointer",
                          opacity: fueraDelSalon ? 0.4 : 1,
                        }}
                      >
                        🚻 Salida al bano
                      </button>
                      <button
                        onClick={() => marcarBanio(alumnoId, "Regreso del banio")}
                        disabled={marcando === alumnoId || !fueraDelSalon}
                        style={{
                          padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: "700",
                          border: "1px solid #3b82f6", background: fueraDelSalon ? "#3b82f6" : "transparent",
                          color: fueraDelSalon ? "#0a0f1e" : "#60a5fa", cursor: !fueraDelSalon || marcando === alumnoId ? "not-allowed" : "pointer",
                          opacity: !fueraDelSalon ? 0.4 : 1,
                        }}
                      >
                        🔙 Regreso
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ background: "rgba(15,23,42,0.6)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px", overflow: "hidden" }}>
            <div style={{ padding: "18px 22px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "14px", fontWeight: "700", color: "#fde68a" }}>En bano</span>
              <span style={{ background: "rgba(245,158,11,0.15)", color: "#fbbf24", padding: "3px 10px", borderRadius: "20px", fontSize: "12px" }}>{enBano.length}</span>
            </div>
            <div style={{ padding: "12px", maxHeight: "300px", overflowY: "auto" }}>
              {enBano.length === 0 ? (
                <div style={{ textAlign: "center", padding: "20px", color: "#475569" }}>Ninguno fuera</div>
              ) : enBano.map((alumnoId) => (
                <div key={alumnoId} style={{ display: "flex", alignItems: "center", gap: "10px", padding:"8px 12px", borderRadius: "10px" }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "rgba(245,158,11,0.15)", color: "#fbbf24", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "700" }}>
                    {getNombre(alumnoId).slice(0, 2)}
                  </div>
                  <span style={{ fontSize: "12px", color: "#cbd5e1" }}>{getNombre(alumnoId)}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "rgba(15,23,42,0.6)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px", overflow: "hidden" }}>
            <div style={{ padding: "18px 22px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "14px", fontWeight: "700", color: "#fca5a5" }}>Ausentes</span>
              <span style={{ background: "rgba(239,68,68,0.15)", color: "#f87171", padding: "3px 10px", borderRadius: "20px", fontSize: "12px" }}>{ausentes.length}</span>
            </div>
            <div style={{ padding: "12px", maxHeight: "300px", overflowY: "auto" }}>
              {ausentes.length === 0 ? (
                <div style={{ textAlign: "center", padding: "20px", color: "#475569" }}>Todos presentes!</div>
              ) : ausentes.map((alumnoId) => (
                <div key={alumnoId} style={{ display: "flex", alignItems: "center", gap: "10px", padding:"8px 12px", borderRadius: "10px" }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "rgba(239,68,68,0.15)", color: "#f87171", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "700" }}>
                    {getNombre(alumnoId).slice(0, 2)}
                  </div>
                  <span style={{ fontSize: "12px", color: "#cbd5e1" }}>{getNombre(alumnoId)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}