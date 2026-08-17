"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

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

  useEffect(() => {
    const data = localStorage.getItem("maestro");
    if (!data) { window.location.href = "/login"; return; }
    const m = JSON.parse(data);
    verificarVigenciaPremium(m);
  }, []);

  const verificarVigenciaPremium = async (m: any) => {
    if (m.plan === "premium" && m.premium_hasta) {
      const vencio = new Date(m.premium_hasta) < new Date();
      if (vencio) {
        await fetch("/api/maestros/verificar-vigencia", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ maestroId: m.id }),
        });
        m.plan = "gratis";
        delete m.premium_hasta;
        localStorage.setItem("maestro", JSON.stringify(m));
      }
    }
    setMaestro(m);
    cargarGrupos(m.id);
  };

  const cargarGrupos = async (maestroId: number) => {
  const res = await fetch("/api/grupos?maestroId=" + maestroId);
  const data = await res.json();
  setGrupos(data.grupos || []);
};

const crearGrupo = async () => {
    if (cargando) return;
    if (!alumnos.trim()) { setColor("#ef4444"); setMensaje("Agrega los nombres de los alumnos"); return; }

    setCargando(true);
    setMensaje("");
    const nombreGrupo = grado + " " + grupo;
    const listaAlumnos = alumnos.split("\n").map((a) => a.trim()).filter((a) => a.length > 0);

    const res = await fetch("/api/grupos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        maestroId: maestro.id,
        nombre: nombreGrupo,
        grado,
        grupo,
        alumnos: listaAlumnos,
      }),
    });
    const data = await res.json();

    if (!res.ok || data.error) {
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

  await fetch("/api/grupos/" + grupoAEliminar.id, {
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
      const res = await fetch("/api/alumnos?grupoId=" + g.id);
      const data = await res.json();
      const { generarGafetesPDF } = await import("../../lib/generarGafetesPDF");
      await generarGafetesPDF(
        data.alumnos || [],
        { nombre: g.nombre, grado: g.grado },
        { nombre: maestro.nombre, email: maestro.email }
      );
      return;
    }

    const res = await fetch("/api/generar-gafetes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grupoId: g.id,
        grupoNombre: g.nombre,
        maestroId: maestro.id,
      }),
    });
    const data = await res.json();
    if (!data.url) {
      alert("Error al conectar con MercadoPago. Intenta de nuevo.");
      return;
    }
    window.location.href = data.url;
  };

  const irAPagar = async () => {
    const respuesta = await fetch("/api/pago", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ maestroId: maestro.id, maestroEmail: maestro.email }),
    });
    const data = await respuesta.json();
    window.location.href = data.url;
  };

  const cerrarSesion = () => { localStorage.removeItem("maestro"); window.location.href = "/login"; };

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
            <span style={{ background: "rgba(99,102,241,0.2)", color: "#818cf8", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" }}>
              {maestro.plan === "premium" ? "Premium" : "Gratis"}
            </span>
            {maestro.plan === "premium" && maestro.premium_hasta && (
              <span style={{ color: "#94a3b8", fontSize: "12px" }}>
                Vence el {new Date(maestro.premium_hasta).toLocaleDateString("es-MX")}
              </span>
            )}
            {maestro.plan !== "premium" && (
              <button onClick={irAPagar} style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "white", border: "none", padding: "8px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
                Actualizar a Premium $49/mes
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
                  {["A","B","C","D","E"].map((g) => (<option key={g} value={g} style={{ background: "#1e1b4b" }}>Grupo {g}</option>))}
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
                    onClick={() => handleGafetes(g)}
                    style={{
                      background: g.gafetes_pagado ? "rgba(26,107,60,0.3)" : "rgba(201,149,42,0.2)",
                      color: g.gafetes_pagado ? "#4ade80" : "#fbbf24",
                      border: g.gafetes_pagado ? "1px solid rgba(26,107,60,0.4)" : "1px solid rgba(201,149,42,0.3)",
                      padding: "8px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: "600", cursor: "pointer"
                    }}>
                    {g.gafetes_pagado ? "🪪 Descargar gafetes" : "🪪 Gafetes $99"}
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
          <h3 style={{ margin: "0 0 8px 0", fontSize: "15px", fontWeight: "700" }}>Necesitas ayuda?</h3>
          <p style={{ margin: "0 0 12px 0", color: "#94a3b8", fontSize: "13px" }}>Si tienes dudas o algun problema, contactanos:</p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="mailto:aidabereniceh@gmail.com" style={{ background: "rgba(99,102,241,0.2)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.3)", padding: "8px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: "600", textDecoration: "none" }}>
              ✉️ Email
            </a>
            <a href="https://wa.me/525545708011" target="_blank" rel="noopener noreferrer" style={{ background: "rgba(34,197,94,0.2)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.3)", padding: "8px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: "600", textDecoration: "none" }}>
              💬 WhatsApp
            </a>
          </div>
        </div>
      </div>

      {grupoAEliminar && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", zIndex: 1000 }}>
          <div style={{ background: "#1e1b4b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "28px", maxWidth: "380px", width: "100%", textAlign: "center" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>⚠️</div>
            <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: "700" }}>Eliminar grupo {grupoAEliminar.nombre}?</h3>
            <p style={{ margin: "0 0 24px 0", color: "#94a3b8", fontSize: "14px", lineHeight: 1.5 }}>
              Esto eliminara el grupo, todos sus alumnos y los registros de asistencia. Esta accion no se puede deshacer.
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