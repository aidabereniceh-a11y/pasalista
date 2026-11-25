"use client";
export const runtime = "edge";

import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const maestroId = searchParams.get("maestroId");
  if (!maestroId) return NextResponse.json({ error: "Falta maestroId" }, { status: 400 });

  const { data, error } = await supabase
    .from("maestros")
    .select("id, nombre, email, plan, premium_hasta, mp_access_token")
    .eq("id", maestroId)
    .single();

  if (error || !data) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  // Nunca exponer el token completo — enmascarar
  const tokenMasked = data.mp_access_token
    ? data.mp_access_token.slice(0, 8) + "••••••••••••••••" + data.mp_access_token.slice(-4)
    : null;

  return NextResponse.json({
    maestro: {
      id: data.id,
      nombre: data.nombre,
      email: data.email,
      plan: data.plan,
      premium_hasta: data.premium_hasta,
      tiene_token: !!data.mp_access_token,
      token_masked: tokenMasked,
    },
  });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { maestroId, mp_access_token } = body;

  if (!maestroId) return NextResponse.json({ error: "Falta maestroId" }, { status: 400 });
  if (!mp_access_token || !mp_access_token.startsWith("APP_USR-")) {
    return NextResponse.json({ error: "Token inválido. Debe empezar con APP_USR-" }, { status: 400 });
  }

  const { error } = await supabase
    .from("maestros")
    .update({ mp_access_token: mp_access_token.trim() })
    .eq("id", maestroId);

  if (error) return NextResponse.json({ error: "No se pudo guardar" }, { status: 500 });

  return NextResponse.json({ ok: true });
}
