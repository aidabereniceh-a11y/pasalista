import QRCode from 'qrcode'

interface Alumno {
  id: string
  nombre: string
}

interface Grupo {
  nombre: string
  grado?: string
}

export async function generarGafetesPDF(
  alumnos: Alumno[],
  grupo: Grupo
): Promise<void> {
  const titulo = grupo.grado ? `${grupo.nombre} — ${grupo.grado}` : grupo.nombre

  // Generar QRs como base64
  const gafetes = await Promise.all(
    alumnos.map(async (alumno) => {
      const qrUrl = `https://pasalista.mx/qr/${alumno.id}`
      const qrDataUrl = await QRCode.toDataURL(qrUrl, {
        width: 200,
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
        body { font-family: Arial, sans-serif; background: white; }
        .grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0;
          width: 216mm;
        }
        .gafete {
          width: 108mm;
          height: 70mm;
          border: 1px solid #1a6b3c;
          display: flex;
          flex-direction: column;
          align-items: center;
          overflow: hidden;
          page-break-inside: avoid;
        }
        .encabezado {
          width: 100%;
          background: #1a6b3c;
          color: white;
          text-align: center;
          font-size: 8px;
          font-weight: bold;
          padding: 3px 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .qr {
          width: 44mm;
          height: 44mm;
          margin: 2mm 0 1mm 0;
        }
        .nombre {
          font-size: 9px;
          font-weight: bold;
          text-align: center;
          padding: 0 4px;
          color: #0f1923;
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        @media print {
          @page { size: letter; margin: 0; }
          body { width: 216mm; }
        }
      </style>
    </head>
    <body>
      <div class="grid">
        ${gafetes.map(g => `
          <div class="gafete">
            <div class="encabezado">${titulo}</div>
            <img class="qr" src="${g.qrDataUrl}" alt="QR ${g.nombre}" />
            <div class="nombre">${g.nombre}</div>
          </div>
        `).join('')}
      </div>
      <script>
        window.onload = function() {
          window.print();
          setTimeout(function() { window.close(); }, 1000);
        }
      </script>
    </body>
    </html>
  `

  const ventana = window.open('', '_blank', 'width=900,height=700')
  if (ventana) {
    ventana.document.write(html)
    ventana.document.close()
  }
}