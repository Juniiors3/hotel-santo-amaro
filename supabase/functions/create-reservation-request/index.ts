import { createClient } from "npm:@supabase/supabase-js@2";

const allowedOrigins = new Set([
  "https://SEU-DOMINIO-DO-SITE",
  "http://localhost:8000",
  "http://127.0.0.1:8000",
]);

function corsHeaders(origin: string | null): Headers {
  const headers = new Headers({
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
    "Access-Control-Max-Age": "86400",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
    "Content-Type": "application/json; charset=utf-8",
  });
  if (origin && allowedOrigins.has(origin)) headers.set("Access-Control-Allow-Origin", origin);
  return headers;
}

const json = (status: number, body: Record<string, unknown>, origin: string | null) =>
  new Response(JSON.stringify(body), { status, headers: corsHeaders(origin) });

const allowedRooms = new Set([
  "Quarto Casal Conforto",
  "Quarto Individual Executivo",
  "Quarto Duplo Solteiro",
  "Suíte Família / Triplo",
  "Outro / Preciso de Orientação",
]);
const allowedGuests = new Set(["1 Pessoa", "2 Pessoas", "3 Pessoas", "4 ou mais"]);
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

function validDate(value: unknown): value is string {
  if (typeof value !== "string" || !datePattern.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

Deno.serve(async (request: Request) => {
  const origin = request.headers.get("origin");
  const headers = corsHeaders(origin);

  if (request.method === "OPTIONS") {
    if (origin && !allowedOrigins.has(origin)) return new Response("Origem não autorizada.", { status: 403 });
    return new Response("ok", { headers });
  }
  if (origin && !allowedOrigins.has(origin)) return json(403, { error: "Origem não autorizada." }, origin);
  if (request.method !== "POST") return json(405, { error: "Método não permitido." }, origin);

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 5000) return json(413, { error: "Solicitação muito grande." });

  try {
    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return json(400, { error: "Dados inválidos." });
    }

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const checkin = body.checkin;
    const checkout = body.checkout;
    const roomType = typeof body.roomType === "string" ? body.roomType : "";
    const guests = typeof body.guests === "string" ? body.guests : "";

    if (name.length < 2 || name.length > 120) return json(400, { error: "Informe um nome válido." });
    const phoneDigits = phone.replace(/\D/g, "");
    if (phone.length > 30 || phoneDigits.length < 10 || phoneDigits.length > 15) {
      return json(400, { error: "Informe um telefone válido com DDD." });
    }
    if (!validDate(checkin) || !validDate(checkout) || checkout <= checkin) {
      return json(400, { error: "As datas informadas são inválidas." });
    }
    if (!allowedRooms.has(roomType) || !allowedGuests.has(guests)) {
      return json(400, { error: "Acomodação ou quantidade de hóspedes inválida." });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Configuração de servidor Supabase ausente.");
      return json(500, { error: "Serviço temporariamente indisponível." });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { error } = await supabase.from("reservation_requests").insert({
      name,
      phone,
      checkin,
      checkout,
      room_type: roomType,
      guests,
    });

    if (error) {
      console.error("Falha ao inserir solicitação:", error.message);
      return json(500, { error: "Não foi possível registrar a solicitação." });
    }

    return json(201, { ok: true });
  } catch (error) {
    console.error("Erro ao processar solicitação:", error);
    return json(400, { error: "Não foi possível processar os dados enviados." });
  }
});
