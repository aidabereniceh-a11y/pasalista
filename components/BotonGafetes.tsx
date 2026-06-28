'use client'

import { useState } from 'react'
import { generarGafetesPDF } from '@/lib/generarGafetesPDF'

interface Alumno {
  id: string
  nombre: string
}

interface Props {
  grupoId: string
  grupoNombre: string
  grupoGrado?: string
  gafetesPagado: boolean
  alumnos: Alumno[]
  maestroId: string
  maestroNombre: string
  maestroEmail: string
}

export default function BotonGafetes({
  grupoId,
  grupoNombre,
  grupoGrado,
  gafetesPagado,
  alumnos,
  maestroId,
  maestroNombre,
  maestroEmail,
}: Props) {
  const [cargando, setCargando] = useState(false)

  async function handleClick() {
    setCargando(true)

    if (gafetesPagado) {
      await generarGafetesPDF(
        alumnos,
        { nombre: grupoNombre, grado: grupoGrado },
        { nombre: maestroNombre, email: maestroEmail }
      )
      setCargando(false)
      return
    }

    const res = await fetch('/api/gafetes/pago', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ grupoId, grupoNombre, maestroId }),
    })

    const data = await res.json()
    window.location.href = data.url
  }

  return (
    <button
      onClick={handleClick}
      disabled={cargando}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm
        transition-all duration-200
        ${gafetesPagado
          ? 'bg-green-600 hover:bg-green-700 text-white'
          : 'bg-white border-2 border-green-600 text-green-700 hover:bg-green-50'
        }
        disabled:opacity-60 disabled:cursor-not-allowed
      `}
    >
      {cargando ? (
        <span>⏳ {gafetesPagado ? 'Generando...' : 'Redirigiendo...'}</span>
      ) : gafetesPagado ? (
        <span>🪪 Descargar gafetes PDF</span>
      ) : (
        <span>🪪 Generar gafetes — $99 MXN</span>
      )}
    </button>
  )
}