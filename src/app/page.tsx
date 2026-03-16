"use client";

import { useState, useCallback } from "react";
import Image from "next/image";

export default function Home() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

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
    setLoading(true);
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
      setLoading(false);
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
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-semibold text-gray-800 mb-2">
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
        {loading && (
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
        {originalImage && !loading && (
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
