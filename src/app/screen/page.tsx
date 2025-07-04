'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, MapPin, BedDouble, Bath, Heart, ChevronDown, Building, Home, ArrowLeft, UserCircle, DollarSign, LoaderCircle, SearchX, Send } from 'lucide-react'

const allPropertiesMock = [
    {
    id: 1,
    title: 'Vivenda T3 Espaçosa no Bairro Académico',
    location: 'Académico, Huambo',
    price: 150000,
    beds: 3,
    baths: 2,
    type: 'Vivenda',
    image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=2670&auto=format&fit=crop',
    favorited: false,
    description: 'Uma vivenda deslumbrante com acabamentos de alta qualidade, localizada numa zona calma e segura. Ideal para famílias que procuram conforto e espaço. Possui um quintal espaçoso e garagem para dois carros.',
    amenities: ['Garagem', 'Quintal', 'Cozinha Equipada', 'Ar Condicionado'],
  },
  {
    id: 2,
    title: 'Apartamento Moderno no Centro da Cidade',
    location: 'Centro, Huambo',
    price: 120000,
    beds: 2,
    baths: 1,
    type: 'Apartamento',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2670&auto=format&fit=crop',
    favorited: true,
    description: 'Apartamento totalmente remodelado com um design moderno e minimalista. Perfeito para jovens profissionais ou casais. Perto de todos os serviços essenciais, como lojas, restaurantes e transportes públicos.',
    amenities: ['Elevador', 'Varanda', 'Segurança 24h'],
  },
  {
    id: 3,
    title: 'Moradia com Quintal na Zona do Sassonde',
    location: 'Sassonde, Huambo',
    price: 180000,
    beds: 4,
    baths: 3,
    type: 'Moradia',
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=2574&auto=format&fit=crop',
    favorited: false,
    description: 'Excelente moradia para quem gosta de natureza e tranquilidade. Com um vasto quintal com árvores de fruto e espaço para lazer. A casa é ampla e arejada, com uma suíte principal e três quartos adicionais.',
    amenities: ['Quintal Amplo', 'Lareira', 'Área de Churrasco'],
  },
  {
    id: 4,
    title: 'Apartamento T2 Remodelado',
    location: 'São João, Huambo',
    price: 95000,
    beds: 2,
    baths: 2,
    type: 'Apartamento',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2670&auto=format&fit=crop',
    favorited: false,
    description: 'Apartamento acolhedor e funcional, recentemente remodelado. Cozinha equipada e quartos com roupeiros embutidos. Ótima oportunidade de investimento ou para habitação própria.',
    amenities: ['Cozinha Equipada', 'Varanda'],
  },
    {
    id: 5,
    title: 'Vivenda de Luxo com Piscina',
    location: 'Aviação, Huambo',
    price: 350000,
    beds: 5,
    baths: 4,
    type: 'Vivenda',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2653&auto=format&fit=crop',
    favorited: false,
    description: 'Uma propriedade exclusiva que oferece o máximo em luxo e conforto. Com uma piscina privativa, jardim bem cuidado e interiores espaçosos e elegantes. A escolha perfeita para quem procura um estilo de vida sofisticado.',
    amenities: ['Piscina', 'Jardim', 'Garagem', 'Segurança 24h'],
  },
  {
    id: 6,
    title: 'Apartamento Aconchegante perto do Mercado',
    location: 'Centro, Huambo',
    price: 80000,
    beds: 1,
    baths: 1,
    type: 'Apartamento',
    image: 'https://images.unsplash.com/photo-1494203484021-3c454daf695d?q=80&w=2670&auto=format&fit=crop',
    favorited: true,
    description: 'Ideal para estudantes ou para quem procura uma solução prática e económica. Localizado numa zona central, com fácil acesso a comércio e transportes. Totalmente mobilado e pronto a habitar.',
    amenities: ['Mobilado', 'Localização Central'],
  },
];

// --- COMPONENTES ---

const Header = () => (
  <header className="bg-white shadow-sm sticky top-0 z-30">
    <div className="container mx-auto px-4 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Building className="text-purple-600" size={28} />
        <span className="text-xl font-bold text-gray-800">ImóveisHuambo</span>
      </div>
      <div className="flex items-center">
        <button className="p-2 rounded-full hover:bg-gray-100">
            <UserCircle size={28} className="text-gray-600"/>
        </button>
      </div>
    </div>
  </header>
);

const SearchAndFilterBar = ({ filters, setFilters }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const barRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (barRef.current && !barRef.current.contains(event.target)) {
        setIsExpanded(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="container mx-auto px-4 py-6 relative z-20" ref={barRef}>
        <button
          onClick={() => setIsExpanded(true)}
          className={`w-full max-w-lg mx-auto bg-white rounded-full shadow-lg p-3 flex items-center justify-between cursor-pointer hover:shadow-xl transition-all text-left ${isExpanded ? 'ring-2 ring-purple-500' : ''}`}
        >
          <div className="flex items-center space-x-3 flex-1">
            <Search size={20} className="text-purple-600 ml-2" />
            <input
                type="text"
                readOnly={!isExpanded}
                placeholder="Comece a sua pesquisa..."
                value={filters.searchQuery}
                onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                className="w-full bg-transparent outline-none text-sm text-gray-800 placeholder-gray-500"
            />
          </div>
          {isExpanded && (
            <button onClick={(e) => {e.stopPropagation(); setIsExpanded(false);}}>
                <ChevronDown size={20} className="text-gray-500 hover:text-gray-700" />
            </button>
          )}
        </button>
    </div>
  );
};

const PropertyCard = ({ property, onClick, onToggleFavorite }) => (
  <div
    onClick={onClick}
    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl cursor-pointer transition"
  >
    <div className="relative">
      <img src={property.image} alt={property.title} className="w-full h-56 object-cover" />
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(property.id);
        }}
        className="absolute top-4 right-4 p-2 bg-white/80 rounded-full"
      >
        <Heart size={20} className={property.favorited ? 'fill-red-500 text-red-500' : 'text-gray-500'} />
      </button>
    </div>
    <div className="p-4">
      <h3 className="font-semibold text-lg">{property.title}</h3>
      <p className="text-sm text-gray-500 flex items-center mt-1">
        <MapPin size={14} className="mr-1" /> {property.location}
      </p>
      <div className="mt-2 flex justify-between items-center">
        <p className="text-purple-600 font-bold text-lg">
          {new Intl.NumberFormat().format(property.price)} AOA
        </p>
        <div className="text-sm text-gray-600 flex gap-3">
          <span className="flex items-center"><BedDouble size={16} className="mr-1" /> {property.beds}</span>
          <span className="flex items-center"><Bath size={16} className="mr-1" /> {property.baths}</span>
        </div>
      </div>
    </div>
  </div>
);

const PropertyDetail = ({ property, onGoBack, onToggleFavorite, onContact }) => (
  <div className="container mx-auto p-4 md:p-8">
    <button onClick={onGoBack} className="flex items-center text-purple-600 font-semibold mb-6">
      <ArrowLeft size={20} className="mr-2" /> Voltar
    </button>
    <div className="bg-white rounded-xl shadow-lg overflow-hidden grid md:grid-cols-5">
      <div className="md:col-span-3">
        <img src={property.image} alt={property.title} className="w-full h-full max-h-[500px] object-cover" />
      </div>
      <div className="md:col-span-2 p-6 flex flex-col">
        <div className="flex justify-between items-start">
          <h1 className="text-2xl font-bold">{property.title}</h1>
          <button onClick={() => onToggleFavorite(property.id)}>
            <Heart size={24} className={property.favorited ? 'fill-red-500 text-red-500' : 'text-gray-500'} />
          </button>
        </div>
        <p className="flex items-center text-sm text-gray-500 mt-2">
          <MapPin size={14} className="mr-2" /> {property.location}
        </p>
        <p className="text-2xl font-bold text-purple-600 my-4">
          {new Intl.NumberFormat().format(property.price)} AOA
        </p>
        <div className="flex space-x-4 border-y py-3 text-gray-700">
          <span className="flex items-center"><BedDouble size={20} className="mr-2" /> {property.beds} Quartos</span>
          <span className="flex items-center"><Bath size={20} className="mr-2" /> {property.baths} WC</span>
        </div>
        <div className="mt-4">
          <h4 className="font-semibold mb-2">Descrição</h4>
          <p className="text-gray-600">{property.description}</p>
        </div>
        <div className="mt-4">
          <h4 className="font-semibold mb-2">Comodidades</h4>
          <div className="flex flex-wrap gap-2">
            {property.amenities.map(item => (
              <span key={item} className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">{item}</span>
            ))}
          </div>
        </div>
        <button onClick={onContact} className="mt-auto bg-purple-600 text-white w-full py-3 rounded-lg mt-6 hover:bg-purple-700">
          Contactar Proprietário
        </button>
      </div>
    </div>
  </div>
);

// NOVO: Componente para a vista de contacto com ícones e dados do vendedor
import { Mail, Phone, MessageCircle } from 'lucide-react';

export const ContactView = ({ property, onGoBack }) => {
    // Mock de contato do vendedor (em produção, viria do backend ou do próprio imóvel)
    const seller = property.seller || {
        name: 'João Proprietário',
        email: 'joao@email.com',
        phone: '+244912345678',
        whatsapp: '+244912345678',
    };

    return (
        <div className="container mx-auto p-4 md:p-8 animate-fade-in">
            <button onClick={onGoBack} className="flex items-center text-purple-600 font-semibold mb-6 hover:underline">
                <ArrowLeft size={20} className="mr-2"/>
                Voltar para os detalhes
            </button>
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-8 max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Contactar Proprietário</h2>
                <p className="text-gray-600 mb-4">Entre em contacto diretamente com o proprietário do imóvel: <span className="font-semibold">{property.title}</span></p>

                <div className="mb-6 p-4 bg-gray-50 rounded-lg border flex flex-col gap-2">
                    <span className="font-semibold text-gray-700 flex items-center gap-2"><UserCircle size={20} /> {seller.name}</span>
                    <div className="flex gap-4 mt-2">
                        <a href={`mailto:${seller.email}`} className="flex flex-col items-center text-purple-700 hover:text-purple-900" title="E-mail">
                            <Mail size={28} />
                            <span className="text-xs mt-1">E-mail</span>
                        </a>
                        <a href={`tel:${seller.phone}`} className="flex flex-col items-center text-purple-700 hover:text-purple-900" title="Telefone">
                            <Phone size={28} />
                            <span className="text-xs mt-1">Telefone</span>
                        </a>
                        <a href={`sms:${seller.phone}`} className="flex flex-col items-center text-purple-700 hover:text-purple-900" title="SMS">
                            <MessageCircle size={28} />
                            <span className="text-xs mt-1">SMS</span>
                        </a>
                        <a href={`https://wa.me/${seller.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center text-green-600 hover:text-green-800" title="WhatsApp">
                            <MessageCircle size={28} />
                            <span className="text-xs mt-1">WhatsApp</span>
                        </a>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                        <span className="block"><b>E-mail:</b> {seller.email}</span>
                        <span className="block"><b>Telefone:</b> {seller.phone}</span>
                        <span className="block"><b>WhatsApp:</b> {seller.whatsapp}</span>
                    </div>
                </div>

                <form className="mt-6 space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">O seu Nome</label>
                        <input type="text" id="name" required className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"/>
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">O seu E-mail</label>
                        <input type="email" id="email" required className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"/>
                    </div>
                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700">Mensagem</label>
                        <textarea id="message" rows="4" required className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"></textarea>
                    </div>
                    <button type="submit" className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                        <Send size={18} className="mr-2"/>
                        Enviar Mensagem
                    </button>
                </form>
            </div>
        </div>
    );
};


const NoResultsFound = ({ onClearFilters }) => (
    <div className="text-center py-16">
        <SearchX size={48} className="mx-auto text-gray-400" />
        <h3 className="mt-4 text-xl font-semibold text-gray-800">Nenhum imóvel encontrado</h3>
        <p className="mt-2 text-gray-500">Tente ajustar os seus filtros ou procure por um termo diferente.</p>
        <button 
            onClick={onClearFilters}
            className="mt-6 px-5 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
        >
            Limpar Filtros
        </button>
    </div>
);

export default function HomeScreen() {
  const [propertyList, setPropertyList] = useState([]);
  // MUDANÇA: Estado de vista agora controla o que é mostrado
  const [view, setView] = useState({ name: 'list', data: null });
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    location: '',
    propertyType: 'Qualquer',
    priceRange: { min: '', max: '' },
    searchQuery: '',
  });

  useEffect(() => {
    setIsLoading(true);
    // Lê imóveis do localStorage e mescla com os mockados
    let userProperties = [];
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('userProperties');
      if (stored) {
        userProperties = JSON.parse(stored);
      }
    }
    const allProperties = [...userProperties, ...allPropertiesMock];
    const { location, propertyType, priceRange, searchQuery } = filters;
    const filtered = allProperties.filter((prop) => {
      const matchLocation = location ? prop.location.toLowerCase().includes(location.toLowerCase()) : true;
      const matchType = propertyType !== 'Qualquer' ? prop.type === propertyType : true;
      const matchPrice = 
        (priceRange.min ? prop.price >= Number(priceRange.min) : true) &&
        (priceRange.max ? prop.price <= Number(priceRange.max) : true);
      const matchSearch = searchQuery
        ? [prop.title, prop.description, prop.location]
            .some(field => field.toLowerCase().includes(searchQuery.toLowerCase()))
        : true;
      return matchLocation && matchType && matchPrice && matchSearch;
    });
    const timer = setTimeout(() => {
      setPropertyList(filtered);
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [filters]);

  const toggleFavorite = (id) => {
    const updatedList = propertyList.map(p =>
      p.id === id ? { ...p, favorited: !p.favorited } : p
    );
    setPropertyList(updatedList);
    if (view.name === 'detail' && view.data.id === id) {
      setView(prev => ({ ...prev, data: { ...prev.data, favorited: !prev.data.favorited }}));
    }
  };
  
  const handleClearFilters = () => {
    setFilters({
        location: '',
        propertyType: 'Qualquer',
        priceRange: { min: '', max: '' },
        searchQuery: '',
    });
  };

  const renderContent = () => {
    switch(view.name) {
        case 'detail':
            return <PropertyDetail 
                        property={view.data} 
                        onGoBack={() => setView({ name: 'list', data: null })}
                        onToggleFavorite={toggleFavorite}
                        onContact={() => setView({ name: 'contact', data: view.data })}
                    />
        case 'contact':
            return <ContactView 
                        property={view.data}
                        onGoBack={() => setView({ name: 'detail', data: view.data })}
                    />
        default: // 'list'
            return (
                <>
                    <SearchAndFilterBar filters={filters} setFilters={setFilters} />
                    <main className="container mx-auto px-4 pb-12">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Imóveis Disponíveis</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {isLoading
                            ? Array(6).fill(0).map((_, i) => (
                                <div key={i} className="h-80 bg-white rounded-xl shadow animate-pulse"></div>
                            ))
                            : propertyList.length > 0
                            ? propertyList.map((property) => (
                                <PropertyCard
                                    key={property.id}
                                    property={property}
                                    onToggleFavorite={toggleFavorite}
                                    onClick={() => {
                                        setView({ name: 'detail', data: property });
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                />
                            ))
                            : <div className="col-span-full"><NoResultsFound onClearFilters={handleClearFilters} /></div>
                        }
                        </div>
                    </main>
                </>
            )
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      {renderContent()}
    </div>
  );
}
