// Colocar en: lib/generarGafetesPDF.ts
// Genera los gafetes con QR y los abre en una ventana lista para imprimir.
// IMPORTANTE: el contenido del QR NO cambia (https://pasalista.mx/checkin/ID),
// así que los gafetes que ya están impresos siguen funcionando.
import QRCode from 'qrcode'

export interface Alumno {
  id: string | number
  nombre: string
}

export interface Grupo {
  nombre: string
  grado?: string
}

export interface Maestro {
  nombre: string
  email: string
}

export interface AlumnoConQR extends Alumno {
  qrDataUrl: string
}

export type Diseno = 'clasico' | 'moderno' | 'infantil' | 'minimalista'
export type Tamano = 'credencial' | 'mediano' | 'grande'

export interface OpcionesGafete {
  color: string
  diseno: Diseno
  tamano: Tamano
  escuela: string
  cicloEscolar: string
  tratamiento: string
  mostrarMaestro: boolean
}

export const OPCIONES_DEFAULT: OpcionesGafete = {
  color: '#1a6b3c',
  diseno: 'clasico',
  tamano: 'mediano',
  escuela: '',
  cicloEscolar: '',
  tratamiento: 'Maestra',
  mostrarMaestro: true,
}

export const COLORES: { nombre: string; valor: string }[] = [
  { nombre: 'Verde', valor: '#1a6b3c' },
  { nombre: 'Azul', valor: '#1d4ed8' },
  { nombre: 'Morado', valor: '#6d28d9' },
  { nombre: 'Rosa', valor: '#db2777' },
  { nombre: 'Rojo', valor: '#dc2626' },
  { nombre: 'Naranja', valor: '#ea580c' },
  { nombre: 'Turquesa', valor: '#0f766e' },
  { nombre: 'Café', valor: '#92400e' },
  { nombre: 'Gris', valor: '#334155' },
  { nombre: 'Negro', valor: '#111827' },
]

export const DISENOS: { valor: Diseno; nombre: string; descripcion: string }[] = [
  { valor: 'clasico', nombre: 'Clásico', descripcion: 'Franjas de color arriba y abajo' },
  { valor: 'moderno', nombre: 'Moderno', descripcion: 'Fondo de color completo' },
  { valor: 'infantil', nombre: 'Infantil', descripcion: 'Bordes redondeados y estrellitas' },
  { valor: 'minimalista', nombre: 'Minimalista', descripcion: 'Casi sin color, ahorra tinta' },
]

// Medidas en milímetros. La hoja carta con márgenes de 8 mm deja ~200 × 263 mm útiles.
export const TAMANOS: Record<Tamano, { nombre: string; descripcion: string; ancho: number; alto: number; columnas: number; filas: number; qr: number }> = {
  credencial: { nombre: 'Credencial', descripcion: '8.6 × 5.4 cm · 8 por hoja', ancho: 86, alto: 54, columnas: 2, filas: 4, qr: 36 },
  mediano: { nombre: 'Mediano', descripcion: '9 × 8.2 cm · 6 por hoja', ancho: 90, alto: 82, columnas: 2, filas: 3, qr: 40 },
  grande: { nombre: 'Grande (para colgar)', descripcion: '9.5 × 12.5 cm · 4 por hoja', ancho: 95, alto: 125, columnas: 2, filas: 2, qr: 62 },
}

// ---------- utilidades ----------

function esc(texto: string | number | undefined | null): string {
  return String(texto ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function hexARgb(hex: string): [number, number, number] {
  const limpio = hex.replace('#', '')
  const completo = limpio.length === 3 ? limpio.split('').map((c) => c + c).join('') : limpio
  const n = parseInt(completo, 16)
  if (isNaN(n)) return [26, 107, 60]
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

// Mezcla el color con blanco (0 = color puro, 1 = blanco)
function aclarar(hex: string, cantidad: number): string {
  const [r, g, b] = hexARgb(hex)
  const m = (c: number) => Math.round(c + (255 - c) * cantidad)
  return `rgb(${m(r)}, ${m(g)}, ${m(b)})`
}

// Texto blanco o negro según qué tan claro es el color de fondo
function textoSobre(hex: string): string {
  const [r, g, b] = hexARgb(hex)
  const luminancia = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminancia > 0.62 ? '#111827' : '#ffffff'
}

export function tituloGrupo(grupo: Grupo): string {
  return grupo.grado ? `${grupo.grado}° — Grupo ${grupo.nombre}` : grupo.nombre
}

// ---------- QR ----------

export async function prepararQRs(alumnos: Alumno[]): Promise<AlumnoConQR[]> {
  return Promise.all(
    alumnos.map(async (alumno) => {
      const qrUrl = `https://pasalista.mx/checkin/${alumno.id}`
      const qrDataUrl = await QRCode.toDataURL(qrUrl, {
        width: 400,
        margin: 1,
        color: { dark: '#0f1923', light: '#ffffff' },
      })
      return { ...alumno, qrDataUrl }
    })
  )
}

// ---------- HTML ----------

function estilos(o: OpcionesGafete): string {
  const t = TAMANOS[o.tamano] || TAMANOS.mediano
  const c = /^#[0-9a-fA-F]{3,6}$/.test(o.color) ? o.color : OPCIONES_DEFAULT.color
  const sobreC = textoSobre(c)
  const claro = aclarar(c, 0.9)
  const medio = aclarar(c, 0.7)
  const horizontal = o.tamano === 'credencial'

  const escala = o.tamano === 'grande' ? 1.25 : o.tamano === 'credencial' ? 0.85 : 1

  return `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { background: white; }
    body { font-family: Arial, Helvetica, sans-serif; color: #0f1923; }
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }

    .pagina {
      display: grid;
      grid-template-columns: repeat(${t.columnas}, ${t.ancho}mm);
      grid-auto-rows: ${t.alto}mm;
      gap: 4mm;
      justify-content: center;
      padding: 4mm 0;
      page-break-after: always;
      break-after: page;
    }
    .pagina:last-child { page-break-after: auto; break-after: auto; }

    .gafete {
      width: ${t.ancho}mm;
      height: ${t.alto}mm;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      break-inside: avoid;
      page-break-inside: avoid;
      position: relative;
    }
    .encabezado {
      text-align: center;
      font-weight: bold;
      font-size: ${(horizontal ? 7.5 : 9) * escala}pt;
      letter-spacing: 0.5px;
      padding: ${horizontal ? '1.2mm 3mm' : '2mm 3mm'};
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .cuerpo {
      flex: 1;
      display: flex;
      flex-direction: ${horizontal ? 'row' : 'column'};
      align-items: center;
      justify-content: center;
      gap: ${horizontal ? '3mm' : '1.5mm'};
      padding: ${horizontal ? '1.5mm 3mm' : '2mm 3mm'};
      min-height: 0;
      overflow: hidden;
    }
    .qr-caja {
      background: #ffffff;
      padding: 1.2mm;
      flex-shrink: 0;
      line-height: 0;
    }
    .qr { width: ${t.qr}mm; height: ${t.qr}mm; display: block; }
    .info {
      display: flex;
      flex-direction: column;
      align-items: ${horizontal ? 'flex-start' : 'center'};
      text-align: ${horizontal ? 'left' : 'center'};
      gap: 0.8mm;
      min-width: 0;
      ${horizontal ? 'flex: 1;' : 'width: 100%;'}
    }
    .nombre {
      font-weight: bold;
      font-size: ${(horizontal ? 10 : 11.5) * escala}pt;
      line-height: 1.2;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      word-break: break-word;
    }
    .grupo-label { font-size: ${(horizontal ? 7.5 : 8.5) * escala}pt; font-weight: bold; }
    .maestro { font-size: ${(horizontal ? 7 : 7.5) * escala}pt; }
    .scan-label { font-size: ${(horizontal ? 6 : 6.5) * escala}pt; font-style: italic; opacity: 0.75; }
    .footer {
      text-align: center;
      font-size: ${(horizontal ? 6 : 7) * escala}pt;
      padding: ${horizontal ? '0.8mm' : '1.2mm'};
      letter-spacing: 0.5px;
    }

    /* ----- Clásico ----- */
    .d-clasico { border: 0.5mm solid ${c}; border-radius: 2.5mm; background: #fff; }
    .d-clasico .encabezado, .d-clasico .footer { background: ${c}; color: ${sobreC}; }
    .d-clasico .grupo-label { color: ${c}; }
    .d-clasico .maestro { color: #4b5563; }
    .d-clasico .scan-label { color: #6b7280; }

    /* ----- Moderno ----- */
    .d-moderno { background: ${c}; color: ${sobreC}; border-radius: 3mm; }
    .d-moderno .encabezado { color: ${sobreC}; opacity: 0.9; }
    .d-moderno .qr-caja { border-radius: 2.5mm; padding: 2mm; }
    .d-moderno .footer { background: rgba(0,0,0,0.18); color: ${sobreC}; }

    /* ----- Infantil ----- */
    .d-infantil {
      background: ${claro};
      border: 1mm dashed ${c};
      border-radius: 6mm;
      font-family: 'Comic Sans MS', 'Chalkboard SE', 'Trebuchet MS', Arial, sans-serif;
    }
    .d-infantil .encabezado { color: ${c}; }
    .d-infantil .qr-caja { border-radius: 3mm; border: 0.6mm solid ${medio}; }
    .d-infantil .nombre { color: ${c}; }
    .d-infantil .grupo-label { color: #374151; }
    .d-infantil .maestro, .d-infantil .scan-label { color: #4b5563; }
    .d-infantil .footer { color: ${c}; }
    .d-infantil .estrella { position: absolute; color: ${c}; font-size: ${10 * escala}pt; line-height: 1; opacity: 0.8; }
    .d-infantil .e1 { top: 2mm; left: 3mm; }
    .d-infantil .e2 { top: 2mm; right: 3mm; }
    .d-infantil .e3 { bottom: 2mm; left: 3mm; }
    .d-infantil .e4 { bottom: 2mm; right: 3mm; }
    .estrella { display: none; }
    .d-infantil .estrella { display: block; }

    /* ----- Minimalista ----- */
    .d-minimalista { border: 0.3mm solid #111827; border-radius: 1.5mm; background: #fff; }
    .d-minimalista .encabezado { border-bottom: 0.3mm solid #111827; color: #111827; }
    .d-minimalista .footer { border-top: 0.3mm solid #d1d5db; color: #6b7280; }
    .d-minimalista .grupo-label { color: #111827; }
    .d-minimalista .maestro, .d-minimalista .scan-label { color: #4b5563; }

    @page { size: letter portrait; margin: 8mm; }
    @media screen {
      body { background: #e5e7eb; padding: 6mm 0; }
      .pagina { background: white; width: 216mm; margin: 0 auto 6mm; padding: 8mm 0; box-shadow: 0 1px 4px rgba(0,0,0,0.15); }
      body.vista-previa { background: transparent; padding: 0; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
      body.vista-previa .pagina { background: transparent; width: auto; box-shadow: none; margin: 0; padding: 0; display: block; }
    }
  `
}

function tarjeta(g: AlumnoConQR, grupo: Grupo, maestro: Maestro, o: OpcionesGafete): string {
  const titulo = tituloGrupo(grupo)
  const encabezado = o.escuela.trim() ? o.escuela.trim().toUpperCase() : 'GAFETE DE ASISTENCIA'
  const pie = o.cicloEscolar.trim() ? `Ciclo ${o.cicloEscolar.trim()} · pasalista.mx` : 'pasalista.mx'
  const lineaMaestro = o.mostrarMaestro && maestro.nombre
    ? `<div class="maestro">${esc(o.tratamiento || 'Docente')}: ${esc(maestro.nombre)}</div>`
    : ''

  return `
    <div class="gafete d-${o.diseno}">
      <span class="estrella e1">★</span><span class="estrella e2">★</span>
      <span class="estrella e3">★</span><span class="estrella e4">★</span>
      <div class="encabezado">${esc(encabezado)}</div>
      <div class="cuerpo">
        <div class="qr-caja"><img class="qr" src="${g.qrDataUrl}" alt="QR ${esc(g.nombre)}" /></div>
        <div class="info">
          <div class="nombre">${esc(g.nombre)}</div>
          <div class="grupo-label">${esc(titulo)}</div>
          ${lineaMaestro}
          <div class="scan-label">Escanear al entrar al salón</div>
        </div>
      </div>
      <div class="footer">${esc(pie)}</div>
    </div>`
}

export function construirHTMLGafetes(
  gafetes: AlumnoConQR[],
  grupo: Grupo,
  maestro: Maestro,
  opciones: Partial<OpcionesGafete> = {},
  modo: 'imprimir' | 'vista-previa' = 'imprimir'
): string {
  const o: OpcionesGafete = { ...OPCIONES_DEFAULT, ...opciones }
  const t = TAMANOS[o.tamano] || TAMANOS.mediano
  const porPagina = t.columnas * t.filas

  const paginas: string[] = []
  for (let i = 0; i < gafetes.length; i += porPagina) {
    const tarjetas = gafetes.slice(i, i + porPagina).map((g) => tarjeta(g, grupo, maestro, o)).join('')
    paginas.push(`<div class="pagina">${tarjetas}</div>`)
  }

  const script = modo === 'imprimir'
    ? `<script>
        window.onload = function () {
          setTimeout(function () { window.print(); }, 300);
        };
        window.onafterprint = function () { setTimeout(function () { window.close(); }, 300); };
      </script>`
    : ''

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Gafetes — ${esc(tituloGrupo(grupo))}</title>
  <style>${estilos(o)}</style>
</head>
<body class="${modo === 'vista-previa' ? 'vista-previa' : ''}">
  ${paginas.join('')}
  ${script}
</body>
</html>`
}

// Abre la ventana de impresión. Llamar directamente desde un clic (sin await antes)
// para que el navegador no bloquee la ventana emergente.
export function imprimirGafetes(html: string): boolean {
  const ventana = window.open('', '_blank', 'width=900,height=750')
  if (!ventana) return false
  ventana.document.open()
  ventana.document.write(html)
  ventana.document.close()
  return true
}

// Compatibilidad con el código anterior: genera e imprime en un solo paso.
export async function generarGafetesPDF(
  alumnos: Alumno[],
  grupo: Grupo,
  maestro: Maestro,
  opciones: Partial<OpcionesGafete> = {}
): Promise<void> {
  const gafetes = await prepararQRs(alumnos)
  const html = construirHTMLGafetes(gafetes, grupo, maestro, opciones, 'imprimir')
  imprimirGafetes(html)
}