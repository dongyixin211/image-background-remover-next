import { NextResponse } from "next/server";

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    
    if (!file) {
      return NextResponse.json({ error: "请上传图片文件" }, { status: 400 });
    }
    
    // Convert to base64
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    
    const apiKey = process.env.REMOVE_BG_API_KEY || "hDoFfreBddKHZmkuRr9ZgiiU";
    if (!apiKey) {
      return NextResponse.json({ error: "服务器未配置 API Key" }, { status: 500 });
    }
    
    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image_file_b64: base64,
        size: "auto",
        format: "png",
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: "Remove.bg API 错误: " + errorText }, { status: 500 });
    }
    
    const resultBuffer = await response.arrayBuffer();
    return new Response(resultBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": 'attachment; filename="removed-bg.png"',
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "处理失败" }, { status: 500 });
  }
}
