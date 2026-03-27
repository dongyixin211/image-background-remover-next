import { redirect } from "next/navigation";

export const runtime = "edge";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_REDIRECT_URI = process.env.NEXTAUTH_URL + "/api/auth/callback/google";

export async function GET() {
  const scope = "openid email profile";
  
  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", GOOGLE_CLIENT_ID);
  authUrl.searchParams.set("redirect_uri", GOOGLE_REDIRECT_URI);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", scope);
  authUrl.searchParams.set("prompt", "consent");
  authUrl.searchParams.set("access_type", "offline");
  
  redirect(authUrl.toString());
}