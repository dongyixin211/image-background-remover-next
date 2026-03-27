import { cookies } from "next/headers";

export async function getSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token")?.value;
  
  if (!sessionToken) return null;
  
  try {
    // 简单的base64解码，格式: userId|email|name|picture
    const decoded = Buffer.from(sessionToken, "base64").toString("utf-8");
    const [userId, email, name, picture] = decoded.split("|");
    
    if (!userId) return null;
    
    return {
      user: {
        id: userId,
        email: email || "",
        name: name || "",
        image: picture || "",
      },
    };
  } catch {
    return null;
  }
}

export function createSessionToken(user: {
  id: string;
  email?: string;
  name?: string;
  image?: string;
}): string {
  const data = [user.id, user.email || "", user.name || "", user.image || ""].join("|");
  return Buffer.from(data).toString("base64");
}