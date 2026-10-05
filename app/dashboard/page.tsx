"use client";
import { useState, useEffect, useRef } from "react";
import PersonalizarGafetes from "../../components/PersonalizarGafetes";

export default function Dashboard() {
  const [maestro, setMaestro] = useState<any>(null);
  const [grupos, setGrupos] = useState<any[]>([]);
  const [mostrarFormGrupo, setMostrarFormGrupo] = useState(false);
  const [grado, setGrado] = useState("1");
  const [grupo, setGrupo] = useState("A");
  const [alumnos, setAlumnos] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [color, setColor] = useState("");
  const [grupoAEliminar, setGrupoAEliminar] = useState<any>(null);
  const [eliminando, setEliminando] = useState(false);
  const [mostrarModalPago, setMostrarModalPago] = useState(false);
  const [cargandoPago, setCargandoPago] = useState(false);
  const [cargandoCancelar, setCargandoCancelar] = useState(false);
  const [mostrarConfirmCancelar, setMostrarConfirmCancelar] = useState(false);
  const [generandoGafetesId, setGenerandoGafetesId] = useState<number | null>(null);
  const [avisoGafetes, setAvisoGafetes] = useState<{ fondo: string; borde: string; texto: string } | null>(null);
  const avisoProcesado = useRef(false);
  const [gafetesAPersonalizar, setGafetesAPersonalizar] = useState<{ grupo: any; alumnos: any[] } | null>(null);

  const [grupoGestionando, setGrupoGestionando] = useState<any>(null);
  const [alumnosGestion, setAlumnosGestion] = useState<any[]>([]);
  const [cargandoAlumnosGestion, setCargandoAlumnosGestion] = useState(false);
  const [nuevosAlumnos, setNuevosAlumnos] = useState("");
  const [agregandoAlumnos, setAgregandoAlumnos] = useState(false);
  const [mensajeGestion, setMensajeGestion] = useState("");
  const [colorGestion, setColorGestion] = useState("");
  const [dandoDeBajaId, setDandoDeBajaId] = useState<number | null>(null);
  const [alumnoABaja, setAlumnoABaja] = useState<any>(null);

  useEffect(() => {
    const data = localStorage.getItem("maestro");
    if (!data) { window.location.href = "/login"; return; }
    const m = JSON.parse(data);
    verificarVigenciaPremium(m);
  }, []);

  const verificarVigenciaPremium = async (m: any) => {
    try {
      const res = await fetch("/api/verificar-vigencia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maestroId: m.id }),
      });
      const data = await res.json();
      if (res.ok && data.maestro) {
        localStorage.setItem("maestro", JSON.stringify(data.maestro));
        setMaestro(data.maestro);
        cargarGrupos(data.maestro.id);
        return;
      }
    } catch {
      // si falla la verificacion, seguimos con los datos locales
    }
    setMaestro(m);
    cargarGrupos(m.id);
  };

  const cargarGrupos = async (maestroId: number) => {
    const res = await fetch(`/api/grupos?maestroId=${maestroId}`);
    const data = await res.json();
    const lista = data.grupos || [];
    setGrupos(lista);
    return lista as any[];
  };

  // Al regresar de Mercado Pago (?gafetes=ok|pendiente|error&grupo=ID)
  useEffect(() => {
    if (!maestro?.id || avisoProcesado.current) return;
    const params = new URLSearchParams(window.location.search);
    const estado = params.get("gafetes");
    if (!estado) return;
    avisoProcesado.current = true;
    const grupoId = params.get("grupo");
    window.history.replaceState(null, "", "/dashboard");

    if (estado === "error") {
      setAvisoGafetes({ fondo: "rgba(239,68,68,0.15)", borde: "rgba(239,68,68,0.4)", texto: "❌ El pago de los gafetes no se completó. No se hizo ningún cobro. Puedes intentarlo de nuevo." });
      return;
    }

    if (estado === "pendiente") {
      setAvisoGafetes({ fondo: "rgba(245,158,11,0.15)", borde: "rgba(245,158,11,0.4)", texto: "⏳ Tu pago está pendiente (OXXO o transferencia). En cuanto Mercado Pago lo confirme, se activará el botón \"Descargar gafetes\". Puede tardar hasta 1 día hábil." });
      return;
    }

    if (estado === "ok") {
      setAvisoGafetes({ fondo: "rgba(99,102,241,0.15)", borde: "rgba(99,102,241,0.4)", texto: "✅ Pago recibido. Estamos confirmando tus gafetes con Mercado Pago…" });
      let intentos = 0;
      const revisar = async () => {
        intentos++;
        try {
          const lista = await cargarGrupos(maestro.id);
          const g = lista.find((x: any) => String(x.id) === String(grupoId));
          if (g?.gafetes_pagado) {
            setAvisoGafetes({ fondo: "rgba(34,197,94,0.15)", borde: "rgba(34,197,94,0.4)", texto: `🎉 ¡Listo! Los gafetes de ${g.nombre} ya están desbloqueados. Da clic en "🪪 Descargar gafetes".` });
            return;
          }
        } catch {
          // si falla una revisión, seguimos intentando
        }
        if (intentos < 20) {
          setTimeout(revisar, 3000);
        } else {
          setAvisoGafetes({ fondo: "rgba(245,158,11,0.15)", borde: "rgba(245,158,11,0.4)", texto: "⏳ Tu pago se recibió, pero la confirmación está tardando. Recarga esta página en unos minutos. Si en 1 hora no se desbloquean tus gafetes, escríbenos por WhatsApp y lo revisamos." });
        }
      };
      revisar();
    }
  }, [maestro?.id]); // eslint-disable-line

  const crearGrupo = async () => {
    if (cargando) return;
    if (!alumnos.trim()) { setColor("#ef4444"); setMensaje("Agrega los nombres de los alumnos"); return; }
    setCargando(true);
    setMensaje("");

    const listaAlumnos = alumnos.split("\n");
    const res = await fetch("/api/grupos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ maestroId: maestro.id, grado, grupo, alumnos: listaAlumnos }),
    });
    const data = await res.json();

    if (!res.ok) {
      setColor("#ef4444");
      setMensaje(data.error || "Error al crear el grupo");
      setCargando(false);
      return;
    }

    setColor("#22c55e");
    setMensaje("Grupo creado correctamente");
    setAlumnos("");
    setMostrarFormGrupo(false);
    cargarGrupos(maestro.id);
    setCargando(false);
  };

  const eliminarGrupo = async () => {
    if (!grupoAEliminar || eliminando) return;
    setEliminando(true);

    await fetch(`/api/grupos/${grupoAEliminar.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ maestroId: maestro.id }),
    });

    setGrupoAEliminar(null);
    setEliminando(false);
    cargarGrupos(maestro.id);
  };

  const handleGafetes = async (g: any) => {
    if (g.gafetes_pagado) {
      if (generandoGafetesId) return;
      setGenerandoGafetesId(g.id);
      try {
        // Los alumnos se piden a la API (con service role). La consulta directa a Supabase
        // desde el navegador regresaba una lista vacía por el RLS, y por eso los gafetes salían en blanco.
        const res = await fetch(`/api/alumnos?grupoId=${g.id}&maestroId=${maestro.id}`);
        const data = await res.json();
        const alumnosGrupo = (data.alumnos || [])
          .filter((a: any) => a.activo !== false)
          .map((a: any) => ({ id: a.id, nombre: a.nombre }));

        if (!res.ok || alumnosGrupo.length === 0) {
          alert(data.error || "Este grupo no tiene alumnos activos para generar gafetes.");
          return;
        }

        // Abre la ventana para elegir color, diseño y tamaño antes de imprimir
        setGafetesAPersonalizar({ grupo: g, alumnos: alumnosGrupo });
      } catch {
        alert("No se pudieron generar los gafetes. Intenta de nuevo.");
      } finally {
        setGenerandoGafetesId(null);
      }
      return;
    }

    const res = await fetch("/api/gafetes/pago", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grupoId: g.id,
        grupoNombre: g.nombre,
        maestroId: maestro.id,
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.url) {
      alert(data.error || "No se pudo iniciar el pago. Intenta de nuevo.");
      return;
    }
    window.location.href = data.url;
  };

  const irAPagarManual = async () => {
    setCargandoPago(true);
    const respuesta = await fetch("/api/pago", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ maestroId: maestro.id, maestroEmail: maestro.email }),
    });
    const data = await respuesta.json();
    window.location.href = data.url;
  };

  const irASuscripcion = async () => {
    setCargandoPago(true);
    const respuesta = await fetch("/api/pago/suscripcion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ maestroId: maestro.id, maestroEmail: maestro.email }),
    });
    const data = await respuesta.json();
    window.location.href = data.url;
  };

  const cancelarSuscripcion = async () => {
    if (cargandoCancelar) return;
    setCargandoCancelar(true);
    const res = await fetch("/api/cancelar-suscripcion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ maestroId: maestro.id }),
    });
    if (res.ok) {
      const m = { ...maestro, preapproval_id: null };
      setMaestro(m);
      localStorage.setItem("maestro", JSON.stringify(m));
    }
    setMostrarConfirmCancelar(false);
    setCargandoCancelar(false);
  };

  const cerrarSesion = () => { localStorage.removeItem("maestro"); window.location.href = "/login"; };

  const abrirGestionAlumnos = (g: any) => {
    setGrupoGestionando(g);
    setNuevosAlumnos("");
    setMensajeGestion("");
    cargarAlumnosGestion(g.id);
  };

  const cargarAlumnosGestion = async (grupoId: number) => {
    setCargandoAlumnosGestion(true);
    const res = await fetch(`/api/alumnos?grupoId=${grupoId}&maestroId=${maestro.id}`);
    const data = await res.json();
    setAlumnosGestion((data.alumnos || []).filter((a: any) => a.activo !== false));
    setCargandoAlumnosGestion(false);
  };

  const agregarAlumnosGestion = async () => {
    if (agregandoAlumnos || !grupoGestionando) return;
    if (!nuevosAlumnos.trim()) {
      setColorGestion("#ef4444");
      setMensajeGestion("Agrega al menos un nombre");
      return;
    }
    setAgregandoAlumnos(true);
    setMensajeGestion("");

    const res = await fetch("/api/alumnos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grupoId: grupoGestionando.id,
        maestroId: maestro.id,
        nombres: nuevosAlumnos.split("\n"),
      }),
    });
    const data = await res.json();

    if (!res.ok) {
      setColorGestion("#ef4444");
      setMensajeGestion(data.error || "Error al agregar alumnos");
      setAgregandoAlumnos(false);
      return;
    }

    setColorGestion("#22c55e");
    setMensajeGestion("Alumnos agregados correctamente");
    setNuevosAlumnos("");
    cargarAlumnosGestion(grupoGestionando.id);
    setAgregandoAlumnos(false);
  };

  const confirmarBajaAlumno = async () => {
    if (!alumnoABaja || !grupoGestionando || dandoDeBajaId) return;
    setDandoDeBajaId(alumnoABaja.id);

    const res = await fetch(`/api/alumnos/${alumnoABaja.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ maestroId: maestro.id }),
    });

    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "No se pudo dar de baja al alumno");
    }

    setAlumnoABaja(null);
    setDandoDeBajaId(null);
    cargarAlumnosGestion(grupoGestionando.id);
  };

  if (!maestro) return null;

  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0a0f1e 0%, #1e1b4b 100%)", fontFamily: "Arial, sans-serif", padding: "24px", color: "white" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: "700", margin: 0 }}>Asistencia QR</h1>
            <p style={{ color: "#94a3b8", fontSize: "14px", margin: "4px 0 0 0" }}>Bienvenido, {maestro.nombre}</p>
          </div>
          <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <span style={{ background: "rgba(99,102,241,0.2)", color: "#818cf8", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" }}>
                  {maestro.plan === "premium" ? "Premium" : "Gratis"}
                </span>
                {maestro.plan === "premium" && maestro.premium_hasta && (
                  <span style={{ color: "#94a3b8", fontSize: "12px" }}>
                    Vence el {new Date(maestro.premium_hasta).toLocaleDateString("es-MX")}
                  </span>
                )}
              </div>
              {maestro.plan === "premium" && maestro.preapproval_id && (
                <button
                  onClick={() => setMostrarConfirmCancelar(true)}
                  style={{ background: "none", border: "none", color: "#64748b", fontSize: "11px", cursor: "pointer", padding: "2px 0", textDecoration: "underline", marginTop: "2px" }}
                >
                  cancelar suscripción
                </button>
              )}
            </div>
            {maestro.plan !== "premium" && (
              <button onClick={() => setMostrarModalPago(true)} style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "white", border: "none", padding: "8px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
                Actualizar a Premium $49/mes
              </button>
            )}
            {maestro.plan === "premium" ? (
              <a href="/dashboard/diario" style={{ background: "linear-gradient(135deg, #667eea, #764ba2)", color: "white", border: "none", padding: "8px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: "700", textDecoration: "none" }}>
                📓 Bitácora y Diario del Maestro
              </a>
            ) : (
              <button onClick={() => setMostrarModalPago(true)} style={{ background: "linear-gradient(135deg, #667eea, #764ba2)", color: "white", border: "none", padding: "8px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>
                🔒 Bitácora y Diario del Maestro
              </button>
            )}
            <button onClick={cerrarSesion} style={{ background: "rgba(239,68,68,0.2)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)", padding: "8px 16px", borderRadius: "10px", fontSize: "13px", cursor: "pointer" }}>
              Cerrar sesion
            </button>
          </div>
        </div>

        {maestro.plan !== "premium" && (
          <div style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "12px", padding: "12px 16px", marginBottom: "20px", color: "#c7d2fe", fontSize: "13px" }}>
            📋 Tu plan gratis incluye <strong>1 grupo</strong> con alumnos ilimitados ({grupos.length}/1 usado). Para crear 2 o mas grupos, actualiza a Premium ($49/mes).
          </div>
        )}

        {avisoGafetes && (
          <div style={{ background: avisoGafetes.fondo, border: `1px solid ${avisoGafetes.borde}`, borderRadius: "12px", padding: "14px 16px", marginBottom: "20px", color: "white", fontSize: "14px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
            <span>{avisoGafetes.texto}</span>
            <button onClick={() => setAvisoGafetes(null)} style={{ background: "none", border: "none", color: "#94a3b8", fontSize: "18px", cursor: "pointer", lineHeight: 1 }}>×</button>
          </div>
        )}
        <div style={{ background: "linear-gradient(135deg, rgba(34,197,94,0.12), rgba(99,102,241,0.12))", border: "1px solid rgba(34,197,94,0.3)", borderRadius: "12px", padding: "14px 16px", marginBottom: "20px", display: "flex", gap: "12px", alignItems: "flex-start" }}>
          <div style={{ fontSize: "26px", lineHeight: 1 }}>🎨</div>
          <div>
            <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#e2e8f0" }}>
              <span style={{ background: "#22c55e", color: "#052e16", fontSize: "10px", fontWeight: 800, padding: "2px 7px", borderRadius: "20px", marginRight: "8px", verticalAlign: "middle" }}>NUEVO</span>
              Personaliza tus gafetes
            </p>
            <p style={{ margin: "6px 0 0", fontSize: "13px", color: "#cbd5e1", lineHeight: 1.5 }}>
              Al dar clic en <strong>🪪 Descargar gafetes</strong> puedes elegir el <strong>color</strong>, el <strong>diseño</strong> (Clásico, Moderno, Infantil o Minimalista) y el <strong>tamaño</strong> (credencial, mediano o grande para colgar). También puedes agregar el nombre de tu escuela y el ciclo escolar. El código QR no cambia: los gafetes que ya imprimiste siguen funcionando.
            </p>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "600", margin: 0 }}>Mis grupos</h2>
          <button onClick={() => setMostrarFormGrupo(!mostrarFormGrupo)} style={{ background: "linear-gradient(135deg, #667eea, #764ba2)", color: "white", border: "none", padding: "10px 20px", borderRadius: "10px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>
            + Nuevo grupo
          </button>
        </div>

        {mostrarFormGrupo && (
          <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "24px", marginBottom: "24px" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "16px" }}>Crear nuevo grupo</h3>
            <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: "13px", color: "#94a3b8", display: "block", marginBottom: "6px" }}>Grado</label>
                <select value={grado} onChange={(e) => setGrado(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "white", fontSize: "15px" }}>
                  {["1","2","3","4","5","6"].map((g) => (<option key={g} value={g} style={{ background: "#1e1b4b" }}>{g} Grado</option>))}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: "13px", color: "#94a3b8", display: "block", marginBottom: "6px" }}>Grupo</label>
                <select value={grupo} onChange={(e) => setGrupo(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "white", fontSize: "15px" }}>
                  {["A","B","C","D","E","F","G","H","I","J","K","L"].map((g) => (<option key={g} value={g} style={{ background: "#1e1b4b" }}>Grupo {g}</option>))}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "13px", color: "#94a3b8", display: "block", marginBottom: "6px" }}>Lista de alumnos (un nombre por linea)</label>
              <textarea value={alumnos} onChange={(e) => setAlumnos(e.target.value)} placeholder={"GARCIA LOPEZ JUAN\nMARTINEZ PEREZ ANA"} rows={8} style={{ width: "100%", padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "white", fontSize: "14px", resize: "vertical", boxSizing: "border-box" }} />
            </div>
            <button onClick={crearGrupo} disabled={cargando} style={{ width: "100%", padding: "14px", background: cargando ? "#475569" : "linear-gradient(135deg, #667eea, #764ba2)", color: "white", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: "700", cursor: cargando ? "not-allowed" : "pointer" }}>
              {cargando ? "Creando..." : "Crear grupo"}
            </button>
            {mensaje && (<div style={{ marginTop: "12px", background: color, color: "white", padding: "12px", borderRadius: "10px", fontSize: "14px", fontWeight: "600" }}>{mensaje}</div>)}
          </div>
        )}

        {grupos.length === 0 ? (
          <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "40px", textAlign: "center", color: "#64748b" }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>📋</div>
            <p style={{ fontSize: "16px" }}>No tienes grupos todavia</p>
            <p style={{ fontSize: "14px" }}>Crea tu primer grupo para empezar</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "16px" }}>
            {grupos.map((g) => (
              <div key={g.id} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700" }}>{g.nombre}</h3>
                  <p style={{ margin: "4px 0 0 0", color: "#94a3b8", fontSize: "13px" }}>Creado el {new Date(g.created_at).toLocaleDateString("es-MX")}</p>
                </div>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <a href={"/asistencia/" + g.id} style={{ background: "rgba(34,197,94,0.2)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.3)", padding: "8px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: "600", textDecoration: "none", display: "inline-block" }}>Ver asistencia</a>
                  <a href={"/qr/" + g.id} style={{ background: "rgba(99,102,241,0.2)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.3)", padding: "8px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: "600", textDecoration: "none", display: "inline-block" }}>Ver QR</a>
                  <button
                    onClick={() => abrirGestionAlumnos(g)}
                    style={{ background: "rgba(148,163,184,0.15)", color: "#cbd5e1", border: "1px solid rgba(148,163,184,0.25)", padding: "8px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
                    Gestionar alumnos
                  </button>
                  <button
                    onClick={() => handleGafetes(g)}
                    disabled={generandoGafetesId === g.id}
                    style={{
                      background: g.gafetes_pagado ? "rgba(26,107,60,0.3)" : "rgba(201,149,42,0.2)",
                      color: g.gafetes_pagado ? "#4ade80" : "#fbbf24",
                      border: g.gafetes_pagado ? "1px solid rgba(26,107,60,0.4)" : "1px solid rgba(201,149,42,0.3)",
                      padding: "8px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: "600",
                      cursor: generandoGafetesId === g.id ? "wait" : "pointer",
                    }}>
                    {generandoGafetesId === g.id ? "Generando..." : g.gafetes_pagado ? "🪪 Descargar gafetes" : "🪪 Gafetes $99"}
                  </button>
                  <button onClick={() => setGrupoAEliminar(g)} style={{ background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.25)", padding: "8px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: "40px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "20px", textAlign: "center" }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: "15px", fontWeight: "700" }}>¿Necesitas ayuda?</h3>
          <p style={{ margin: "0 0 12px 0", color: "#94a3b8", fontSize: "13px" }}>Si tienes dudas o algún problema, contáctanos:</p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="mailto:aidabereniceh@gmail.com" style={{ background: "rgba(99,102,241,0.2)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.3)", padding: "8px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: "600", textDecoration: "none" }}>
              ✉️ Email
            </a>
            <a href="/api/contacto" target="_blank" rel="noopener noreferrer" style={{ background: "rgba(34,197,94,0.2)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.3)", padding: "8px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: "600", textDecoration: "none" }}>
              💬 WhatsApp
            </a>
          </div>
          <div style={{ marginTop: "16px", display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/terminos-y-condiciones" style={{ color: "#64748b", fontSize: "12px", textDecoration: "underline" }}>Términos y Condiciones</a>
            <a href="/aviso-de-privacidad" style={{ color: "#64748b", fontSize: "12px", textDecoration: "underline" }}>Aviso de Privacidad</a>
          </div>
        </div>
      </div>

      {mostrarModalPago && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", zIndex: 1000 }}>
          <div style={{ background: "#1e1b4b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "28px", maxWidth: "400px", width: "100%" }}>
            <h3 style={{ margin: "0 0 6px 0", fontSize: "18px", fontWeight: "700", textAlign: "center" }}>Elige como pagar</h3>
            <p style={{ margin: "0 0 20px 0", color: "#94a3b8", fontSize: "13px", textAlign: "center" }}>Plan Premium - $49 MXN/mes</p>

            <button
              onClick={irASuscripcion}
              disabled={cargandoPago}
              style={{ width: "100%", padding: "14px", background: "linear-gradient(135deg, #667eea, #764ba2)", color: "white", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "700", cursor: cargandoPago ? "not-allowed" : "pointer", marginBottom: "10px" }}
            >
              💳 Suscripción automática (tarjeta)
            </button>
            <p style={{ margin: "0 0 16px 0", color: "#64748b", fontSize: "11px", textAlign: "center" }}>
              Se renueva sola cada mes. Cancela cuando quieras.<br />
              <strong style={{ color: "#fbbf24" }}>Importante:</strong> inicia sesión en Mercado Pago con el mismo correo que usas en PasaLista ({maestro?.email}).
            </p>

            <button
              onClick={irAPagarManual}
              disabled={cargandoPago}
              style={{ width: "100%", padding: "14px", background: "rgba(255,255,255,0.1)", color: "white", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "10px", fontSize: "14px", fontWeight: "700", cursor: cargandoPago ? "not-allowed" : "pointer", marginBottom: "10px" }}
            >
              🏪 Pago único (tarjeta, OXXO, SPEI)
            </button>
            <p style={{ margin: "0 0 20px 0", color: "#64748b", fontSize: "11px", textAlign: "center" }}>
              Pagas cada mes manualmente, sin renovación automática. Recomendado si tu correo de Mercado Pago es distinto al de PasaLista.
            </p>

            <button
              onClick={() => setMostrarModalPago(false)}
              disabled={cargandoPago}
              style={{ width: "100%", padding: "10px", background: "none", color: "#94a3b8", border: "none", fontSize: "13px", cursor: "pointer" }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {mostrarConfirmCancelar && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", zIndex: 1000 }}>
          <div style={{ background: "#1e1b4b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "28px", maxWidth: "380px", width: "100%", textAlign: "center" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>⚠️</div>
            <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: "700" }}>¿Cancelar suscripción automática?</h3>
            <p style={{ margin: "0 0 24px 0", color: "#94a3b8", fontSize: "14px", lineHeight: 1.5 }}>
              No se te cobrará de nuevo. Tu Premium sigue activo hasta que termine el periodo ya pagado.
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setMostrarConfirmCancelar(false)} disabled={cargandoCancelar} style={{ flex: 1, padding: "12px", background: "rgba(255,255,255,0.1)", color: "white", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "10px", fontSize: "14px", fontWeight: "600", cursor: cargandoCancelar ? "not-allowed" : "pointer" }}>
                Volver
              </button>
              <button onClick={cancelarSuscripcion} disabled={cargandoCancelar} style={{ flex: 1, padding: "12px", background: cargandoCancelar ? "#7f1d1d" : "#ef4444", color: "white", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "700", cursor: cargandoCancelar ? "not-allowed" : "pointer" }}>
                {cargandoCancelar ? "Cancelando..." : "Sí, cancelar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {grupoGestionando && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", zIndex: 1000 }}>
          <div style={{ background: "#1e1b4b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "28px", maxWidth: "480px", width: "100%", maxHeight: "85vh", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700" }}>Gestionar alumnos</h3>
              <button onClick={() => setGrupoGestionando(null)} style={{ background: "none", border: "none", color: "#94a3b8", fontSize: "20px", cursor: "pointer", lineHeight: 1 }}>×</button>
            </div>
            <p style={{ margin: "0 0 16px 0", color: "#94a3b8", fontSize: "13px" }}>Grupo {grupoGestionando.nombre}</p>

            <div style={{ overflowY: "auto", marginBottom: "16px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px" }}>
              {cargandoAlumnosGestion ? (
                <div style={{ padding: "20px", textAlign: "center", color: "#64748b", fontSize: "13px" }}>Cargando...</div>
              ) : alumnosGestion.length === 0 ? (
                <div style={{ padding: "20px", textAlign: "center", color: "#64748b", fontSize: "13px" }}>No hay alumnos activos</div>
              ) : (
                alumnosGestion.map((a) => (
                  <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <span style={{ fontSize: "13px", color: "#e2e8f0" }}>{a.nombre}</span>
                    <button
                      onClick={() => setAlumnoABaja(a)}
                      disabled={dandoDeBajaId === a.id}
                      style={{ background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.25)", padding: "5px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: "600", cursor: dandoDeBajaId === a.id ? "not-allowed" : "pointer" }}
                    >
                      {dandoDeBajaId === a.id ? "..." : "Dar de baja"}
                    </button>
                  </div>
                ))
              )}
            </div>

            <label style={{ fontSize: "13px", color: "#94a3b8", display: "block", marginBottom: "6px" }}>Agregar alumnos (un nombre por linea)</label>
            <textarea
              value={nuevosAlumnos}
              onChange={(e) => setNuevosAlumnos(e.target.value)}
              placeholder={"GARCIA LOPEZ JUAN\nMARTINEZ PEREZ ANA"}
              rows={4}
              style={{ width: "100%", padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "white", fontSize: "14px", resize: "vertical", boxSizing: "border-box", marginBottom: "10px" }}
            />
            <button
              onClick={agregarAlumnosGestion}
              disabled={agregandoAlumnos}
              style={{ width: "100%", padding: "12px", background: agregandoAlumnos ? "#475569" : "linear-gradient(135deg, #667eea, #764ba2)", color: "white", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "700", cursor: agregandoAlumnos ? "not-allowed" : "pointer" }}
            >
              {agregandoAlumnos ? "Agregando..." : "Agregar alumnos"}
            </button>
            {mensajeGestion && (
              <div style={{ marginTop: "10px", background: colorGestion, color: "white", padding: "10px", borderRadius: "10px", fontSize: "13px", fontWeight: "600" }}>
                {mensajeGestion}
              </div>
            )}
          </div>
        </div>
      )}

      {alumnoABaja && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", zIndex: 1100 }}>
          <div style={{ background: "#1e1b4b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "28px", maxWidth: "380px", width: "100%", textAlign: "center" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>⚠️</div>
            <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: "700" }}>¿Dar de baja a {alumnoABaja.nombre}?</h3>
            <p style={{ margin: "0 0 24px 0", color: "#94a3b8", fontSize: "14px", lineHeight: 1.5 }}>
              Ya no aparecerá en la lista ni en nuevos códigos QR. Su historial de asistencia se conserva.
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setAlumnoABaja(null)} disabled={!!dandoDeBajaId} style={{ flex: 1, padding: "12px", background: "rgba(255,255,255,0.1)", color: "white", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "10px", fontSize: "14px", fontWeight: "600", cursor: dandoDeBajaId ? "not-allowed" : "pointer" }}>
                Cancelar
              </button>
              <button onClick={confirmarBajaAlumno} disabled={!!dandoDeBajaId} style={{ flex: 1, padding: "12px", background: dandoDeBajaId ? "#7f1d1d" : "#ef4444", color: "white", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "700", cursor: dandoDeBajaId ? "not-allowed" : "pointer" }}>
                {dandoDeBajaId ? "..." : "Sí, dar de baja"}
              </button>
            </div>
          </div>
        </div>
      )}

      {gafetesAPersonalizar && (
        <PersonalizarGafetes
          grupo={{ nombre: gafetesAPersonalizar.grupo.nombre, grado: gafetesAPersonalizar.grupo.grado }}
          maestro={{ nombre: maestro.nombre, email: maestro.email }}
          alumnos={gafetesAPersonalizar.alumnos}
          onClose={() => setGafetesAPersonalizar(null)}
        />
      )}

      {grupoAEliminar && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", zIndex: 1000 }}>
          <div style={{ background: "#1e1b4b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "28px", maxWidth: "380px", width: "100%", textAlign: "center" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>⚠️</div>
            <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: "700" }}>¿Eliminar grupo {grupoAEliminar.nombre}?</h3>
            <p style={{ margin: "0 0 24px 0", color: "#94a3b8", fontSize: "14px", lineHeight: 1.5 }}>
              Esto eliminará el grupo, todos sus alumnos y los registros de asistencia. Esta acción no se puede deshacer.
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setGrupoAEliminar(null)} disabled={eliminando} style={{ flex: 1, padding: "12px", background: "rgba(255,255,255,0.1)", color: "white", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "10px", fontSize: "14px", fontWeight: "600", cursor: eliminando ? "not-allowed" : "pointer" }}>
                Cancelar
              </button>
              <button onClick={eliminarGrupo} disabled={eliminando} style={{ flex: 1, padding: "12px", background: eliminando ? "#7f1d1d" : "#ef4444", color: "white", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "700", cursor: eliminando ? "not-allowed" : "pointer" }}>
                {eliminando ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}