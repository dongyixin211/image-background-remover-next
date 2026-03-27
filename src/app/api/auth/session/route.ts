import { getSession } from "@/lib/auth-session";

export const runtime = "edge";

export async function GET() {
  const session = await getSession();
  
  if (!session) {
    return new Response("null", {
      status: 401,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
  
  return Response.json(session);
}