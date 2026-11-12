"use client";

export const runtime = "edge";   // ← agregar esta línea

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Maestro {
  id: number;
  nombre: string;
  plan: string;
}

interface Grupo {
  id: number;
  nombre: string;
  grado: string;
  grupo: string;
}

interface Evaluacion {
  id: number;
  grupo_id: number;
  nombre: string;
  fecha: string;
}

interface Alumno {
  id: number;
  nombre: string;
}

interface Calificacion {
  alumno_id: number;
  calificacion: number | string;
  observacion: string;
}

export default function EvaluacionesPage() {
  const router = useRouter();
  const [maestro, setMaestro] = useState<Maestro | null>(null);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState<number | null>(null);
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [evaluacionSeleccionada, setEvaluacionSeleccionada] = useState<Evaluacion | null>(null);
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [calificaciones, setCalificaciones] = useState<Record<number, Calificacion>>({});
  const [nuevaEval, setNuevaEval] = useState({ nombre: "", fecha: "" });
  const [creando, setCreando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
  const data = localStorage.getItem("maestro");
  if (!data) { router.push("/login"); return; }
  const m = JSON.parse(data);
  setMaestro(m);
  fetch(`/api/grupos?maestroId=${m.id}`)
    .then(r => r.json())
    .then(data => setGrupos(data.grupos || []));  // ← fix aquí
}, [router]);

  useEffect(() => {
    if (!grupoSeleccionado || !maestro) return;
    setEvaluacionSeleccionada(null);
    setAlumnos([]);
    setCalificaciones({});
    fetch(`/api/evaluaciones?maestroId=${maestro.id}&grupoId=${grupoSeleccionado}`)
      .then(r => r.json())
      .then(setEvaluaciones);
    fetch(`/api/alumnos?grupoId=${grupoSeleccionado}`)
      .then(r => r.json())
      .then(setAlumnos);
  }, [grupoSeleccionado, maestro]);

  useEffect(() => {
    if (!evaluacionSeleccionada) return;
    fetch(`/api/evaluaciones/${evaluacionSeleccionada.id}/calificaciones`)
      .then(r => r.json())
      .then((data: Array<{ alumno_id: number; calificacion: number; observacion: string }>) => {
        const map: Record<number, Calificacion> = {};
        data.forEach(c => {
          map[c.alumno_id] = { alumno_id: c.alumno_id, calificacion: c.calificacion, observacion: c.observacion || "" };
        });
        setCalificaciones(map);
      });
  }, [evaluacionSeleccionada]);

  const crearEvaluacion = async () => {
    if (!nuevaEval.nombre || !grupoSeleccionado || !maestro) return;
    setCreando(true);
    const res = await fetch("/api/evaluaciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ maestroId: maestro.id, grupoId: grupoSeleccionado, nombre: nuevaEval.nombre, fecha: nuevaEval.fecha || undefined }),
    });
    const nueva = await res.json();
    setEvaluaciones(prev => [nueva, ...prev]);
    setNuevaEval({ nombre: "", fecha: "" });
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

  const grupoActual = grupos.find(g => g.id === grupoSeleccionado);

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
          onChange={e => setGrupoSeleccionado(Number(e.target.value))}
          style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "#0f172a", color: "white", border: "1px solid #334155", fontSize: "15px" }}
        >
          <option value="">-- Elige un grupo --</option>
          {grupos.map(g => (
            <option key={g.id} value={g.id}>{g.nombre} — {g.grado} {g.grupo}</option>
          ))}
        </select>
      </div>

      {grupoSeleccionado && (
        <>
          {/* Crear evaluación */}
          <div style={{ background: "#1e293b", borderRadius: "12px", padding: "20px", marginBottom: "20px" }}>
            <h2 style={{ margin: "0 0 16px", fontSize: "16px", color: "#94a3b8" }}>Nueva evaluación</h2>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <input
                placeholder="Nombre (ej. Bloque 1)"
                value={nuevaEval.nombre}
                onChange={e => setNuevaEval(p => ({ ...p, nombre: e.target.value }))}
                style={{ flex: 1, minWidth: "200px", padding: "10px", borderRadius: "8px", background: "#0f172a", color: "white", border: "1px solid #334155", fontSize: "15px" }}
              />
              <input
                type="date"
                value={nuevaEval.fecha}
                onChange={e => setNuevaEval(p => ({ ...p, fecha: e.target.value }))}
                style={{ padding: "10px", borderRadius: "8px", background: "#0f172a", color: "white", border: "1px solid #334155", fontSize: "15px" }}
              />
              <button
                onClick={crearEvaluacion}
                disabled={creando || !nuevaEval.nombre}
                style={{ padding: "10px 20px", borderRadius: "8px", background: "#6366f1", color: "white", border: "none", fontWeight: "700", cursor: "pointer" }}
              >
                {creando ? "Creando..." : "Crear"}
              </button>
            </div>
          </div>

          {/* Lista de evaluaciones */}
          {evaluaciones.length > 0 && (
            <div style={{ background: "#1e293b", borderRadius: "12px", padding: "20px", marginBottom: "20px" }}>
              <h2 style={{ margin: "0 0 16px", fontSize: "16px", color: "#94a3b8" }}>Evaluaciones de {grupoActual?.nombre}</h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {evaluaciones.map(ev => (
                  <button
                    key={ev.id}
                    onClick={() => setEvaluacionSeleccionada(ev)}
                    style={{
                      padding: "10px 16px", borderRadius: "8px", border: "2px solid",
                      borderColor: evaluacionSeleccionada?.id === ev.id ? "#6366f1" : "#334155",
                      background: evaluacionSeleccionada?.id === ev.id ? "#312e81" : "#0f172a",
                      color: "white", cursor: "pointer", fontWeight: "600"
                    }}
                  >
                    {ev.nombre}
                    <span style={{ display: "block", fontSize: "11px", color: "#94a3b8", fontWeight: "400" }}>{ev.fecha}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tabla de calificaciones */}
          {evaluacionSeleccionada && alumnos.length > 0 && (
            <div style={{ background: "#1e293b", borderRadius: "12px", padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
                <h2 style={{ margin: 0, fontSize: "16px" }}>Calificaciones — {evaluacionSeleccionada.nombre}</h2>
                <button
                  onClick={guardarCalificaciones}
                  disabled={guardando}
                  style={{ padding: "10px 24px", borderRadius: "8px", background: guardado ? "#16a34a" : "#6366f1", color: "white", border: "none", fontWeight: "700", cursor: "pointer" }}
                >
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
                          <input
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            value={calificaciones[alumno.id]?.calificacion ?? ""}
                            onChange={e => actualizarCal(alumno.id, "calificacion", e.target.value)}
                            style={{ width: "70px", padding: "6px", borderRadius: "6px", background: "#334155", color: "white", border: "1px solid #475569", textAlign: "center", fontSize: "14px" }}
                          />
                        </td>
                        <td style={{ padding: "8px 12px" }}>
                          <input
                            type="text"
                            placeholder="Opcional..."
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
    </main>
  );
}