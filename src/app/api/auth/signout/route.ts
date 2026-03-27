import { cookies } from "next/headers";

export const runtime = "edge";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("session_token");
  
  return new Response(null, {
    status: 302,
    headers: {
      Location: "/",
    },
  });
}