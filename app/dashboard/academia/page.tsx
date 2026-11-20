"use client";
export const runtime = "edge";
import { useState, useEffect } from "react";

const DIAS_SEMANA = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export default function AcademiaDashboard() {
  const [maestro, setMaestro] = useState<any>(null);
  const [actividades, setActividades] = useState<any[]>([]);
  const [mostrarFormActividad, setMostrarFormActividad] = useState(false);
  const [nombreActividad, setNombreActividad] = useState("");
  const [etiquetaActividad, setEtiquetaActividad] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [color, setColor] = useState("");

  const [alertas, setAlertas] = useState<any[]>([]);
  const [cargandoAlertas, setCargandoAlertas] = useState(false);
  const [seccionActiva, setSeccionActiva] = useState<"actividades" | "alertas" | "resumen">("actividades");

  // Resumen de pagos
  const [resumen, setResumen] = useState<any[]>([]);
  const [mesMostrado, setMesMostrado] = useState("");
  const [cargandoResumen, setCargandoResumen] = useState(false);

  const [actividadGestionando, setActividadGestionando] = useState<any>(null);
  const [alumnosGestion, setAlumnosGestion] = useState<any[]>([]);
  const [cargandoAlumnos, setCargandoAlumnos] = useState(false);
  const [nuevosAlumnos, setNuevosAlumnos] = useState("");
  const [agregando, setAgregando] = useState(false);
  const [mensajeGestion, setMensajeGestion] = useState("");
  const [colorGestion, setColorGestion] = useState("");
  const [alumnoABaja, setAlumnoABaja] = useState<any>(null);
  const [dandoDeBajaId, setDandoDeBajaId] = useState<number | null>(null);

  // Ficha del alumno
  const [fichaAlumno, setFichaAlumno] = useState<any>(null);
  const [fichaTab, setFichaTab] = useState<"datos" | "pagos">("datos");
  const [editFicha, setEditFicha] = useState({
    tutor_nombre: "",
    tutor_whatsapp: "",
    fecha_inscripcion: "",
    notas: "",
    dias_clase: [] as string[],
  });
  const [guardandoFicha, setGuardandoFicha] = useState(false);
  const [mensajeFicha, setMensajeFicha] = useState("");
  const [colorFicha, setColorFicha] = useState("");

  // Pagos
  const [pagos, setPagos] = useState<any[]>([]);
  const [cargandoPagos, setCargandoPagos] = useState(false);
  const [mostrarFormPago, setMostrarFormPago] = useState(false);
  const [nuevoPago, setNuevoPago] = useState({
    tipo: "mensualidad",
    concepto: "",
    monto: "",
    fecha_pago: new Date().toISOString().split("T")[0],
    fecha_vencimiento: "",
    estado: "pagado",
  });
  const [guardandoPago, setGuardandoPago] = useState(false);
  const [mensajePago, setMensajePago] = useState("");
  const [colorPago, setColorPago] = useState("");
  const [pagoAEliminar, setPagoAEliminar] = useState<any>(null);

  const [actividadAEliminar, setActividadAEliminar] = useState<any>(null);
  const [eliminando, setEliminando] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem("maestro");
    if (!data) { window.location.href = "/login"; return; }
    const m = JSON.parse(data);
    setMaestro(m);
    cargarActividades(m.id);
  }, []);

  const cargarActividades = async (maestroId: number) => {
    const res = await fetch(`/api/grupos?maestroId=${maestroId}&tipo=academia`);
    const data = await res.json();
    setActividades(data.grupos || []);
  };

  const cargarAlertas = async () => {
    if (!maestro) return;
    setCargandoAlertas(true);
    const res = await fetch(`/api/academia/alertas?maestroId=${maestro.id}`);
    const data = await res.json();
    setAlertas(data.alertas || []);
    setCargandoAlertas(false);
  };

  const cargarResumen = async () => {
    if (!maestro) return;
    setCargandoResumen(true);
    const res = await fetch(`/api/pagos/resumen?maestroId=${maestro.id}`);
    const data = await res.json();
    setResumen(data.resumen || []);
    setMesMostrado(data.mes || "");
    setCargandoResumen(false);
  };

  useEffect(() => {
    if (seccionActiva === "alertas" && maestro) cargarAlertas();
    if (seccionActiva === "resumen" && maestro) cargarResumen();
  }, [seccionActiva, maestro]);

  const crearActividad = async () => {
    if (cargando) return;
    if (!nombreActividad.trim()) {
      setColor("#ef4444"); setMensaje("Escribe el nombre de la actividad"); return;
    }
    setCargando(true); setMensaje("");
    const res = await fetch("/api/grupos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        maestroId: maestro.id,
        grado: 1, grupo: "A", alumnos: [],
        nivelEducativo: "academia",
        asignatura: nombreActividad.trim(),
        etiqueta: etiquetaActividad.trim(),
        tipo: "academia",
        confirmarDuplicado: false,
      }),
    });
    const data = await res.json();
    setCargando(false);
    if (!res.ok) { setColor("#ef4444"); setMensaje(data.error || "Error al crear"); return; }
    setColor("#22c55e"); setMensaje("Actividad creada");
    setNombreActividad(""); setEtiquetaActividad("");
    setMostrarFormActividad(false);
    cargarActividades(maestro.id);
  };

  const abrirGestion = (a: any) => {
    setActividadGestionando(a);
    setNuevosAlumnos(""); setMensajeGestion("");
    cargarAlumnos(a.id);
  };

  const cargarAlumnos = async (grupoId: number) => {
    setCargandoAlumnos(true);
    const res = await fetch(`/api/alumnos?grupoId=${grupoId}&maestroId=${maestro.id}`);
    const data = await res.json();
    setAlumnosGestion((data.alumnos || []).filter((a: any) => a.activo !== false));
    setCargandoAlumnos(false);
  };

  const agregarAlumnos = async () => {
    if (agregando || !actividadGestionando) return;
    if (!nuevosAlumnos.trim()) { setColorGestion("#ef4444"); setMensajeGestion("Agrega al menos un nombre"); return; }
    setAgregando(true);
    const res = await fetch("/api/alumnos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ grupoId: actividadGestionando.id, maestroId: maestro.id, nombres: nuevosAlumnos.split("\n") }),
    });
    const data = await res.json();
    setAgregando(false);
    if (!res.ok) { setColorGestion("#ef4444"); setMensajeGestion(data.error || "Error al agregar"); return; }
    setColorGestion("#22c55e"); setMensajeGestion("Alumnos agregados");
    setNuevosAlumnos("");
    cargarAlumnos(actividadGestionando.id);
  };

  const confirmarBaja = async () => {
    if (!alumnoABaja || !actividadGestionando || dandoDeBajaId) return;
    setDandoDeBajaId(alumnoABaja.id);
    await fetch(`/api/alumnos/${alumnoABaja.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ maestroId: maestro.id }),
    });
    setAlumnoABaja(null); setDandoDeBajaId(null);
    cargarAlumnos(actividadGestionando.id);
  };

  const abrirFicha = (a: any) => {
    setFichaAlumno(a);
    setFichaTab("datos");
    setEditFicha({
      tutor_nombre: a.tutor_nombre || "",
      tutor_whatsapp: a.tutor_whatsapp || "",
      fecha_inscripcion: a.fecha_inscripcion || "",
      notas: a.notas || "",
      dias_clase: a.dias_clase || [],
    });
    setMensajeFicha(""); setColorFicha("");
    setMostrarFormPago(false);
    setMensajePago(""); setColorPago("");
    setPagos([]);
    cargarPagos(a.id, a.grupo_id);
  };

  const toggleDia = (dia: string) => {
    setEditFicha((p) => ({
      ...p,
      dias_clase: p.dias_clase.includes(dia)
        ? p.dias_clase.filter((d) => d !== dia)
        : [...p.dias_clase, dia],
    }));
  };

  const guardarFicha = async () => {
    if (!fichaAlumno || guardandoFicha) return;
    setGuardandoFicha(true);
    const res = await fetch(`/api/alumnos/${fichaAlumno.id}/ficha`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        maestroId: maestro.id,
        tutor_nombre: editFicha.tutor_nombre.trim(),
        tutor_whatsapp: editFicha.tutor_whatsapp.trim(),
        fecha_inscripcion: editFicha.fecha_inscripcion || null,
        notas: editFicha.notas.trim(),
        dias_clase: editFicha.dias_clase,
      }),
    });
    const data = await res.json();
    setGuardandoFicha(false);
    if (!res.ok) { setColorFicha("#ef4444"); setMensajeFicha(data.error || "No se pudo guardar"); return; }
    setColorFicha("#22c55e"); setMensajeFicha("Guardado ✓");
    setAlumnosGestion((prev) => prev.map((a) => a.id === fichaAlumno.id ? { ...a, ...editFicha } : a));
    setFichaAlumno((prev: any) => ({ ...prev, ...editFicha }));
  };

  // ── PAGOS ──

  const cargarPagos = async (alumnoId: number, grupoId: number) => {
    setCargandoPagos(true);
    const res = await fetch(`/api/pagos?alumnoId=${alumnoId}&grupoId=${grupoId}&maestroId=${maestro.id}`);
    const data = await res.json();
    setPagos(data.pagos || []);
    setCargandoPagos(false);
  };

  const registrarPago = async () => {
    if (guardandoPago || !fichaAlumno) return;
    if (!nuevoPago.concepto.trim()) { setColorPago("#ef4444"); setMensajePago("Escribe un concepto"); return; }
    if (!nuevoPago.monto || parseFloat(nuevoPago.monto) <= 0) { setColorPago("#ef4444"); setMensajePago("Monto inválido"); return; }
    setGuardandoPago(true); setMensajePago("");
    const res = await fetch("/api/pagos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        alumnoId: fichaAlumno.id,
        grupoId: fichaAlumno.grupo_id,
        maestroId: maestro.id,
        tipo: nuevoPago.tipo,
        concepto: nuevoPago.concepto.trim(),
        monto: parseFloat(nuevoPago.monto),
        fecha_pago: nuevoPago.fecha_pago,
        fecha_vencimiento: nuevoPago.fecha_vencimiento || null,
        estado: nuevoPago.estado,
      }),
    });
    const data = await res.json();
    setGuardandoPago(false);
    if (!res.ok) { setColorPago("#ef4444"); setMensajePago(data.error || "Error al guardar"); return; }
    setColorPago("#22c55e"); setMensajePago("Pago registrado ✓");
    setMostrarFormPago(false);
    setNuevoPago({ tipo: "mensualidad", concepto: "", monto: "", fecha_pago: new Date().toISOString().split("T")[0], fecha_vencimiento: "", estado: "pagado" });
    cargarPagos(fichaAlumno.id, fichaAlumno.grupo_id);
  };

  const eliminarPago = async (pago: any) => {
    const res = await fetch(`/api/pagos?id=${pago.id}&grupoId=${fichaAlumno.grupo_id}&maestroId=${maestro.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setPagoAEliminar(null);
      cargarPagos(fichaAlumno.id, fichaAlumno.grupo_id);
    }
  };

  const eliminarActividad = async () => {
    if (!actividadAEliminar || eliminando) return;
    setEliminando(true);
    const res = await fetch(`/api/grupos/${actividadAEliminar.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ maestroId: maestro.id }),
    });
    setEliminando(false);
    if (res.ok) { setActividadAEliminar(null); cargarActividades(maestro.id); }
  };

  const cerrarSesion = () => { localStorage.removeItem("maestro"); window.location.href = "/login"; };

  const formatFecha = (f: string) => {
    if (!f) return "";
    const [y, m, d] = f.split("-");
    return `${d}/${m}/${y}`;
  };

  const formatMonto = (n: number) =>
    new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n);

  const colorEstado = (estado: string) => {
    if (estado === "pagado") return { bg: "rgba(34,197,94,0.15)", color: "#4ade80", border: "rgba(34,197,94,0.3)" };
    if (estado === "pendiente") return { bg: "rgba(251,191,36,0.15)", color: "#fbbf24", border: "rgba(251,191,36,0.3)" };
    return { bg: "rgba(239,68,68,0.15)", color: "#f87171", border: "rgba(239,68,68,0.3)" };
  };

  if (!maestro) return null;

  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0a0f1e 0%, #0f2027 100%)", fontFamily: "Arial, sans-serif", padding: "24px", color: "white" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: "700", margin: 0 }}>Mi Academia</h1>
            <p style={{ color: "#94a3b8", fontSize: "14px", margin: "4px 0 0 0" }}>Bienvenida, {maestro.nombre}</p>
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
            <a href="/dashboard" style={{ background: "rgba(99,102,241,0.15)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.3)", padding: "8px 14px", borderRadius: "10px", fontSize: "13px", fontWeight: "600", textDecoration: "none" }}>
              🏫 Vista Escuela
            </a>
            <button onClick={cerrarSesion} style={{ background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.25)", padding: "8px 14px", borderRadius: "10px", fontSize: "13px", cursor: "pointer" }}>
              Cerrar sesión
            </button>
          </div>
        </div>

        {/* Tabs principales */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "24px", background: "rgba(255,255,255,0.05)", borderRadius: "12px", padding: "6px" }}>
          <button onClick={() => setSeccionActiva("actividades")} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", fontSize: "13px", fontWeight: "600", cursor: "pointer", background: seccionActiva === "actividades" ? "rgba(14,165,233,0.25)" : "transparent", color: seccionActiva === "actividades" ? "#38bdf8" : "#64748b" }}>
            🧘 Actividades
          </button>
          <button onClick={() => setSeccionActiva("resumen")} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", fontSize: "13px", fontWeight: "600", cursor: "pointer", background: seccionActiva === "resumen" ? "rgba(34,197,94,0.2)" : "transparent", color: seccionActiva === "resumen" ? "#4ade80" : "#64748b" }}>
            💰 Pagos
          </button>
          <button onClick={() => setSeccionActiva("alertas")} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", fontSize: "13px", fontWeight: "600", cursor: "pointer", background: seccionActiva === "alertas" ? "rgba(239,68,68,0.2)" : "transparent", color: seccionActiva === "alertas" ? "#f87171" : "#64748b" }}>
            ⚠️ Alertas
          </button>
        </div>

        {/* SECCIÓN ACTIVIDADES */}
        {seccionActiva === "actividades" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: "600", margin: 0, color: "#94a3b8" }}>Mis actividades</h2>
              <button onClick={() => setMostrarFormActividad(!mostrarFormActividad)} style={{ background: "linear-gradient(135deg, #0ea5e9, #0284c7)", color: "white", border: "none", padding: "10px 20px", borderRadius: "10px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>
                + Nueva actividad
              </button>
            </div>

            {mostrarFormActividad && (
              <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "24px", marginBottom: "20px" }}>
                <h3 style={{ margin: "0 0 16px 0", fontSize: "16px" }}>Nueva actividad</h3>
                <div style={{ marginBottom: "14px" }}>
                  <label style={{ fontSize: "13px", color: "#94a3b8", display: "block", marginBottom: "6px" }}>Nombre *</label>
                  <input value={nombreActividad} onChange={(e) => setNombreActividad(e.target.value)} maxLength={80} placeholder="Yoga, Pilates, Natación, Inglés adultos…" style={{ width: "100%", padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "white", fontSize: "15px", boxSizing: "border-box" }} />
                </div>
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ fontSize: "13px", color: "#94a3b8", display: "block", marginBottom: "6px" }}>Horario o nivel (opcional)</label>
                  <input value={etiquetaActividad} onChange={(e) => setEtiquetaActividad(e.target.value)} maxLength={60} placeholder="Lunes y miércoles 7am, Nivel principiante…" style={{ width: "100%", padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "white", fontSize: "15px", boxSizing: "border-box" }} />
                </div>
                <button onClick={crearActividad} disabled={cargando} style={{ width: "100%", padding: "14px", background: cargando ? "#475569" : "linear-gradient(135deg, #0ea5e9, #0284c7)", color: "white", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: "700", cursor: cargando ? "not-allowed" : "pointer" }}>
                  {cargando ? "Creando..." : "Crear actividad"}
                </button>
                {mensaje && <div style={{ marginTop: "12px", background: color, color: "white", padding: "12px", borderRadius: "10px", fontSize: "14px", fontWeight: "600" }}>{mensaje}</div>}
              </div>
            )}

            {actividades.length === 0 ? (
              <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "48px", textAlign: "center", color: "#64748b" }}>
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>🧘</div>
                <p style={{ fontSize: "16px", margin: "0 0 6px" }}>No tienes actividades todavía</p>
                <p style={{ fontSize: "14px", margin: 0 }}>Crea tu primera actividad para empezar</p>
              </div>
            ) : (
              <div style={{ display: "grid", gap: "14px" }}>
                {actividades.map((act) => (
                  <div key={act.id} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#7dd3fc" }}>{act.asignatura || act.nombre}</h3>
                      {act.etiqueta && <span style={{ display: "inline-block", marginTop: "6px", background: "rgba(14,165,233,0.15)", color: "#7dd3fc", border: "1px solid rgba(14,165,233,0.3)", padding: "2px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 700 }}>🕐 {act.etiqueta}</span>}
                    </div>
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                      <button onClick={() => abrirGestion(act)} style={{ background: "rgba(14,165,233,0.2)", color: "#38bdf8", border: "1px solid rgba(14,165,233,0.3)", padding: "8px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
                        👥 Alumnos
                      </button>
                      <button onClick={() => setActividadAEliminar(act)} style={{ background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.25)", padding: "8px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* SECCIÓN ALERTAS */}
        {seccionActiva === "alertas" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <h2 style={{ fontSize: "16px", fontWeight: "600", margin: 0, color: "#94a3b8" }}>Alumnos que faltaron hoy</h2>
                <p style={{ fontSize: "12px", color: "#475569", margin: "4px 0 0" }}>Solo alumnos con clase programada hoy y sin registro o con falta.</p>
              </div>
              <button onClick={cargarAlertas} disabled={cargandoAlertas} style={{ background: "rgba(255,255,255,0.08)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.1)", padding: "8px 14px", borderRadius: "10px", fontSize: "13px", cursor: "pointer" }}>
                {cargandoAlertas ? "Cargando..." : "🔄 Actualizar"}
              </button>
            </div>

            {cargandoAlertas ? (
              <div style={{ textAlign: "center", padding: "48px", color: "#64748b" }}>Cargando alertas...</div>
            ) : alertas.length === 0 ? (
              <div style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "16px", padding: "48px", textAlign: "center" }}>
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>✅</div>
                <p style={{ fontSize: "16px", margin: "0 0 6px", color: "#4ade80" }}>¡Todo bien!</p>
                <p style={{ fontSize: "14px", margin: 0, color: "#64748b" }}>No hay alumnos con falta hoy</p>
              </div>
            ) : (
              <div style={{ display: "grid", gap: "12px" }}>
                {alertas.map((alerta) => (
                  <div key={alerta.alumno_id} style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "14px", padding: "18px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                    <div>
                      <p style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#fca5a5" }}>{alerta.nombre}</p>
                      <p style={{ margin: "3px 0 0", fontSize: "12px", color: "#64748b" }}>{alerta.actividad}{alerta.tutor_nombre ? ` · ${alerta.tutor_nombre}` : ""}</p>
                      {!alerta.tutor_whatsapp && <p style={{ margin: "3px 0 0", fontSize: "11px", color: "#f59e0b" }}>⚠️ Sin WhatsApp guardado</p>}
                    </div>
                    {alerta.tutor_whatsapp ? (
                      <a href={`https://wa.me/52${alerta.tutor_whatsapp}?text=${encodeURIComponent(`Hola${alerta.tutor_nombre ? " " + alerta.tutor_nombre : ""}, te escribo de la academia. Hoy ${alerta.nombre} no se presentó a clase de ${alerta.actividad}. ¿Todo bien? 😊`)}`} target="_blank" rel="noopener noreferrer" style={{ background: "rgba(34,197,94,0.2)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.3)", padding: "10px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: "700", textDecoration: "none", whiteSpace: "nowrap" }}>
                        💬 Avisar por WhatsApp
                      </a>
                    ) : (
                      <span style={{ fontSize: "12px", color: "#475569", fontStyle: "italic" }}>Agrega WhatsApp en la ficha</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* SECCIÓN RESUMEN DE PAGOS */}
        {seccionActiva === "resumen" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <h2 style={{ fontSize: "16px", fontWeight: "600", margin: 0, color: "#94a3b8" }}>Resumen de pagos</h2>
                {mesMostrado && <p style={{ fontSize: "12px", color: "#475569", margin: "4px 0 0", textTransform: "capitalize" }}>Total cobrado en {mesMostrado}</p>}
              </div>
              <button onClick={cargarResumen} disabled={cargandoResumen} style={{ background: "rgba(255,255,255,0.08)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.1)", padding: "8px 14px", borderRadius: "10px", fontSize: "13px", cursor: "pointer" }}>
                {cargandoResumen ? "Cargando..." : "🔄 Actualizar"}
              </button>
            </div>

            {cargandoResumen ? (
              <div style={{ textAlign: "center", padding: "48px", color: "#64748b" }}>Cargando resumen...</div>
            ) : resumen.length === 0 ? (
              <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "48px", textAlign: "center", color: "#64748b" }}>
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>💰</div>
                <p style={{ margin: 0 }}>No hay actividades con alumnos todavía</p>
              </div>
            ) : (
              <div style={{ display: "grid", gap: "20px" }}>
                {resumen.map((act) => {
                  const conPago = act.alumnos.filter((a: any) => a.ultimoPago);
                  const sinPago = act.alumnos.filter((a: any) => !a.ultimoPago);
                  const pendientes = act.alumnos.filter((a: any) => a.ultimoPago?.estado === "pendiente" || a.ultimoPago?.estado === "vencido");

                  return (
                    <div key={act.grupo_id} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "16px", overflow: "hidden" }}>
                      {/* Header actividad */}
                      <div style={{ background: "rgba(14,165,233,0.1)", borderBottom: "1px solid rgba(14,165,233,0.15)", padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                        <div>
                          <span style={{ fontSize: "16px", fontWeight: "700", color: "#7dd3fc" }}>{act.nombre}</span>
                          {act.etiqueta && <span style={{ marginLeft: "10px", fontSize: "12px", color: "#38bdf8" }}>🕐 {act.etiqueta}</span>}
                          <p style={{ margin: "3px 0 0", fontSize: "12px", color: "#64748b" }}>{act.total_alumnos} alumno{act.total_alumnos !== 1 ? "s" : ""}</p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <p style={{ margin: 0, fontSize: "11px", color: "#64748b" }}>Cobrado este mes</p>
                          <p style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#4ade80" }}>
                            {new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(act.total_mes)}
                          </p>
                        </div>
                      </div>

                      {/* Lista de alumnos */}
                      <div style={{ padding: "4px 0" }}>
                        {act.alumnos.length === 0 ? (
                          <p style={{ padding: "14px 18px", color: "#475569", fontSize: "13px", margin: 0 }}>Sin alumnos</p>
                        ) : (
                          act.alumnos.map((alumno: any) => {
                            const p = alumno.ultimoPago;
                            const esProblema = p?.estado === "pendiente" || p?.estado === "vencido";
                            const sinRegistro = !p;

                            return (
                              <div key={alumno.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 18px", borderBottom: "1px solid rgba(255,255,255,0.04)", background: esProblema ? "rgba(239,68,68,0.04)" : sinRegistro ? "rgba(251,191,36,0.04)" : "transparent", flexWrap: "wrap", gap: "6px" }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <span style={{ fontSize: "13px", fontWeight: "600", color: esProblema ? "#fca5a5" : sinRegistro ? "#fde68a" : "#e2e8f0" }}>
                                    {sinRegistro ? "⚠️ " : esProblema ? "🔴 " : "✅ "}{alumno.nombre}
                                  </span>
                                  {p && (
                                    <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#64748b" }}>
                                      {p.concepto} · {new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(p.monto)}
                                      {p.fecha_pago ? ` · ${p.fecha_pago.split("-").reverse().join("/")}` : ""}
                                    </p>
                                  )}
                                  {sinRegistro && <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#f59e0b" }}>Sin pagos registrados</p>}
                                </div>
                                {p && (
                                  <span style={{
                                    fontSize: "11px", fontWeight: "600", padding: "3px 10px", borderRadius: "10px",
                                    background: p.estado === "pagado" ? "rgba(34,197,94,0.15)" : p.estado === "pendiente" ? "rgba(251,191,36,0.15)" : "rgba(239,68,68,0.15)",
                                    color: p.estado === "pagado" ? "#4ade80" : p.estado === "pendiente" ? "#fbbf24" : "#f87171",
                                    border: `1px solid ${p.estado === "pagado" ? "rgba(34,197,94,0.3)" : p.estado === "pendiente" ? "rgba(251,191,36,0.3)" : "rgba(239,68,68,0.3)"}`,
                                  }}>
                                    {p.estado}
                                  </span>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Footer resumen rápido */}
                      {act.alumnos.length > 0 && (
                        <div style={{ padding: "10px 18px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: "16px", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "12px", color: "#4ade80" }}>✅ {conPago.filter((a: any) => a.ultimoPago?.estado === "pagado").length} pagados</span>
                          {pendientes.length > 0 && <span style={{ fontSize: "12px", color: "#fbbf24" }}>⏳ {pendientes.length} pendiente{pendientes.length !== 1 ? "s" : ""}</span>}
                          {sinPago.length > 0 && <span style={{ fontSize: "12px", color: "#f59e0b" }}>⚠️ {sinPago.length} sin registro</span>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <div style={{ marginTop: "40px", textAlign: "center" }}>
          <p style={{ color: "#475569", fontSize: "12px" }}>
            <a href="/terminos-y-condiciones" style={{ color: "#475569", textDecoration: "underline" }}>Términos</a>
            {" · "}
            <a href="/aviso-de-privacidad" style={{ color: "#475569", textDecoration: "underline" }}>Privacidad</a>
          </p>
        </div>
      </div>

      {/* ── Modal gestionar alumnos ── */}
      {actividadGestionando && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", zIndex: 1000 }}>
          <div style={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "28px", maxWidth: "480px", width: "100%", maxHeight: "85vh", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700" }}>{actividadGestionando.asignatura || actividadGestionando.nombre}</h3>
              <button onClick={() => setActividadGestionando(null)} style={{ background: "none", border: "none", color: "#94a3b8", fontSize: "20px", cursor: "pointer" }}>×</button>
            </div>
            {actividadGestionando.etiqueta && <p style={{ margin: "0 0 4px", color: "#38bdf8", fontSize: "12px" }}>🕐 {actividadGestionando.etiqueta}</p>}
            <p style={{ margin: "0 0 12px", color: "#64748b", fontSize: "11px" }}>Toca el nombre para ver la ficha y control de pagos.</p>

            <div style={{ overflowY: "auto", marginBottom: "16px", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", flex: 1 }}>
              {cargandoAlumnos ? (
                <div style={{ padding: "20px", textAlign: "center", color: "#64748b", fontSize: "13px" }}>Cargando...</div>
              ) : alumnosGestion.length === 0 ? (
                <div style={{ padding: "20px", textAlign: "center", color: "#64748b", fontSize: "13px" }}>No hay alumnos todavía</div>
              ) : (
                alumnosGestion.map((a) => (
                  <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <button onClick={() => abrirFicha(a)} style={{ background: "none", border: "none", color: "#e2e8f0", fontSize: "13px", fontWeight: "600", cursor: "pointer", padding: 0, textAlign: "left", textDecoration: "underline", textDecorationColor: "rgba(255,255,255,0.2)" }}>
                        {a.nombre}
                      </button>
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "3px" }}>
                        {a.tutor_whatsapp && <span style={{ fontSize: "11px", color: "#4ade80" }}>📱 {a.tutor_whatsapp}</span>}
                        {a.dias_clase && a.dias_clase.length > 0 && <span style={{ fontSize: "11px", color: "#7dd3fc" }}>📅 {a.dias_clase.join(", ")}</span>}
                      </div>
                    </div>
                    <button onClick={() => setAlumnoABaja(a)} disabled={dandoDeBajaId === a.id} style={{ background: "rgba(239,68,68,0.12)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)", padding: "5px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: "600", cursor: "pointer", marginLeft: "8px", flexShrink: 0 }}>
                      {dandoDeBajaId === a.id ? "..." : "Dar de baja"}
                    </button>
                  </div>
                ))
              )}
            </div>

            <label style={{ fontSize: "13px", color: "#94a3b8", display: "block", marginBottom: "6px" }}>Agregar alumnos (un nombre por línea)</label>
            <textarea value={nuevosAlumnos} onChange={(e) => setNuevosAlumnos(e.target.value)} placeholder={"María López\nJuan García"} rows={3} style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "white", fontSize: "14px", resize: "vertical", boxSizing: "border-box", marginBottom: "10px" }} />
            <button onClick={agregarAlumnos} disabled={agregando} style={{ width: "100%", padding: "12px", background: agregando ? "#475569" : "linear-gradient(135deg, #0ea5e9, #0284c7)", color: "white", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "700", cursor: agregando ? "not-allowed" : "pointer" }}>
              {agregando ? "Agregando..." : "Agregar alumnos"}
            </button>
            {mensajeGestion && <div style={{ marginTop: "10px", background: colorGestion, color: "white", padding: "10px", borderRadius: "10px", fontSize: "13px", fontWeight: "600" }}>{mensajeGestion}</div>}
          </div>
        </div>
      )}

      {/* ── Modal ficha del alumno ── */}
      {fichaAlumno && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", zIndex: 1100 }}>
          <div style={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "28px", maxWidth: "460px", width: "100%", maxHeight: "92vh", display: "flex", flexDirection: "column" }}>
            {/* Header ficha */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700" }}>{fichaAlumno.nombre}</h3>
              <button onClick={() => setFichaAlumno(null)} style={{ background: "none", border: "none", color: "#94a3b8", fontSize: "20px", cursor: "pointer" }}>×</button>
            </div>

            {/* Tabs ficha */}
            <div style={{ display: "flex", gap: "6px", marginBottom: "18px", marginTop: "10px", background: "rgba(255,255,255,0.05)", borderRadius: "10px", padding: "4px" }}>
              <button onClick={() => setFichaTab("datos")} style={{ flex: 1, padding: "8px", borderRadius: "7px", border: "none", fontSize: "13px", fontWeight: "600", cursor: "pointer", background: fichaTab === "datos" ? "rgba(14,165,233,0.25)" : "transparent", color: fichaTab === "datos" ? "#38bdf8" : "#64748b" }}>
                📋 Datos
              </button>
              <button onClick={() => setFichaTab("pagos")} style={{ flex: 1, padding: "8px", borderRadius: "7px", border: "none", fontSize: "13px", fontWeight: "600", cursor: "pointer", background: fichaTab === "pagos" ? "rgba(34,197,94,0.2)" : "transparent", color: fichaTab === "pagos" ? "#4ade80" : "#64748b" }}>
                💳 Pagos {pagos.length > 0 ? `(${pagos.length})` : ""}
              </button>
            </div>

            {/* ── TAB DATOS ── */}
            {fichaTab === "datos" && (
              <div style={{ overflowY: "auto", flex: 1 }}>
                <div style={{ marginBottom: "14px" }}>
                  <label style={{ fontSize: "12px", color: "#94a3b8", display: "block", marginBottom: "5px" }}>Nombre del contacto / tutor</label>
                  <input value={editFicha.tutor_nombre} onChange={(e) => setEditFicha((p) => ({ ...p, tutor_nombre: e.target.value }))} maxLength={100} placeholder="Ej. María López" style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "white", fontSize: "14px", boxSizing: "border-box" }} />
                </div>

                <div style={{ marginBottom: "14px" }}>
                  <label style={{ fontSize: "12px", color: "#94a3b8", display: "block", marginBottom: "5px" }}>WhatsApp (10 dígitos)</label>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <input value={editFicha.tutor_whatsapp} onChange={(e) => setEditFicha((p) => ({ ...p, tutor_whatsapp: e.target.value.replace(/\D/g, "").slice(0, 10) }))} placeholder="5512345678" inputMode="numeric" style={{ flex: 1, padding: "10px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "white", fontSize: "14px", boxSizing: "border-box" }} />
                    {editFicha.tutor_whatsapp.length === 10 && (
                      <a href={`https://wa.me/52${editFicha.tutor_whatsapp}`} target="_blank" rel="noopener noreferrer" style={{ background: "rgba(34,197,94,0.2)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.3)", padding: "10px 12px", borderRadius: "8px", fontSize: "13px", fontWeight: "700", textDecoration: "none", whiteSpace: "nowrap" }}>
                        💬 Escribir
                      </a>
                    )}
                  </div>
                </div>

                <div style={{ marginBottom: "14px" }}>
                  <label style={{ fontSize: "12px", color: "#94a3b8", display: "block", marginBottom: "8px" }}>Días de clase</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {DIAS_SEMANA.map((dia) => {
                      const sel = editFicha.dias_clase.includes(dia);
                      return (
                        <button key={dia} onClick={() => toggleDia(dia)} style={{ padding: "6px 14px", borderRadius: "20px", border: sel ? "1px solid #38bdf8" : "1px solid rgba(255,255,255,0.15)", background: sel ? "rgba(14,165,233,0.25)" : "rgba(255,255,255,0.05)", color: sel ? "#38bdf8" : "#64748b", fontSize: "13px", fontWeight: sel ? "700" : "400", cursor: "pointer" }}>
                          {dia}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ marginBottom: "14px" }}>
                  <label style={{ fontSize: "12px", color: "#94a3b8", display: "block", marginBottom: "5px" }}>Fecha de inscripción</label>
                  <input type="date" value={editFicha.fecha_inscripcion} onChange={(e) => setEditFicha((p) => ({ ...p, fecha_inscripcion: e.target.value }))} style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "white", fontSize: "14px", boxSizing: "border-box", colorScheme: "dark" }} />
                </div>

                <div style={{ marginBottom: "18px" }}>
                  <label style={{ fontSize: "12px", color: "#94a3b8", display: "block", marginBottom: "5px" }}>Notas</label>
                  <textarea value={editFicha.notas} onChange={(e) => setEditFicha((p) => ({ ...p, notas: e.target.value }))} placeholder="Alergias, nivel, horario especial…" rows={3} style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "white", fontSize: "14px", resize: "vertical", boxSizing: "border-box" }} />
                </div>

                {mensajeFicha && <div style={{ marginBottom: "12px", background: colorFicha, color: "white", padding: "10px", borderRadius: "8px", fontSize: "13px", fontWeight: "600" }}>{mensajeFicha}</div>}

                <div style={{ display: "flex", gap: "10px" }}>
                  <button onClick={() => setFichaAlumno(null)} style={{ flex: 1, padding: "12px", background: "rgba(255,255,255,0.08)", color: "white", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>Cerrar</button>
                  <button onClick={guardarFicha} disabled={guardandoFicha} style={{ flex: 1, padding: "12px", background: guardandoFicha ? "#475569" : "linear-gradient(135deg, #0ea5e9, #0284c7)", color: "white", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "700", cursor: guardandoFicha ? "not-allowed" : "pointer" }}>
                    {guardandoFicha ? "Guardando..." : "Guardar ficha"}
                  </button>
                </div>
              </div>
            )}

            {/* ── TAB PAGOS ── */}
            {fichaTab === "pagos" && (
              <div style={{ overflowY: "auto", flex: 1, display: "flex", flexDirection: "column" }}>

                {/* Botón registrar pago */}
                {!mostrarFormPago && (
                  <button onClick={() => setMostrarFormPago(true)} style={{ width: "100%", padding: "12px", background: "linear-gradient(135deg, #22c55e, #16a34a)", color: "white", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "700", cursor: "pointer", marginBottom: "16px" }}>
                    + Registrar pago
                  </button>
                )}

                {/* Formulario nuevo pago */}
                {mostrarFormPago && (
                  <div style={{ background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "12px", padding: "18px", marginBottom: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                      <span style={{ fontSize: "14px", fontWeight: "700", color: "#4ade80" }}>Nuevo pago</span>
                      <button onClick={() => { setMostrarFormPago(false); setMensajePago(""); }} style={{ background: "none", border: "none", color: "#94a3b8", fontSize: "18px", cursor: "pointer" }}>×</button>
                    </div>

                    {/* Tipo */}
                    <div style={{ marginBottom: "12px" }}>
                      <label style={{ fontSize: "12px", color: "#94a3b8", display: "block", marginBottom: "6px" }}>Tipo</label>
                      <div style={{ display: "flex", gap: "8px" }}>
                        {["mensualidad", "paquete"].map((t) => (
                          <button key={t} onClick={() => setNuevoPago((p) => ({ ...p, tipo: t }))} style={{ flex: 1, padding: "8px", borderRadius: "8px", border: nuevoPago.tipo === t ? "1px solid #4ade80" : "1px solid rgba(255,255,255,0.15)", background: nuevoPago.tipo === t ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.05)", color: nuevoPago.tipo === t ? "#4ade80" : "#64748b", fontSize: "13px", fontWeight: "600", cursor: "pointer", textTransform: "capitalize" }}>
                            {t === "mensualidad" ? "📅 Mensualidad" : "🎟️ Paquete"}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Concepto */}
                    <div style={{ marginBottom: "12px" }}>
                      <label style={{ fontSize: "12px", color: "#94a3b8", display: "block", marginBottom: "5px" }}>Concepto *</label>
                      <input value={nuevoPago.concepto} onChange={(e) => setNuevoPago((p) => ({ ...p, concepto: e.target.value }))} placeholder="Ej. Noviembre 2026, Paquete 10 clases" maxLength={100} style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "white", fontSize: "14px", boxSizing: "border-box" }} />
                    </div>

                    {/* Monto y fecha */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                      <div>
                        <label style={{ fontSize: "12px", color: "#94a3b8", display: "block", marginBottom: "5px" }}>Monto ($) *</label>
                        <input type="number" value={nuevoPago.monto} onChange={(e) => setNuevoPago((p) => ({ ...p, monto: e.target.value }))} placeholder="0.00" min="0" step="0.01" style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "white", fontSize: "14px", boxSizing: "border-box" }} />
                      </div>
                      <div>
                        <label style={{ fontSize: "12px", color: "#94a3b8", display: "block", marginBottom: "5px" }}>Fecha de pago *</label>
                        <input type="date" value={nuevoPago.fecha_pago} onChange={(e) => setNuevoPago((p) => ({ ...p, fecha_pago: e.target.value }))} style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "white", fontSize: "14px", boxSizing: "border-box", colorScheme: "dark" }} />
                      </div>
                    </div>

                    {/* Estado y vencimiento */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
                      <div>
                        <label style={{ fontSize: "12px", color: "#94a3b8", display: "block", marginBottom: "5px" }}>Estado</label>
                        <select value={nuevoPago.estado} onChange={(e) => setNuevoPago((p) => ({ ...p, estado: e.target.value }))} style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", background: "#1e293b", border: "1px solid rgba(255,255,255,0.15)", color: "white", fontSize: "14px", boxSizing: "border-box" }}>
                          <option value="pagado">✅ Pagado</option>
                          <option value="pendiente">⏳ Pendiente</option>
                          <option value="vencido">❌ Vencido</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: "12px", color: "#94a3b8", display: "block", marginBottom: "5px" }}>Vence (opcional)</label>
                        <input type="date" value={nuevoPago.fecha_vencimiento} onChange={(e) => setNuevoPago((p) => ({ ...p, fecha_vencimiento: e.target.value }))} style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "white", fontSize: "14px", boxSizing: "border-box", colorScheme: "dark" }} />
                      </div>
                    </div>

                    {mensajePago && <div style={{ marginBottom: "10px", background: colorPago, color: "white", padding: "10px", borderRadius: "8px", fontSize: "13px", fontWeight: "600" }}>{mensajePago}</div>}

                    <button onClick={registrarPago} disabled={guardandoPago} style={{ width: "100%", padding: "12px", background: guardandoPago ? "#475569" : "linear-gradient(135deg, #22c55e, #16a34a)", color: "white", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "700", cursor: guardandoPago ? "not-allowed" : "pointer" }}>
                      {guardandoPago ? "Guardando..." : "Guardar pago"}
                    </button>
                  </div>
                )}

                {/* Historial de pagos */}
                {cargandoPagos ? (
                  <div style={{ textAlign: "center", padding: "24px", color: "#64748b", fontSize: "13px" }}>Cargando pagos...</div>
                ) : pagos.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "32px", color: "#475569", fontSize: "13px" }}>
                    <div style={{ fontSize: "32px", marginBottom: "8px" }}>💳</div>
                    No hay pagos registrados todavía
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <p style={{ margin: "0 0 4px", fontSize: "12px", color: "#64748b" }}>Historial ({pagos.length} registro{pagos.length !== 1 ? "s" : ""})</p>
                    {pagos.map((p) => {
                      const ec = colorEstado(p.estado);
                      return (
                        <div key={p.id} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "14px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
                                <span style={{ fontSize: "14px", fontWeight: "700", color: "#e2e8f0" }}>{p.concepto}</span>
                                <span style={{ fontSize: "11px", background: ec.bg, color: ec.color, border: `1px solid ${ec.border}`, padding: "2px 8px", borderRadius: "10px", fontWeight: "600" }}>
                                  {p.estado}
                                </span>
                              </div>
                              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                                <span style={{ fontSize: "15px", fontWeight: "700", color: "#4ade80" }}>{formatMonto(p.monto)}</span>
                                <span style={{ fontSize: "12px", color: "#64748b" }}>📅 {formatFecha(p.fecha_pago)}</span>
                                {p.fecha_vencimiento && <span style={{ fontSize: "12px", color: "#94a3b8" }}>Vence: {formatFecha(p.fecha_vencimiento)}</span>}
                                <span style={{ fontSize: "11px", color: "#475569", background: "rgba(255,255,255,0.05)", padding: "1px 7px", borderRadius: "8px" }}>{p.tipo}</span>
                              </div>
                            </div>
                            <button onClick={() => setPagoAEliminar(p)} style={{ background: "rgba(239,68,68,0.12)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)", padding: "5px 10px", borderRadius: "8px", fontSize: "11px", cursor: "pointer", flexShrink: 0 }}>
                              Borrar
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmar baja alumno */}
      {alumnoABaja && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", zIndex: 1200 }}>
          <div style={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "28px", maxWidth: "360px", width: "100%", textAlign: "center" }}>
            <div style={{ fontSize: "36px", marginBottom: "10px" }}>⚠️</div>
            <h3 style={{ margin: "0 0 8px", fontSize: "17px", fontWeight: "700" }}>¿Dar de baja a {alumnoABaja.nombre}?</h3>
            <p style={{ margin: "0 0 20px", color: "#94a3b8", fontSize: "14px" }}>Su historial se conserva.</p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setAlumnoABaja(null)} style={{ flex: 1, padding: "12px", background: "rgba(255,255,255,0.08)", color: "white", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>Cancelar</button>
              <button onClick={confirmarBaja} style={{ flex: 1, padding: "12px", background: "#ef4444", color: "white", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "700", cursor: "pointer" }}>Dar de baja</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmar eliminar pago */}
      {pagoAEliminar && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", zIndex: 1200 }}>
          <div style={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "28px", maxWidth: "360px", width: "100%", textAlign: "center" }}>
            <div style={{ fontSize: "36px", marginBottom: "10px" }}>🗑️</div>
            <h3 style={{ margin: "0 0 8px", fontSize: "17px", fontWeight: "700" }}>¿Eliminar este pago?</h3>
            <p style={{ margin: "0 0 4px", color: "#e2e8f0", fontSize: "15px", fontWeight: "600" }}>{pagoAEliminar.concepto}</p>
            <p style={{ margin: "0 0 20px", color: "#4ade80", fontSize: "16px", fontWeight: "700" }}>{formatMonto(pagoAEliminar.monto)}</p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setPagoAEliminar(null)} style={{ flex: 1, padding: "12px", background: "rgba(255,255,255,0.08)", color: "white", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>Cancelar</button>
              <button onClick={() => eliminarPago(pagoAEliminar)} style={{ flex: 1, padding: "12px", background: "#ef4444", color: "white", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "700", cursor: "pointer" }}>Sí, eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmar eliminar actividad */}
      {actividadAEliminar && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", zIndex: 1000 }}>
          <div style={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "28px", maxWidth: "380px", width: "100%", textAlign: "center" }}>
            <div style={{ fontSize: "36px", marginBottom: "10px" }}>⚠️</div>
            <h3 style={{ margin: "0 0 8px", fontSize: "17px", fontWeight: "700" }}>¿Eliminar {actividadAEliminar.asignatura || actividadAEliminar.nombre}?</h3>
            <p style={{ margin: "0 0 20px", color: "#94a3b8", fontSize: "14px" }}>Se borrarán todos los alumnos y su historial.</p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setActividadAEliminar(null)} disabled={eliminando} style={{ flex: 1, padding: "12px", background: "rgba(255,255,255,0.08)", color: "white", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>Cancelar</button>
              <button onClick={eliminarActividad} disabled={eliminando} style={{ flex: 1, padding: "12px", background: eliminando ? "#7f1d1d" : "#ef4444", color: "white", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "700", cursor: eliminando ? "not-allowed" : "pointer" }}>
                {eliminando ? "Eliminando..." : "Sí, eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
