import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_KEY
);

export async function POST(request) {
  const { email, senha } = await request.json();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  });

  if (error) {
    return Response.json({ message: "Falha ao entrar no portal: " + error.message }, { status: 400 });
  }

  return Response.json({ message: "Portal aberto com sucesso, caçador!" });
}
