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

export default function Home() {
  return (
    <main style={{ fontFamily: "Arial, sans-serif", background: "white", minHeight: "100vh" }}>

      {/* NAV */}
      <nav style={{ background: "white", borderBottom: "1px solid #e2e8f0", padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ fontSize: "22px", fontWeight: "800", background: "linear-gradient(135deg, #667eea, #764ba2)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          PasaLista
        </div>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <a href="/login" style={{ color: "#64748b", textDecoration: "none", fontSize: "14px", fontWeight: "500" }}>Iniciar sesion</a>
          <a href="/registro" style={{ background: "linear-gradient(135deg, #667eea, #764ba2)", color: "white", padding: "10px 20px", borderRadius: "10px", textDecoration: "none", fontSize: "14px", fontWeight: "700" }}>Empezar gratis</a>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", padding: "80px 32px", color: "white" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px", alignItems: "center" }}>
          <div>
            <div style={{ display: "inline-block", background: "rgba(255,255,255,0.15)", borderRadius: "20px", padding: "6px 16px", fontSize: "13px", fontWeight: "600", marginBottom: "20px", border: "1px solid rgba(255,255,255,0.3)" }}>
              ✨ 100% gratis para empezar
            </div>
            <h1 style={{ fontSize: "48px", fontWeight: "800", margin: "0 0 16px 0", lineHeight: 1.2 }}>
              Pasa lista en segundos con un QR
            </h1>
            <p style={{ fontSize: "18px", opacity: 0.9, marginBottom: "32px", lineHeight: 1.6 }}>
              Olvida las listas en papel. Escanea el gafete QR de cada alumno con tu celular y listo, asistencia registrada al instante.
            </p>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <a href="/registro" style={{ background: "white", color: "#667eea", padding: "16px 32px", borderRadius: "12px", textDecoration: "none", fontSize: "18px", fontWeight: "700", boxShadow: "0 4px 20px rgba(0,0,0,0.2)", display: "inline-block" }}>
                Empezar gratis
              </a>
              <a href="#como-funciona" style={{ background: "rgba(255,255,255,0.2)", color: "white", padding: "16px 32px", borderRadius: "12px", textDecoration: "none", fontSize: "18px", fontWeight: "700", border: "2px solid rgba(255,255,255,0.4)", display: "inline-block" }}>
                Ver como funciona
              </a>
            </div>
          </div>
          <div style={{ borderRadius: "20px", overflow: "hidden", boxShadow: "0 24px 64px rgba(0,0,0,0.3)" }}>
            <img
              src="/maestra-celular.png"
              alt="Maestra mostrando gafete QR de alumno en su celular"
              style={{ width: "100%", height: "460px", objectFit: "cover", display: "block" }}
            />
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ background: "#f8fafc", padding: "48px 32px" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "32px", textAlign: "center" }}>
          <div><div style={{ fontSize: "48px", fontWeight: "800", color: "#667eea" }}>5 seg</div><div style={{ color: "#64748b", fontSize: "16px" }}>para pasar lista</div></div>
          <div><div style={{ fontSize: "48px", fontWeight: "800", color: "#667eea" }}>100%</div><div style={{ color: "#64748b", fontSize: "16px" }}>desde el celular</div></div>
          <div><div style={{ fontSize: "48px", fontWeight: "800", color: "#667eea" }}>0</div><div style={{ color: "#64748b", fontSize: "16px" }}>papel necesario</div></div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" style={{ padding: "80px 32px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: "36px", fontWeight: "800", color: "#1e293b", marginBottom: "16px" }}>Como funciona</h2>
          <p style={{ textAlign: "center", color: "#64748b", fontSize: "18px", marginBottom: "64px" }}>En 5 pasos sencillos, sin complicaciones</p>

          {/* Paso 1 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "64px", alignItems: "center", marginBottom: "80px" }}>
            <div>
              <div style={{ width: "48px", height: "48px", background: "linear-gradient(135deg, #667eea, #764ba2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "800", fontSize: "18px", marginBottom: "16px" }}>1</div>
              <h3 style={{ fontSize: "24px", fontWeight: "700", color: "#1e293b", marginBottom: "12px" }}>Crea tu cuenta gratis</h3>
              <p style={{ color: "#64748b", fontSize: "16px", lineHeight: 1.7 }}>Registrate en menos de 2 minutos. Sin tarjeta de credito, sin complicaciones. Solo tu nombre y correo.</p>
            </div>
            <div style={{ borderRadius: "16px", overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>
              <img
                src="/empieza-gratis.png"
                alt="Pagina de registro de PasaLista en laptop"
                style={{ width: "100%", height: "320px", objectFit: "cover", objectPosition: "top", display: "block" }}
              />
            </div>
          </div>

          {/* Paso 2 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "64px", alignItems: "center", marginBottom: "80px" }}>
            <div style={{ background: "#f0f4ff", borderRadius: "16px", padding: "32px", textAlign: "center", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
              <div style={{ fontSize: "64px", marginBottom: "16px" }}>📋</div>
              <div style={{ color: "#1e293b", fontSize: "18px", fontWeight: "700", marginBottom: "8px" }}>Agrega a tus alumnos</div>
              <div style={{ color: "#64748b", fontSize: "14px" }}>Un nombre por linea · QR automatico para cada uno</div>
            </div>
            <div>
              <div style={{ width: "48px", height: "48px", background: "linear-gradient(135deg, #667eea, #764ba2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "800", fontSize: "18px", marginBottom: "16px" }}>2</div>
              <h3 style={{ fontSize: "24px", fontWeight: "700", color: "#1e293b", marginBottom: "12px" }}>Agrega tu grupo</h3>
              <p style={{ color: "#64748b", fontSize: "16px", lineHeight: 1.7 }}>Escribe los nombres de tus alumnos, uno por linea. El sistema genera automaticamente un QR unico para cada uno.</p>
            </div>
          </div>

          {/* Paso 3 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "64px", alignItems: "center", marginBottom: "80px" }}>
            <div>
              <div style={{ width: "48px", height: "48px", background: "linear-gradient(135deg, #667eea, #764ba2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "800", fontSize: "18px", marginBottom: "16px" }}>3</div>
              <h3 style={{ fontSize: "24px", fontWeight: "700", color: "#1e293b", marginBottom: "12px" }}>Imprime los gafetes QR</h3>
              <p style={{ color: "#64748b", fontSize: "16px", lineHeight: 1.7 }}>Descarga e imprime los gafetes con el QR de cada alumno. Cada alumno lleva su gafete colgado o en la mochila. 6 gafetes por hoja carta.</p>
            </div>
            <div style={{ borderRadius: "16px", overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>
              <img
                src="/gafetes-qr.jpg"
                alt="Gafetes con codigo QR de alumnos sobre un escritorio"
                style={{ width: "100%", height: "320px", objectFit: "cover", display: "block" }}
              />
            </div>
          </div>

          {/* Paso 4 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "64px", alignItems: "center", marginBottom: "80px" }}>
            <div style={{ borderRadius: "16px", overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>
              <img
                src="/maestra-escaneando.png"
                alt="Maestra escaneando QR con su celular"
                style={{ width: "100%", height: "320px", objectFit: "cover", display: "block" }}
              />
            </div>
            <div>
              <div style={{ width: "48px", height: "48px", background: "linear-gradient(135deg, #667eea, #764ba2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "800", fontSize: "18px", marginBottom: "16px" }}>4</div>
              <h3 style={{ fontSize: "24px", fontWeight: "700", color: "#1e293b", marginBottom: "12px" }}>Escanea el gafete de cada alumno</h3>
              <p style={{ color: "#64748b", fontSize: "16px", lineHeight: 1.7 }}>Tu como maestra escaneas el QR del gafete de cada alumno al llegar. Sin apps extra, solo la camara de tu celular. La asistencia queda registrada al instante.</p>
            </div>
          </div>

          {/* Paso 5 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "64px", alignItems: "center" }}>
            <div>
              <div style={{ width: "48px", height: "48px", background: "linear-gradient(135deg, #667eea, #764ba2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "800", fontSize: "18px", marginBottom: "16px" }}>5</div>
              <h3 style={{ fontSize: "24px", fontWeight: "700", color: "#1e293b", marginBottom: "12px" }}>Consulta reportes y exporta a Excel</h3>
              <p style={{ color: "#64748b", fontSize: "16px", lineHeight: 1.7 }}>Ve quien asistio, quien falto y quien salio al bano, todo en tiempo real. Exporta el reporte a Excel con un clic para tu supervisora.</p>
            </div>
            <div style={{ borderRadius: "16px", overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>
              <img
                src="/laptop-reporte.png"
                alt="Reporte de asistencia en Excel en laptop"
                style={{ width: "100%", height: "320px", objectFit: "cover", display: "block" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* BANNER DASHBOARD */}
      <section style={{ background: "#f0f4ff", padding: "80px 32px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "64px", alignItems: "center" }}>
          <div>
            <h2 style={{ fontSize: "36px", fontWeight: "800", color: "#1e293b", marginBottom: "16px", lineHeight: 1.3 }}>
              Todo desde tu celular o computadora
            </h2>
            <p style={{ color: "#64748b", fontSize: "16px", lineHeight: 1.7, marginBottom: "16px" }}>
              Tu panel de control te muestra todos tus grupos, la asistencia del dia y los reportes del ciclo escolar completo. Sin instalaciones, funciona directo desde el navegador.
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px 0" }}>
              {[
                "Ve la asistencia en tiempo real",
                "Controla salidas al bano",
                "Genera gafetes QR para tus alumnos",
                "Exporta reportes a Excel",
              ].map((item) => (
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
            <img
              src="/dashboard.png"
              alt="Dashboard de PasaLista en laptop"
              style={{ width: "100%", height: "420px", objectFit: "cover", objectPosition: "top", display: "block" }}
            />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ background: "linear-gradient(135deg, #0a0f1e 0%, #1e1b4b 100%)", padding: "80px 32px", color: "white" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: "36px", fontWeight: "800", marginBottom: "16px" }}>Todo lo que necesitas</h2>
          <p style={{ textAlign: "center", color: "#94a3b8", fontSize: "18px", marginBottom: "48px" }}>Sin complicaciones, sin instalaciones, sin papel</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "24px" }}>
            {[
              { icon: "✅", title: "Asistencia en tiempo real", desc: "Ve quien esta presente, quien salio al bano y quien falta, todo en vivo." },
              { icon: "🚻", title: "Control de bano", desc: "Registra salidas y regresos del bano con un solo escaneo del gafete." },
              { icon: "📊", title: "Exporta a Excel", desc: "Descarga el registro de asistencia en Excel con un clic para tu supervisora." },
              { icon: "📱", title: "Solo necesitas tu celular", desc: "Sin apps extra. La camara de tu telefono es suficiente para escanear los gafetes." },
              { icon: "🪪", title: "Gafetes QR para alumnos", desc: "Genera e imprime gafetes profesionales con QR unico para cada alumno. 6 por hoja carta." },
              { icon: "👥", title: "Multiples grupos", desc: "Con el plan Premium maneja todos tus grupos sin limite." },
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

      {/* PRECIOS */}
      <section style={{ padding: "80px 32px", maxWidth: "700px", margin: "0 auto", textAlign: "center" }}>
        <h2 style={{ fontSize: "36px", fontWeight: "800", color: "#1e293b", marginBottom: "12px" }}>Precios simples</h2>
        <p style={{ color: "#64748b", fontSize: "18px", marginBottom: "48px" }}>Empieza gratis, actualiza cuando lo necesites</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
          <div style={{ border: "2px solid #e2e8f0", borderRadius: "20px", padding: "32px", textAlign: "left" }}>
            <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#1e293b", margin: "0 0 8px 0" }}>Gratis</h3>
            <div style={{ fontSize: "48px", fontWeight: "800", color: "#1e293b", margin: "0 0 4px 0" }}>$0</div>
            <p style={{ color: "#64748b", marginBottom: "24px" }}>Para siempre</p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px 0" }}>
              {["1 grupo", "Alumnos ilimitados", "Codigos QR", "Asistencia en tiempo real", "Exportar a Excel"].map((f) => (
                <li key={f} style={{ padding: "8px 0", color: "#475569", fontSize: "15px", borderBottom: "1px solid #f1f5f9" }}>✅ {f}</li>
              ))}
            </ul>
            <a href="/registro" style={{ display: "block", background: "#f1f5f9", color: "#475569", padding: "14px", borderRadius: "10px", textDecoration: "none", fontWeight: "700", textAlign: "center" }}>Empezar gratis</a>
          </div>
          <div style={{ border: "2px solid #667eea", borderRadius: "20px", padding: "32px", textAlign: "left", background: "linear-gradient(135deg, rgba(102,126,234,0.05), rgba(118,75,162,0.05))", position: "relative" }}>
            <div style={{ position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg, #667eea, #764ba2)", color: "white", padding: "4px 16px", borderRadius: "20px", fontSize: "12px", fontWeight: "700" }}>MAS POPULAR</div>
            <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#1e293b", margin: "0 0 8px 0" }}>Premium</h3>
            <div style={{ fontSize: "48px", fontWeight: "800", color: "#667eea", margin: "0 0 4px 0" }}>$35</div>
            <p style={{ color: "#64748b", marginBottom: "24px" }}>al mes</p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px 0" }}>
              {["Grupos ilimitados", "Alumnos ilimitados", "Codigos QR", "Asistencia en tiempo real", "Exportar a Excel", "Gafetes QR para alumnos", "Soporte prioritario"].map((f) => (
                <li key={f} style={{ padding: "8px 0", color: "#475569", fontSize: "15px", borderBottom: "1px solid #f1f5f9" }}>✅ {f}</li>
              ))}
            </ul>
            <a href="/registro" style={{ display: "block", background: "linear-gradient(135deg, #667eea, #764ba2)", color: "white", padding: "14px", borderRadius: "10px", textDecoration: "none", fontWeight: "700", textAlign: "center" }}>Empezar ahora</a>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", padding: "80px 32px", textAlign: "center", color: "white" }}>
        <h2 style={{ fontSize: "36px", fontWeight: "800", margin: "0 0 16px 0" }}>Lista para modernizar tu lista de asistencia?</h2>
        <p style={{ fontSize: "18px", opacity: 0.9, marginBottom: "32px" }}>Unete a los maestros que ya usan PasaLista</p>
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