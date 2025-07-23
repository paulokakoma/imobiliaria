'use client'

import { useRouter } from 'next/navigation'
import { Building, Search } from 'lucide-react'

export default function ProfileSelectionPage() {
  const router = useRouter()

  // MUDANÇA: A lógica foi separada para cada botão.
  const handleNavigate = (path: string, role?: 'cliente' | 'vendedor_anunciante') => {
    // Se um 'role' for fornecido (para vendedores), guarda-o antes de navegar.
    if (role) {
      sessionStorage.setItem('user_role', role);
    }
    router.push(path);
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center p-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Qual é o seu objetivo?</h1>
        <p className="text-lg text-gray-600 mb-12 max-w-lg mx-auto">
          Diga-nos como pretende usar a plataforma para que possamos personalizar a sua experiência.
        </p>
        <div className="flex flex-col md:flex-row justify-center gap-8">
          {/* MUDANÇA: Opção Cliente agora leva diretamente para a tela de anúncios. */}
          <div 
            onClick={() => handleNavigate('/screen')}
            className="group flex flex-col items-center p-8 bg-white rounded-2xl shadow-lg cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 w-full md:w-80"
          >
            <Search className="text-purple-500 mb-4 transition-transform group-hover:scale-110" size={48} strokeWidth={1.5} />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Procurar um Imóvel</h2>
            <p className="text-gray-500">Quero encontrar casas para arrendar ou comprar.</p>
          </div>

          {/* MUDANÇA: Opção Vendedor continua a levar para o login, mas agora passa o 'role'. */}
          <div 
            onClick={() => handleNavigate('/login', 'vendedor_anunciante')}
            className="group flex flex-col items-center p-8 bg-white rounded-2xl shadow-lg cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 w-full md:w-80"
          >
            <Building className="text-purple-500 mb-4 transition-transform group-hover:scale-110" size={48} strokeWidth={1.5} />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Anunciar um Imóvel</h2>
            <p className="text-gray-500">Quero publicar e gerir os meus próprios anúncios.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
