"use client";
export const runtime = "edge";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function QRPage() {
  const params = useParams();
  const id = params.id as string;
  const [alumnos, setAlumnos] = useState<any[]>([]);
  const [grupo, setGrupo] = useState<any>(null);
  const [generandoPDF, setGenerandoPDF] = useState(false);

  useEffect(() => {
    if (!id) return;
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    const { data: grupoData } = await supabase.from("grupos").select("*").eq("id", id).single();
    setGrupo(grupoData);
    const { data: alumnosData } = await supabase.from("alumnos").select("*").eq("grupo_id", id);
    setAlumnos(alumnosData || []);
  };

  const urlBase = "https://pasalista.mx/checkin/";

  const descargarPDF = async () => {
    setGenerandoPDF(true);
    try {
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Codigos QR - Grupo ${grupo?.nombre || ""}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; background: white; padding: 10mm; }
            h1 { text-align: center; font-size: 14px; margin-bottom: 8mm; color: #1e293b; }
            .grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 6mm;
            }
            .tarjeta {
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 4mm;
              text-align: center;
              page-break-inside: avoid;
            }
            .nombre {
              font-size: 9px;
              font-weight: bold;
              color: #1e293b;
              margin-bottom: 3mm;
            }
            .qr { width: 45mm; height: 45mm; }
            .grupo {
              font-size: 8px;
              color: #64748b;
              margin-top: 2mm;
            }
            @media print {
              @page { size: letter; margin: 10mm; }
            }
          </style>
        </head>
        <body>
          <h1>Codigos QR — Grupo ${grupo?.nombre || ""}</h1>
          <div class="grid">
            ${alumnos.map(alumno => {
              const qrUrl = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" +
                encodeURIComponent(urlBase + encodeURIComponent(alumno.nombre) + "?grupo=" + id);
              return `
                <div class="tarjeta">
                  <div class="nombre">${alumno.nombre}</div>
                  <img class="qr" src="${qrUrl}" alt="${alumno.nombre}" />
                  <div class="grupo">Grupo ${grupo?.nombre || ""}</div>
                </div>
              `;
            }).join("")}
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 1000);
            }
          </script>
        </body>
        </html>
      `;

      const ventana = window.open("", "_blank", "width=900,height=700");
      if (ventana) {
        ventana.document.write(html);
        ventana.document.close();
      }
    } catch (err) {
      alert("Error al generar el PDF, intenta de nuevo");
    }
    setGenerandoPDF(false);
  };

  if (!grupo) return <div style={{ color: "white", padding: "40px", textAlign: "center" }}>Cargando...</div>;

  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0a0f1e 0%, #1e1b4b 100%)", fontFamily: "Arial, sans-serif", padding: "24px", color: "white" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: "700", margin: 0 }}>Codigos QR</h1>
            <p style={{ color: "#94a3b8", fontSize: "14px", margin: "4px 0 0 0" }}>Grupo {grupo.nombre}</p>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={descargarPDF}
              disabled={generandoPDF || alumnos.length === 0}
              style={{
                background: generandoPDF ? "rgba(34,197,94,0.2)" : "#22c55e",
                color: generandoPDF ? "#86efac" : "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: "600",
                cursor: generandoPDF ? "not-allowed" : "pointer",
              }}
            >
              {generandoPDF ? "Generando..." : "📄 Descargar PDF"}
            </button>
            <a href="/dashboard" style={{ background: "rgba(99,102,241,0.2)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.3)", padding: "8px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: "600", textDecoration: "none", display: "inline-block" }}>Volver</a>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
          {alumnos.map((alumno) => (
            <div key={alumno.id} style={{ background: "white", borderRadius: "16px", padding: "16px", textAlign: "center" }}>
              <p style={{ color: "#1e293b", fontSize: "12px", fontWeight: "700", marginBottom: "12px", marginTop: 0 }}>{alumno.nombre}</p>
              <img
                src={"https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" + encodeURIComponent(urlBase + encodeURIComponent(alumno.nombre) + "?grupo=" + id)}
                alt={alumno.nombre}
                style={{ width: "150px", height: "150px" }}
              />
              <p style={{ color: "#64748b", fontSize: "10px", marginTop: "8px", marginBottom: 0 }}>Grupo {grupo.nombre}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}