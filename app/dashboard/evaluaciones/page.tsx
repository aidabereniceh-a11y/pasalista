// Colocar en: app/dashboard/evaluaciones/page.tsx
"use client";
import { useEffect, useState } from "react";

const TRIMESTRES = [1, 2, 3];

const inputStyle = {
  padding: "12px",
  borderRadius: "10px",
  background: "#fff",
  border: "1px solid #e2e8f0",
  color: "#1e293b",
  fontSize: "14px",
  boxSizing: "border-box" as const,
};

function getMaestro() {
  const data = localStorage.getItem("maestro");
  return data ? JSON.parse(data) : null;
}

export default function EvaluacionesPage() {
  const [esPremium, setEsPremium] = useState<boolean | null>(null);
  const [grupos, setGrupos] = useState<any[]>([]);
  const [grupo, setGrupo] = useState("");
  const [trimestre, setTrimestre] = useState(1);
  const [alumnos, setAlumnos] = useState<any[]>([]);
  const [materias, setMaterias] = useState<any[]>([]);
  const [materiaActiva, setMateriaActiva] = useState<number | null>(null);
  const [evaluaciones, setEvaluaciones] = useState<any[]>([]);
  const [nuevaMateria, setNuevaMateria] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [color, setColor] = useState("");
  const [cargando, setCargando] = useState(false);

  // formulario de nueva evaluación por alumno: { [alumnoId]: { tipo, valor, comentario } }
  const [formAlumno, setFormAlumno] = useState<Record<string, { tipo: "numerica" | "comentario"; valor: string; comentario: string }>>({});

  useEffect(() => {
    const maestro = getMaestro();
    if (!maestro?.id) { window.location.href = "/login"; return; }
    setEsPremium(maestro.plan === "premium");
    fetch(`/api/grupos?maestroId=${maestro.id}`)
      .then((res) => res.json())
      .then((data) => setGrupos(data.grupos || []));
  }, []);

  useEffect(() => {
    const maestro = getMaestro();
    if (!maestro?.id || !grupo) { setAlumnos([]); setMaterias([]); setMateriaActiva(null); return; }
    fetch(`/api/alumnos?grupoId=${grupo}&maestroId=${maestro.id}`)
      .then((res) => res.json())
      .then((data) => setAlumnos((data.alumnos || []).filter((a: any) => a.activo !== false)));
    cargarMaterias();
  }, [grupo]);

  useEffect(() => {
    if (!grupo) return;
    cargarEvaluaciones();
  }, [grupo, trimestre]);

  const cargarMaterias = async () => {
    const maestro = getMaestro();
    if (!maestro?.id || !grupo) return;
    const res = await fetch(`/api/materias?grupo_id=${grupo}&maestro_id=${maestro.id}`);
    const data = await res.json();
    const lista = Array.isArray(data) ? data : [];
    setMaterias(lista);
    if (lista.length && materiaActiva === null) setMateriaActiva(lista[0].id);
  };

  const cargarEvaluaciones = async () => {
    const maestro = getMaestro();
    if (!maestro?.id || !grupo) return;
    setCargando(true);
    const res = await fetch(`/api/evaluaciones?grupo_id=${grupo}&maestro_id=${maestro.id}&trimestre=${trimestre}`);
    const data = await res.json();
    setEvaluaciones(Array.isArray(data) ? data : []);
    setCargando(false);
  };

  const agregarMateria = async () => {
    const maestro = getMaestro();
    if (!maestro?.id || !grupo || !nuevaMateria.trim()) return;
    const res = await fetch("/api/materias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ grupo_id: grupo, maestro_id: maestro.id, nombre: nuevaMateria.trim() }),
    });
    const data = await res.json();
    if (res.ok) {
      setMaterias((prev) => [...prev, data]);
      setMateriaActiva(data.id);
      setNuevaMateria("");
    } else {
      setColor("#ef4444"); setMensaje(data.error || "No se pudo agregar la materia");
      setTimeout(() => setMensaje(""), 3000);
    }
  };

  const borrarMateria = async (id: number) => {
    const maestro = getMaestro();
    if (!maestro?.id) return;
    if (!confirm("¿Borrar esta materia y todas sus evaluaciones?")) return;
    const res = await fetch("/api/materias", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, maestro_id: maestro.id }),
    });
    if (res.ok) {
      setMaterias((prev) => prev.filter((m) => m.id !== id));
      if (materiaActiva === id) setMateriaActiva(null);
      cargarEvaluaciones();
    }
  };

  const guardarEvaluacion = async (alumnoId: number) => {
    const maestro = getMaestro();
    if (!maestro?.id || !grupo || !materiaActiva) return;
    const form = formAlumno[alumnoId];
    if (!form) return;
    if (form.tipo === "numerica" && form.valor === "") return;
    if (form.tipo === "comentario" && !form.comentario.trim()) return;

    const payload: any = {
      grupo_id: grupo,
      alumno_id: alumnoId,
      materia_id: materiaActiva,
      maestro_id: maestro.id,
      trimestre,
      tipo: form.tipo,
    };
    if (form.tipo === "numerica") payload.valor_numerico = Number(form.valor);
    if (form.tipo === "comentario") payload.comentario = form.comentario.trim();

    const res = await fetch("/api/evaluaciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (res.ok) {
      setEvaluaciones((prev) => [data, ...prev]);
      setFormAlumno((prev) => ({ ...prev, [alumnoId]: { tipo: form.tipo, valor: "", comentario: "" } }));
      setColor("#22c55e"); setMensaje("Guardado correctamente");
    } else {
      setColor("#ef4444"); setMensaje(data.error || "No se pudo guardar");
    }
    setTimeout(() => setMensaje(""), 2500);
  };

  const borrarEvaluacion = async (id: number) => {
    const maestro = getMaestro();
    if (!maestro?.id) return;
    const res = await fetch("/api/evaluaciones", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, maestro_id: maestro.id }),
    });
    if (res.ok) setEvaluaciones((prev) => prev.filter((e) => e.id !== id));
  };

  const setForm = (alumnoId: number, cambios: Partial<{ tipo: "numerica" | "comentario"; valor: string; comentario: string }>) => {
    setFormAlumno((prev) => ({
      ...prev,
      [alumnoId]: { tipo: "numerica", valor: "", comentario: "", ...prev[alumnoId], ...cambios },
    }));
  };

  const evaluacionesDe = (alumnoId: number) =>
    evaluaciones.filter((e) => String(e.alumno_id) === String(alumnoId) && String(e.materia_id) === String(materiaActiva));

  const promedioDe = (alumnoId: number) => {
    const nums = evaluacionesDe(alumnoId).filter((e) => e.tipo === "numerica").map((e) => Number(e.valor_numerico));
    if (!nums.length) return null;
    return (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1);
  };

  if (esPremium === null) return null;

  if (!esPremium) {
    return (
      <main style={{ minHeight: "100vh", background: "#dbeafe", fontFamily: "Arial, sans-serif", padding: "24px", color: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "#fff", borderRadius: "16px", padding: "40px", maxWidth: "420px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>🔒</div>
          <h1 style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 8px" }}>Función Premium</h1>
          <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "24px" }}>
            Las Evaluaciones por materia y trimestre están disponibles solo para maestros con plan Premium ($49/mes).
          </p>
          <a href="/dashboard" style={{ display: "inline-block", background: "#6366f1", color: "white", padding: "12px 24px", borderRadius: "10px", fontSize: "14px", fontWeight: 700, textDecoration: "none" }}>
            Volver al dashboard
          </a>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "#dbeafe", fontFamily: "Arial, sans-serif", padding: "24px", color: "#1e293b" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: 700, margin: 0 }}>📊 Evaluaciones</h1>
          <a href="/dashboard" style={{ background: "#eef2ff", color: "#4f46e5", border: "1px solid #c7d2fe", padding: "8px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: 600, textDecoration: "none" }}>
            Volver
          </a>
        </div>

        {mensaje && (
          <div style={{ background: color === "#22c55e" ? "#dcfce7" : "#fee2e2", color, padding: "10px 16px", borderRadius: "10px", marginBottom: "16px", fontSize: "13px", fontWeight: 600 }}>
            {mensaje}
          </div>
        )}

        <div style={{ background: "#fff", borderRadius: "16px", padding: "20px", marginBottom: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "4px" }}>
            <div style={{ flex: "1 1 220px" }}>
              <label style={{ fontSize: "13px", color: "#475569", fontWeight: 600, display: "block", marginBottom: "6px" }}>Grupo</label>
              <select value={grupo} onChange={(e) => setGrupo(e.target.value)} style={{ ...inputStyle, width: "100%" }}>
                <option value="">Selecciona un grupo</option>
                {grupos.map((g) => (
                  <option key={g.id} value={g.id}>{g.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: "13px", color: "#475569", fontWeight: 600, display: "block", marginBottom: "6px" }}>Trimestre</label>
              <div style={{ display: "flex", gap: "6px" }}>
                {TRIMESTRES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTrimestre(t)}
                    style={{
                      width: "38px", height: "42px", borderRadius: "10px", border: "none", fontWeight: 700, cursor: "pointer",
                      background: trimestre === t ? "#6366f1" : "#e2e8f0",
                      color: trimestre === t ? "white" : "#475569",
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {grupo && (
          <div style={{ background: "#fff", borderRadius: "16px", padding: "20px", marginBottom: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <h2 style={{ fontSize: "15px", fontWeight: 700, margin: "0 0 12px" }}>Materias / Campos formativos</h2>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "14px" }}>
              {materias.map((m) => (
                <div
                  key={m.id}
                  onClick={() => setMateriaActiva(m.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: "8px", padding: "8px 14px", borderRadius: "20px", cursor: "pointer",
                    background: materiaActiva === m.id ? "#6366f1" : "#eef2ff",
                    color: materiaActiva === m.id ? "white" : "#4f46e5",
                    fontWeight: 600, fontSize: "13px",
                  }}
                >
                  {m.nombre}
                  <span
                    onClick={(e) => { e.stopPropagation(); borrarMateria(m.id); }}
                    style={{ opacity: 0.7 }}
                  >
                    ✕
                  </span>
                </div>
              ))}
              {materias.length === 0 && (
                <span style={{ fontSize: "13px", color: "#94a3b8" }}>Aún no has agregado materias para este grupo.</span>
              )}
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                value={nuevaMateria}
                onChange={(e) => setNuevaMateria(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && agregarMateria()}
                placeholder="Ej. Lenguaje, Matemáticas…"
                style={{ ...inputStyle, flex: 1 }}
              />
              <button
                onClick={agregarMateria}
                style={{ padding: "12px 18px", borderRadius: "10px", border: "none", background: "#6366f1", color: "white", fontWeight: 700, cursor: "pointer" }}
              >
                + Agregar
              </button>
            </div>
          </div>
        )}

        {grupo && materiaActiva && (
          <div style={{ background: "#fff", borderRadius: "16px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <h2 style={{ fontSize: "15px", fontWeight: 700, margin: "0 0 14px" }}>
              {materias.find((m) => m.id === materiaActiva)?.nombre} — Trimestre {trimestre}
            </h2>

            {cargando && <p style={{ fontSize: "13px", color: "#94a3b8" }}>Cargando…</p>}

            {alumnos.map((al) => {
              const lista = evaluacionesDe(al.id);
              const prom = promedioDe(al.id);
              const form = formAlumno[al.id] || { tipo: "numerica" as const, valor: "", comentario: "" };
              return (
                <div key={al.id} style={{ borderTop: "1px solid #f1f5f9", padding: "14px 0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontWeight: 700, fontSize: "14px" }}>{al.nombre}</span>
                    {prom !== null && (
                      <span style={{ background: "#eef2ff", color: "#4f46e5", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 700 }}>
                        Promedio: {prom}
                      </span>
                    )}
                  </div>

                  {lista.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "10px" }}>
                      {lista.map((ev) => (
                        <span
                          key={ev.id}
                          style={{
                            display: "flex", alignItems: "center", gap: "6px", fontSize: "12px",
                            background: ev.tipo === "numerica" ? "#dcfce7" : "#fef3c7",
                            color: ev.tipo === "numerica" ? "#15803d" : "#92400e",
                            padding: "5px 10px", borderRadius: "14px",
                          }}
                        >
                          {ev.tipo === "numerica" ? ev.valor_numerico : `"${ev.comentario}"`}
                          <span onClick={() => borrarEvaluacion(ev.id)} style={{ cursor: "pointer", opacity: 0.7 }}>✕</span>
                        </span>
                      ))}
                    </div>
                  )}

                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                    <select
                      value={form.tipo}
                      onChange={(e) => setForm(al.id, { tipo: e.target.value as "numerica" | "comentario" })}
                      style={{ ...inputStyle, padding: "8px" }}
                    >
                      <option value="numerica">Calificación</option>
                      <option value="comentario">Comentario</option>
                    </select>
                    {form.tipo === "numerica" ? (
                      <input
                        type="number"
                        min={0}
                        max={10}
                        step={0.1}
                        value={form.valor}
                        onChange={(e) => setForm(al.id, { valor: e.target.value })}
                        placeholder="0-10"
                        style={{ ...inputStyle, width: "90px", padding: "8px" }}
                      />
                    ) : (
                      <input
                        value={form.comentario}
                        onChange={(e) => setForm(al.id, { comentario: e.target.value })}
                        placeholder="Escribe un comentario…"
                        style={{ ...inputStyle, flex: 1, minWidth: "180px", padding: "8px" }}
                      />
                    )}
                    <button
                      onClick={() => guardarEvaluacion(al.id)}
                      style={{ padding: "8px 16px", borderRadius: "10px", border: "none", background: "#6366f1", color: "white", fontWeight: 700, cursor: "pointer", fontSize: "13px" }}
                    >
                      Agregar
                    </button>
                  </div>
                </div>
              );
            })}

            {alumnos.length === 0 && (
              <p style={{ fontSize: "13px", color: "#94a3b8" }}>Este grupo no tiene alumnos activos.</p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
