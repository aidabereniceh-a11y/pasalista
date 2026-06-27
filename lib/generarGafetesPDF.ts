import jsPDF from 'jspdf'
import QRCode from 'qrcode'

interface Alumno {
  id: string
  nombre: string
}

interface Grupo {
  nombre: string
  grado?: string
}

const HOJA_W = 215.9
const HOJA_H = 279.4
const COLS   = 2
const ROWS   = 4
const GAF_W  = HOJA_W / COLS
const GAF_H  = HOJA_H / ROWS
const PADDING = 4

export async function generarGafetesPDF(
  alumnos: Alumno[],
  grupo: Grupo
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter',
  })

  for (let i = 0; i < alumnos.length; i++) {
    const alumno = alumnos[i]
    const col = i % COLS
    const row = Math.floor(i / COLS) % ROWS
    const x   = col * GAF_W
    const y   = row * GAF_H

    if (i > 0 && i % (COLS * ROWS) === 0) {
      doc.addPage()
    }

    // Marco del gafete
    doc.setDrawColor(26, 107, 60)
    doc.setLineWidth(0.5)
    doc.rect(x + 1, y + 1, GAF_W - 2, GAF_H - 2)

    // Franja verde superior
    doc.setFillColor(26, 107, 60)
    doc.rect(x + 1, y + 1, GAF_W - 2, 10, 'F')

    // Nombre del grupo en la franja
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    const titulo = grupo.grado ? `${grupo.nombre} — ${grupo.grado}` : grupo.nombre
    doc.text(titulo, x + GAF_W / 2, y + 7, {
      align: 'center',
      maxWidth: GAF_W - PADDING * 2,
    })

    // QR del alumno
    const qrUrl = `https://pasalista.mx/qr/${alumno.id}`
    const qrDataUrl = await QRCode.toDataURL(qrUrl, {
      width: 200,
      margin: 1,
      color: { dark: '#0f1923', light: '#ffffff' },
    })

    const qrSize = GAF_H - 10 - 18 - PADDING * 2
    const qrX    = x + (GAF_W - qrSize) / 2
    const qrY    = y + 13

    doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize)

    // Nombre del alumno
    doc.setTextColor(15, 25, 35)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    const nombreMostrar = alumno.nombre.length > 28
      ? alumno.nombre.substring(0, 26) + '…'
      : alumno.nombre
    doc.text(nombreMostrar, x + GAF_W / 2, y + GAF_H - PADDING - 2, {
      align: 'center',
    })

    // Líneas de corte
    doc.setDrawColor(200, 200, 200)
    doc.setLineWidth(0.1)
    if (col === 0) doc.line(x + GAF_W, y, x + GAF_W, y + GAF_H)
    if (row < ROWS - 1) doc.line(x, y + GAF_H, x + GAF_W * COLS, y + GAF_H)
  }

  const nombreArchivo = `gafetes-${grupo.nombre.replace(/\s+/g, '-').toLowerCase()}.pdf`
  doc.save(nombreArchivo)
}