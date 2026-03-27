import { cookies } from "next/headers";
import { createSessionToken } from "@/lib/auth-session";

export const runtime = "edge";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const NEXTAUTH_URL = process.env.NEXTAUTH_URL!;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  
  if (!code) {
    return new Response("No code provided", { status: 400 });
  }
  
  // 交换 code 获取 access_token
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
      redirect_uri: `${NEXTAUTH_URL}/api/auth/callback/google`,
    }),
  });
  
  const tokenData = await tokenResponse.json();
  
  if (!tokenData.access_token) {
    return new Response("Failed to get access token", { status: 400 });
  }
  
  // 获取用户信息
  const userResponse = await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    }
  );
  
  const userData = await userResponse.json();
  
  // 创建session token
  const sessionToken = createSessionToken({
    id: userData.id,
    email: userData.email,
    name: userData.name,
    image: userData.picture,
  });
  
  // 设置cookie
  const cookieStore = await cookies();
  cookieStore.set("session_token", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  
  // 跳转到首页
  return new Response(null, {
    status: 302,
    headers: {
      Location: "/",
    },
  });
}