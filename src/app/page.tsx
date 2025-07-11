'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation' 
import { ArrowRight } from 'lucide-react'

const slides = [
  {
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=2670&auto=format&fit=crop',
    message: 'O seu próximo lar no Huambo está à sua espera.',
  },
  {
    image: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=2670&auto=format&fit=crop',
    message: 'Descubra as melhores casas no Planalto Central.',
  },
  {
    image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=2670&auto=format&fit=crop',
    message: 'Um novo começo na Cidade Vida. Comece aqui.',
  },
  {
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2671&auto=format&fit=crop',
    message: 'A sua pesquisa no Huambo, simples e segura.',
  },
  {
    image: 'https://images.unsplash.com/photo-1598228723793-52759bba239c?q=80&w=2574&auto=format&fit=crop',
    message: 'Conectando pessoas a propriedades de sonho.',
  },
  {
    image: 'https://images.unsplash.com/photo-1558036117-15d82a90b9b1?q=80&w=2670&auto=format&fit=crop',
    message: 'O seu futuro começa com uma nova porta.',
  },
]

export default function WelcomeScreen() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const router = useRouter() 

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length)
    }, 5000) 

    return () => clearTimeout(timer)
  }, [currentSlide])

  return (
    <main className="bg-white w-full h-screen">
      <div className="relative w-full h-full p-4 md:p-6 lg:p-8">
        <div className="relative w-full h-full overflow-hidden rounded-2xl">
          <style>{`
            @keyframes pulse-light {
              0% {
                transform: translateX(-100%) skewX(-15deg);
              }
              100% {
                transform: translateX(200%) skewX(-15deg);
              }
            }
          `}</style>
          
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
              style={{ backgroundImage: `url(${slide.image})` }}
            />
          ))}
          
          <div className="absolute inset-0 bg-black opacity-40"></div>

          <div className="absolute inset-0 z-10 flex items-center justify-center text-center">
            <div className="w-full h-16">
                {slides.map((slide, index) => (
                    <h1
                        key={index}
                        className={`absolute w-full left-0 px-4 text-3xl md:text-4xl font-bold text-white transition-all duration-1000 ${index === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5'}`}
                    >
                        {slide.message}
                    </h1>
                ))}
            </div>
          </div>

          <div className="absolute bottom-12 left-0 right-0 z-10 flex justify-center">
            {/* MUDANÇA: O botão agora é um link <a> para forçar o recarregamento da página */}
            <a 
              href="/escolher-perfil"
              className="relative overflow-hidden flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-md rounded-full shadow-lg border border-white/20 text-white font-semibold text-lg transition-transform hover:scale-105"
            >
              <span className="mr-2">Continuar</span>
              <ArrowRight size={22} />
              
              <span className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[pulse-light_2s_ease-in-out_infinite]"></span>
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}
