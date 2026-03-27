"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { getSession } from "@/lib/auth-session";

interface SessionUser {
  id: string;
  email: string;
  name: string;
  image: string;
}

export default function Home() {
  const [session, setSession] = useState<{ user: SessionUser } | null>(null);
  const [loading, setLoading] = useState(true);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // 检查session
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const res = await fetch("/api/auth/session");
      if (res.ok) {
        const data = await res.json();
        setSession(data);
      }
    } catch {
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = () => {
    window.location.href = "/api/auth/login";
  };

  const handleSignOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    setSession(null);
  };

  // 加载状态不显示内容
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  // 未登录显示登录界面
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-semibold text-gray-800 mb-2">
              🖼️ 图片背景移除
            </h1>
            <p className="text-gray-500">使用 AI 自动移除图片背景</p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center max-w-md mx-auto">
            <div className="text-5xl mb-4">🔐</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">登录后使用</h2>
            <p className="text-gray-500 mb-6">使用 Google 账号登录以使用图片背景移除功能</p>
            <button
              onClick={handleSignIn}
              className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-medium transition-all hover:scale-105 shadow-md flex items-center justify-center gap-2 mx-auto"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              使用 Google 登录
            </button>
          </div>

          {/* Footer */}
          <p className="text-center text-gray-400 text-sm mt-12">
            Powered by Remove.bg API | Built with Next.js + Tailwind CSS
          </p>
        </div>
      </div>
    );
  }

  // 已登录显示主界面
  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("请上传图片文件 (JPG, PNG, WebP)");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("文件大小不能超过 10MB");
      return;
    }
    setError(null);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalImage(e.target?.result as string);
      processImage(file);
    };
    reader.readAsDataURL(file);
  }, []);

  const processImage = async (file: File) => {
    setProcessing(true);
    setResultImage(null);
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await fetch("/api/remove-bg", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "处理失败");
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setResultImage(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "处理失败，请重试");
    } finally {
      setProcessing(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDownload = () => {
    if (!resultImage) return;
    const link = document.createElement("a");
    link.href = resultImage;
    link.download = "removed-bg.png";
    link.click();
  };

  const reset = () => {
    setOriginalImage(null);
    setResultImage(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with User Info */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {session.user.image && (
              <Image
                src={session.user.image}
                alt={session.user.name || "用户"}
                width={40}
                height={40}
                className="rounded-full"
              />
            )}
            <div>
              <div className="font-medium text-gray-800">{session.user.name}</div>
              <div className="text-sm text-gray-500">{session.user.email}</div>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            退出登录
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-800">
            🖼️ 图片背景移除
          </h1>
          <p className="text-gray-500">使用 AI 自动移除图片背景</p>
        </div>

        {/* Upload Area */}
        {!originalImage && (
          <div
            className={`border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all duration-300 ${
              dragOver
                ? "border-blue-400 bg-blue-50"
                : "border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50"
            }`}
            onClick={() => document.getElementById("fileInput")?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <div className="text-5xl mb-4">📁</div>
            <p className="text-lg text-gray-700 mb-2">点击或拖拽图片到这里</p>
            <p className="text-gray-400 text-sm">支持 JPG, PNG, WebP 格式 (最大 10MB)</p>
            <input
              id="fileInput"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </div>
        )}

        {/* Loading */}
        {processing && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">⏳</div>
            <p className="text-gray-600 text-lg">正在处理图片...</p>
            <p className="text-gray-400 text-sm mt-2">AI 正在移除背景</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-center">
            <p className="text-red-500">{error}</p>
            <button
              onClick={reset}
              className="mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg text-sm transition-colors"
            >
              重试
            </button>
          </div>
        )}

        {/* Result */}
        {originalImage && !processing && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Original */}
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <h3 className="text-center text-gray-500 mb-4 font-medium">原图</h3>
                <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={originalImage}
                    alt="Original"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              
              {/* Result */}
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <h3 className="text-center text-gray-500 mb-4 font-medium">结果</h3>
                <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  {resultImage ? (
                    <Image
                      src={resultImage}
                      alt="Result"
                      fill
                      className="object-contain"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      处理中...
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 justify-center">
              {resultImage && (
                <button
                  onClick={handleDownload}
                  className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-medium transition-all hover:scale-105 shadow-md"
                >
                  ⬇️ 下载结果
                </button>
              )}
              <button
                onClick={reset}
                className="px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full font-medium transition-colors"
              >
                🔄 处理新图片
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-gray-400 text-sm mt-12">
          Powered by Remove.bg API | Built with Next.js + Tailwind CSS
        </p>
      </div>
    </div>
  );
}