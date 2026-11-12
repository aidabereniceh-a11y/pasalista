"use client";
export const runtime = "edge";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const TIPOS = [
  { value: "tarea", label: "📋 Tareas" },
  { value: "examen", label: "📄 Exámenes" },
  { value: "participacion", label: "🙋 Participación" },
  { value: "otro", label: "📌 Otro" },
];

interface Maestro { id: number; nombre: string; }
interface Grupo { id: number; nombre: string; grado: string; grupo: string; asignatura?: string; etiqueta?: string; }
interface Evaluacion { id: number; nombre: string; tipo: string; fecha: string; }
interface Alumno { id: number; nombre: string; }
interface Calificacion { alumno_id: number; calificacion: number; }

export default function ConcentradoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const grupoIdParam = searchParams.get("grupoId");

  const [maestro, setMaestro] = useState<Maestro | null>(null);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState<number | null>(grupoIdParam ? Number(grupoIdParam) : null);
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [calificacionesMap, setCalificacionesMap] = useState<Record<number, Record<number, number>>>({});
  const [cargando, setCargando] = useState(false);

  // Porcentajes por tipo
  const [porcentajes, setPorcentajes] = useState<Record<string, number>>({
    tarea: 30,
    examen: 50,
    participacion: 20,
    otro: 0,
  });
  const [porcentajesGuardados, setPorcentajesGuardados] = useState(false);

  const totalPorcentaje = Object.values(porcentajes).reduce((a, b) => a + b, 0);
  const printRef = useRef<HTMLDivElement>(null);

  const guardarPonderacion = () => {
    if (totalPorcentaje !== 100) return;
    localStorage.setItem("ponderacion_concentrado", JSON.stringify(porcentajes));
    setPorcentajesGuardados(true);
    setTimeout(() => setPorcentajesGuardados(false), 2000);
  };

  useEffect(() => {
    const data = localStorage.getItem("maestro");
    if (!data) { router.push("/login"); return; }
    const m = JSON.parse(data);
    setMaestro(m);
    // Cargar ponderación guardada
    const savedP = localStorage.getItem("ponderacion_concentrado");
    if (savedP) setPorcentajes(JSON.parse(savedP));
    fetch(`/api/grupos?maestroId=${m.id}`)
      .then(r => r.json())
      .then(data => setGrupos(data.grupos || []));
  }, [router]);

  useEffect(() => {
    if (!grupoSeleccionado || !maestro) return;
    setCargando(true);
    setCalificacionesMap({});

    Promise.all([
      fetch(`/api/alumnos?grupoId=${grupoSeleccionado}&maestroId=${maestro.id}`).then(r => r.json()),
      fetch(`/api/evaluaciones?maestroId=${maestro.id}&grupoId=${grupoSeleccionado}`).then(r => r.json()),
    ]).then(async ([alumnosData, evaluacionesData]) => {
      const listaAlumnos: Alumno[] = (alumnosData.alumnos || []).filter((a: any) => a.activo !== false);
      const listaEvals: Evaluacion[] = evaluacionesData.evaluaciones || [];
      setAlumnos(listaAlumnos);
      setEvaluaciones(listaEvals);

      // Cargar calificaciones de cada evaluación
      const map: Record<number, Record<number, number>> = {};
      await Promise.all(
        listaEvals.map(async (ev) => {
          const res = await fetch(`/api/evaluaciones/${ev.id}/calificaciones`);
          const data = await res.json();
          const arr: Calificacion[] = Array.isArray(data) ? data : [];
          map[ev.id] = {};
          arr.forEach(c => { map[ev.id][c.alumno_id] = c.calificacion; });
        })
      );
      setCalificacionesMap(map);
      setCargando(false);
    });
  }, [grupoSeleccionado, maestro]);

  const actualizarPorcentaje = (tipo: string, valor: number) => {
    setPorcentajes(prev => ({ ...prev, [tipo]: valor }));
  };

  // Calcula promedio ponderado de un alumno
  const calcularPromedioPonderado = (alumnoId: number): string => {
    if (totalPorcentaje === 0) return "—";

    let sumaTotal = 0;
    let pesosUsados = 0;

    TIPOS.forEach(({ value: tipo }) => {
      const peso = porcentajes[tipo] || 0;
      if (peso === 0) return;

      const evsTipo = evaluaciones.filter(ev => ev.tipo === tipo);
      if (evsTipo.length === 0) return;

      const cals = evsTipo.map(ev => calificacionesMap[ev.id]?.[alumnoId] ?? null).filter(c => c !== null) as number[];
      if (cals.length === 0) return;

      const promTipo = cals.reduce((a, b) => a + b, 0) / cals.length;
      sumaTotal += (promTipo * peso) / 100;
      pesosUsados += peso;
    });

    if (pesosUsados === 0) return "—";
    // Ajustar al porcentaje real usado
    const promFinal = (sumaTotal / pesosUsados) * 100;
    return promFinal.toFixed(1);
  };

  const promedioTipo = (alumnoId: number, tipo: string): string => {
    const evsTipo = evaluaciones.filter(ev => ev.tipo === tipo);
    if (evsTipo.length === 0) return "—";
    const cals = evsTipo.map(ev => calificacionesMap[ev.id]?.[alumnoId] ?? null).filter(c => c !== null) as number[];
    if (cals.length === 0) return "—";
    return (cals.reduce((a, b) => a + b, 0) / cals.length).toFixed(1);
  };

  const imprimir = () => window.print();

  const grupoActual = grupos.find(g => g.id === grupoSeleccionado);
  const tiposConEvals = TIPOS.filter(t => evaluaciones.some(ev => ev.tipo === t.value));

  return (
    <>
      {/* Estilos de impresión */}
      <style>{`
        @media print {
          body { background: white !important; color: black !important; }
          .no-print { display: none !important; }
          .print-container { background: white !important; color: black !important; padding: 0 !important; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ccc; padding: 6px 10px; font-size: 12px; }
          th { background: #f0f0f0 !important; color: black !important; }
          .print-title { font-size: 18px; font-weight: bold; margin-bottom: 8px; color: black; }
          .print-subtitle { font-size: 13px; color: #444; margin-bottom: 16px; }
        }
      `}</style>

      <main style={{ minHeight: "100vh", background: "#0f172a", color: "white", padding: "24px", fontFamily: "system-ui, sans-serif" }} className="print-container">

        {/* Header */}
        <div className="no-print" style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
          <button onClick={() => router.back()} style={{ background: "#1e293b", border: "none", color: "#94a3b8", padding: "8px 16px", borderRadius: "8px", cursor: "pointer" }}>
            ← Volver
          </button>
          <h1 style={{ margin: 0, fontSize: "22px", fontWeight: "700" }}>📊 Concentrado</h1>
        </div>

        {/* Título de impresión */}
        <div style={{ display: "none" }} className="print-title-block">
          <div className="print-title">Concentrado de Calificaciones</div>
          {grupoActual && (
            <div className="print-subtitle">
              {grupoActual.nombre}{grupoActual.asignatura ? ` · ${grupoActual.asignatura}` : ""}{grupoActual.etiqueta ? ` · ${grupoActual.etiqueta}` : ""}
              {" · "}Maestro: {maestro?.nombre}
            </div>
          )}
        </div>

        {/* Selector de grupo */}
        <div className="no-print" style={{ background: "#1e293b", borderRadius: "12px", padding: "20px", marginBottom: "20px" }}>
          <label style={{ fontSize: "14px", color: "#94a3b8", display: "block", marginBottom: "8px" }}>Grupo</label>
          <select
            value={grupoSeleccionado || ""}
            onChange={e => setGrupoSeleccionado(Number(e.target.value))}
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
            {/* Configurador de porcentajes */}
            <div className="no-print" style={{ background: "#1e293b", borderRadius: "12px", padding: "20px", marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
                <h2 style={{ margin: 0, fontSize: "16px", color: "#94a3b8" }}>⚖️ Ponderación (debe sumar 100%)</h2>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{
                    fontWeight: "700", fontSize: "15px",
                    color: totalPorcentaje === 100 ? "#4ade80" : "#f87171"
                  }}>
                    Total: {totalPorcentaje}%
                    {totalPorcentaje === 100 ? " ✓" : " ⚠️"}
                  </span>
                  {totalPorcentaje === 100 && (
                    <button onClick={guardarPonderacion} style={{ background: porcentajesGuardados ? "#16a34a" : "#6366f1", color: "white", border: "none", borderRadius: 8, padding: "6px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                      {porcentajesGuardados ? "✓ Guardado" : "💾 Guardar ponderación"}
                    </button>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                {TIPOS.map(({ value, label }) => (
                  <div key={value} style={{ flex: "1", minWidth: "140px" }}>
                    <label style={{ fontSize: "13px", color: "#94a3b8", display: "block", marginBottom: "6px" }}>{label}</label>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <input
                        type="number" min="0" max="100" step="5"
                        value={porcentajes[value]}
                        onChange={e => actualizarPorcentaje(value, Number(e.target.value))}
                        style={{ width: "70px", padding: "8px", borderRadius: "8px", background: "#0f172a", color: "white", border: "1px solid #334155", fontSize: "15px", textAlign: "center" }}
                      />
                      <span style={{ color: "#94a3b8", fontSize: "15px" }}>%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Botones de acción */}
            <div className="no-print" style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
              <button onClick={imprimir} style={{ padding: "10px 24px", borderRadius: "10px", border: "none", background: "#1e293b", color: "#94a3b8", fontWeight: "700", fontSize: "14px", cursor: "pointer" }}>
                🖨️ Imprimir / PDF
              </button>
            </div>

            {cargando ? (
              <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8", fontSize: "16px" }}>Cargando calificaciones...</div>
            ) : alumnos.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px", color: "#475569" }}>No hay alumnos en este grupo</div>
            ) : (
              <div ref={printRef} style={{ overflowX: "auto" }}>
                {/* Título visible en pantalla */}
                {grupoActual && (
                  <div style={{ marginBottom: "12px" }}>
                    <span style={{ fontSize: "17px", fontWeight: "700" }}>{grupoActual.nombre}</span>
                    {grupoActual.asignatura && <span style={{ color: "#94a3b8", marginLeft: "8px" }}>· {grupoActual.asignatura}</span>}
                    {grupoActual.etiqueta && <span style={{ color: "#94a3b8", marginLeft: "8px" }}>· {grupoActual.etiqueta}</span>}
                  </div>
                )}

                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    {/* Fila 1: agrupadores de tipo */}
                    <tr>
                      <th rowSpan={2} style={{ padding: "10px 14px", textAlign: "left", background: "#1e293b", color: "#94a3b8", border: "1px solid #334155", minWidth: "180px", verticalAlign: "bottom" }}>
                        Alumno
                      </th>
                      {tiposConEvals.map(({ value, label }) => {
                        const evsTipo = evaluaciones.filter(ev => ev.tipo === value);
                        return (
                          <th key={value} colSpan={evsTipo.length + 1} style={{ padding: "8px 10px", textAlign: "center", background: "#1e293b", color: "#a5b4fc", border: "1px solid #334155", fontWeight: "700" }}>
                            {label} ({porcentajes[value]}%)
                          </th>
                        );
                      })}
                      <th rowSpan={2} style={{ padding: "10px 14px", textAlign: "center", background: "#312e81", color: "#c7d2fe", border: "1px solid #4338ca", fontWeight: "700", minWidth: "80px", verticalAlign: "bottom" }}>
                        Promedio Final
                      </th>
                    </tr>
                    {/* Fila 2: nombres de evaluaciones + promedio tipo */}
                    <tr>
                      {tiposConEvals.map(({ value }) => {
                        const evsTipo = evaluaciones.filter(ev => ev.tipo === value);
                        return evsTipo.map(ev => (
                          <th key={ev.id} style={{ padding: "8px 10px", textAlign: "center", background: "#0f172a", color: "#cbd5e1", border: "1px solid #334155", fontWeight: "400", fontSize: "12px", maxWidth: "90px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={ev.nombre}>
                            {ev.nombre}
                          </th>
                        )).concat(
                          <th key={`prom-${value}`} style={{ padding: "8px 10px", textAlign: "center", background: "#0f172a", color: "#fbbf24", border: "1px solid #334155", fontWeight: "700", fontSize: "12px" }}>
                            Prom.
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {alumnos.map((alumno, i) => {
                      const promFinal = calcularPromedioPonderado(alumno.id);
                      const promNum = parseFloat(promFinal);
                      const colorFinal = isNaN(promNum) ? "#94a3b8" : promNum >= 9 ? "#4ade80" : promNum >= 7 ? "#fbbf24" : promNum >= 6 ? "#fb923c" : "#f87171";

                      return (
                        <tr key={alumno.id} style={{ background: i % 2 === 0 ? "#1e293b" : "#0f172a" }}>
                          <td style={{ padding: "9px 14px", border: "1px solid #334155", fontWeight: "500", fontSize: "13px" }}>
                            {alumno.nombre}
                          </td>
                          {tiposConEvals.map(({ value }) => {
                            const evsTipo = evaluaciones.filter(ev => ev.tipo === value);
                            return evsTipo.map(ev => {
                              const cal = calificacionesMap[ev.id]?.[alumno.id];
                              const calStr = cal !== undefined ? String(cal) : "—";
                              const calNum = cal !== undefined ? cal : NaN;
                              const color = isNaN(calNum) ? "#475569" : calNum >= 9 ? "#4ade80" : calNum >= 7 ? "#fbbf24" : calNum >= 6 ? "#fb923c" : "#f87171";
                              return (
                                <td key={ev.id} style={{ padding: "9px 10px", border: "1px solid #334155", textAlign: "center", color, fontWeight: "600" }}>
                                  {calStr}
                                </td>
                              );
                            }).concat(
                              <td key={`prom-${value}-${alumno.id}`} style={{ padding: "9px 10px", border: "1px solid #334155", textAlign: "center", color: "#fbbf24", fontWeight: "700", background: i % 2 === 0 ? "#1e2a1a" : "#111b0d" }}>
                                {promedioTipo(alumno.id, value)}
                              </td>
                            );
                          })}
                          <td style={{ padding: "9px 14px", border: "1px solid #4338ca", textAlign: "center", fontWeight: "800", fontSize: "15px", color: colorFinal, background: i % 2 === 0 ? "#1e1b4b" : "#1a1740" }}>
                            {promFinal}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Leyenda ponderación */}
                {totalPorcentaje !== 100 && (
                  <div className="no-print" style={{ marginTop: "12px", padding: "10px 16px", background: "rgba(239,68,68,0.1)", border: "1px solid #ef4444", borderRadius: "8px", color: "#f87171", fontSize: "13px" }}>
                    ⚠️ Los porcentajes suman {totalPorcentaje}% — el promedio final no es exacto. Ajusta la ponderación a 100%.
                  </div>
                )}

                <div style={{ marginTop: "12px", display: "flex", gap: "16px", flexWrap: "wrap", fontSize: "12px", color: "#94a3b8" }}>
                  <span>🟢 ≥ 9.0</span>
                  <span>🟡 ≥ 7.0</span>
                  <span>🟠 ≥ 6.0</span>
                  <span>🔴 &lt; 6.0</span>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
