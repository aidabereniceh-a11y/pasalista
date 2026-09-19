export const runtime = "edge";

export default function TerminosYCondiciones() {
  return (
    <main style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "Arial, sans-serif", color: "#1e293b" }}>
      <div style={{ background: "linear-gradient(135deg, #0a0f1e 0%, #1e1b4b 100%)", padding: "40px 24px", color: "white" }}>
        <div style={{ maxWidth: "780px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 800, margin: 0 }}>Términos y Condiciones de Uso</h1>
          <p style={{ color: "#94a3b8", fontSize: "14px", marginTop: "8px" }}>Pasalista · pasalista.mx</p>
          <p style={{ color: "#94a3b8", fontSize: "13px" }}>Última actualización: {new Date().toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })}</p>
        </div>
      </div>

      <div style={{ maxWidth: "780px", margin: "0 auto", padding: "32px 24px 80px 24px", lineHeight: 1.7, fontSize: "15px" }}>

        <p>
          Bienvenido(a) a Pasalista ("la Plataforma", "el Servicio"), operado por Pasalista.mx ("nosotros", "el Responsable").
          Estos Términos y Condiciones ("los Términos") rigen el acceso y uso de la Plataforma por parte de cualquier persona
          que se registre o utilice el Servicio ("el Usuario", "el Maestro"). Al crear una cuenta o utilizar Pasalista, el
          Usuario declara haber leído, entendido y aceptado estos Términos en su totalidad. Si no está de acuerdo, debe
          abstenerse de usar la Plataforma.
        </p>

        <h2 style={sectionStyle}>1. Descripción del servicio</h2>
        <p>
          Pasalista es una herramienta digital de apoyo para el pase de lista y control de asistencia escolar mediante
          códigos QR, dirigida a maestros y personal educativo. El Servicio permite crear grupos, registrar alumnos,
          generar códigos QR, tomar asistencia, generar reportes y gestionar gafetes, entre otras funciones que se
          describen dentro de la propia Plataforma.
        </p>
        <p>
          Pasalista es una herramienta de apoyo administrativo y <strong>no sustituye</strong> los mecanismos oficiales de
          control escolar que la institución educativa esté obligada a llevar conforme a la normatividad aplicable (SEP u
          otra autoridad correspondiente).
        </p>

        <h2 style={sectionStyle}>2. Registro y cuenta del usuario</h2>
        <p>
          Para usar Pasalista, el Usuario debe crear una cuenta proporcionando información veraz. El Usuario es responsable
          de mantener la confidencialidad de sus credenciales de acceso y de toda actividad que ocurra bajo su cuenta.
          Pasalista no es responsable por accesos no autorizados derivados de que el Usuario comparta su usuario y
          contraseña, o de que deje su sesión abierta en dispositivos compartidos o de terceros.
        </p>

        <h2 style={sectionStyle}>3. Responsabilidad sobre los datos capturados</h2>
        <p>
          El Usuario es el <strong>único responsable</strong> de la información que captura, sube o registra dentro de la
          Plataforma, incluyendo (sin limitar) nombres de alumnos, grados, grupos y registros de asistencia. Al usar
          Pasalista, el Usuario declara y garantiza que:
        </p>
        <ul style={listStyle}>
          <li>Cuenta con la autorización, facultad o relación (como maestro, tutor de grupo o personal escolar) necesaria para capturar los datos de los alumnos que registre.</li>
          <li>Es su responsabilidad, como maestro o institución, obtener el consentimiento de los padres o tutores de los alumnos menores de edad cuya información sea capturada, cuando dicho consentimiento sea legalmente requerido.</li>
          <li>La información capturada es veraz y se mantiene actualizada.</li>
        </ul>
        <p>
          <strong>Recomendación importante:</strong> para reducir la exposición de datos personales de menores de edad,
          se recomienda al Usuario registrar a los alumnos utilizando únicamente su nombre de pila y la inicial del
          apellido (por ejemplo, "Juan P."), en lugar de su nombre completo, salvo que la institución educativa requiera
          expresamente lo contrario.
        </p>

        <h2 style={sectionStyle}>4. Planes, pagos y cancelaciones</h2>
        <p>
          Pasalista ofrece un plan gratuito con funcionalidad limitada y un plan de pago ("Premium") con funcionalidad
          ampliada, conforme a los precios y condiciones vigentes mostrados dentro de la Plataforma al momento de la
          contratación. Los pagos pueden realizarse mediante suscripción automática recurrente o mediante pago único,
          según la opción que el Usuario elija. El Usuario puede cancelar su suscripción automática en cualquier momento
          desde su panel; la cancelación detiene cobros futuros, pero no genera reembolsos por el periodo ya pagado, salvo
          que la ley aplicable disponga lo contrario.
        </p>

        <h2 style={sectionStyle}>5. Uso bajo responsabilidad del usuario / Deslinde de responsabilidad</h2>
        <p>
          <strong>
            El uso de Pasalista es responsabilidad exclusiva de quien lo utiliza. El Servicio se ofrece "tal cual" ("as is")
            y "según disponibilidad", sin garantías de ningún tipo, expresas o implícitas.
          </strong>
        </p>
        <p>
          En la máxima medida permitida por la legislación aplicable, Pasalista.mx, sus desarrolladores, colaboradores y
          representantes:
        </p>
        <ul style={listStyle}>
          <li>No serán responsables, civil o penalmente, por el uso que el Usuario haga de la Plataforma, ni por la información que el Usuario capture, almacene, comparta o elimine a través de ella.</li>
          <li>No serán responsables por decisiones tomadas por el Usuario, por terceros, por la institución educativa o por cualquier autoridad, con base en los reportes, registros o información generada por la Plataforma.</li>
          <li>No garantizan que el Servicio esté libre de errores, interrupciones, pérdida de datos o fallas técnicas, aunque se realizan esfuerzos razonables para mantener su buen funcionamiento y respaldo de la información.</li>
          <li>No serán responsables por daños directos, indirectos, incidentales o consecuentes derivados del uso o la imposibilidad de uso del Servicio.</li>
        </ul>
        <p>
          Cualquier responsabilidad legal derivada del contenido, veracidad o consecuencias del uso de la información
          capturada en la Plataforma corresponde exclusivamente al Usuario que la generó o capturó, en su carácter de
          responsable directo de dicha información.
        </p>
        <p style={{ fontSize: "13px", color: "#64748b" }}>
          Nota: conforme a la legislación mexicana, la responsabilidad penal es personal e intransferible, por lo que este
          deslinde aplica en la medida permitida por la ley; no exime a ninguna persona de responsabilidades penales que
          le sean legalmente atribuibles por sus propios actos.
        </p>

        <h2 style={sectionStyle}>6. Propiedad intelectual</h2>
        <p>
          El software, diseño, marca, logotipos y demás elementos de Pasalista son propiedad de sus desarrolladores. El
          Usuario conserva la titularidad de los datos que ingresa (nombres de alumnos, registros, etc.), y únicamente
          otorga a Pasalista el derecho de almacenar y procesar dicha información con el único fin de prestar el Servicio.
        </p>

        <h2 style={sectionStyle}>7. Modificaciones</h2>
        <p>
          Pasalista podrá modificar estos Términos, el Servicio o sus planes en cualquier momento. Los cambios relevantes
          se notificarán a través de la Plataforma o por correo electrónico. El uso continuado del Servicio después de una
          modificación constituye la aceptación de los nuevos Términos.
        </p>

        <h2 style={sectionStyle}>8. Terminación</h2>
        <p>
          Pasalista podrá suspender o cancelar cuentas que incumplan estos Términos, que hagan un uso indebido de la
          Plataforma, o por falta de pago en el caso de cuentas Premium. El Usuario puede cancelar su cuenta en cualquier
          momento.
        </p>

        <h2 style={sectionStyle}>9. Legislación aplicable</h2>
        <p>
          Estos Términos se rigen por las leyes de los Estados Unidos Mexicanos. Cualquier controversia relacionada con
          el Servicio se someterá a los tribunales competentes en México.
        </p>

        <h2 style={sectionStyle}>10. Contacto</h2>
        <p>
          Para dudas relacionadas con estos Términos, puede contactarnos desde la sección de ayuda dentro de la
          aplicación (menú principal del panel del maestro).
        </p>

        <div style={{ marginTop: "48px", borderTop: "1px solid #e2e8f0", paddingTop: "20px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <a href="/dashboard" style={{ color: "#64748b", fontWeight: 600, textDecoration: "none" }}>← Volver al dashboard</a>
          <a href="/aviso-de-privacidad" style={{ color: "#4f46e5", fontWeight: 600, textDecoration: "none" }}>Ver Aviso de Privacidad →</a>
        </div>
      </div>
    </main>
  );
}

const sectionStyle: React.CSSProperties = { fontSize: "18px", fontWeight: 700, marginTop: "32px", marginBottom: "8px", color: "#1e1b4b" };
const listStyle: React.CSSProperties = { paddingLeft: "22px", margin: "8px 0" };