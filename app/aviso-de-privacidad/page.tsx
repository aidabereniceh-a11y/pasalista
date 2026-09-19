export const runtime = "edge";

export default function AvisoDePrivacidad() {
  return (
    <main style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "Arial, sans-serif", color: "#1e293b" }}>
      <div style={{ background: "linear-gradient(135deg, #0a0f1e 0%, #1e1b4b 100%)", padding: "40px 24px", color: "white" }}>
        <div style={{ maxWidth: "780px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 800, margin: 0 }}>Aviso de Privacidad</h1>
          <p style={{ color: "#94a3b8", fontSize: "14px", marginTop: "8px" }}>Pasalista · pasalista.mx</p>
          <p style={{ color: "#94a3b8", fontSize: "13px" }}>Última actualización: {new Date().toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })}</p>
        </div>
      </div>

      <div style={{ maxWidth: "780px", margin: "0 auto", padding: "32px 24px 80px 24px", lineHeight: 1.7, fontSize: "15px" }}>

        <p>
          En cumplimiento de la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) y
          su Reglamento, Pasalista.mx ("el Responsable") pone a disposición el presente Aviso de Privacidad.
        </p>

        <h2 style={sectionStyle}>1. Identidad y domicilio del responsable</h2>
        <p>
          Pasalista.mx es el responsable del tratamiento de los datos personales que se recaban a través de la plataforma
          pasalista.mx. Para cualquier duda relacionada con este Aviso, puede contactarnos desde la sección de ayuda
          dentro de la aplicación (menú principal del panel del maestro).
        </p>

        <h2 style={sectionStyle}>2. Datos personales que se recaban</h2>
        <p><strong>Del maestro o usuario que se registra:</strong></p>
        <ul style={listStyle}>
          <li>Nombre</li>
          <li>Correo electrónico</li>
          <li>Datos necesarios para procesar pagos (gestionados directamente por la pasarela de pago; Pasalista no almacena números completos de tarjeta)</li>
        </ul>
        <p><strong>De los alumnos, capturados por el maestro:</strong></p>
        <ul style={listStyle}>
          <li>Nombre del alumno (se recomienda al maestro capturar únicamente nombre e inicial del apellido, ver sección 6)</li>
          <li>Grado y grupo</li>
          <li>Registros de asistencia (presente, ausente, retardo, justificado, salidas al baño)</li>
        </ul>
        <p>
          Dado que estos datos pueden corresponder a menores de edad, se consideran datos sensibles y son tratados con
          medidas de seguridad razonables. La responsabilidad de contar con el consentimiento correspondiente de los
          padres o tutores para el tratamiento de los datos de un menor recae en el maestro o institución educativa que
          los captura, en su carácter de responsable directo frente a los padres de familia.
        </p>

        <h2 style={sectionStyle}>3. Finalidades del tratamiento</h2>
        <p>Los datos se utilizan para:</p>
        <ul style={listStyle}>
          <li>Crear y administrar la cuenta del maestro</li>
          <li>Prestar el servicio de registro y control de asistencia escolar</li>
          <li>Generar reportes de asistencia y códigos QR / gafetes</li>
          <li>Procesar pagos de planes Premium y gafetes</li>
          <li>Enviar comunicaciones relacionadas con el servicio (confirmaciones, avisos de vigencia, soporte)</li>
        </ul>
        <p>No utilizamos los datos de los alumnos con fines de mercadotecnia ni los compartimos con fines publicitarios.</p>

        <h2 style={sectionStyle}>4. Transferencia de datos</h2>
        <p>
          Sus datos no serán vendidos ni transferidos a terceros para fines distintos a los aquí señalados, salvo con
          proveedores de servicios estrictamente necesarios para operar la Plataforma, tales como:
        </p>
        <ul style={listStyle}>
          <li>El proveedor de base de datos e infraestructura en la nube (Supabase / Cloudflare)</li>
          <li>La pasarela de procesamiento de pagos (MercadoPago)</li>
        </ul>
        <p>Estos proveedores procesan la información únicamente para permitir el funcionamiento del Servicio.</p>

        <h2 style={sectionStyle}>5. Derechos ARCO</h2>
        <p>
          El titular de los datos personales (el maestro registrado) tiene derecho a Acceder, Rectificar, Cancelar u
          Oponerse (derechos ARCO) al tratamiento de sus datos personales. Para ejercer estos derechos, puede enviar una
          solicitud desde la sección de ayuda dentro de la aplicación, indicando su nombre, el derecho que desea ejercer
          y una descripción clara de su solicitud.
        </p>
        <p>
          Respecto a los datos de los alumnos, las solicitudes de acceso, rectificación o cancelación deben ser
          canalizadas a través del maestro o institución educativa responsable de haber capturado dicha información,
          quien podrá a su vez solicitar la corrección o baja del registro directamente desde la Plataforma.
        </p>

        <h2 style={sectionStyle}>6. Recomendación de minimización de datos de menores</h2>
        <p>
          Con el fin de proteger la privacidad de los alumnos, se recomienda a los maestros registrar a los estudiantes
          utilizando únicamente su nombre de pila y la inicial de su apellido (por ejemplo, "Juan P."), en lugar de su
          nombre completo, salvo que la institución educativa requiera lo contrario para fines de identificación oficial.
        </p>

        <h2 style={sectionStyle}>7. Uso de almacenamiento local</h2>
        <p>
          La Plataforma utiliza el almacenamiento local del navegador (localStorage) únicamente para mantener la sesión
          iniciada del maestro en su propio dispositivo. No se utiliza para fines de rastreo publicitario.
        </p>

        <h2 style={sectionStyle}>8. Cambios al aviso de privacidad</h2>
        <p>
          Este Aviso de Privacidad puede actualizarse periódicamente. Cualquier cambio será publicado en esta misma
          página, indicando la fecha de la última actualización.
        </p>

        <h2 style={sectionStyle}>9. Contacto</h2>
        <p>
          Para cualquier duda relacionada con el tratamiento de sus datos personales, contáctenos desde la sección de
          ayuda dentro de la aplicación.
        </p>

        <div style={{ marginTop: "48px", borderTop: "1px solid #e2e8f0", paddingTop: "20px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <a href="/dashboard" style={{ color: "#64748b", fontWeight: 600, textDecoration: "none" }}>← Volver al dashboard</a>
          <a href="/terminos-y-condiciones" style={{ color: "#4f46e5", fontWeight: 600, textDecoration: "none" }}>Ver Términos y Condiciones →</a>
        </div>
      </div>
    </main>
  );
}

const sectionStyle: React.CSSProperties = { fontSize: "18px", fontWeight: 700, marginTop: "32px", marginBottom: "8px", color: "#1e1b4b" };
const listStyle: React.CSSProperties = { paddingLeft: "22px", margin: "8px 0" };