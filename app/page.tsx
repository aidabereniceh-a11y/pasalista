"use client";

export default function Home() {
  return (
    <main style={{ fontFamily: "Arial, sans-serif", background: "white", minHeight: "100vh" }}>

      <nav style={{ background: "white", borderBottom: "1px solid #e2e8f0", padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ fontSize: "22px", fontWeight: "800", background: "linear-gradient(135deg, #667eea, #764ba2)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          PasaLista
        </div>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <a href="/login" style={{ color: "#64748b", textDecoration: "none", fontSize: "14px", fontWeight: "500" }}>Iniciar sesion</a>
          <a href="/registro" style={{ background: "linear-gradient(135deg, #667eea, #764ba2)", color: "white", padding: "10px 20px", borderRadius: "10px", textDecoration: "none", fontSize: "14px", fontWeight: "700" }}>Empezar gratis</a>
        </div>
      </nav>

      <section style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", padding: "80px 32px", textAlign: "center", color: "white" }}>
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
          <div style={{ fontSize: "64px", marginBottom: "16px" }}>📚</div>
          <h1 style={{ fontSize: "48px", fontWeight: "800", margin: "0 0 16px 0", lineHeight: 1.2 }}>Pasa lista en segundos con un QR</h1>
          <p style={{ fontSize: "20px", opacity: 0.9, marginBottom: "32px", lineHeight: 1.6 }}>Olvida las listas en papel. Escanea el QR de cada alumno con tu celular y listo, asistencia registrada al instante.</p>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/registro" style={{ background: "white", color: "#667eea", padding: "16px 32px", borderRadius: "12px", textDecoration: "none", fontSize: "18px", fontWeight: "700", boxShadow: "0 4px 20px rgba(0,0,0,0.2)", display: "inline-block" }}>Empezar gratis</a>
            <a href="#como-funciona" style={{ background: "rgba(255,255,255,0.2)", color: "white", padding: "16px 32px", borderRadius: "12px", textDecoration: "none", fontSize: "18px", fontWeight: "700", border: "2px solid rgba(255,255,255,0.4)", display: "inline-block" }}>Ver como funciona</a>
          </div>
        </div>
      </section>

      <section style={{ background: "#f8fafc", padding: "48px 32px" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "32px", textAlign: "center" }}>
          <div><div style={{ fontSize: "48px", fontWeight: "800", color: "#667eea" }}>5 seg</div><div style={{ color: "#64748b", fontSize: "16px" }}>para pasar lista</div></div>
          <div><div style={{ fontSize: "48px", fontWeight: "800", color: "#667eea" }}>100%</div><div style={{ color: "#64748b", fontSize: "16px" }}>desde el celular</div></div>
          <div><div style={{ fontSize: "48px", fontWeight: "800", color: "#667eea" }}>0</div><div style={{ color: "#64748b", fontSize: "16px" }}>papel necesario</div></div>
        </div>
      </section>

      <section id="como-funciona" style={{ padding: "80px 32px", maxWidth: "900px", margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: "36px", fontWeight: "800", color: "#1e293b", marginBottom: "48px" }}>Como funciona</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "32px" }}>
          {[
            { num: "1", icon: "👤", title: "Crea tu cuenta", desc: "Registrate gratis en segundos. Sin tarjeta de credito." },
            { num: "2", icon: "📋", title: "Agrega tu grupo", desc: "Escribe los nombres de tus alumnos y selecciona el grado." },
            { num: "3", icon: "🖨️", title: "Imprime los QR", desc: "Genera e imprime un codigo QR unico para cada alumno." },
            { num: "4", icon: "📱", title: "Escanea el QR del alumno", desc: "Tu como maestra escaneas el QR de cada alumno con tu celular. Sin apps extra, solo la camara." },
            { num: "5", icon: "✅", title: "Registra asistencia y bano", desc: "Presiona Presente, Salida al bano o Regreso del bano. Todo queda registrado al instante en tu panel." },
          ].map((paso) => (
            <div key={paso.num} style={{ textAlign: "center", padding: "32px 24px", background: "#f8fafc", borderRadius: "20px", border: "1px solid #e2e8f0" }}>
              <div style={{ width: "48px", height: "48px", background: "linear-gradient(135deg, #667eea, #764ba2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "white", fontWeight: "800", fontSize: "18px" }}>{paso.num}</div>
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>{paso.icon}</div>
              <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#1e293b", marginBottom: "8px" }}>{paso.title}</h3>
              <p style={{ color: "#64748b", fontSize: "15px", lineHeight: 1.6, margin: 0 }}>{paso.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ background: "linear-gradient(135deg, #0a0f1e 0%, #1e1b4b 100%)", padding: "80px 32px", color: "white" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: "36px", fontWeight: "800", marginBottom: "48px" }}>Todo lo que necesitas</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "24px" }}>
            {[
              { icon: "✅", title: "Asistencia en tiempo real", desc: "Ve quien esta presente, quien salio al bano y quien falta, todo en vivo." },
              { icon: "🚻", title: "Control de bano", desc: "Registra salidas y regresos del bano con un solo escaneo." },
              { icon: "📊", title: "Exporta a Excel", desc: "Descarga el registro de asistencia en Excel con un clic." },
              { icon: "📱", title: "Funciona en celular", desc: "Los alumnos usan su celular para escanear, sin apps extra." },
              { icon: "🔒", title: "Sin duplicados", desc: "El sistema detecta automaticamente si un alumno ya registro asistencia." },
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
            <div style={{ fontSize: "48px", fontWeight: "800", color: "#667eea", margin: "0 0 4px 0" }}>$499</div>
            <p style={{ color: "#64748b", marginBottom: "24px" }}>al ano (~$42/mes)</p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px 0" }}>
              {["Grupos ilimitados", "Alumnos ilimitados", "Codigos QR", "Asistencia en tiempo real", "Exportar a Excel", "Soporte prioritario"].map((f) => (
                <li key={f} style={{ padding: "8px 0", color: "#475569", fontSize: "15px", borderBottom: "1px solid #f1f5f9" }}>✅ {f}</li>
              ))}
            </ul>
            <a href="/registro" style={{ display: "block", background: "linear-gradient(135deg, #667eea, #764ba2)", color: "white", padding: "14px", borderRadius: "10px", textDecoration: "none", fontWeight: "700", textAlign: "center" }}>Empezar ahora</a>
          </div>
        </div>
      </section>

      <section style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", padding: "80px 32px", textAlign: "center", color: "white" }}>
        <h2 style={{ fontSize: "36px", fontWeight: "800", margin: "0 0 16px 0" }}>Lista para modernizar tu lista de asistencia?</h2>
        <p style={{ fontSize: "18px", opacity: 0.9, marginBottom: "32px" }}>Unete a los maestros que ya usan PasaLista</p>
        <a href="/registro" style={{ background: "white", color: "#667eea", padding: "16px 40px", borderRadius: "12px", textDecoration: "none", fontSize: "20px", fontWeight: "800", boxShadow: "0 4px 20px rgba(0,0,0,0.2)", display: "inline-block" }}>Empezar gratis ahora</a>
      </section>

      <footer style={{ background: "#0a0f1e", color: "#64748b", padding: "32px", textAlign: "center", fontSize: "14px" }}>
        <div style={{ marginBottom: "8px", fontSize: "18px", fontWeight: "700", color: "white" }}>PasaLista</div>
        <p style={{ margin: 0 }}>2026 PasaLista · Todos los derechos reservados</p>
      </footer>

    </main>
  );
}

