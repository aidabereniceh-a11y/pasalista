"use client";
export const runtime = "edge";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import jsPDF from "jspdf";

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

  const obtenerQRBase64 = async (url: string): Promise<string> => {
    const respuesta = await fetch(url);
    const blob = await respuesta.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const descargarPDF = async () => {
    setGenerandoPDF(true);
    try {
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "letter" });

      const margenX = 15;
      const margenY = 22;
      const margenInferior = 15;
      const qrTamano = 45;
      const espacioX = 15;
      const espacioY = 18;
      const columnas = 3;

      const altoPagina = 279.4;
      const anchoUtil = 215.9 - margenX * 2;
      const celdaAncho = (anchoUtil - espacioX * (columnas - 1)) / columnas;

      const alturaFila = qrTamano + espacioY + 10;
      const filasPorPagina = Math.floor((altoPagina - margenY - margenInferior) / alturaFila);

      let col = 0;
      let fila = 0;

      pdf.setFontSize(16);
      pdf.text("Codigos QR - Grupo " + (grupo?.nombre || ""), 105, 12, { align: "center" });

      for (let i = 0; i < alumnos.length; i++) {
        const alumno = alumnos[i];
        const qrUrl =
          "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" +
          encodeURIComponent(urlBase + encodeURIComponent(alumno.nombre) + "?grupo=" + id);

        const qrBase64 = await obtenerQRBase64(qrUrl);

        const x = margenX + col * (celdaAncho + espacioX);
        const y = margenY + fila * alturaFila;

        pdf.addImage(qrBase64, "PNG", x + (celdaAncho - qrTamano) / 2, y, qrTamano, qrTamano);

        pdf.setFontSize(9);
        pdf.setFont("helvetica", "bold");
        const lineasNombre = pdf.splitTextToSize(alumno.nombre, celdaAncho);
        pdf.text(lineasNombre, x + celdaAncho / 2, y + qrTamano + 6, { align: "center" });

        pdf.setFontSize(8);
        pdf.setFont("helvetica", "normal");
        const yGrupo = y + qrTamano + 6 + lineasNombre.length * 4 + 2;
        pdf.text("Grupo " + (grupo?.nombre || ""), x + celdaAncho / 2, yGrupo, { align: "center" });

        col++;
        if (col >= columnas) {
          col = 0;
          fila++;
          if (fila >= filasPorPagina && i < alumnos.length - 1) {
            pdf.addPage();
            fila = 0;
            pdf.setFontSize(16);
            pdf.setFont("helvetica", "normal");
            pdf.text("Codigos QR - Grupo " + (grupo?.nombre || ""), 105, 12, { align: "center" });
          }
        }
      }

      pdf.save("codigos-qr-" + (grupo?.nombre || "grupo") + ".pdf");
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