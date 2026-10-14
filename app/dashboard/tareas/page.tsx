// Colocar en: app/dashboard/tareas/page.tsx
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

export default function TareasPage() {
  const [esPremium, setEsPremium] = useState<boolean | null>(null);
  const [grupos, setGrupos] = useState<any[]>([]);
  const [grupo, setGrupo] = useState("");
  const [trimestre, setTrimestre] = useState(1);
  const [alumnos, setAlumnos] = useState<any[]>([]);
  const [materias, setMaterias] = useState<any[]>([]);
  const [tareas, setTareas] = useState<any[]>([]);
  const [entregas, setEntregas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [color, setColor] = useState("");

  const [nuevoTitulo, setNuevoTitulo] = useState("");
  const [nuevaMateria, setNuevaMateria] = useState("");

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
    if (!maestro?.id || !grupo) { setAlumnos([]); setMaterias([]); return; }
    fetch(`/api/alumnos?grupoId=${grupo}&maestroId=${maestro.id}`)
      .then((res) => res.json())
      .then((data) => setAlumnos((data.alumnos || []).filter((a: any) => a.activo !== false)));
    fetch(`/api/materias?grupo_id=${grupo}&maestro_id=${maestro.id}`)
      .then((res) => res.json())
      .then((data) => setMaterias(Array.isArray(data) ? data : []));
  }, [grupo]);

  useEffect(() => {
    if (!grupo) return;
    cargarTodo();
  }, [grupo, trimestre]);

  const cargarTodo = async () => {
    const maestro = getMaestro();
    if (!maestro?.id || !grupo) return;
    setCargando(true);
    const [resTareas, resEntregas] = await Promise.all([
      fetch(`/api/tareas?grupo_id=${grupo}&maestro_id=${maestro.id}&trimestre=${trimestre}`),
      fetch(`/api/tareas-entregas?grupo_id=${grupo}&maestro_id=${maestro.id}&trimestre=${trimestre}`),
    ]);
    setTareas(await resTareas.json());
    setEntregas(await resEntregas.json());
    setCargando(false);
  };

  const agregarTarea = async () => {
    const maestro = getMaestro();
    if (!maestro?.id || !grupo || !nuevoTitulo.trim()) return;
    const res = await fetch("/api/tareas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grupo_id: grupo,
        materia_id: nuevaMateria || null,
        maestro_id: maestro.id,
        trimestre,
        titulo: nuevoTitulo.trim(),
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setNuevoTitulo("");
      setColor("#22c55e"); setMensaje("Tarea agregada");
      cargarTodo();
    } else {
      setColor("#ef4444"); setMensaje(data.error || "No se pudo agregar");
    }
    setTimeout(() => setMensaje(""), 2500);
  };

  const borrarTarea = async (id: number) => {
    const maestro = getMaestro();
    if (!maestro?.id) return;
    if (!confirm("¿Borrar esta tarea y sus entregas registradas?")) return;
    const res = await fetch("/api/tareas", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, maestro_id: maestro.id }),
    });
    if (res.ok) cargarTodo();
  };

  const toggleEntrega = async (tareaId: number, alumnoId: number, actual: boolean) => {
    const maestro = getMaestro();
    if (!maestro?.id) return;
    // actualización optimista
    setEntregas((prev) => {
      const existe = prev.find((e) => e.tarea_id === tareaId && e.alumno_id === alumnoId);
      if (existe) {
        return prev.map((e) =>
          e.tarea_id === tareaId && e.alumno_id === alumnoId ? { ...e, entregada: !actual } : e
        );
      }
      return [...prev, { tarea_id: tareaId, alumno_id: alumnoId, entregada: !actual }];
    });
    await fetch("/api/tareas-entregas", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tarea_id: tareaId, alumno_id: alumnoId, maestro_id: maestro.id, entregada: !actual }),
    });
  };

  const entregaDe = (tareaId: number, alumnoId: number) =>
    !!entregas.find((e) => e.tarea_id === tareaId && e.alumno_id === alumnoId)?.entregada;

  const recuentoDe = (alumnoId: number) => {
    const total = tareas.length;
    const entregadas = tareas.filter((t) => entregaDe(t.id, alumnoId)).length;
    return { entregadas, total };
  };

  if (esPremium === null) return null;

  if (!esPremium) {
    return (
      <main style={{ minHeight: "100vh", background: "#dbeafe", fontFamily: "Arial, sans-serif", padding: "24px", color: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "#fff", borderRadius: "16px", padding: "40px", maxWidth: "420px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>🔒</div>
          <h1 style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 8px" }}>Función Premium</h1>
          <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "24px" }}>
            El recuento de tareas entregadas por trimestre está disponible solo para maestros con plan Premium ($49/mes).
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
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: 700, margin: 0 }}>📝 Tareas entregadas</h1>
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
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
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
            <h2 style={{ fontSize: "15px", fontWeight: 700, margin: "0 0 12px" }}>Nueva tarea — Trimestre {trimestre}</h2>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <input
                value={nuevoTitulo}
                onChange={(e) => setNuevoTitulo(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && agregarTarea()}
                placeholder="Ej. Lectura de comprensión, página 12…"
                style={{ ...inputStyle, flex: "1 1 240px" }}
              />
              <select value={nuevaMateria} onChange={(e) => setNuevaMateria(e.target.value)} style={{ ...inputStyle, width: "180px" }}>
                <option value="">Sin materia específica</option>
                {materias.map((m) => (
                  <option key={m.id} value={m.id}>{m.nombre}</option>
                ))}
              </select>
              <button
                onClick={agregarTarea}
                style={{ padding: "12px 18px", borderRadius: "10px", border: "none", background: "#6366f1", color: "white", fontWeight: 700, cursor: "pointer" }}
              >
                + Agregar tarea
              </button>
            </div>
          </div>
        )}

        {grupo && tareas.length > 0 && (
          <div style={{ background: "#fff", borderRadius: "16px", padding: "20px", marginBottom: "16px", overflowX: "auto", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <h2 style={{ fontSize: "15px", fontWeight: 700, margin: "0 0 14px" }}>Control de entregas</h2>
            <table style={{ borderCollapse: "collapse", width: "100%", fontSize: "13px" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "8px", position: "sticky", left: 0, background: "#fff" }}>Alumno</th>
                  {tareas.map((t) => (
                    <th key={t.id} style={{ padding: "8px", fontWeight: 600, minWidth: "110px" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                        <span>{t.titulo}</span>
                        <span onClick={() => borrarTarea(t.id)} style={{ cursor: "pointer", color: "#ef4444", fontSize: "11px" }}>✕ borrar</span>
                      </div>
                    </th>
                  ))}
                  <th style={{ padding: "8px" }}>Recuento</th>
                </tr>
              </thead>
              <tbody>
                {alumnos.map((al) => {
                  const { entregadas, total } = recuentoDe(al.id);
                  return (
                    <tr key={al.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "8px", fontWeight: 600, position: "sticky", left: 0, background: "#fff" }}>{al.nombre}</td>
                      {tareas.map((t) => {
                        const entregada = entregaDe(t.id, al.id);
                        return (
                          <td key={t.id} style={{ textAlign: "center", padding: "8px" }}>
                            <span
                              onClick={() => toggleEntrega(t.id, al.id, entregada)}
                              style={{
                                display: "inline-flex", alignItems: "center", justifyContent: "center",
                                width: "28px", height: "28px", borderRadius: "8px", cursor: "pointer",
                                background: entregada ? "#dcfce7" : "#fee2e2",
                                color: entregada ? "#15803d" : "#b91c1c",
                                fontWeight: 700,
                              }}
                            >
                              {entregada ? "✓" : "✕"}
                            </span>
                          </td>
                        );
                      })}
                      <td style={{ textAlign: "center", padding: "8px", fontWeight: 700 }}>
                        <span style={{ background: "#eef2ff", color: "#4f46e5", padding: "4px 10px", borderRadius: "20px", fontSize: "12px" }}>
                          {entregadas}/{total}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {grupo && !cargando && tareas.length === 0 && (
          <p style={{ fontSize: "13px", color: "#64748b" }}>Aún no has agregado tareas para este trimestre.</p>
        )}
      </div>
    </main>
  );
}
