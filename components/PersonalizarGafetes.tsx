"use client";
// Colocar en: components/PersonalizarGafetes.tsx
// Ventana para elegir color, diseño y tamaño de los gafetes, con vista previa en vivo.
import { useEffect, useMemo, useState } from "react";
import {
  COLORES,
  DISENOS,
  TAMANOS,
  OPCIONES_DEFAULT,
  prepararQRs,
  construirHTMLGafetes,
  imprimirGafetes,
  type AlumnoConQR,
  type OpcionesGafete,
  type Tamano,
} from "../lib/generarGafetesPDF";

const CLAVE_PREFERENCIAS = "gafetesPreferencias";
const TRATAMIENTOS = ["Maestra", "Maestro", "Profesora", "Profesor", "Docente"];

function leerPreferencias(): OpcionesGafete {
  try {
    const guardado = localStorage.getItem(CLAVE_PREFERENCIAS);
    if (guardado) return { ...OPCIONES_DEFAULT, ...JSON.parse(guardado) };
  } catch {
    // sin acceso a localStorage: usamos los valores por defecto
  }
  return { ...OPCIONES_DEFAULT };
}

function guardarPreferencias(o: OpcionesGafete) {
  try {
    localStorage.setItem(CLAVE_PREFERENCIAS, JSON.stringify(o));
  } catch {
    // no pasa nada si no se puede guardar
  }
}

interface Props {
  grupo: { nombre: string; grado?: string };
  maestro: { nombre: string; email: string };
  alumnos: { id: string | number; nombre: string }[];
  onClose: () => void;
}

export default function PersonalizarGafetes({ grupo, maestro, alumnos, onClose }: Props) {
  const [opciones, setOpciones] = useState<OpcionesGafete>(OPCIONES_DEFAULT);
  const [gafetes, setGafetes] = useState<AlumnoConQR[] | null>(null);
  const [error, setError] = useState("");

  // Preferencias guardadas + generar los QR en cuanto se abre la ventana
  useEffect(() => {
    setOpciones(leerPreferencias());
    let activo = true;
    prepararQRs(alumnos)
      .then((lista) => { if (activo) setGafetes(lista); })
      .catch(() => { if (activo) setError("No se pudieron generar los códigos QR. Intenta de nuevo."); });
    return () => { activo = false; };
  }, [alumnos]);

  const cambiar = (cambios: Partial<OpcionesGafete>) => {
    setOpciones((prev) => {
      const nuevas = { ...prev, ...cambios };
      guardarPreferencias(nuevas);
      return nuevas;
    });
  };

  const vistaPrevia = useMemo(() => {
    if (!gafetes || gafetes.length === 0) return "";
    return construirHTMLGafetes([gafetes[0]], grupo, maestro, opciones, "vista-previa");
  }, [gafetes, grupo, maestro, opciones]);

  const t = TAMANOS[opciones.tamano];
  const totalHojas = Math.ceil(alumnos.length / (t.columnas * t.filas));

  const imprimir = () => {
    if (!gafetes) return;
    const html = construirHTMLGafetes(gafetes, grupo, maestro, opciones, "imprimir");
    const ok = imprimirGafetes(html);
    if (!ok) {
      setError("Tu navegador bloqueó la ventana de impresión. Permite las ventanas emergentes para pasalista.mx e intenta de nuevo.");
      return;
    }
    onClose();
  };

  const etiqueta = { fontSize: "12px", color: "#94a3b8", fontWeight: 700, display: "block", marginBottom: "8px" } as const;
  const campo = { width: "100%", padding: "10px", borderRadius: "10px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)", color: "white", fontSize: "13px", boxSizing: "border-box" as const };
  const opcionBtn = (activo: boolean) => ({
    padding: "10px 12px", borderRadius: "10px", cursor: "pointer", textAlign: "left" as const,
    border: activo ? "2px solid #818cf8" : "1px solid rgba(255,255,255,0.15)",
    background: activo ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.04)",
    color: "white",
  });

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", zIndex: 1200 }}>
      <div style={{ background: "#1e1b4b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", width: "100%", maxWidth: "940px", maxHeight: "92vh", overflowY: "auto", color: "white", fontFamily: "Arial, sans-serif" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 22px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>🪪 Personaliza tus gafetes</h3>
            <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#94a3b8" }}>
              {grupo.grado ? `${grupo.grado}° — Grupo ${grupo.nombre}` : grupo.nombre} · {alumnos.length} alumnos
            </p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#94a3b8", fontSize: "24px", cursor: "pointer", lineHeight: 1 }}>×</button>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "22px", padding: "22px" }}>
          {/* ----- Opciones ----- */}
          <div style={{ flex: "1 1 360px", minWidth: 0, display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <span style={etiqueta}>🎨 COLOR</span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
                {COLORES.map((c) => (
                  <button
                    key={c.valor}
                    title={c.nombre}
                    onClick={() => cambiar({ color: c.valor })}
                    style={{
                      width: "32px", height: "32px", borderRadius: "50%", background: c.valor, cursor: "pointer",
                      border: opciones.color === c.valor ? "3px solid white" : "2px solid rgba(255,255,255,0.2)",
                      boxShadow: opciones.color === c.valor ? "0 0 0 2px #818cf8" : "none",
                    }}
                  />
                ))}
                <label title="Otro color" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#cbd5e1", cursor: "pointer" }}>
                  <input
                    type="color"
                    value={opciones.color}
                    onChange={(e) => cambiar({ color: e.target.value })}
                    style={{ width: "32px", height: "32px", border: "none", background: "none", cursor: "pointer", padding: 0 }}
                  />
                  Otro
                </label>
              </div>
            </div>

            <div>
              <span style={etiqueta}>🖼️ DISEÑO</span>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                {DISENOS.map((d) => (
                  <button key={d.valor} onClick={() => cambiar({ diseno: d.valor })} style={opcionBtn(opciones.diseno === d.valor)}>
                    <div style={{ fontSize: "13px", fontWeight: 700 }}>{d.nombre}</div>
                    <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>{d.descripcion}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span style={etiqueta}>📏 TAMAÑO</span>
              <div style={{ display: "grid", gap: "8px" }}>
                {(Object.keys(TAMANOS) as Tamano[]).map((k) => (
                  <button key={k} onClick={() => cambiar({ tamano: k })} style={opcionBtn(opciones.tamano === k)}>
                    <span style={{ fontSize: "13px", fontWeight: 700 }}>{TAMANOS[k].nombre}</span>
                    <span style={{ fontSize: "11px", color: "#94a3b8", marginLeft: "8px" }}>{TAMANOS[k].descripcion}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span style={etiqueta}>✏️ DATOS DEL GAFETE (opcional)</span>
              <div style={{ display: "grid", gap: "10px" }}>
                <input
                  value={opciones.escuela}
                  onChange={(e) => cambiar({ escuela: e.target.value.slice(0, 60) })}
                  placeholder="Nombre de la escuela (si lo dejas vacío dice GAFETE DE ASISTENCIA)"
                  style={campo}
                />
                <input
                  value={opciones.cicloEscolar}
                  onChange={(e) => cambiar({ cicloEscolar: e.target.value.slice(0, 20) })}
                  placeholder="Ciclo escolar, ej. 2026-2027"
                  style={campo}
                />
                <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={opciones.mostrarMaestro}
                      onChange={(e) => cambiar({ mostrarMaestro: e.target.checked })}
                    />
                    Mostrar mi nombre como
                  </label>
                  <select
                    value={opciones.tratamiento}
                    onChange={(e) => cambiar({ tratamiento: e.target.value })}
                    disabled={!opciones.mostrarMaestro}
                    style={{ ...campo, width: "auto", padding: "8px" }}
                  >
                    {TRATAMIENTOS.map((tr) => (
                      <option key={tr} value={tr} style={{ background: "#1e1b4b" }}>{tr}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* ----- Vista previa ----- */}
          <div style={{ flex: "1 1 360px", minWidth: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
            <span style={etiqueta}>👀 VISTA PREVIA</span>
            <div style={{ background: "#e5e7eb", borderRadius: "12px", height: "520px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              {error ? (
                <p style={{ color: "#b91c1c", fontSize: "13px", padding: "20px", textAlign: "center" }}>{error}</p>
              ) : !gafetes ? (
                <p style={{ color: "#475569", fontSize: "13px" }}>Generando códigos QR…</p>
              ) : (
                <iframe
                  title="Vista previa del gafete"
                  srcDoc={vistaPrevia}
                  style={{ width: "100%", height: "100%", border: "none", background: "transparent" }}
                />
              )}
            </div>
            <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8", textAlign: "center" }}>
              Se imprimirán {alumnos.length} gafetes en {totalHojas} {totalHojas === 1 ? "hoja" : "hojas"} tamaño carta.
              El código QR es el mismo de siempre: los gafetes que ya imprimiste siguen funcionando.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", padding: "16px 22px", borderTop: "1px solid rgba(255,255,255,0.08)", flexWrap: "wrap" }}>
          <button
            onClick={() => cambiar({ ...OPCIONES_DEFAULT })}
            style={{ padding: "12px 16px", borderRadius: "10px", background: "none", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.15)", fontSize: "13px", cursor: "pointer" }}
          >
            Restablecer
          </button>
          <button
            onClick={onClose}
            style={{ padding: "12px 16px", borderRadius: "10px", background: "rgba(255,255,255,0.1)", color: "white", border: "1px solid rgba(255,255,255,0.2)", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}
          >
            Cancelar
          </button>
          <button
            onClick={imprimir}
            disabled={!gafetes}
            style={{ padding: "12px 22px", borderRadius: "10px", background: gafetes ? "linear-gradient(135deg, #22c55e, #15803d)" : "#475569", color: "white", border: "none", fontSize: "14px", fontWeight: 700, cursor: gafetes ? "pointer" : "wait" }}
          >
            🖨️ Imprimir {alumnos.length} gafetes
          </button>
        </div>
      </div>
    </div>
  );
}