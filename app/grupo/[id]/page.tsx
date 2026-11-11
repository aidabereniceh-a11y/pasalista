"use client";
export const runtime = "edge";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

const COMENTARIOS_POSITIVOS = [
  "Participa con entusiasmo",
  "Respeta las reglas del salón",
  "Entrega trabajos a tiempo",
];

const COMENTARIOS_NEGATIVOS = [
  "Habla durante la explicación",
  "Se levanta de su lugar sin permiso",
  "No trae cuaderno",
  "No trae material necesario",
];

const PERIODOS = ["Periodo 1", "Periodo 2", "Periodo 3", "Periodo 4"];

export default function GrupoPage() {
  const params = useParams();
  const id = params.id as string;
  const [grupo, setGrupo] = useState<any>(null);
  const [alumnos, setAlumnos] = useState<any[]>([]);
  const [nuevoAlumno, setNuevoAlumno] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [color, setColor] = useState("");
  const [pestana, setPestana] = useState<"alumnos" | "conducta">("alumnos");

  // Conducta
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState("Periodo 1");
  const [conductaData, setConductaData] = useState<Record<number, { comentarios: string[]; observacion: string }>>({});
  const [alumnoAbierto, setAlumnoAbierto] = useState<number | null>(null);
  const [guardandoId, setGuardandoId] = useState<number | null>(null);
  const [guardadoId, setGuardadoId] = useState<number | null>(null);
  const [maestro, setMaestro] = useState<any>(null);

  // Compartir con papás
  const [linkCopiado, setLinkCopiado] = useState<number | null>(null);
  const [copiandoId, setCopiandoId] = useState<number | null>(null);

  useEffect(() => {
    const data = localStorage.getItem("maestro");
    if (data) setMaestro(JSON.parse(data));
  }, []);

  useEffect(() => {
    if (!id || !maestro) return;
    cargarDatos();
  }, [id, maestro]);

  useEffect(() => {
    if (!id || !maestro || alumnos.length === 0) return;
    cargarConducta();
  }, [periodoSeleccionado, alumnos]);

  const cargarDatos = async () => {
    const resGrupo = await fetch(`/api/grupos?maestroId=${maestro.id}`);
    const dataGrupo = await resGrupo.json();
    const g = (dataGrupo.grupos || []).find((x: any) => String(x.id) === String(id));
    setGrupo(g || null);

    const resAlumnos = await fetch(`/api/alumnos?grupoId=${id}&maestroId=${maestro.id}`);
    const dataAlumnos = await resAlumnos.json();
    setAlumnos((dataAlumnos.alumnos || []).filter((a: any) => a.activo !== false));
  };

  const cargarConducta = async () => {
    const res = await fetch(`/api/conducta?grupoId=${id}&periodo=${encodeURIComponent(periodoSeleccionado)}`);
    const data = await res.json();
    const map: Record<number, { comentarios: string[]; observacion: string }> = {};
    (data || []).forEach((c: any) => {
      map[c.alumno_id] = { comentarios: c.comentarios || [], observacion: c.observacion || "" };
    });
    setConductaData(map);
  };

  const toggleComentario = (alumnoId: number, comentario: string) => {
    setConductaData(prev => {
      const actual = prev[alumnoId] || { comentarios: [], observacion: "" };
      const yaEsta = actual.comentarios.includes(comentario);
      return {
        ...prev,
        [alumnoId]: {
          ...actual,
          comentarios: yaEsta
            ? actual.comentarios.filter(c => c !== comentario)
            : [...actual.comentarios, comentario],
        },
      };
    });
  };

  const actualizarObservacion = (alumnoId: number, texto: string) => {
    setConductaData(prev => ({
      ...prev,
      [alumnoId]: { ...(prev[alumnoId] || { comentarios: [] }), observacion: texto },
    }));
  };

  const guardarConducta = async (alumnoId: number) => {
    if (guardandoId === alumnoId) return;
    setGuardandoId(alumnoId);
    const datos = conductaData[alumnoId] || { comentarios: [], observacion: "" };
    await fetch("/api/conducta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        alumnoId,
        grupoId: Number(id),
        periodo: periodoSeleccionado,
        comentarios: datos.comentarios,
        observacion: datos.observacion,
      }),
    });
    setGuardandoId(null);
    setGuardadoId(alumnoId);
    setTimeout(() => setGuardadoId(null), 2000);
  };

  const compartirReporte = async (alumnoId: number) => {
    if (copiandoId === alumnoId || !maestro) return;
    setCopiandoId(alumnoId);
    try {
      const res = await fetch(`/api/reporte-token?alumnoId=${alumnoId}&maestroId=${maestro.id}`);
      const data = await res.json();
      if (data.url) {
        await navigator.clipboard.writeText(data.url);
        setLinkCopiado(alumnoId);
        setTimeout(() => setLinkCopiado(null), 3000);
      }
    } catch (e) {
      // silently fail
    }
    setCopiandoId(null);
  };

  const agregarAlumno = async () => {
    if (cargando || !maestro) return;
    if (!nuevoAlumno.trim()) { setColor("#ef4444"); setMensaje("Escribe el nombre del alumno"); return; }
    setCargando(true);
    const res = await fetch("/api/alumnos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ grupoId: id, maestroId: maestro.id, nombres: [nuevoAlumno.trim().toUpperCase()] }),
    });
    if (!res.ok) {
      setColor("#ef4444"); setMensaje("Error al agregar alumno");
    } else {
      setColor("#22c55e"); setMensaje("Alumno agregado correctamente");
      setNuevoAlumno("");
      cargarDatos();
    }
    setCargando(false);
    setTimeout(() => setMensaje(""), 3000);
  };

  const desactivarAlumno = async (alumnoId: number, nombre: string) => {
    if (!confirm("¿Dar de baja a " + nombre + "? Su historial de asistencia se conservará.")) return;
    await fetch(`/api/alumnos/${alumnoId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ maestroId: maestro.id }),
    });
    setColor("#22c55e"); setMensaje("Alumno dado de baja. Su historial se conserva.");
    cargarDatos();
    setTimeout(() => setMensaje(""), 3000);
  };

  if (!grupo) return <div style={{ color: "white", padding: "40px", textAlign: "center" }}>Cargando...</div>;

  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0a0f1e 0%, #1e1b4b 100%)", fontFamily: "Arial, sans-serif", padding: "24px", color: "white" }}>
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: "700", margin: 0 }}>Grupo {grupo.nombre}</h1>
            <p style={{ color: "#94a3b8", fontSize: "14px", margin: "4px 0 0 0" }}>{alumnos.length} alumnos activos</p>
          </div>
          <a href="/dashboard" style={{ background: "rgba(99,102,241,0.2)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.3)", padding: "8px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: "600", textDecoration: "none" }}>Volver</a>
        </div>

        {/* Pestañas */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
          {(["alumnos", "conducta"] as const).map(p => (
            <button key={p} onClick={() => setPestana(p)} style={{
              padding: "10px 20px", borderRadius: "10px", border: "none", fontWeight: "700", fontSize: "14px", cursor: "pointer",
              background: pestana === p ? "linear-gradient(135deg, #667eea, #764ba2)" : "rgba(255,255,255,0.08)",
              color: pestana === p ? "white" : "#94a3b8",
            }}>
              {p === "alumnos" ? "👥 Alumnos" : "📋 Conducta"}
            </button>
          ))}
        </div>

        {/* Pestaña Alumnos */}
        {pestana === "alumnos" && (
          <>
            <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "24px", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: "600", margin: "0 0 16px 0" }}>Agregar alumno</h2>
              <div style={{ display: "flex", gap: "12px" }}>
                <input
                  type="text"
                  placeholder="Nombre completo del alumno"
                  value={nuevoAlumno}
                  onChange={(e) => setNuevoAlumno(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && agregarAlumno()}
                  style={{ flex: 1, padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "white", fontSize: "14px", outline: "none" }}
                />
                <button onClick={agregarAlumno} disabled={cargando} style={{ padding: "12px 20px", background: "linear-gradient(135deg, #667eea, #764ba2)", color: "white", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "600", cursor: cargando ? "not-allowed" : "pointer" }}>
                  {cargando ? "..." : "+ Agregar"}
                </button>
              </div>
              {mensaje && <div style={{ marginTop: "12px", background: color, color: "white", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", fontWeight: "600" }}>{mensaje}</div>}
            </div>

            <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", overflow: "hidden" }}>
              <div style={{ padding: "18px 22px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "14px", fontWeight: "700", color: "#86efac" }}>Lista de alumnos activos</span>
                <span style={{ background: "rgba(34,197,94,0.15)", color: "#4ade80", padding: "3px 10px", borderRadius: "20px", fontSize: "12px" }}>{alumnos.length}</span>
              </div>
              <div style={{ padding: "12px", maxHeight: "500px", overflowY: "auto" }}>
                {alumnos.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "30px", color: "#475569" }}>No hay alumnos activos en este grupo</div>
                ) : alumnos.map((alumno, index) => (
                  <div key={alumno.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", borderRadius: "10px", marginBottom: "4px", background: "rgba(255,255,255,0.02)" }}>
                    <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "rgba(99,102,241,0.2)", color: "#818cf8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "700", flexShrink: 0 }}>{index + 1}</div>
                    <span style={{ flex: 1, fontSize: "13px", color: "#cbd5e1" }}>{alumno.nombre}</span>
                    <button onClick={() => desactivarAlumno(alumno.id, alumno.nombre)} style={{ padding: "6px 12px", background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "8px", fontSize: "12px", cursor: "pointer", fontWeight: "600" }}>
                      Dar de baja
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Pestaña Conducta */}
        {pestana === "conducta" && (
          <div>
            {/* Selector de periodo */}
            <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "16px", marginBottom: "20px" }}>
              <label style={{ fontSize: "13px", color: "#94a3b8", display: "block", marginBottom: "8px" }}>Periodo</label>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {PERIODOS.map(p => (
                  <button key={p} onClick={() => { setPeriodoSeleccionado(p); setAlumnoAbierto(null); }} style={{
                    padding: "8px 16px", borderRadius: "8px", border: "2px solid",
                    borderColor: periodoSeleccionado === p ? "#6366f1" : "#334155",
                    background: periodoSeleccionado === p ? "#312e81" : "transparent",
                    color: "white", cursor: "pointer", fontWeight: "600", fontSize: "13px",
                  }}>{p}</button>
                ))}
              </div>
            </div>

            {/* Lista de alumnos con conducta */}
            {alumnos.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#475569" }}>No hay alumnos en este grupo</div>
            ) : alumnos.map(alumno => {
              const datos = conductaData[alumno.id] || { comentarios: [], observacion: "" };
              const abierto = alumnoAbierto === alumno.id;
              return (
                <div key={alumno.id} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", marginBottom: "12px", overflow: "hidden" }}>
                  {/* Cabecera del alumno */}
                  <button onClick={() => setAlumnoAbierto(abierto ? null : alumno.id)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", background: "none", border: "none", color: "white", cursor: "pointer", textAlign: "left" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ fontSize: "14px", fontWeight: "600" }}>{alumno.nombre}</span>
                      {datos.comentarios.length > 0 && (
                        <span style={{ background: "rgba(99,102,241,0.3)", color: "#a5b4fc", padding: "2px 8px", borderRadius: "20px", fontSize: "11px" }}>
                          {datos.comentarios.length} nota{datos.comentarios.length > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                    <span style={{ color: "#64748b", fontSize: "18px" }}>{abierto ? "▲" : "▼"}</span>
                  </button>

                  {/* Panel expandible */}
                  {abierto && (
                    <div style={{ padding: "0 16px 16px" }}>
                      {/* Positivos */}
                      <p style={{ fontSize: "12px", color: "#4ade80", fontWeight: "700", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>✅ Positivos</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
                        {COMENTARIOS_POSITIVOS.map(c => {
                          const activo = datos.comentarios.includes(c);
                          return (
                            <button key={c} onClick={() => toggleComentario(alumno.id, c)} style={{
                              padding: "7px 14px", borderRadius: "20px", border: "2px solid",
                              borderColor: activo ? "#22c55e" : "#334155",
                              background: activo ? "rgba(34,197,94,0.2)" : "transparent",
                              color: activo ? "#4ade80" : "#94a3b8", cursor: "pointer", fontSize: "13px", fontWeight: activo ? "700" : "400",
                            }}>{c}</button>
                          );
                        })}
                      </div>

                      {/* Negativos */}
                      <p style={{ fontSize: "12px", color: "#f87171", fontWeight: "700", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>⚠️ Áreas de mejora</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
                        {COMENTARIOS_NEGATIVOS.map(c => {
                          const activo = datos.comentarios.includes(c);
                          return (
                            <button key={c} onClick={() => toggleComentario(alumno.id, c)} style={{
                              padding: "7px 14px", borderRadius: "20px", border: "2px solid",
                              borderColor: activo ? "#ef4444" : "#334155",
                              background: activo ? "rgba(239,68,68,0.2)" : "transparent",
                              color: activo ? "#f87171" : "#94a3b8", cursor: "pointer", fontSize: "13px", fontWeight: activo ? "700" : "400",
                            }}>{c}</button>
                          );
                        })}
                      </div>

                      {/* Observación libre */}
                      <p style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "700", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>📝 Observación adicional</p>
                      <textarea
                        value={datos.observacion}
                        onChange={e => actualizarObservacion(alumno.id, e.target.value)}
                        placeholder="Escribe aquí observaciones adicionales..."
                        rows={3}
                        style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "rgba(255,255,255,0.08)", border: "1px solid #334155", color: "white", fontSize: "13px", resize: "vertical", boxSizing: "border-box", marginBottom: "12px" }}
                      />

                      {/* Botones */}
                      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                        {/* Botón compartir con papás */}
                        <button
                          onClick={() => compartirReporte(alumno.id)}
                          disabled={copiandoId === alumno.id}
                          style={{
                            padding: "10px 20px", borderRadius: "8px", border: "none",
                            fontWeight: "700", fontSize: "13px", cursor: copiandoId === alumno.id ? "not-allowed" : "pointer",
                            background: linkCopiado === alumno.id ? "rgba(34,197,94,0.2)" : "rgba(99,102,241,0.2)",
                            color: linkCopiado === alumno.id ? "#4ade80" : "#818cf8",
                          }}
                        >
                          {linkCopiado === alumno.id ? "✓ Link copiado" : copiandoId === alumno.id ? "Generando..." : "📤 Compartir con papás"}
                        </button>

                        {/* Botón guardar */}
                        <button
                          onClick={() => guardarConducta(alumno.id)}
                          disabled={guardandoId === alumno.id}
                          style={{
                            padding: "10px 24px", borderRadius: "8px", border: "none", fontWeight: "700", fontSize: "13px", cursor: "pointer",
                            background: guardadoId === alumno.id ? "#16a34a" : guardandoId === alumno.id ? "#475569" : "#6366f1",
                            color: "white",
                          }}
                        >
                          {guardadoId === alumno.id ? "✓ Guardado" : guardandoId === alumno.id ? "Guardando..." : "Guardar"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}