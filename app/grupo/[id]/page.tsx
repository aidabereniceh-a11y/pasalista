"use client";
export const runtime = "edge";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function GrupoPage() {
  const params = useParams();
  const id = params.id as string;
  const [grupo, setGrupo] = useState<any>(null);
  const [alumnos, setAlumnos] = useState<any[]>([]);
  const [nuevoAlumno, setNuevoAlumno] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [color, setColor] = useState("");

  useEffect(() => {
    if (!id) return;
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    const { data: grupoData } = await supabase.from("grupos").select("*").eq("id", id).single();
    setGrupo(grupoData);
    const { data: alumnosData } = await supabase.from("alumnos").select("*").eq("grupo_id", id).eq("activo", true).order("nombre");
    setAlumnos(alumnosData || []);
  };

  const agregarAlumno = async () => {
    if (cargando) return;
    if (!nuevoAlumno.trim()) {
      setColor("#ef4444");
      setMensaje("Escribe el nombre del alumno");
      return;
    }
    setCargando(true);
    const { error } = await supabase.from("alumnos").insert({ grupo_id: id, nombre: nuevoAlumno.trim().toUpperCase(), activo: true });
    if (error) {
      setColor("#ef4444");
      setMensaje("Error al agregar alumno");
    } else {
      setColor("#22c55e");
      setMensaje("Alumno agregado correctamente");
      setNuevoAlumno("");
      cargarDatos();
    }
    setCargando(false);
    setTimeout(() => setMensaje(""), 3000);
  };

  const desactivarAlumno = async (alumnoId: number, nombre: string) => {
    if (!confirm("Dar de baja a " + nombre + "? Su historial de asistencia se conservara.")) return;
    const { error } = await supabase.from("alumnos").update({ activo: false }).eq("id", alumnoId);
    if (error) {
      setColor("#ef4444");
      setMensaje("Error al dar de baja al alumno");
    } else {
      setColor("#22c55e");
      setMensaje("Alumno dado de baja. Su historial se conserva.");
      cargarDatos();
    }
    setTimeout(() => setMensaje(""), 3000);
  };

  if (!grupo) return <div style={{ color: "white", padding: "40px", textAlign: "center" }}>Cargando...</div>;

  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0a0f1e 0%, #1e1b4b 100%)", fontFamily: "Arial, sans-serif", padding: "24px", color: "white" }}>
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: "700", margin: 0 }}>Grupo {grupo.nombre}</h1>
            <p style={{ color: "#94a3b8", fontSize: "14px", margin: "4px 0 0 0" }}>{alumnos.length} alumnos activos</p>
          </div>
          <a href="/dashboard" style={{ background: "rgba(99,102,241,0.2)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.3)", padding: "8px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: "600", textDecoration: "none" }}>Volver</a>
        </div>

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
            <button
              onClick={agregarAlumno}
              disabled={cargando}
              style={{ padding: "12px 20px", background: "linear-gradient(135deg, #667eea, #764ba2)", color: "white", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "600", cursor: cargando ? "not-allowed" : "pointer" }}
            >
              {cargando ? "..." : "+ Agregar"}
            </button>
          </div>
          {mensaje && (
            <div style={{ marginTop: "12px", background: color, color: "white", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", fontWeight: "600" }}>
              {mensaje}
            </div>
          )}
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
                <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "rgba(99,102,241,0.2)", color: "#818cf8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "700", flexShrink: 0 }}>
                  {index + 1}
                </div>
                <span style={{ flex: 1, fontSize: "13px", color: "#cbd5e1" }}>{alumno.nombre}</span>
                <button
                  onClick={() => desactivarAlumno(alumno.id, alumno.nombre)}
                  style={{ padding: "6px 12px", background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "8px", fontSize: "12px", cursor: "pointer", fontWeight: "600" }}
                >
                  Dar de baja
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}