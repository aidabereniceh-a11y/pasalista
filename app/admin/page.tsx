"use client";

import { useEffect, useState } from "react";
import * as XLSX from "xlsx";

const TODOS_LOS_ALUMNOS = [
  "ARROYO ESPINDOLA MOISES",
  "CAMACHO ORTEGA IVAN",
  "CRUZ SALGUERO NICOLAS",
  "DAVILA MARTINEZ KENAI ARISTE0",
  "DOMINGUEZ TINOCO AILYN GUADALUPE",
  "ESTRADA TREJO DIEGO JESUS",
  "GONZALEZ MONDRAGON JADE SAMANTHA",
  "HERNANDEZ REYES ALEXA SOFIA",
  "MARTINEZ URIBE SAMUEL ROMAN",
  "MENDOZA BAUTISTA ANGEL",
  "MENDOZA TRINIDAD JUAN GAEL",
  "MIRANDA CASTRO MILA XHARENY",
  "ORTEGA PALOMINO LUISA YAQUELINE",
  "PENA PEDRAZA ARTURO",
  "PEREA MERLOS AMANDA GETSEMANI",
  "PEREZ ALCANTARA ISAEL GIOVANNI",
  "RAMIREZ AGUILAR LUZ SCARLETT",
  "RODRIGUEZ LAGUNAS DAYANA NICOLE",
  "RUBIO FUENTES DELIA EPIFANIA",
  "SANCHEZ ARELLANO SCARLETT SOFIA",
  "SANCHEZ MARTINEZ LIAM OCTAVIO",
  "SANTIAGO DIAZ YANETH",
  "SILVA REYES ADRIAN",
  "TON BASURTO AFRICA",
  "VARGAS ANDRES ANA ALEJANDRA",
];

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Sora', sans-serif;
    background: #0a0f1e;
    color: #e2e8f0;
    min-height: 100vh;
  }

  .dashboard {
    min-height: 100vh;
    background:
      radial-gradient(ellipse at 20% 20%, rgba(99,102,241,0.15) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 80%, rgba(20,184,166,0.12) 0%, transparent 50%),
      #0a0f1e;
    padding: 32px;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 36px;
    flex-wrap: wrap;
    gap: 16px;
  }

  .header-left h1 {
    font-size: 28px;
    font-weight: 800;
    color: #f1f5f9;
    letter-spacing: -0.5px;
    line-height: 1.2;
  }

  .header-left h1 span {
    background: linear-gradient(135deg, #818cf8, #38bdf8);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .header-left p {
    margin-top: 6px;
    font-size: 13px;
    color: #64748b;
    font-family: 'JetBrains Mono', monospace;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .pulse-dot {
    width: 8px;
    height: 8px;
    background: #22c55e;
    border-radius: 50%;
    display: inline-block;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
    50% { opacity: 0.8; transform: scale(1.1); box-shadow: 0 0 0 6px rgba(34,197,94,0); }
  }

  .export-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    background: linear-gradient(135deg, #166534, #15803d);
    color: white;
    border: 1px solid rgba(34,197,94,0.3);
    padding: 13px 22px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    font-family: 'Sora', sans-serif;
    cursor: pointer;
    box-shadow: 0 4px 20px rgba(34,197,94,0.2), inset 0 1px 0 rgba(255,255,255,0.1);
    transition: all 0.2s ease;
  }

  .export-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(34,197,94,0.35);
    background: linear-gradient(135deg, #15803d, #16a34a);
  }

  .export-btn:active { transform: translateY(0); }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
    gap: 16px;
    margin-bottom: 36px;
  }

  .stat-card {
    border-radius: 18px;
    padding: 22px;
    position: relative;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,0.07);
    backdrop-filter: blur(10px);
    transition: transform 0.2s ease;
  }

  .stat-card:hover { transform: translateY(-3px); }

  .stat-card.green { background: linear-gradient(135deg, rgba(21,128,61,0.35), rgba(20,83,45,0.2)); border-color: rgba(34,197,94,0.25); box-shadow: 0 8px 32px rgba(34,197,94,0.12); }
  .stat-card.amber { background: linear-gradient(135deg, rgba(180,83,9,0.35), rgba(146,64,14,0.2)); border-color: rgba(245,158,11,0.25); box-shadow: 0 8px 32px rgba(245,158,11,0.12); }
  .stat-card.blue  { background: linear-gradient(135deg, rgba(37,99,235,0.35), rgba(29,78,216,0.2)); border-color: rgba(59,130,246,0.25); box-shadow: 0 8px 32px rgba(59,130,246,0.12); }
  .stat-card.red   { background: linear-gradient(135deg, rgba(185,28,28,0.35), rgba(153,27,27,0.2)); border-color: rgba(239,68,68,0.25); box-shadow: 0 8px 32px rgba(239,68,68,0.12); }
  .stat-card.slate { background: linear-gradient(135deg, rgba(51,65,85,0.5), rgba(30,41,59,0.3)); border-color: rgba(100,116,139,0.25); box-shadow: 0 8px 32px rgba(0,0,0,0.2); }

  .stat-icon { font-size: 22px; margin-bottom: 12px; display: block; }

  .stat-label {
    font-size: 12px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    opacity: 0.65;
    margin-bottom: 6px;
  }

  .stat-value {
    font-size: 52px;
    font-weight: 800;
    line-height: 1;
    letter-spacing: -2px;
  }

  .stat-card.green .stat-value { color: #4ade80; }
  .stat-card.amber .stat-value { color: #fbbf24; }
  .stat-card.blue  .stat-value { color: #93c5fd; }
  .stat-card.red   .stat-value { color: #f87171; }
  .stat-card.slate .stat-value { color: #94a3b8; }

  .stat-bar {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 3px;
    border-radius: 0 0 18px 18px;
  }
  .stat-card.green .stat-bar { background: linear-gradient(90deg, #22c55e, #86efac); }
  .stat-card.amber .stat-bar { background: linear-gradient(90deg, #f59e0b, #fde68a); }
  .stat-card.blue  .stat-bar { background: linear-gradient(90deg, #3b82f6, #93c5fd); }
  .stat-card.red   .stat-bar { background: linear-gradient(90deg, #ef4444, #fca5a5); }
  .stat-card.slate .stat-bar { background: linear-gradient(90deg, #64748b, #94a3b8); }

  .lists-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
  }

  .list-card {
    background: rgba(15,23,42,0.6);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 20px;
    overflow: hidden;
    backdrop-filter: blur(10px);
  }

  .list-header {
    padding: 18px 22px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .list-header-title {
    font-size: 14px;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .list-header-count {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    padding: 3px 10px;
    border-radius: 20px;
    font-weight: 500;
  }

  .list-card.green-card .list-header-title { color: #86efac; }
  .list-card.green-card .list-header-count { background: rgba(34,197,94,0.15); color: #4ade80; }
  .list-card.amber-card .list-header-title { color: #fde68a; }
  .list-card.amber-card .list-header-count { background: rgba(245,158,11,0.15); color: #fbbf24; }
  .list-card.red-card   .list-header-title { color: #fca5a5; }
  .list-card.red-card   .list-header-count { background: rgba(239,68,68,0.15); color: #f87171; }

  .list-body {
    padding: 12px;
    max-height: 380px;
    overflow-y: auto;
  }

  .list-body::-webkit-scrollbar { width: 4px; }
  .list-body::-webkit-scrollbar-track { background: transparent; }
  .list-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

  .alumno-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 10px;
    transition: background 0.15s ease;
    cursor: default;
  }

  .alumno-row:hover { background: rgba(255,255,255,0.04); }

  .alumno-avatar {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 700;
    flex-shrink: 0;
  }

  .green-card .alumno-avatar { background: rgba(34,197,94,0.15); color: #4ade80; }
  .amber-card .alumno-avatar { background: rgba(245,158,11,0.15); color: #fbbf24; }
  .red-card   .alumno-avatar { background: rgba(239,68,68,0.15);  color: #f87171; }

  .alumno-name {
    font-size: 12.5px;
    font-weight: 500;
    color: #cbd5e1;
    letter-spacing: 0.2px;
  }

  .empty-state {
    text-align: center;
    padding: 30px 20px;
    color: #475569;
    font-size: 13px;
  }

  .empty-state span { display: block; font-size: 28px; margin-bottom: 8px; }

  @media (max-width: 768px) {
    .dashboard { padding: 16px; }
    .header { flex-direction: column; align-items: flex-start; }
    .header-left h1 { font-size: 22px; }
    .export-btn { width: 100%; justify-content: center; }
    .stats-grid { grid-template-columns: repeat(2, 1fr); }
    .lists-grid { grid-template-columns: 1fr; }
  }
`;

function getInitials(name: string) {
  const parts = name.trim().split(" ");
  return parts.length >= 2 ? parts[0][0] + parts[1][0] : parts[0].slice(0, 2);
}

// Acepta filas con formato "D/MM/YYYY HH:MM:SS" y descarta cualquier
// fila sin fecha válida (por ejemplo, las filas de depuración "LOG").
function esDeHoy(fechaHoraStr: string) {
  if (!fechaHoraStr) return false;

  const fechaPart = fechaHoraStr.split(" ")[0];
  const partes = fechaPart.split("/");
  if (partes.length !== 3) return false;

  const dia = Number(partes[0]);
  const mes = Number(partes[1]);
  const anio = Number(partes[2]);
  if (!dia || !mes || !anio) return false;

  const hoy = new Date();
  return (
    dia === hoy.getDate() &&
    mes === hoy.getMonth() + 1 &&
    anio === hoy.getFullYear()
  );
}

export default function Admin() {
  const [datos, setDatos] = useState<any[]>([]);
  const [hora, setHora] = useState(new Date());

  useEffect(() => {
    const cargarDatos = () => {
      fetch("https://script.google.com/macros/s/AKfycbyZzCSfyBWYH1ieXcOFpe6q7pKGl7cZ7OuMIPQgMUVuY5es1IyS3Uufyt79N8n33h4j/exec")
        .then((r) => r.json())
        .then((json) => {
          json.shift();
          const datosDeHoy = json.filter((fila: any[]) => esDeHoy(fila[0]));
          setDatos(datosDeHoy);
        });
    };
    cargarDatos();
    const intervalo = setInterval(cargarDatos, 10000);
    return () => clearInterval(intervalo);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setHora(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const presentes = Array.from(
    new Set(datos.filter((f) => f[2] === "Presente").map((f) => f[1]))
  );

  const ausentes = TODOS_LOS_ALUMNOS.filter((a) => !presentes.includes(a));

  const estadoBano = new Map<string, boolean>();
  datos.forEach((fila) => {
    if (fila[2] === "Salida al baño") estadoBano.set(fila[1], true);
    if (fila[2] === "Regreso del baño") estadoBano.set(fila[1], false);
  });

  const alumnosEnBano = Array.from(estadoBano.entries())
    .filter(([_, v]) => v)
    .map(([nombre]) => nombre);

  const enBano = alumnosEnBano.length;
  const regresaron = estadoBano.size - enBano;

  const today = hora.toLocaleDateString("es-MX", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  const timeStr = hora.toLocaleTimeString("es-MX", {
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });

  const exportarExcel = () => {
    const hoja = XLSX.utils.json_to_sheet(
      datos.map((f) => ({ Fecha: f[0], Alumno: f[1], Accion: f[2], Grupo: f[3] }))
    );
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Asistencia");
    const fecha = new Date().toISOString().split("T")[0];
    XLSX.writeFile(libro, `Asistencia_3A_${fecha}.xlsx`);
  };

  return (
    <>
      <style>{styles}</style>
      <div className="dashboard">

        <div className="header">
          <div className="header-left">
            <h1>Asistencia <span>Grupo 3A</span></h1>
            <p>
              <span className="pulse-dot" />
              EN VIVO · {today} · {timeStr}
            </p>
          </div>
          <button className="export-btn" onClick={exportarExcel}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Exportar Excel
          </button>
        </div>

        <div className="stats-grid">
          <div className="stat-card green">
            <span className="stat-icon">✅</span>
            <div className="stat-label">Presentes</div>
            <div className="stat-value">{presentes.length}</div>
            <div className="stat-bar" />
          </div>
          <div className="stat-card amber">
            <span className="stat-icon">🚻</span>
            <div className="stat-label">En baño</div>
            <div className="stat-value">{enBano}</div>
            <div className="stat-bar" />
          </div>
          <div className="stat-card blue">
            <span className="stat-icon">🔵</span>
            <div className="stat-label">Regresaron</div>
            <div className="stat-value">{regresaron}</div>
            <div className="stat-bar" />
          </div>
          <div className="stat-card red">
            <span className="stat-icon">❌</span>
            <div className="stat-label">Ausentes</div>
            <div className="stat-value">{ausentes.length}</div>
            <div className="stat-bar" />
          </div>
          <div className="stat-card slate">
            <span className="stat-icon">🎓</span>
            <div className="stat-label">Total</div>
            <div className="stat-value">{TODOS_LOS_ALUMNOS.length}</div>
            <div className="stat-bar" />
          </div>
        </div>

        <div className="lists-grid">

          <div className="list-card green-card">
            <div className="list-header">
              <span className="list-header-title">🟢 Presentes</span>
              <span className="list-header-count">{presentes.length}</span>
            </div>
            <div className="list-body">
              {presentes.length === 0 ? (
                <div className="empty-state"><span>📋</span>Sin registros aún</div>
              ) : presentes.map((alumno) => (
                <div className="alumno-row" key={alumno}>
                  <div className="alumno-avatar">{getInitials(alumno)}</div>
                  <span className="alumno-name">{alumno}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="list-card amber-card">
            <div className="list-header">
              <span className="list-header-title">🚻 En baño</span>
              <span className="list-header-count">{enBano}</span>
            </div>
            <div className="list-body">
              {alumnosEnBano.length === 0 ? (
                <div className="empty-state"><span>✨</span>Ningún alumno fuera</div>
              ) : alumnosEnBano.map((alumno) => (
                <div className="alumno-row" key={alumno}>
                  <div className="alumno-avatar">{getInitials(alumno)}</div>
                  <span className="alumno-name">{alumno}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="list-card red-card">
            <div className="list-header">
              <span className="list-header-title">🔴 Ausentes</span>
              <span className="list-header-count">{ausentes.length}</span>
            </div>
            <div className="list-body">
              {ausentes.length === 0 ? (
                <div className="empty-state"><span>🎉</span>¡Todos presentes!</div>
              ) : ausentes.map((alumno) => (
                <div className="alumno-row" key={alumno}>
                  <div className="alumno-avatar">{getInitials(alumno)}</div>
                  <span className="alumno-name">{alumno}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}