import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PasaLista - Pase de lista digital con QR para maestros",
  description: "Pasa lista en segundos con un QR. Olvida las listas en papel. Escanea el QR de cada alumno con tu celular y listo, asistencia registrada al instante.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "PasaLista - Pase de lista digital con QR para maestros",
    description: "Pasa lista en segundos con un QR. Olvida las listas en papel.",
    url: "https://pasalista.mx",
    siteName: "PasaLista",
    locale: "es_MX",
  },
};

// QR decorativo para las muestras de gafetes (no es un QR real)
function MiniQR({ size = 64 }: { size?: number }) {
  const celdas = [
    [4,0],[6,0],[4,1],[5,2],[6,3],[4,4],[8,4],[9,4],[11,4],[0,5],[2,5],[5,5],[7,5],[10,5],
    [1,6],[3,6],[4,6],[6,6],[9,6],[12,6],[0,7],[5,7],[8,7],[11,7],[2,8],[4,8],[7,8],[9,8],[12,8],
    [4,9],[6,9],[10,9],[5,10],[8,10],[11,10],[12,10],[4,11],[7,11],[9,11],[6,12],[8,12],[10,12],[12,12],
  ];
  const ojo = (x: number, y: number) => (
    <g key={`o${x}${y}`}>
      <rect x={x} y={y} width="3" height="3" fill="none" stroke="#0f1923" strokeWidth="0.6" />
      <rect x={x + 0.9} y={y + 0.9} width="1.2" height="1.2" fill="#0f1923" />
    </g>
  );
  return (
    <svg width={size} height={size} viewBox="-0.5 -0.5 14 14" style={{ display: "block", background: "white" }} aria-hidden="true">
      {ojo(0, 0)}{ojo(10, 0)}{ojo(0, 10)}
      {celdas.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#0f1923" />
      ))}
    </svg>
  );
}

const MUESTRAS_GAFETES = [
  { diseno: "Clásico", color: "#1a6b3c", nombre: "SOFÍA MARTÍNEZ" },
  { diseno: "Moderno", color: "#1d4ed8", nombre: "DIEGO HERNÁNDEZ" },
  { diseno: "Infantil", color: "#db2777", nombre: "VALENTINA LÓPEZ" },
  { diseno: "Minimalista", color: "#111827", nombre: "MATEO GARCÍA" },
];

function MuestraGafete({ diseno, color, nombre }: { diseno: string; color: string; nombre: string }) {
  const base: React.CSSProperties = { width: "100%", maxWidth: "190px", height: "230px", margin: "0 auto", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", boxShadow: "0 8px 24px rgba(0,0,0,0.10)" };
  const cuerpo: React.CSSProperties = { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px", padding: "8px" };

  if (diseno === "Moderno") {
    return (
      <div style={{ ...base, background: color, color: "white", borderRadius: "14px" }}>
        <div style={{ textAlign: "center", fontSize: "10px", fontWeight: 700, padding: "8px", letterSpacing: "1px", opacity: 0.9 }}>GAFETE DE ASISTENCIA</div>
        <div style={cuerpo}>
          <div style={{ background: "white", padding: "6px", borderRadius: "10px" }}><MiniQR size={78} /></div>
          <div style={{ fontSize: "12px", fontWeight: 800, textAlign: "center" }}>{nombre}</div>
          <div style={{ fontSize: "10px", fontWeight: 700 }}>3° — Grupo B</div>
        </div>
        <div style={{ background: "rgba(0,0,0,0.18)", fontSize: "9px", textAlign: "center", padding: "5px" }}>pasalista.mx</div>
      </div>
    );
  }

  if (diseno === "Infantil") {
    return (
      <div style={{ ...base, background: "#fce7f3", border: `3px dashed ${color}`, borderRadius: "22px", fontFamily: "'Comic Sans MS', 'Trebuchet MS', Arial, sans-serif" }}>
        {[{ top: 6, left: 10 }, { top: 6, right: 10 }, { bottom: 6, left: 10 }, { bottom: 6, right: 10 }].map((pos, i) => (
          <span key={i} style={{ position: "absolute", color, fontSize: "13px", ...pos }}>★</span>
        ))}
        <div style={{ textAlign: "center", fontSize: "10px", fontWeight: 700, padding: "8px 22px", color }}>GAFETE DE ASISTENCIA</div>
        <div style={cuerpo}>
          <div style={{ background: "white", padding: "5px", borderRadius: "10px", border: "2px solid #f9a8d4" }}><MiniQR size={78} /></div>
          <div style={{ fontSize: "12px", fontWeight: 800, color, textAlign: "center" }}>{nombre}</div>
          <div style={{ fontSize: "10px", fontWeight: 700, color: "#374151" }}>1° — Grupo A</div>
        </div>
        <div style={{ fontSize: "9px", textAlign: "center", padding: "6px", color }}>pasalista.mx</div>
      </div>
    );
  }

  if (diseno === "Minimalista") {
    return (
      <div style={{ ...base, background: "white", border: "1px solid #111827", borderRadius: "6px" }}>
        <div style={{ textAlign: "center", fontSize: "10px", fontWeight: 700, padding: "8px", color: "#111827", borderBottom: "1px solid #111827" }}>GAFETE DE ASISTENCIA</div>
        <div style={cuerpo}>
          <MiniQR size={84} />
          <div style={{ fontSize: "12px", fontWeight: 800, color: "#111827", textAlign: "center" }}>{nombre}</div>
          <div style={{ fontSize: "10px", fontWeight: 700, color: "#111827" }}>6° — Grupo C</div>
        </div>
        <div style={{ fontSize: "9px", textAlign: "center", padding: "5px", color: "#6b7280", borderTop: "1px solid #d1d5db" }}>pasalista.mx</div>
      </div>
    );
  }

  // Clásico
  return (
    <div style={{ ...base, background: "white", border: `2px solid ${color}`, borderRadius: "10px" }}>
      <div style={{ textAlign: "center", fontSize: "10px", fontWeight: 700, padding: "8px", background: color, color: "white", letterSpacing: "1px" }}>GAFETE DE ASISTENCIA</div>
      <div style={cuerpo}>
        <MiniQR size={84} />
        <div style={{ fontSize: "12px", fontWeight: 800, color: "#0f1923", textAlign: "center" }}>{nombre}</div>
        <div style={{ fontSize: "10px", fontWeight: 700, color }}>4° — Grupo A</div>
      </div>
      <div style={{ fontSize: "9px", textAlign: "center", padding: "5px", background: color, color: "white" }}>pasalista.mx</div>
    </div>
  );
}

export default function Home() {
  return (
    <main style={{ fontFamily: "Arial, sans-serif", background: "white", minHeight: "100vh" }}>

      <style>{`
        .grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 64px;
          align-items: center;
        }
        .grid-2-reverse {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 64px;
          align-items: center;
        }
        .hero-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          align-items: center;
          max-width: 1100px;
          margin: 0 auto;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
          text-align: center;
          max-width: 800px;
          margin: 0 auto;
        }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .precio-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        .gafetes-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          margin-bottom: 48px;
        }
        .opciones-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .nav-links { display: flex; gap: 16px; align-items: center; }
        .hero-img { height: 460px; }
        .paso-img { height: 320px; }
        .dashboard-img { height: 420px; }
        .hero-btns { display: flex; gap: 16px; flex-wrap: wrap; }

        @media (max-width: 768px) {
          .hero-grid {
            grid-template-columns: 1fr;
            gap: 32px;
            padding: 0;
          }
          .grid-2 {
            grid-template-columns: 1fr;
            gap: 32px;
          }
          .grid-2-reverse {
            grid-template-columns: 1fr;
            gap: 32px;
          }
          .grid-2-reverse .img-primero {
            order: -1;
          }
          .stats-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .features-grid {
            grid-template-columns: 1fr;
          }
          .precio-grid {
            grid-template-columns: 1fr;
          }
          .gafetes-grid {
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          }
          .opciones-grid {
            grid-template-columns: 1fr;
          }
          .nav-links a:first-child { display: none; }
          .hero-img { height: 280px; }
          .paso-img { height: 220px; }
          .dashboard-img { height: 240px; }
          .hero-btns { flex-direction: column; }
          .hero-btns a { text-align: center; }
        }
      `}</style>

      {/* NAV */}
      <nav style={{ background: "white", borderBottom: "1px solid #e2e8f0", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ fontSize: "22px", fontWeight: "800", background: "linear-gradient(135deg, #667eea, #764ba2)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          PasaLista
        </div>
        <div className="nav-links">
          <a href="/login" style={{ color: "#64748b", textDecoration: "none", fontSize: "14px", fontWeight: "500" }}>Iniciar sesión</a>
          <a href="/registro" style={{ background: "linear-gradient(135deg, #667eea, #764ba2)", color: "white", padding: "10px 20px", borderRadius: "10px", textDecoration: "none", fontSize: "14px", fontWeight: "700" }}>Empezar gratis</a>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", padding: "60px 24px", color: "white" }}>
        <div className="hero-grid">
          <div>
            <div style={{ display: "inline-block", background: "rgba(255,255,255,0.15)", borderRadius: "20px", padding: "6px 16px", fontSize: "13px", fontWeight: "600", marginBottom: "20px", border: "1px solid rgba(255,255,255,0.3)" }}>
              ✨ 100% gratis para empezar
            </div>
            <h1 style={{ fontSize: "clamp(32px, 6vw, 48px)", fontWeight: "800", margin: "0 0 16px 0", lineHeight: 1.2 }}>
              Pasa lista en segundos con un QR
            </h1>
            <p style={{ fontSize: "18px", opacity: 0.9, marginBottom: "32px", lineHeight: 1.6 }}>
              Olvida las listas en papel. Escanea el gafete QR de cada alumno con tu celular y listo, asistencia registrada al instante.
            </p>
            <div className="hero-btns">
              <a href="/registro" style={{ background: "white", color: "#667eea", padding: "16px 32px", borderRadius: "12px", textDecoration: "none", fontSize: "18px", fontWeight: "700", boxShadow: "0 4px 20px rgba(0,0,0,0.2)", display: "inline-block" }}>
                Empezar gratis
              </a>
              <a href="#como-funciona" style={{ background: "rgba(255,255,255,0.2)", color: "white", padding: "16px 32px", borderRadius: "12px", textDecoration: "none", fontSize: "18px", fontWeight: "700", border: "2px solid rgba(255,255,255,0.4)", display: "inline-block" }}>
                Ver cómo funciona
              </a>
            </div>
          </div>
          <div style={{ borderRadius: "20px", overflow: "hidden", boxShadow: "0 24px 64px rgba(0,0,0,0.3)" }}>
            <img
              src="/maestra-celular.png"
              alt="Maestra mostrando gafete QR de alumno en su celular"
              className="hero-img"
              style={{ width: "100%", objectFit: "cover", display: "block" }}
            />
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ background: "#f8fafc", padding: "48px 24px" }}>
        <div className="stats-grid">
          <div><div style={{ fontSize: "48px", fontWeight: "800", color: "#667eea" }}>5 seg</div><div style={{ color: "#64748b", fontSize: "16px" }}>para pasar lista</div></div>
          <div><div style={{ fontSize: "48px", fontWeight: "800", color: "#667eea" }}>100%</div><div style={{ color: "#64748b", fontSize: "16px" }}>desde el celular</div></div>
          <div><div style={{ fontSize: "48px", fontWeight: "800", color: "#667eea" }}>0</div><div style={{ color: "#64748b", fontSize: "16px" }}>papel necesario</div></div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: "clamp(28px, 5vw, 36px)", fontWeight: "800", color: "#1e293b", marginBottom: "16px" }}>Cómo funciona</h2>
          <p style={{ textAlign: "center", color: "#64748b", fontSize: "18px", marginBottom: "64px" }}>En 5 pasos sencillos, sin complicaciones</p>

          {/* Paso 1 */}
          <div className="grid-2" style={{ marginBottom: "80px" }}>
            <div>
              <div style={{ width: "48px", height: "48px", background: "linear-gradient(135deg, #667eea, #764ba2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "800", fontSize: "18px", marginBottom: "16px" }}>1</div>
              <h3 style={{ fontSize: "24px", fontWeight: "700", color: "#1e293b", marginBottom: "12px" }}>Crea tu cuenta gratis</h3>
              <p style={{ color: "#64748b", fontSize: "16px", lineHeight: 1.7 }}>Regístrate en menos de 2 minutos. Sin tarjeta de crédito, sin complicaciones. Solo tu nombre y correo.</p>
            </div>
            <div style={{ borderRadius: "16px", overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>
              <img src="/empieza-gratis.png" alt="Pagina de registro de PasaLista en laptop"
                className="paso-img" style={{ width: "100%", objectFit: "cover", objectPosition: "top", display: "block" }} />
            </div>
          </div>

          {/* Paso 2 */}
          <div className="grid-2-reverse" style={{ marginBottom: "80px" }}>
            <div className="img-primero" style={{ background: "#f0f4ff", borderRadius: "16px", padding: "32px", textAlign: "center", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
              <div style={{ fontSize: "64px", marginBottom: "16px" }}>📋</div>
              <div style={{ color: "#1e293b", fontSize: "18px", fontWeight: "700", marginBottom: "8px" }}>Agrega a tus alumnos</div>
              <div style={{ color: "#64748b", fontSize: "14px" }}>Un nombre por línea · QR automático para cada uno</div>
            </div>
            <div>
              <div style={{ width: "48px", height: "48px", background: "linear-gradient(135deg, #667eea, #764ba2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "800", fontSize: "18px", marginBottom: "16px" }}>2</div>
              <h3 style={{ fontSize: "24px", fontWeight: "700", color: "#1e293b", marginBottom: "12px" }}>Agrega tu grupo</h3>
              <p style={{ color: "#64748b", fontSize: "16px", lineHeight: 1.7 }}>Escribe los nombres de tus alumnos, uno por línea. El sistema genera automáticamente un QR único para cada uno.</p>
            </div>
          </div>

          {/* Paso 3 */}
          <div className="grid-2" style={{ marginBottom: "80px" }}>
            <div>
              <div style={{ width: "48px", height: "48px", background: "linear-gradient(135deg, #667eea, #764ba2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "800", fontSize: "18px", marginBottom: "16px" }}>3</div>
              <h3 style={{ fontSize: "24px", fontWeight: "700", color: "#1e293b", marginBottom: "12px" }}>Personaliza e imprime los gafetes QR</h3>
              <p style={{ color: "#64748b", fontSize: "16px", lineHeight: 1.7 }}>Elige el color, el diseño y el tamaño de los gafetes, agrega el nombre de tu escuela y míralos en vista previa antes de imprimir. Cada alumno lleva su gafete colgado o en la mochila. <a href="#gafetes-personalizados" style={{ color: "#667eea", fontWeight: 700 }}>Ver diseños →</a></p>
            </div>
            <div style={{ borderRadius: "16px", overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>
              <img src="/gafetes-qr.jpg" alt="Gafetes con codigo QR de alumnos sobre un escritorio"
                className="paso-img" style={{ width: "100%", objectFit: "cover", display: "block" }} />
            </div>
          </div>

          {/* Paso 4 */}
          <div className="grid-2-reverse" style={{ marginBottom: "80px" }}>
            <div className="img-primero" style={{ borderRadius: "16px", overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>
              <img src="/maestra-escaneando.png" alt="Maestra escaneando QR con su celular"
                className="paso-img" style={{ width: "100%", objectFit: "cover", display: "block" }} />
            </div>
            <div>
              <div style={{ width: "48px", height: "48px", background: "linear-gradient(135deg, #667eea, #764ba2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "800", fontSize: "18px", marginBottom: "16px" }}>4</div>
              <h3 style={{ fontSize: "24px", fontWeight: "700", color: "#1e293b", marginBottom: "12px" }}>Escanea el gafete de cada alumno</h3>
              <p style={{ color: "#64748b", fontSize: "16px", lineHeight: 1.7 }}>Tú como maestra escaneas el QR del gafete de cada alumno al llegar. Sin apps extra, solo la cámara de tu celular. La asistencia queda registrada al instante.</p>
            </div>
          </div>

          {/* Paso 5 */}
          <div className="grid-2">
            <div>
              <div style={{ width: "48px", height: "48px", background: "linear-gradient(135deg, #667eea, #764ba2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "800", fontSize: "18px", marginBottom: "16px" }}>5</div>
              <h3 style={{ fontSize: "24px", fontWeight: "700", color: "#1e293b", marginBottom: "12px" }}>Consulta reportes y exporta a Excel</h3>
              <p style={{ color: "#64748b", fontSize: "16px", lineHeight: 1.7 }}>Ve quién asistió, quién faltó y quién salió al baño, todo en tiempo real. Exporta el reporte a Excel con un clic para tu supervisora.</p>
            </div>
            <div style={{ borderRadius: "16px", overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>
              <img src="/laptop-reporte.png" alt="Reporte de asistencia en Excel en laptop"
                className="paso-img" style={{ width: "100%", objectFit: "cover", objectPosition: "top", display: "block" }} />
            </div>
          </div>
        </div>
      </section>

      {/* GAFETES PERSONALIZADOS */}
      <section id="gafetes-personalizados" style={{ background: "linear-gradient(180deg, #ffffff 0%, #f0fdf4 100%)", padding: "80px 24px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ display: "inline-block", background: "rgba(34,197,94,0.15)", borderRadius: "20px", padding: "6px 16px", fontSize: "13px", fontWeight: "700", color: "#15803d", marginBottom: "16px" }}>
              🎨 Nuevo
            </div>
            <h2 style={{ fontSize: "clamp(28px, 5vw, 36px)", fontWeight: "800", color: "#1e293b", marginBottom: "16px", lineHeight: 1.3 }}>
              Gafetes a tu estilo
            </h2>
            <p style={{ color: "#64748b", fontSize: "18px", lineHeight: 1.6, margin: "0 auto 48px", maxWidth: "720px" }}>
              Personaliza los gafetes de tus alumnos antes de imprimirlos: elige el color, el diseño y el tamaño, y ve cómo quedan en vista previa. Ideal para preescolar, primaria y maestros especialistas.
            </p>
          </div>

          <div className="gafetes-grid">
            {MUESTRAS_GAFETES.map((m) => (
              <div key={m.diseno} style={{ textAlign: "center" }}>
                <MuestraGafete diseno={m.diseno} color={m.color} nombre={m.nombre} />
                <div style={{ marginTop: "12px", fontSize: "14px", fontWeight: 700, color: "#1e293b" }}>{m.diseno}</div>
              </div>
            ))}
          </div>

          <div className="opciones-grid">
            {[
              { icon: "🎨", title: "El color que quieras", desc: "10 colores listos o cualquier otro con el selector. El texto se ajusta solo para que siempre se lea bien." },
              { icon: "🖼️", title: "4 diseños", desc: "Clásico, Moderno, Infantil con estrellitas o Minimalista para ahorrar tinta." },
              { icon: "📏", title: "3 tamaños", desc: "Credencial (8 por hoja), Mediano (6 por hoja) o Grande para colgar (4 por hoja carta)." },
            ].map((o) => (
              <div key={o.title} style={{ background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 8px 32px rgba(0,0,0,0.06)", border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: "32px", marginBottom: "10px" }}>{o.icon}</div>
                <h3 style={{ fontSize: "17px", fontWeight: "700", color: "#1e293b", margin: "0 0 8px" }}>{o.title}</h3>
                <p style={{ color: "#64748b", fontSize: "14px", lineHeight: 1.6, margin: 0 }}>{o.desc}</p>
              </div>
            ))}
          </div>

          <p style={{ textAlign: "center", color: "#475569", fontSize: "15px", lineHeight: 1.6, margin: "36px auto 0", maxWidth: "720px" }}>
            ✏️ Agrega el nombre de tu escuela y el ciclo escolar. Y no te preocupes: <strong>el código QR no cambia</strong>, así que los gafetes que ya imprimiste siguen funcionando.
          </p>
        </div>
      </section>

      {/* BANNER DASHBOARD */}
      <section style={{ background: "#f0f4ff", padding: "80px 24px" }}>
        <div className="grid-2" style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: "800", color: "#1e293b", marginBottom: "16px", lineHeight: 1.3 }}>
              Todo desde tu celular o computadora
            </h2>
            <p style={{ color: "#64748b", fontSize: "16px", lineHeight: 1.7, marginBottom: "16px" }}>
              Tu panel de control te muestra todos tus grupos, la asistencia del día y los reportes del ciclo escolar completo. Sin instalaciones, funciona directo desde el navegador.
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px 0" }}>
              {["Ve la asistencia en tiempo real", "Controla salidas al baño", "Genera gafetes QR personalizados para tus alumnos", "Exporta reportes a Excel"].map((item) => (
                <li key={item} style={{ padding: "8px 0", color: "#475569", fontSize: "15px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#667eea", fontWeight: "700" }}>✓</span> {item}
                </li>
              ))}
            </ul>
            <a href="/registro" style={{ display: "inline-block", background: "linear-gradient(135deg, #667eea, #764ba2)", color: "white", padding: "14px 28px", borderRadius: "12px", textDecoration: "none", fontSize: "16px", fontWeight: "700" }}>
              Probar gratis ahora
            </a>
          </div>
          <div style={{ borderRadius: "16px", overflow: "hidden", boxShadow: "0 16px 48px rgba(0,0,0,0.15)" }}>
            <img src="/dashboard.png" alt="Dashboard de PasaLista en laptop"
              className="dashboard-img" style={{ width: "100%", objectFit: "cover", objectPosition: "top", display: "block" }} />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ background: "linear-gradient(135deg, #0a0f1e 0%, #1e1b4b 100%)", padding: "80px 24px", color: "white" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: "clamp(28px, 5vw, 36px)", fontWeight: "800", marginBottom: "16px" }}>Todo lo que necesitas</h2>
          <p style={{ textAlign: "center", color: "#94a3b8", fontSize: "18px", marginBottom: "48px" }}>Sin complicaciones, sin instalaciones, sin papel</p>
          <div className="features-grid">
            {[
              { icon: "✅", title: "Asistencia en tiempo real", desc: "Ve quién está presente, quién salió al baño y quién falta, todo en vivo." },
              { icon: "🚻", title: "Control de baño", desc: "Registra salidas y regresos del baño con un solo escaneo del gafete." },
              { icon: "📊", title: "Exporta a Excel", desc: "Descarga el registro de asistencia en Excel con un clic para tu supervisora." },
              { icon: "📱", title: "Solo necesitas tu celular", desc: "Sin apps extra. La cámara de tu teléfono es suficiente para escanear los gafetes." },
              { icon: "🪪", title: "Gafetes QR personalizados", desc: "Elige color, diseño y tamaño de los gafetes de tus alumnos, con vista previa antes de imprimir." },
              { icon: "📓", title: "Diario del Maestro", desc: "Registra tu práctica docente todos los días. Dicta por voz en vez de escribir y exporta a PDF o Word cuando quieras." },
              { icon: "⚠️", title: "Bitácora de Incidencias", desc: "Documenta incidentes de tus alumnos por grupo, con dictado por voz y exportación a PDF y Word." },
              { icon: "👥", title: "Múltiples grupos", desc: "Con el plan Premium maneja todos tus grupos sin límite." },
            ].map((f) => (
              <div key={f.title} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "24px" }}>
                <div style={{ fontSize: "32px", marginBottom: "12px" }}>{f.icon}</div>
                <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "8px" }}>{f.title}</h3>
                <p style={{ color: "#94a3b8", fontSize: "14px", lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DIARIO Y BITACORA */}
      <section style={{ background: "#f0f4ff", padding: "80px 24px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ display: "inline-block", background: "rgba(102,126,234,0.15)", borderRadius: "20px", padding: "6px 16px", fontSize: "13px", fontWeight: "700", color: "#667eea", marginBottom: "16px" }}>
            ⭐ Incluido en el plan Premium
          </div>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: "800", color: "#1e293b", marginBottom: "16px", lineHeight: 1.3 }}>
            Diario del Maestro y Bitácora de Incidencias
          </h2>
          <p style={{ color: "#64748b", fontSize: "16px", lineHeight: 1.7, marginBottom: "48px", maxWidth: "700px" }}>
            Documenta tu práctica docente y los incidentes de tus alumnos sin escribir una sola palabra: solo dicta por voz y PasaLista lo convierte en texto automáticamente.
          </p>
          <div className="grid-2">
            <div style={{ background: "white", borderRadius: "16px", padding: "32px", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>📓</div>
              <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#1e293b", marginBottom: "12px" }}>Diario del Maestro</h3>
              <p style={{ color: "#64748b", fontSize: "15px", lineHeight: 1.7, marginBottom: "16px" }}>
                Registra las actividades, logros, retos y compromisos de cada sesión. Marca los componentes curriculares trabajados y autoevalúa tu clase, todo en una sola pantalla.
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {["Dictado por voz en cada campo", "Historial editable por grupo y por mes", "Exporta a PDF o Word con un clic"].map((item) => (
                  <li key={item} style={{ padding: "6px 0", color: "#475569", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "#667eea", fontWeight: "700" }}>✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ background: "white", borderRadius: "16px", padding: "32px", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>⚠️</div>
              <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#1e293b", marginBottom: "12px" }}>Bitácora de Incidencias</h3>
              <p style={{ color: "#64748b", fontSize: "15px", lineHeight: 1.7, marginBottom: "16px" }}>
                Documenta incidentes por alumno y por grupo: agresiones, accidentes, cambios de comportamiento y más. Describe lo sucedido dictando por voz, sin perder tiempo escribiendo.
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {["Selecciona grupo y alumno con un clic", "Consulta el historial por grupo, alumno y mes", "Exporta a PDF o Word con un clic"].map((item) => (
                  <li key={item} style={{ padding: "6px 0", color: "#475569", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "#667eea", fontWeight: "700" }}>✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* PRECIOS */}
      <section style={{ padding: "80px 24px", maxWidth: "700px", margin: "0 auto", textAlign: "center" }}>
        <h2 style={{ fontSize: "clamp(28px, 5vw, 36px)", fontWeight: "800", color: "#1e293b", marginBottom: "12px" }}>Precios simples</h2>
        <p style={{ color: "#64748b", fontSize: "18px", marginBottom: "48px" }}>Empieza gratis, actualiza cuando lo necesites</p>
        <div className="precio-grid">
          <div style={{ border: "2px solid #e2e8f0", borderRadius: "20px", padding: "32px", textAlign: "left" }}>
            <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#1e293b", margin: "0 0 8px 0" }}>Gratis</h3>
            <div style={{ fontSize: "48px", fontWeight: "800", color: "#1e293b", margin: "0 0 4px 0" }}>$0</div>
            <p style={{ color: "#64748b", marginBottom: "24px" }}>Para siempre</p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px 0" }}>
              {["1 grupo", "Alumnos ilimitados", "Códigos QR", "Asistencia en tiempo real", "Exportar a Excel"].map((f) => (
                <li key={f} style={{ padding: "8px 0", color: "#475569", fontSize: "15px", borderBottom: "1px solid #f1f5f9" }}>✅ {f}</li>
              ))}
            </ul>
            <a href="/registro" style={{ display: "block", background: "#f1f5f9", color: "#475569", padding: "14px", borderRadius: "10px", textDecoration: "none", fontWeight: "700", textAlign: "center" }}>Empezar gratis</a>
          </div>
          <div style={{ border: "2px solid #667eea", borderRadius: "20px", padding: "32px", textAlign: "left", background: "linear-gradient(135deg, rgba(102,126,234,0.05), rgba(118,75,162,0.05))", position: "relative" }}>
            <div style={{ position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg, #667eea, #764ba2)", color: "white", padding: "4px 16px", borderRadius: "20px", fontSize: "12px", fontWeight: "700", whiteSpace: "nowrap" }}>MÁS POPULAR</div>
            <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#1e293b", margin: "0 0 8px 0" }}>Premium</h3>
            <div style={{ fontSize: "48px", fontWeight: "800", color: "#667eea", margin: "0 0 4px 0" }}>$49</div>
            <p style={{ color: "#64748b", marginBottom: "24px" }}>al mes</p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px 0" }}>
              {["Grupos ilimitados", "Alumnos ilimitados", "Códigos QR", "Asistencia en tiempo real", "Exportar a Excel", "Gafetes QR personalizables para alumnos", "Diario del Maestro con dictado por voz", "Bitácora de Incidencias con dictado por voz", "Exporta el Diario y la Bitácora a PDF y Word", "Soporte prioritario"].map((f) => (
                <li key={f} style={{ padding: "8px 0", color: "#475569", fontSize: "15px", borderBottom: "1px solid #f1f5f9" }}>✅ {f}</li>
              ))}
            </ul>
            <a href="/registro" style={{ display: "block", background: "linear-gradient(135deg, #667eea, #764ba2)", color: "white", padding: "14px", borderRadius: "10px", textDecoration: "none", fontWeight: "700", textAlign: "center" }}>Empezar ahora</a>
          </div>
        </div>
      </section>

      {/* APP MOVIL */}
      <section style={{ background: "linear-gradient(135deg, #0a0f1e 0%, #1e1b4b 100%)", padding: "80px 24px", color: "white", textAlign: "center" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <div style={{ fontSize: "64px", marginBottom: "16px" }}>📱</div>
          <h2 style={{ fontSize: "clamp(28px, 5vw, 36px)", fontWeight: "800", marginBottom: "16px" }}>
            Nuestra app móvil está en camino
          </h2>
          <p style={{ color: "#94a3b8", fontSize: "18px", marginBottom: "40px", lineHeight: 1.6 }}>
            Escanea los gafetes QR de tus alumnos aún más rápido desde nuestra app nativa para Android e iOS.
          </p>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "14px", padding: "16px 32px", display: "flex", alignItems: "center", gap: "12px", opacity: 0.6 }}>
              <span style={{ fontSize: "28px" }}>🤖</span>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: "11px", color: "#94a3b8" }}>Próximamente en</div>
                <div style={{ fontSize: "16px", fontWeight: "700" }}>Android</div>
              </div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "14px", padding: "16px 32px", display: "flex", alignItems: "center", gap: "12px", opacity: 0.6 }}>
              <span style={{ fontSize: "28px" }}>🍎</span>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: "11px", color: "#94a3b8" }}>Próximamente en</div>
                <div style={{ fontSize: "16px", fontWeight: "700" }}>App Store</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", padding: "80px 24px", textAlign: "center", color: "white" }}>
        <h2 style={{ fontSize: "clamp(24px, 5vw, 36px)", fontWeight: "800", margin: "0 0 16px 0" }}>¿Lista para modernizar tu lista de asistencia?</h2>
        <p style={{ fontSize: "18px", opacity: 0.9, marginBottom: "32px" }}>Únete a los maestros que ya usan PasaLista</p>
        <a href="/registro" style={{ background: "white", color: "#667eea", padding: "16px 40px", borderRadius: "12px", textDecoration: "none", fontSize: "20px", fontWeight: "800", boxShadow: "0 4px 20px rgba(0,0,0,0.2)", display: "inline-block" }}>
          Empezar gratis ahora
        </a>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#0a0f1e", color: "#64748b", padding: "32px", textAlign: "center", fontSize: "14px" }}>
        <div style={{ marginBottom: "8px", fontSize: "18px", fontWeight: "700", color: "white" }}>PasaLista</div>
        <p style={{ margin: 0 }}>2026 PasaLista · Todos los derechos reservados</p>
      </footer>

    </main>
  );
}