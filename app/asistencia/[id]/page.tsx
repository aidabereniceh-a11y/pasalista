"use client";
export const runtime = "edge";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import * as XLSX from "xlsx";

export default function AsistenciaPage() {
  const params = useParams();
  const id = params.id as string;
  const [grupo, setGrupo] = useState<any>(null);
  const [alumnos, setAlumnos] = useState<any[]>([]);
  const [asistencias, setAsistencias] = useState<any[]>([]);
  const [hora, setHora] = useState(new Date());
  const [noAutorizado, setNoAutorizado] = useState(false);

  useEffect(() => {
    if (!id) return;
    const data = localStorage.getItem("maestro");
    if (!data) { window.location.href = "/login"; return; }
    cargarDatos();
    const intervalo = setInterval(cargarDatos, 10000);
    const timer = setInterval(() => setHora(new Date()), 1000);
    return () => { clearInterval(intervalo); clearInterval(timer); };
  }, [id]);

  const cargarDatos = async () => {
    const data = localStorage.getItem("maestro");
    if (!data) return;
    const maestro = JSON.parse(data);

    const res = await fetch(`/api/asistencia-vivo?grupoId=${id}&maestroId=${maestro.id}`);
    if (!res.ok) {
      setNoAutorizado(true);
      return;
    }
    const resultado = await res.json();
    setGrupo(resultado.grupo);
    setAlumnos(resultado.alumnos || []);
    setAsistencias(resultado.asistencias || []);
  };

  const presentes = Array.from(new Set(asistencias.filter((a) => a.accion === "Presente").map((a) => a.alumno_id)));

  const estadoBano = new Map<number, boolean>();
  asistencias.forEach((a) => {
    if (a.accion === "Salida al banio") estadoBano.set(a.alumno_id, true);
    if (a.accion === "Regreso del banio") estadoBano.set(a.alumno_id, false);
  });

  const enBano = Array.from(estadoBano.entries()).filter(([_, v]) => v).map(([id]) => id);

  const ausentes = alumnos.filter((a) => !presentes.includes(a.id)).map((a) => a.id);

  const exportarExcel = () => {
    const filas = asistencias.map((a) => ({
      Fecha: new Date(a.fecha).toLocaleString("es-MX"),
      Alumno: getNombre(a.alumno_id),
      Accion: a.accion,
      Grupo: grupo?.nombre || "",
    }));
    const hoja = XLSX.utils.json_to_sheet(filas);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Asistencia");
    const fecha = new Date().toISOString().split("T")[0];
    XLSX.writeFile(libro, "Asistencia_" + grupo?.nombre + "_" + fecha + ".xlsx");
  };

  const getNombre = (alumnoId: number) => alumnos.find((a) => a.id === alumnoId)?.nombre || "";

  const today = hora.toLocaleDateString("es-MX", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const timeStr = hora.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  if (noAutorizado) {
    return (
      <main style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0a0f1e 0%, #1e1b4b 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontFamily: "Arial, sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <p>No tienes acceso a este grupo, o ya no existe.</p>
          <a href="/dashboard" style={{ color: "#818cf8" }}>Volver al dashboard</a>
        </div>
      </main>
    );
  }

  if (!grupo) {
    return (
      <main style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0a0f1e 0%, #1e1b4b 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontFamily: "Arial, sans-serif" }}>
        <div>Cargando...</div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0a0f1e 0%, #1e1b4b 100%)", fontFamily: "Arial, sans-serif", padding: "24px", color: "white" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: "700", margin: 0 }}>Asistencia en vivo</h1>
            <p style={{ color: "#94a3b8", fontSize: "13px", margin: "4px 0 0 0" }}>Grupo {grupo.nombre} ·{today} · {timeStr}</p>
          </div>
          <button onClick={exportarExcel} style={{ background: "linear-gradient(135deg, #166534, #15803d)", color: "white", border: "1px solid rgba(34,197,94,0.3)", padding: "10px 20px", borderRadius: "10px", fontSize: "13px", fontWeight: "600", cursor: "pointer", marginRight: "10px" }}>Exportar Excel</button>
          <a href="/dashboard" style={{ background: "rgba(99,102,241,0.2)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.3)", padding: "8px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: "600", textDecoration: "none", display: "inline-block" }}>Volver</a>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px", marginBottom: "32px" }}>
          <div style={{ background: "linear-gradient(135deg, rgba(21,128,61,0.35), rgba(20,83,45,0.2))", border: "1px solid rgba(34,197,94,0.25)", borderRadius: "18px", padding: "22px", position: "relative", overflow: "hidden" }}>
            <div style={{ fontSize: "22px", marginBottom: "8px" }}>✅</div>
            <div style={{ fontSize: "12px", opacity: 0.65, textTransform: "uppercase", letterSpacing: "1px" }}>Presentes</div>
            <div style={{ fontSize: "48px", fontWeight: "800", color: "#4ade80", lineHeight: 1 }}>{presentes.length}</div>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "3px", background: "linear-gradient(90deg, #22c55e, #86efac)" }} />
          </div>
          <div style={{ background: "linear-gradient(135deg, rgba(180,83,9,0.35), rgba(146,64,14,0.2))", border: "1px solid rgba(245,158,11,0.25)", borderRadius: "18px", padding: "22px", position: "relative", overflow: "hidden" }}>
            <div style={{ fontSize: "22px", marginBottom: "8px" }}>🚻</div>
            <div style={{ fontSize: "12px", opacity: 0.65, textTransform: "uppercase", letterSpacing: "1px" }}>En bano</div>
            <div style={{ fontSize: "48px", fontWeight: "800", color: "#fbbf24", lineHeight: 1 }}>{enBano.length}</div>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "3px", background: "linear-gradient(90deg, #f59e0b, #fde68a)" }} />
          </div>
          <div style={{ background: "linear-gradient(135deg, rgba(185,28,28,0.35), rgba(153,27,27,0.2))",border: "1px solid rgba(239,68,68,0.25)", borderRadius: "18px", padding: "22px", position: "relative", overflow: "hidden" }}>
            <div style={{ fontSize: "22px", marginBottom: "8px" }}>❌</div>
            <div style={{ fontSize: "12px", opacity: 0.65, textTransform: "uppercase", letterSpacing: "1px" }}>Ausentes</div>
            <div style={{ fontSize: "48px", fontWeight: "800", color: "#f87171", lineHeight: 1 }}>{ausentes.length}</div>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "3px", background: "linear-gradient(90deg, #ef4444, #fca5a5)" }} />
          </div>
          <div style={{ background: "linear-gradient(135deg, rgba(51,65,85,0.5), rgba(30,41,59,0.3))", border: "1px solid rgba(100,116,139,0.25)", borderRadius: "18px", padding: "22px", position: "relative", overflow: "hidden" }}>
            <div style={{ fontSize: "22px", marginBottom: "8px" }}>🎓</div>
            <div style={{ fontSize: "12px", opacity: 0.65, textTransform: "uppercase", letterSpacing: "1px" }}>Total</div>
            <div style={{ fontSize: "48px", fontWeight: "800", color: "#94a3b8", lineHeight: 1 }}>{alumnos.length}</div>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "3px", background: "linear-gradient(90deg, #64748b, #94a3b8)" }} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
          <div style={{ background: "rgba(15,23,42,0.6)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px", overflow: "hidden" }}>
            <div style={{ padding: "18px 22px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "14px", fontWeight: "700", color: "#86efac" }}>Presentes</span>
              <span style={{ background: "rgba(34,197,94,0.15)", color: "#4ade80", padding: "3px 10px", borderRadius: "20px", fontSize: "12px" }}>{presentes.length}</span>
            </div>
            <div style={{ padding: "12px", maxHeight: "300px", overflowY: "auto" }}>
              {presentes.length === 0 ? (
                <div style={{ textAlign: "center", padding: "20px", color: "#475569" }}>Sin registros</div>
              ) : presentes.map((alumnoId) => (
                <div key={alumnoId} style={{ display: "flex", alignItems: "center", gap: "10px", padding:"8px 12px", borderRadius: "10px" }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "rgba(34,197,94,0.15)", color: "#4ade80", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "700" }}>
                    {getNombre(alumnoId).slice(0, 2)}
                  </div>
                  <span style={{ fontSize: "12px", color: "#cbd5e1" }}>{getNombre(alumnoId)}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "rgba(15,23,42,0.6)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px", overflow: "hidden" }}>
            <div style={{ padding: "18px 22px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "14px", fontWeight: "700", color: "#fde68a" }}>En bano</span>
              <span style={{ background: "rgba(245,158,11,0.15)", color: "#fbbf24", padding: "3px 10px", borderRadius: "20px", fontSize: "12px" }}>{enBano.length}</span>
            </div>
            <div style={{ padding: "12px", maxHeight: "300px", overflowY: "auto" }}>
              {enBano.length === 0 ? (
                <div style={{ textAlign: "center", padding: "20px", color: "#475569" }}>Ninguno fuera</div>
              ) : enBano.map((alumnoId) => (
                <div key={alumnoId} style={{ display: "flex", alignItems: "center", gap: "10px", padding:"8px 12px", borderRadius: "10px" }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "rgba(245,158,11,0.15)", color: "#fbbf24", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "700" }}>
                    {getNombre(alumnoId).slice(0, 2)}
                  </div>
                  <span style={{ fontSize: "12px", color: "#cbd5e1" }}>{getNombre(alumnoId)}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "rgba(15,23,42,0.6)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px", overflow: "hidden" }}>
            <div style={{ padding: "18px 22px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "14px", fontWeight: "700", color: "#fca5a5" }}>Ausentes</span>
              <span style={{ background: "rgba(239,68,68,0.15)", color: "#f87171", padding: "3px 10px", borderRadius: "20px", fontSize: "12px" }}>{ausentes.length}</span>
            </div>
            <div style={{ padding: "12px", maxHeight: "300px", overflowY: "auto" }}>
              {ausentes.length === 0 ? (
                <div style={{ textAlign: "center", padding: "20px", color: "#475569" }}>Todos presentes!</div>
              ) : ausentes.map((alumnoId) => (
                <div key={alumnoId} style={{ display: "flex", alignItems: "center", gap: "10px", padding:"8px 12px", borderRadius: "10px" }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "rgba(239,68,68,0.15)", color: "#f87171", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "700" }}>
                    {getNombre(alumnoId).slice(0, 2)}
                  </div>
                  <span style={{ fontSize: "12px", color: "#cbd5e1" }}>{getNombre(alumnoId)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}