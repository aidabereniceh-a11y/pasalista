"use client";
import { useState, useRef, useEffect } from "react";

const COMPONENTES = [
  "Lenguaje y Comunicación",
  "Pensamiento Matemático",
  "Exploración y comprensión del mundo",
  "Artes",
  "Educación Socioemocional",
  "Educación Física",
  "Inglés",
];

const AUTOEVAL = [
  "Inicio puntual de la actividad",
  "Se llevó a cabo lo planeado",
  "El material fue adecuado",
  "Mi intervención fue adecuada",
  "Favorecí el desarrollo socioemocional",
  "Mis consignas fueron claras",
];

const SITUACIONES = [
  "Agresión verbal",
  "Desacato al docente",
  "Lenguaje obsceno",
  "Cambio de comportamiento",
  "Daño material",
  "Otros",
  "Agresión física",
  "Accidente escolar",
  "Conducta agresiva o peligrosa",
  "Participó en una pelea",
  "Incumplimiento de tareas",
];

const inputStyle = {
  padding: "12px",
  borderRadius: "10px",
  background: "#fff",
  border: "1px solid #e2e8f0",
  color: "#1e293b",
  fontSize: "14px",
  boxSizing: "border-box" as const,
};

function useDictado(onResult: (t: string) => void) {
  const [grabando, setGrabando] = useState(false);
  const [soportado, setSoportado] = useState(true);
  const recRef = useRef<any>(null);

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setSoportado(false); return; }
    const rec = new SR();
    rec.lang = "es-MX";
    rec.continuous = true;
    rec.interimResults = false;
    rec.onresult = (e: any) => {
      let texto = "";
      for (let i = e.resultIndex; i < e.results.length; i++) texto += e.results[i][0].transcript;
      onResult(texto);
    };
    rec.onend = () => setGrabando(false);
    recRef.current = rec;
  }, []); // eslint-disable-line

  const toggle = () => {
    if (!recRef.current) return;
    if (grabando) { recRef.current.stop(); setGrabando(false); }
    else { recRef.current.start(); setGrabando(true); }
  };
  return { grabando, soportado, toggle };
}

function CampoDictado({ label, value, onChange, rows = 3 }: any) {
  const { grabando, soportado, toggle } = useDictado((texto) =>
    onChange((prev: string) => (prev ? prev + " " + texto : texto))
  );
  return (
    <div style={{ marginBottom: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
        <label style={{ fontSize: "13px", color: "#475569", fontWeight: 600 }}>{label}</label>
        {soportado ? (
          <button
            type="button"
            onClick={toggle}
            className="no-print"
            style={{
              display: "flex", alignItems: "center", gap: "6px", border: "none", borderRadius: "20px",
              padding: "5px 12px", fontSize: "12px", fontWeight: 700, cursor: "pointer", color: "white",
              background: grabando ? "#ef4444" : "#6366f1",
            }}
          >
            {grabando ? "⏹ Grabando…" : "🎤 Dictar"}
          </button>
        ) : (
          <span className="no-print" style={{ fontSize: "11px", color: "#94a3b8" }}>Dictado no disponible en este navegador</span>
        )}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder="Escribe o presiona Dictar para hablar…"
        style={{ ...inputStyle, width: "100%", resize: "vertical", fontFamily: "inherit", borderColor: grabando ? "#ef4444" : "#e2e8f0" }}
      />
    </div>
  );
}

function Check2({ checked, onChange, label }: any) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: "10px", padding: "7px 0", fontSize: "14px", color: "#1e293b", cursor: "pointer" }}>
      <span
        onClick={() => onChange(!checked)}
        style={{
          width: "18px", height: "18px", borderRadius: "5px", flexShrink: 0,
          border: `2px solid ${checked ? "#6366f1" : "#cbd5e1"}`,
          background: checked ? "#6366f1" : "transparent",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        {checked && <span style={{ color: "white", fontSize: "12px" }}>✓</span>}
      </span>
      {label}
    </label>
  );
}

function exportarWord(titulo: string, html: string) {
  const doc = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
  <head><meta charset="utf-8"><title>${titulo}</title></head>
  <body style="font-family:Calibri,Arial,sans-serif; color:#1e293b; padding: 20px;">
    <div style="border-bottom: 3px solid #6366f1; padding-bottom: 12px; margin-bottom: 20px;">
      <h1 style="color:#4f46e5; font-size:22px; margin:0;">${titulo}</h1>
    </div>
    ${html}
    <p style="margin-top:30px; font-size:11px; color:#94a3b8;">Generado desde PasaLista</p>
  </body></html>`;
  const blob = new Blob(["\ufeff", doc], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${titulo.replace(/\s+/g, "_")}.doc`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function campoWord(label: string, valor: string) {
  return `<div style="margin-bottom:16px;">
    <div style="font-size:12px; font-weight:bold; color:#6366f1; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px;">${label}</div>
    <div style="font-size:14px; line-height:1.5; background:#f8fafc; border-left:3px solid #c7d2fe; padding:10px 14px; border-radius:4px;">${valor || "—"}</div>
  </div>`;
}

function datosWord(pares: [string, string][]) {
  const celdas = pares.map(([label, valor]) =>
    `<td style="padding:8px 14px; border:1px solid #e2e8f0; background:#eef2ff;">
      <div style="font-size:11px; color:#4f46e5; font-weight:bold;">${label}</div>
      <div style="font-size:13px;">${valor || "—"}</div>
    </td>`
  ).join("");
  return `<table style="width:100%; border-collapse:collapse; margin-bottom:20px;"><tr>${celdas}</tr></table>`;
}

function listaWord(titulo: string, items: string[], color: string) {
  const filas = items.length
    ? items.map((i) => `<li style="margin-bottom:4px;">${i}</li>`).join("")
    : `<li style="color:#94a3b8;">Ninguno marcado</li>`;
  return `<div style="margin-bottom:20px;">
    <div style="font-size:13px; font-weight:bold; color:${color}; margin-bottom:6px;">${titulo}</div>
    <ul style="margin:0; padding-left:20px; font-size:13px;">${filas}</ul>
  </div>`;
}

export default function DiarioDelMaestro() {
  const [tab, setTab] = useState("diario");
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [historialDiario, setHistorialDiario] = useState<any[]>([]);
  const [historialBitacora, setHistorialBitacora] = useState<any[]>([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);

  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [historialGrupo, setHistorialGrupo] = useState("");
  const [historialAlumno, setHistorialAlumno] = useState("");
  const [alumnosHistorial, setAlumnosHistorial] = useState<any[]>([]);

  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [grupo, setGrupo] = useState("");
  const [nombreDocente, setNombreDocente] = useState("");
  const [firmaDocente, setFirmaDocente] = useState("");
  const [componentes, setComponentes] = useState<any>({});
  const [actividades, setActividades] = useState("");
  const [logros, setLogros] = useState("");
  const [retos, setRetos] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [compromisos, setCompromisos] = useState("");
  const [autoeval, setAutoeval] = useState<any>({});

  const [incFecha, setIncFecha] = useState(new Date().toISOString().slice(0, 10));
  const [incGrupo, setIncGrupo] = useState("");
  const [incAlumno, setIncAlumno] = useState("");
  const [incSituaciones, setIncSituaciones] = useState<any>({});
  const [incDescripcion, setIncDescripcion] = useState("");
  const [incAccion, setIncAccion] = useState("");
  const [incNotifico, setIncNotifico] = useState(false);
  const [firmas, setFirmas] = useState<any>({});

  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [color, setColor] = useState("");
  const [grupos, setGrupos] = useState<any[]>([]);
  const [alumnosDelGrupo, setAlumnosDelGrupo] = useState<any[]>([]);
  const [esPremium, setEsPremium] = useState<boolean | null>(null);

  const getMaestro = () => {
    const data = localStorage.getItem("maestro");
    return data ? JSON.parse(data) : null;
  };

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
    if (!maestro?.id || !incGrupo) { setAlumnosDelGrupo([]); return; }
    fetch(`/api/alumnos?grupoId=${incGrupo}&maestroId=${maestro.id}`)
      .then((res) => res.json())
      .then((data) => setAlumnosDelGrupo((data.alumnos || []).filter((a: any) => a.activo !== false)));
  }, [incGrupo]);

  useEffect(() => {
    const maestro = getMaestro();
    if (!maestro?.id || !historialGrupo) { setAlumnosHistorial([]); return; }
    fetch(`/api/alumnos?grupoId=${historialGrupo}&maestroId=${maestro.id}`)
      .then((res) => res.json())
      .then((data) => setAlumnosHistorial((data.alumnos || []).filter((a: any) => a.activo !== false)));
  }, [historialGrupo]);

  const limpiarFormulario = () => {
    setEditandoId(null);
    setFecha(new Date().toISOString().slice(0, 10));
    setGrupo(""); setNombreDocente(""); setFirmaDocente(""); setComponentes({}); setActividades(""); setLogros(""); setRetos("");
    setObservaciones(""); setCompromisos(""); setAutoeval({});
    setIncFecha(new Date().toISOString().slice(0, 10));
    setIncGrupo(""); setIncAlumno(""); setIncSituaciones({}); setIncDescripcion(""); setIncAccion(""); setIncNotifico(false); setFirmas({});
  };

  const cargarHistorial = async () => {
    const maestro = getMaestro();
    if (!maestro?.id) return;
    setCargandoHistorial(true);
    if (tab === "diario") {
      const res = await fetch(`/api/diario?maestro_id=${maestro.id}`);
      const data = await res.json();
      setHistorialDiario(Array.isArray(data) ? data : []);
    } else {
      const res = await fetch(`/api/bitacora?maestro_id=${maestro.id}`);
      const data = await res.json();
      setHistorialBitacora(Array.isArray(data) ? data : []);
    }
    setCargandoHistorial(false);
  };

  const abrirHistorial = () => {
    setMostrarHistorial(!mostrarHistorial);
    if (!mostrarHistorial) { setHistorialGrupo(""); setHistorialAlumno(""); cargarHistorial(); }
  };

  const editarEntradaDiario = (registro: any) => {
    setEditandoId(registro.id);
    setFecha(registro.fecha || new Date().toISOString().slice(0, 10));
    setGrupo(registro.grupo_id || "");
    setNombreDocente(registro.nombre_docente || "");
    setFirmaDocente(registro.firma_docente || "");
    setComponentes(registro.componentes || {});
    setActividades(registro.actividades || "");
    setLogros(registro.logros || "");
    setRetos(registro.retos || "");
    setObservaciones(registro.observaciones || "");
    setCompromisos(registro.compromisos || "");
    setAutoeval(registro.autoevaluacion || {});
    setMostrarHistorial(false);
  };

  const editarEntradaBitacora = (registro: any) => {
    setEditandoId(registro.id);
    setIncFecha(registro.fecha || new Date().toISOString().slice(0, 10));
    setIncGrupo(registro.grupo_id || "");
    setIncAlumno(registro.alumno_nombre || "");
    setIncSituaciones(registro.situaciones || {});
    setIncDescripcion(registro.descripcion || "");
    setIncAccion(registro.accion || "");
    setIncNotifico(!!registro.notifico_padres);
    setFirmas(registro.firmas || {});
    setMostrarHistorial(false);
  };

  const guardar = async () => {
    if (guardando) return;
    const maestro = getMaestro();
    if (!maestro?.id) { window.location.href = "/login"; return; }

    setGuardando(true);
    setMensaje("");
    const endpoint = tab === "diario" ? "/api/diario" : "/api/bitacora";
    const metodo = editandoId ? "PUT" : "POST";
    const payload =
      tab === "diario"
        ? { id: editandoId, maestro_id: maestro.id, grupo_id: grupo || null, fecha, nombre_docente: nombreDocente, firma_docente: firmaDocente, componentes, actividades, logros, retos, observaciones, compromisos, autoevaluacion: autoeval }
        : { id: editandoId, maestro_id: maestro.id, grupo_id: incGrupo || null, alumno_nombre: incAlumno, fecha: incFecha, situaciones: incSituaciones, descripcion: incDescripcion, accion: incAccion, notifico_padres: incNotifico, firmas };

    try {
      const res = await fetch(endpoint, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Error al guardar");
      setColor("#22c55e");
      setMensaje(editandoId ? "Actualizado correctamente" : "Guardado correctamente");
      setEditandoId(null);
    } catch (err: any) {
      setColor("#ef4444");
      setMensaje(err.message || "No se pudo guardar");
    }
    setGuardando(false);
    setTimeout(() => setMensaje(""), 3000);
  };

  const imprimirPDF = () => window.print();

  const handleWord = () => {
    if (tab === "diario") {
      const nombreGrupo = grupos.find((g) => String(g.id) === String(grupo))?.nombre || "—";
      const html =
        datosWord([["Fecha", fecha], ["Grupo", nombreGrupo], ["Docente", nombreDocente || "—"]]) +
        listaWord("Componentes curriculares trabajados", Object.keys(componentes).filter((k) => componentes[k]), "#15803d") +
        campoWord("Actividades realizadas", actividades) +
        campoWord("Logros del día", logros) +
        campoWord("Retos u obstáculos", retos) +
        campoWord("Observaciones sobre el grupo", observaciones) +
        campoWord("Compromisos para la próxima sesión", compromisos) +
        listaWord("Autoevaluación", AUTOEVAL.filter((a) => autoeval[a]), "#b45309") +
        datosWord([["Firma del Maestro(a)", firmaDocente || "—"]]);
      exportarWord("Diario del Maestro " + fecha, html);
    } else {
      const nombreGrupo = grupos.find((g) => String(g.id) === String(incGrupo))?.nombre || "—";
      const html =
        datosWord([["Fecha", incFecha], ["Grupo", nombreGrupo], ["Alumno", incAlumno || "—"]]) +
        listaWord("Situación", SITUACIONES.filter((s) => incSituaciones[s]), "#b45309") +
        campoWord("Descripción del incidente", incDescripcion) +
        campoWord("Acción tomada", incAccion) +
        datosWord([["Se notificó a los padres", incNotifico ? "Sí" : "No"]]) +
        datosWord([
          ["Firma Alumno", firmas.alumno || "—"],
          ["Firma Director(a)", firmas.director || "—"],
          ["Firma Padre o tutor", firmas.padre || "—"],
          ["Firma Otros", firmas.otros || "—"],
          ["Firma Maestro(a)", firmas.maestro || "—"],
        ]);
      exportarWord("Bitácora de Incidencias " + incFecha, html);
    }
  };

  const guardarEnDrive = () => {
    alert("Para guardar en Drive, primero conecta tu cuenta de Google desde tu perfil (próximamente).");
  };

  const tabBtn = (id: string, texto: string) => (
    <button
      onClick={() => { setTab(id); setMostrarHistorial(false); limpiarFormulario(); }}
      style={{
        padding: "10px 20px", borderRadius: "10px", border: "none", fontWeight: 700, fontSize: "14px", cursor: "pointer",
        background: tab === id ? "#6366f1" : "#e2e8f0",
        color: tab === id ? "white" : "#475569",
      }}
    >
      {texto}
    </button>
  );

  const btnAccion = (bg: string, textColor: string) => ({
    display: "flex", alignItems: "center", gap: "6px", padding: "10px 16px", borderRadius: "10px",
    border: "none", color: textColor, background: bg, fontWeight: 700, fontSize: "13px", cursor: "pointer",
  });

  if (esPremium === null) return null;

  if (!esPremium) {
    return (
      <main style={{ minHeight: "100vh", background: "#dbeafe", fontFamily: "Arial, sans-serif", padding: "24px", color: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "#fff", borderRadius: "16px", padding: "40px", maxWidth: "420px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>🔒</div>
          <h1 style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 8px" }}>Función Premium</h1>
          <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "24px" }}>
            El Diario del Maestro y la Bitácora de incidencias están disponibles solo para maestros con plan Premium ($49/mes).
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
      <style>{`@media print { .no-print { display: none !important; } }`}</style>
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: 700, margin: 0 }}>{tab === "diario" ? "Diario" : "Bitácora"}</h1>
          <a href="/dashboard" style={{ background: "#eef2ff", color: "#4f46e5", border: "1px solid #c7d2fe", padding: "8px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: 600, textDecoration: "none" }}>
            Volver
          </a>
        </div>

        <div className="no-print" style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
          {tabBtn("diario", "📓 Diario")}
          {tabBtn("incidencias", "⚠️ Bitácora")}
          <button
            onClick={abrirHistorial}
            style={{ padding: "10px 20px", borderRadius: "10px", border: "1px solid #c7d2fe", fontWeight: 700, fontSize: "14px", cursor: "pointer", background: mostrarHistorial ? "#eef2ff" : "#fff", color: "#4f46e5" }}
          >
            🕓 {mostrarHistorial ? "Ocultar anteriores" : "Ver anteriores"}
          </button>
        </div>

        {editandoId && (
          <div className="no-print" style={{ background: "#fef9c3", border: "1px solid #fde047", color: "#854d0e", padding: "10px 14px", borderRadius: "10px", fontSize: "13px", fontWeight: 600, marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Editando un registro guardado</span>
            <button onClick={limpiarFormulario} style={{ background: "none", border: "none", color: "#854d0e", textDecoration: "underline", cursor: "pointer", fontSize: "13px", fontWeight: 700 }}>
              Cancelar edición
            </button>
          </div>
        )}

        {mostrarHistorial && (
          <div className="no-print" style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "16px", marginBottom: "20px" }}>
            <div style={{ display: "flex", gap: "12px", marginBottom: "12px", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: "160px" }}>
                <label style={{ fontSize: "12px", color: "#475569", fontWeight: 600, display: "block", marginBottom: "4px" }}>¿Qué grupo quieres consultar?</label>
                <select
                  value={historialGrupo}
                  onChange={(e) => { setHistorialGrupo(e.target.value); setHistorialAlumno(""); }}
                  style={{ ...inputStyle, width: "100%" }}
                >
                  <option value="">Selecciona un grupo</option>
                  {grupos.map((g) => (
                    <option key={g.id} value={g.id}>{g.nombre}</option>
                  ))}
                </select>
              </div>
              {tab === "incidencias" && historialGrupo && (
                <div style={{ flex: 1, minWidth: "160px" }}>
                  <label style={{ fontSize: "12px", color: "#475569", fontWeight: 600, display: "block", marginBottom: "4px" }}>Alumno</label>
                  <select
                    value={historialAlumno}
                    onChange={(e) => setHistorialAlumno(e.target.value)}
                    style={{ ...inputStyle, width: "100%" }}
                  >
                    <option value="">Todos los alumnos</option>
                    {alumnosHistorial.map((a) => (
                      <option key={a.id} value={a.nombre}>{a.nombre}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {!historialGrupo ? (
              <p style={{ color: "#94a3b8", fontSize: "13px", margin: 0 }}>Selecciona un grupo para ver su historial.</p>
            ) : cargandoHistorial ? (
              <p style={{ color: "#94a3b8", fontSize: "13px", margin: 0 }}>Cargando…</p>
            ) : tab === "diario" ? (
              historialDiario.filter((r) => String(r.grupo_id) === String(historialGrupo)).length === 0 ? (
                <p style={{ color: "#94a3b8", fontSize: "13px", margin: 0 }}>No hay entradas guardadas para ese grupo.</p>
              ) : historialDiario.filter((r) => String(r.grupo_id) === String(historialGrupo)).map((r) => (
                <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 4px", borderBottom: "1px solid #f1f5f9" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "13px" }}>{r.fecha}</div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>{(r.actividades || "Sin actividades registradas").slice(0, 60)}</div>
                  </div>
                  <button onClick={() => editarEntradaDiario(r)} style={{ background: "#eef2ff", color: "#4f46e5", border: "none", padding: "6px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
                    Editar
                  </button>
                </div>
              ))
            ) : historialBitacora.filter((r) => String(r.grupo_id) === String(historialGrupo) && (!historialAlumno || r.alumno_nombre === historialAlumno)).length === 0 ? (
              <p style={{ color: "#94a3b8", fontSize: "13px", margin: 0 }}>No hay incidencias registradas para esa selección.</p>
            ) : historialBitacora.filter((r) => String(r.grupo_id) === String(historialGrupo) && (!historialAlumno || r.alumno_nombre === historialAlumno)).map((r) => (
              <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 4px", borderBottom: "1px solid #f1f5f9" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "13px" }}>{r.fecha} {r.alumno_nombre ? "· " + r.alumno_nombre : ""}</div>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>{(r.descripcion || "Sin descripción").slice(0, 60)}</div>
                </div>
                <button onClick={() => editarEntradaBitacora(r)} style={{ background: "#eef2ff", color: "#4f46e5", border: "none", padding: "6px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
                  Editar
                </button>
              </div>
            ))}
          </div>
        )}

        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          {tab === "diario" ? (
            <>
              <div style={{ display: "flex", gap: "16px", marginBottom: "20px", flexWrap: "wrap" }}>
                <div>
                  <label style={{ fontSize: "13px", color: "#475569", fontWeight: 600, display: "block", marginBottom: "6px" }}>Fecha</label>
                  <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} style={inputStyle} />
                </div>
                <div style={{ flex: 1, minWidth: "160px" }}>
                  <label style={{ fontSize: "13px", color: "#475569", fontWeight: 600, display: "block", marginBottom: "6px" }}>Grupo</label>
                  <select value={grupo} onChange={(e) => setGrupo(e.target.value)} style={{ ...inputStyle, width: "100%" }}>
                    <option value="">Selecciona un grupo…</option>
                    {grupos.map((g) => (
                      <option key={g.id} value={g.id}>{g.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontSize: "13px", color: "#475569", fontWeight: 600, display: "block", marginBottom: "6px" }}>Nombre del Docente</label>
                <input
                  value={nombreDocente}
                  onChange={(e) => setNombreDocente(e.target.value)}
                  style={{ ...inputStyle, width: "100%" }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <p style={{ fontWeight: 700, fontSize: "14px", color: "#15803d", marginBottom: "8px" }}>
                  Componentes curriculares trabajados hoy
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px", background: "#f0fdf4", padding: "12px", borderRadius: "10px" }}>
                  {COMPONENTES.map((c) => (
                    <Check2 key={c} label={c} checked={!!componentes[c]} onChange={(v: boolean) => setComponentes({ ...componentes, [c]: v })} />
                  ))}
                </div>
              </div>

              <CampoDictado label="Actividades realizadas" value={actividades} onChange={setActividades} />
              <CampoDictado label="Logros del día" value={logros} onChange={setLogros} />
              <CampoDictado label="Retos u obstáculos" value={retos} onChange={setRetos} />
              <CampoDictado label="Observaciones sobre el grupo" value={observaciones} onChange={setObservaciones} />
              <CampoDictado label="Compromisos para la próxima sesión" value={compromisos} onChange={setCompromisos} rows={2} />

              <div>
                <p style={{ fontWeight: 700, fontSize: "14px", color: "#b45309", marginBottom: "8px" }}>Autoevaluación</p>
                <div style={{ background: "#fffbeb", padding: "12px", borderRadius: "10px" }}>
                  {AUTOEVAL.map((a) => (
                    <Check2 key={a} label={a} checked={!!autoeval[a]} onChange={(v: boolean) => setAutoeval({ ...autoeval, [a]: v })} />
                  ))}
                </div>
              </div>

              <div style={{ marginTop: "20px", borderTop: "1px solid #e2e8f0", paddingTop: "16px" }}>
                <p style={{ fontWeight: 700, fontSize: "14px", color: "#1e293b", marginBottom: "10px" }}>Firma</p>
                <div>
                  <label style={{ fontSize: "12px", color: "#475569", fontWeight: 600, display: "block", marginBottom: "6px" }}>Maestro(a)</label>
                  <input
                    value={firmaDocente}
                    onChange={(e) => setFirmaDocente(e.target.value)}
                    style={{ ...inputStyle, width: "100%", maxWidth: "320px" }}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                <div>
                  <label style={{ fontSize: "13px", color: "#475569", fontWeight: 600, display: "block", marginBottom: "6px" }}>Grupo</label>
                  <select value={incGrupo} onChange={(e) => setIncGrupo(e.target.value)} style={{ ...inputStyle, width: "100%" }}>
                    <option value="">Selecciona un grupo</option>
                    {grupos.map((g) => (
                      <option key={g.id} value={g.id}>{g.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "13px", color: "#475569", fontWeight: 600, display: "block", marginBottom: "6px" }}>Nombre del alumno</label>
                  <select
                    value={incAlumno}
                    onChange={(e) => setIncAlumno(e.target.value)}
                    disabled={!incGrupo}
                    style={{ ...inputStyle, width: "100%" }}
                  >
                    <option value="">{incGrupo ? "Selecciona un alumno…" : "Primero selecciona un grupo"}</option>
                    {alumnosDelGrupo.map((a) => (
                      <option key={a.id} value={a.nombre}>{a.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: "8px" }}>
                <label style={{ fontSize: "13px", color: "#475569", fontWeight: 600, display: "block", marginBottom: "4px" }}>Fecha</label>
                <input type="date" value={incFecha} onChange={(e) => setIncFecha(e.target.value)} style={inputStyle} />
              </div>

              <p style={{ fontWeight: 700, fontSize: "14px", color: "#475569", margin: "20px 0 10px" }}>Situación</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: "24px", marginBottom: "20px" }}>
                <div>
                  {SITUACIONES.slice(0, 6).map((s) => (
                    <Check2 key={s} label={s} checked={!!incSituaciones[s]} onChange={(v: boolean) => setIncSituaciones({ ...incSituaciones, [s]: v })} />
                  ))}
                </div>
                <div>
                  {SITUACIONES.slice(6).map((s) => (
                    <Check2 key={s} label={s} checked={!!incSituaciones[s]} onChange={(v: boolean) => setIncSituaciones({ ...incSituaciones, [s]: v })} />
                  ))}
                </div>
              </div>

              <CampoDictado label="Descripción del incidente" value={incDescripcion} onChange={setIncDescripcion} />
              <CampoDictado label="Acción tomada" value={incAccion} onChange={setIncAccion} rows={2} />

              <Check2 checked={incNotifico} onChange={setIncNotifico} label="Se notificó a los padres o tutores" />

              <div style={{ marginTop: "20px", borderTop: "1px solid #e2e8f0", paddingTop: "16px" }}>
                <p style={{ fontWeight: 700, fontSize: "14px", color: "#1e293b", marginBottom: "10px" }}>Firmas</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  {[
                    ["alumno", "Alumno"],
                    ["director", "Director(a)"],
                    ["padre", "Padre o tutor"],
                    ["otros", "Otros"],
                    ["maestro", "Maestro(a)"],
                  ].map(([key, label]) => (
                    <div key={key}>
                      <label style={{ fontSize: "12px", color: "#475569", fontWeight: 600, display: "block", marginBottom: "6px" }}>{label}</label>
                      <input
                        value={firmas[key] || ""}
                        onChange={(e) => setFirmas({ ...firmas, [key]: e.target.value })}
                        style={{ ...inputStyle, width: "100%" }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="no-print" style={{ display: "flex", gap: "10px", marginTop: "20px", flexWrap: "wrap" }}>
          <button onClick={guardar} disabled={guardando} style={btnAccion(guardando ? "#94a3b8" : "#6366f1", "white")}>
            {guardando ? "Guardando…" : editandoId ? "Actualizar" : "Guardar"}
          </button>
          <button onClick={imprimirPDF} style={btnAccion("#f1f5f9", "#334155")}>📄 Exportar PDF</button>
          <button onClick={handleWord} style={btnAccion("#dcfce7", "#15803d")}>⬇️ Exportar Word</button>
          <button onClick={guardarEnDrive} style={btnAccion("#dbeafe", "#1d4ed8")}>☁️ Guardar en Drive</button>
        </div>

        {mensaje && (
          <div className="no-print" style={{ marginTop: "14px", background: color, color: "white", padding: "12px", borderRadius: "10px", fontSize: "14px", fontWeight: 700 }}>
            {mensaje}
          </div>
        )}
      </div>
    </main>
  );
}