"use client";
export const runtime = "edge";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

const TIPOS_EVALUACION = [
  { value: "tarea", label: "📋 Tarea" },
  { value: "examen", label: "📄 Examen" },
  { value: "participacion", label: "🙋 Participación" },
  { value: "otro", label: "📌 Otro" },
];

interface Maestro { id: number; nombre: string; plan: string; }
interface Grupo { id: number; nombre: string; grado: string; grupo: string; asignatura?: string; etiqueta?: string; }
interface Evaluacion { id: number; grupo_id: number; nombre: string; fecha: string; tipo: string; }
interface Alumno { id: number; nombre: string; }
interface Calificacion { alumno_id: number; calificacion: number | string; observacion: string; }

export default function EvaluacionesPage() {
  const router = useRouter();
  const [maestro, setMaestro] = useState<Maestro | null>(null);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState<number | null>(null);
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [pestana, setPestana] = useState<"calificaciones" | "conducta">("calificaciones");

  // Calificaciones
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [evaluacionSeleccionada, setEvaluacionSeleccionada] = useState<Evaluacion | null>(null);
  const [calificaciones, setCalificaciones] = useState<Record<number, Calificacion>>({});
  const [nuevaEval, setNuevaEval] = useState({ nombre: "", fecha: "", tipo: "tarea" });
  const [creando, setCreando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  // Conducta
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState("Periodo 1");
  const [conductaData, setConductaData] = useState<Record<number, { comentarios: string[]; observacion: string }>>({});
  const [alumnoAbierto, setAlumnoAbierto] = useState<number | null>(null);
  const [guardandoConductaId, setGuardandoConductaId] = useState<number | null>(null);
  const [guardadoConductaId, setGuardadoConductaId] = useState<number | null>(null);
  const [linkCopiado, setLinkCopiado] = useState<number | null>(null);
  const [copiandoId, setCopiandoId] = useState<number | null>(null);

  useEffect(() => {
    const data = localStorage.getItem("maestro");
    if (!data) { router.push("/login"); return; }
    const m = JSON.parse(data);
    setMaestro(m);
    fetch(`/api/grupos?maestroId=${m.id}`)
      .then(r => r.json())
      .then(data => setGrupos(data.grupos || []));
  }, [router]);

  useEffect(() => {
    if (!grupoSeleccionado || !maestro) return;
    setEvaluacionSeleccionada(null);
    setAlumnos([]);
    setCalificaciones({});
    setConductaData({});
    setAlumnoAbierto(null);
    fetch(`/api/evaluaciones?maestroId=${maestro.id}&grupoId=${grupoSeleccionado}`)
      .then(r => r.json())
      .then(data => setEvaluaciones(data.evaluaciones || []));
    fetch(`/api/alumnos?grupoId=${grupoSeleccionado}&maestroId=${maestro.id}`)
      .then(r => r.json())
      .then(data => setAlumnos((data.alumnos || []).filter((a: any) => a.activo !== false)));
  }, [grupoSeleccionado, maestro]);

  useEffect(() => {
    if (!evaluacionSeleccionada) return;
    fetch(`/api/evaluaciones/${evaluacionSeleccionada.id}/calificaciones`)
      .then(r => r.json())
      .then((data: any) => {
        const arr = Array.isArray(data) ? data : [];
        const map: Record<number, Calificacion> = {};
        arr.forEach((c: any) => {
          map[c.alumno_id] = { alumno_id: c.alumno_id, calificacion: c.calificacion, observacion: c.observacion || "" };
        });
        setCalificaciones(map);
      });
  }, [evaluacionSeleccionada]);

  useEffect(() => {
    if (!grupoSeleccionado || alumnos.length === 0) return;
    fetch(`/api/conducta?grupoId=${grupoSeleccionado}&periodo=${encodeURIComponent(periodoSeleccionado)}`)
      .then(r => r.json())
      .then((data: any) => {
        const map: Record<number, { comentarios: string[]; observacion: string }> = {};
        (Array.isArray(data) ? data : []).forEach((c: any) => {
          map[c.alumno_id] = { comentarios: c.comentarios || [], observacion: c.observacion || "" };
        });
        setConductaData(map);
      });
  }, [periodoSeleccionado, alumnos, grupoSeleccionado]);

  const crearEvaluacion = async () => {
    if (!nuevaEval.nombre || !grupoSeleccionado || !maestro) return;
    setCreando(true);
    const res = await fetch("/api/evaluaciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ maestroId: maestro.id, grupoId: grupoSeleccionado, nombre: nuevaEval.nombre, fecha: nuevaEval.fecha || undefined, tipo: nuevaEval.tipo }),
    });
    const data = await res.json();
    const nueva = data.evaluacion || data;
    setEvaluaciones(prev => [nueva, ...prev]);
    setNuevaEval({ nombre: "", fecha: "", tipo: "tarea" });
    setCreando(false);
  };

  const actualizarCal = (alumnoId: number, campo: "calificacion" | "observacion", valor: string) => {
    setCalificaciones(prev => ({
      ...prev,
      [alumnoId]: { alumno_id: alumnoId, calificacion: prev[alumnoId]?.calificacion ?? "", observacion: prev[alumnoId]?.observacion ?? "", [campo]: valor },
    }));
  };

  const guardarCalificaciones = async () => {
    if (!evaluacionSeleccionada) return;
    setGuardando(true);
    const rows = alumnos.map(a => ({
      alumnoId: a.id,
      calificacion: parseFloat(String(calificaciones[a.id]?.calificacion)) || 0,
      observacion: calificaciones[a.id]?.observacion || "",
    }));
    await fetch(`/api/evaluaciones/${evaluacionSeleccionada.id}/calificaciones`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ calificaciones: rows }),
    });
    setGuardando(false);
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2000);
  };

  const toggleComentario = (alumnoId: number, comentario: string) => {
    setConductaData(prev => {
      const actual = prev[alumnoId] || { comentarios: [], observacion: "" };
      const yaEsta = actual.comentarios.includes(comentario);
      return {
        ...prev,
        [alumnoId]: {
          ...actual,
          comentarios: yaEsta ? actual.comentarios.filter(c => c !== comentario) : [...actual.comentarios, comentario],
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
    if (guardandoConductaId === alumnoId || !grupoSeleccionado) return;
    setGuardandoConductaId(alumnoId);
    const datos = conductaData[alumnoId] || { comentarios: [], observacion: "" };
    await fetch("/api/conducta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alumnoId, grupoId: grupoSeleccionado, periodo: periodoSeleccionado, comentarios: datos.comentarios, observacion: datos.observacion }),
    });
    setGuardandoConductaId(null);
    setGuardadoConductaId(alumnoId);
    setTimeout(() => setGuardadoConductaId(null), 2000);
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
    } catch (e) {}
    setCopiandoId(null);
  };

  const grupoActual = grupos.find(g => g.id === grupoSeleccionado);
  const tipoLabel = (tipo: string) => TIPOS_EVALUACION.find(t => t.value === tipo)?.label || "📋 Tarea";

  return (
    <main style={{ minHeight: "100vh", background: "#0f172a", color: "white", padding: "24px", fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
        <button onClick={() => router.push("/dashboard")} style={{ background: "#1e293b", border: "none", color: "#94a3b8", padding: "8px 16px", borderRadius: "8px", cursor: "pointer" }}>
          ← Dashboard
        </button>
        <h1 style={{ margin: 0, fontSize: "22px", fontWeight: "700" }}>📝 Evaluaciones</h1>
      </div>

      {/* Selector de grupo */}
      <div style={{ background: "#1e293b", borderRadius: "12px", padding: "20px", marginBottom: "20px" }}>
        <label style={{ fontSize: "14px", color: "#94a3b8", display: "block", marginBottom: "8px" }}>Selecciona un grupo</label>
        <select
          value={grupoSeleccionado || ""}
          onChange={e => { setGrupoSeleccionado(Number(e.target.value)); setPestana("calificaciones"); }}
          style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "#0f172a", color: "white", border: "1px solid #334155", fontSize: "15px" }}
        >
          <option value="">-- Elige un grupo --</option>
          {grupos.map(g => (
            <option key={g.id} value={g.id}>{g.nombre}{g.asignatura ? ` · ${g.asignatura}` : ""}{g.etiqueta ? ` · ${g.etiqueta}` : ""}</option>
          ))}
        </select>
      </div>

      {grupoSeleccionado && (
        <>
          {/* Pestañas */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
            {(["calificaciones", "conducta"] as const).map(p => (
              <button key={p} onClick={() => setPestana(p)} style={{
                padding: "10px 20px", borderRadius: "10px", border: "none", fontWeight: "700", fontSize: "14px", cursor: "pointer",
                background: pestana === p ? "linear-gradient(135deg, #667eea, #764ba2)" : "#1e293b",
                color: pestana === p ? "white" : "#94a3b8",
              }}>
                {p === "calificaciones" ? "📝 Calificaciones" : "📋 Conducta"}
              </button>
            ))}
            {/* Botón concentrado */}
            <button
              onClick={() => router.push(`/dashboard/concentrado?grupoId=${grupoSeleccionado}`)}
              style={{ padding: "10px 20px", borderRadius: "10px", border: "none", fontWeight: "700", fontSize: "14px", cursor: "pointer", background: "#1e293b", color: "#fbbf24" }}
            >
              📊 Concentrado
            </button>
          </div>

          {/* ── PESTAÑA CALIFICACIONES ── */}
          {pestana === "calificaciones" && (
            <>
              <div style={{ background: "#1e293b", borderRadius: "12px", padding: "20px", marginBottom: "20px" }}>
                <h2 style={{ margin: "0 0 16px", fontSize: "16px", color: "#94a3b8" }}>Nueva evaluación</h2>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <input
                    placeholder="Nombre (ej. Bloque 1)"
                    value={nuevaEval.nombre}
                    onChange={e => setNuevaEval(p => ({ ...p, nombre: e.target.value }))}
                    style={{ flex: 1, minWidth: "200px", padding: "10px", borderRadius: "8px", background: "#0f172a", color: "white", border: "1px solid #334155", fontSize: "15px" }}
                  />
                  <select
                    value={nuevaEval.tipo}
                    onChange={e => setNuevaEval(p => ({ ...p, tipo: e.target.value }))}
                    style={{ padding: "10px", borderRadius: "8px", background: "#0f172a", color: "white", border: "1px solid #334155", fontSize: "15px" }}
                  >
                    {TIPOS_EVALUACION.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  <input
                    type="date"
                    value={nuevaEval.fecha}
                    onChange={e => setNuevaEval(p => ({ ...p, fecha: e.target.value }))}
                    style={{ padding: "10px", borderRadius: "8px", background: "#0f172a", color: "white", border: "1px solid #334155", fontSize: "15px" }}
                  />
                  <button onClick={crearEvaluacion} disabled={creando || !nuevaEval.nombre}
                    style={{ padding: "10px 20px", borderRadius: "8px", background: "#6366f1", color: "white", border: "none", fontWeight: "700", cursor: "pointer" }}>
                    {creando ? "Creando..." : "Crear"}
                  </button>
                </div>
              </div>

              {evaluaciones.length > 0 && (
                <div style={{ background: "#1e293b", borderRadius: "12px", padding: "20px", marginBottom: "20px" }}>
                  <h2 style={{ margin: "0 0 16px", fontSize: "16px", color: "#94a3b8" }}>Evaluaciones de {grupoActual?.nombre}</h2>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                    {evaluaciones.map(ev => (
                      <button key={ev.id} onClick={() => setEvaluacionSeleccionada(ev)} style={{
                        padding: "10px 16px", borderRadius: "8px", border: "2px solid",
                        borderColor: evaluacionSeleccionada?.id === ev.id ? "#6366f1" : "#334155",
                        background: evaluacionSeleccionada?.id === ev.id ? "#312e81" : "#0f172a",
                        color: "white", cursor: "pointer", fontWeight: "600", textAlign: "left"
                      }}>
                        {ev.nombre || "Sin nombre"}
                        <span style={{ display: "block", fontSize: "11px", color: "#94a3b8", fontWeight: "400" }}>{tipoLabel(ev.tipo || "tarea")} {ev.fecha ? `· ${ev.fecha}` : ""}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {evaluacionSeleccionada && alumnos.length > 0 && (
                <div style={{ background: "#1e293b", borderRadius: "12px", padding: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
                    <h2 style={{ margin: 0, fontSize: "16px" }}>Calificaciones — {evaluacionSeleccionada.nombre} <span style={{ fontSize: "13px", color: "#94a3b8" }}>{tipoLabel(evaluacionSeleccionada.tipo)}</span></h2>
                    <button onClick={guardarCalificaciones} disabled={guardando}
                      style={{ padding: "10px 24px", borderRadius: "8px", background: guardado ? "#16a34a" : "#6366f1", color: "white", border: "none", fontWeight: "700", cursor: "pointer" }}>
                      {guardado ? "✓ Guardado" : guardando ? "Guardando..." : "Guardar"}
                    </button>
                  </div>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ background: "#0f172a" }}>
                          <th style={{ padding: "10px 12px", textAlign: "left", color: "#94a3b8", fontWeight: "600", fontSize: "13px" }}>Alumno</th>
                          <th style={{ padding: "10px 12px", textAlign: "center", color: "#94a3b8", fontWeight: "600", fontSize: "13px", width: "100px" }}>Calificación</th>
                          <th style={{ padding: "10px 12px", textAlign: "left", color: "#94a3b8", fontWeight: "600", fontSize: "13px" }}>Observación</th>
                        </tr>
                      </thead>
                      <tbody>
                        {alumnos.map((alumno, i) => (
                          <tr key={alumno.id} style={{ background: i % 2 === 0 ? "#1e293b" : "#0f172a" }}>
                            <td style={{ padding: "8px 12px", fontSize: "14px" }}>{alumno.nombre}</td>
                            <td style={{ padding: "8px 12px", textAlign: "center" }}>
                              <input type="number" min="0" max="10" step="0.1"
                                value={calificaciones[alumno.id]?.calificacion ?? ""}
                                onChange={e => actualizarCal(alumno.id, "calificacion", e.target.value)}
                                style={{ width: "70px", padding: "6px", borderRadius: "6px", background: "#334155", color: "white", border: "1px solid #475569", textAlign: "center", fontSize: "14px" }}
                              />
                            </td>
                            <td style={{ padding: "8px 12px" }}>
                              <input type="text" placeholder="Opcional..."
                                value={calificaciones[alumno.id]?.observacion ?? ""}
                                onChange={e => actualizarCal(alumno.id, "observacion", e.target.value)}
                                style={{ width: "100%", padding: "6px 10px", borderRadius: "6px", background: "#334155", color: "white", border: "1px solid #475569", fontSize: "14px" }}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── PESTAÑA CONDUCTA ── */}
          {pestana === "conducta" && (
            <div>
              <div style={{ background: "#1e293b", borderRadius: "12px", padding: "16px", marginBottom: "20px" }}>
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

              {alumnos.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#475569" }}>No hay alumnos en este grupo</div>
              ) : alumnos.map(alumno => {
                const datos = conductaData[alumno.id] || { comentarios: [], observacion: "" };
                const abierto = alumnoAbierto === alumno.id;
                return (
                  <div key={alumno.id} style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "12px", marginBottom: "12px", overflow: "hidden" }}>
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

                    {abierto && (
                      <div style={{ padding: "0 16px 16px" }}>
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

                        <p style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "700", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>📝 Observación adicional</p>
                        <textarea
                          value={datos.observacion}
                          onChange={e => actualizarObservacion(alumno.id, e.target.value)}
                          placeholder="Escribe aquí observaciones adicionales..."
                          rows={3}
                          style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "#0f172a", border: "1px solid #334155", color: "white", fontSize: "13px", resize: "vertical", boxSizing: "border-box", marginBottom: "12px" }}
                        />

                        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                          <button onClick={() => compartirReporte(alumno.id)} disabled={copiandoId === alumno.id} style={{
                            padding: "10px 20px", borderRadius: "8px", border: "none", fontWeight: "700", fontSize: "13px",
                            cursor: copiandoId === alumno.id ? "not-allowed" : "pointer",
                            background: linkCopiado === alumno.id ? "rgba(34,197,94,0.2)" : "rgba(99,102,241,0.2)",
                            color: linkCopiado === alumno.id ? "#4ade80" : "#818cf8",
                          }}>
                            {linkCopiado === alumno.id ? "✓ Link copiado" : copiandoId === alumno.id ? "Generando..." : "📤 Compartir con papás"}
                          </button>

                          <button onClick={() => guardarConducta(alumno.id)} disabled={guardandoConductaId === alumno.id} style={{
                            padding: "10px 24px", borderRadius: "8px", border: "none", fontWeight: "700", fontSize: "13px", cursor: "pointer",
                            background: guardadoConductaId === alumno.id ? "#16a34a" : guardandoConductaId === alumno.id ? "#475569" : "#6366f1",
                            color: "white",
                          }}>
                            {guardadoConductaId === alumno.id ? "✓ Guardado" : guardandoConductaId === alumno.id ? "Guardando..." : "Guardar"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </main>
  );
}