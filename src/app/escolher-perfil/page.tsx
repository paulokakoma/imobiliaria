"use client";

import { useRouter } from "next/navigation";
import { Home, Building } from "lucide-react";

export default function EscolherPerfilPage() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full space-y-8">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">Qual é o seu objetivo?</h1>
        <div className="grid grid-cols-1 gap-6">
          <button
            onClick={() => router.push("/login")}
            className="flex flex-col items-center justify-center p-6 border-2 border-purple-600 bg-purple-50 rounded-xl hover:bg-purple-100 transition-all"
          >
            <Building size={40} className="text-purple-600 mb-2" />
            <span className="text-lg font-semibold text-purple-700">Sou proprietário</span>
            <span className="text-sm text-gray-600 mt-1">Quero anunciar um imóvel</span>
          </button>
          <button
            onClick={() => router.push("/screen")}
            className="flex flex-col items-center justify-center p-6 border-2 border-gray-300 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all"
          >
            <Home size={40} className="text-gray-500 mb-2" />
            <span className="text-lg font-semibold text-gray-700">Quero encontrar uma casa</span>
            <span className="text-sm text-gray-500 mt-1">Ver imóveis disponíveis</span>
          </button>
        </div>
      </div>
    </div>
  );
}
