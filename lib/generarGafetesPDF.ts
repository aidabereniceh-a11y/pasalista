import QRCode from 'qrcode'

interface Alumno {
  id: string
  nombre: string
}

interface Grupo {
  nombre: string
  grado?: string
}

interface Maestro {
  nombre: string
  email: string
}

export async function generarGafetesPDF(
  alumnos: Alumno[],
  grupo: Grupo,
  maestro: Maestro
): Promise<void> {
  const titulo = grupo.grado ? `${grupo.grado}° — Grupo ${grupo.nombre}` : grupo.nombre

  const gafetes = await Promise.all(
    alumnos.map(async (alumno) => {
      const qrUrl = `https://pasalista.mx/checkin/${alumno.id}`
      const qrDataUrl = await QRCode.toDataURL(qrUrl, {
        width: 300,
        margin: 1,
        color: { dark: '#0f1923', light: '#ffffff' },
      })
      return { ...alumno, qrDataUrl }
    })
  )

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Gafetes — ${titulo}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: Arial, sans-serif; 
          background: white;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(2, 340px);
          gap: 12px;
          padding: 20px;
          width: 720px;
          margin: 0 auto;
        }
        .gafete {
  width: 100%;
  height: 300px;
  break-inside: avoid;
  border: 2px solid #1a6b3c;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
}
        .encabezado {
          width: 100%;
          background: #1a6b3c;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          color: white;
          text-align: center;
          font-size: 11px;
          font-weight: bold;
          padding: 7px 8px;
          letter-spacing: 1px;
        }
        .maestra-area {
          width: 100%;
          background: #f0f7f3;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          text-align: center;
          padding: 5px 8px;
          font-size: 10px;
          color: #1a6b3c;
          font-weight: bold;
          border-bottom: 1px solid #c3dfc9;
        }
        .qr {
          width: 150px;
          height: 150px;
          margin: 6px auto;
          display: block;
        }
        .nombre {
          font-size: 14px;
          font-weight: bold;
          text-align: center;
          padding: 0 10px;
          color: #0f1923;
          line-height: 1.3;
          margin-bottom: 4px;
        }
        .grupo-label {
          font-size: 11px;
          color: #6b7280;
          text-align: center;
          margin-bottom: 4px;
        }
        .scan-label {
          font-size: 9px;
          color: #9ca3af;
          text-align: center;
          font-style: italic;
        }
        .footer {
          width: 100%;
          background: #1a6b3c;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          color: white;
          text-align: center;
          font-size: 9px;
          padding: 5px;
          margin-top: auto;
          letter-spacing: 1px;
        }
        @media print {
          @page { 
            size: letter portrait; 
            margin: 8mm;
          }
          body { width: 100%; }
          .grid {
  display: grid;
  grid-template-columns: repeat(2, 340px);
  gap: 8px;
  padding: 12px;
  width: 720px;
  margin: 0 auto;
}
          .gafete {
            width: 340px;
            height: 320px;
            break-inside: avoid;
            border: 2px solid #1a6b3c;
            border-radius: 8px;
            display: flex;
            flex-direction: column;
            align-items: center;
            overflow: hidden;
          }
          .qr {
            width: 180px;
            height: 180px;
            margin: 8px auto;
            display: block;
          }
          .encabezado {
            background: #1a6b3c !important;
            color: white !important;
          }
          .maestra-area {
            background: #f0f7f3 !important;
            color: #1a6b3c !important;
          }
          .footer {
            background: #1a6b3c !important;
            color: white !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="grid">
        ${gafetes.map(g => `
          <div class="gafete">
            <div class="encabezado">GAFETE DE ASISTENCIA</div>
            <div class="maestra-area">
              Maestra: ${maestro.nombre} &nbsp;|&nbsp; ${titulo}
            </div>
            <img class="qr" src="${g.qrDataUrl}" alt="QR ${g.nombre}" />
            <div class="nombre">${g.nombre}</div>
            <div class="grupo-label">${titulo}</div>
            <div class="scan-label">Escanear al entrar al salón</div>
            <div class="footer">pasalista.mx</div>
          </div>
        `).join('')}
      </div>
      <script>
        window.onload = function() {
          window.print();
          setTimeout(function() { window.close(); }, 1500);
        }
      </script>
    </body>
    </html>
  `

  const ventana = window.open('', '_blank', 'width=800,height=700')
  if (ventana) {
    ventana.document.write(html)
    ventana.document.close()
  }
}