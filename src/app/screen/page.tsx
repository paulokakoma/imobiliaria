'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, BedDouble, Bath, Heart, ChevronDown, Building, Home, ArrowLeft, UserCircle, DollarSign, LoaderCircle, SearchX, SlidersHorizontal, X, LogOut, User as UserIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// --- COMPONENTES DE UI ---

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const router = useRouter();
    const supabase = createClient();
    const menuRef = useRef(null);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };
    
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building className="text-purple-600" size={28} />
            <span className="text-xl font-bold text-gray-800">ImóveisHuambo</span>
          </div>
          <div className="relative" ref={menuRef}>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-full hover:bg-gray-100">
                <UserCircle size={28} className="text-gray-600"/>
            </button>
            {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-40 animate-fade-in-down">
                    <button 
                        onClick={() => router.push('/profile')}
                        className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                        <UserIcon size={16} className="mr-2"/>
                        Ver Perfil
                    </button>
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                        <LogOut size={16} className="mr-2"/>
                        Sair
                    </button>
                </div>
            )}
          </div>
        </div>
      </header>
    );
};

const FilterModal = ({ filters, setFilters, isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start pt-20 z-40" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg animate-fade-in-down" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h3 className="text-xl font-semibold">Filtros Avançados</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><X size={20}/></button>
                </div>
                <div className="space-y-6">
                    <div>
                        <label className="text-sm font-medium text-gray-700">Tipo de Anúncio</label>
                        <div className="flex mt-2 rounded-lg bg-gray-100 p-1">
                            <button onClick={() => setFilters(prev => ({...prev, adType: 'arrendar'}))} className={`w-1/2 py-2 rounded-md text-sm font-semibold transition-colors ${filters.adType === 'arrendar' ? 'bg-purple-600 text-white' : 'text-gray-600'}`}>Arrendar</button>
                            <button onClick={() => setFilters(prev => ({...prev, adType: 'vender'}))} className={`w-1/2 py-2 rounded-md text-sm font-semibold transition-colors ${filters.adType === 'vender' ? 'bg-purple-600 text-white' : 'text-gray-600'}`}>Comprar</button>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="location" className="text-sm font-medium text-gray-700">Localização</label>
                        <input id="location" type="text" placeholder="Ex: Centro da Cidade, Académico" value={filters.location} onChange={(e) => setFilters(prev => ({...prev, location: e.target.value}))} className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"/>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Tipo de Imóvel</label>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                            {['Qualquer', 'Apartamento', 'Vivenda', 'Moradia'].map(type => (
                                <button key={type} onClick={() => setFilters(prev => ({...prev, propertyType: type}))} className={`px-3 py-2 border rounded-lg text-sm transition-colors ${filters.propertyType === type ? 'bg-purple-600 text-white border-purple-600' : 'bg-white hover:border-purple-400'}`}>{type}</button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Faixa de Preço (AOA)</label>
                        <div className="flex items-center space-x-2 mt-1">
                            <input type="number" placeholder="Mínimo" value={filters.priceRange.min} onChange={(e) => setFilters(prev => ({...prev, priceRange: {...prev.priceRange, min: e.target.value}}))} className="w-1/2 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"/>
                            <input type="number" placeholder="Máximo" value={filters.priceRange.max} onChange={(e) => setFilters(prev => ({...prev, priceRange: {...prev.priceRange, max: e.target.value}}))} className="w-1/2 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


const PropertyCard = ({ property, onClick, onToggleFavorite }) => (
  <div
    onClick={onClick}
    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl cursor-pointer transition-all duration-300 group"
  >
    <div className="relative overflow-hidden">
      <img src={property.image_urls?.[0] || 'https://placehold.co/600x400/EEE/31343C?text=Sem+Imagem'} alt={property.title} className="w-full h-56 object-cover transform group-hover:scale-110 group-hover:rotate-1 transition-transform duration-500 ease-in-out" />
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(property.id, property.favorited);
        }}
        className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full"
      >
        <Heart size={20} className={`transition-colors ${property.favorited ? 'text-red-500 fill-red-500' : 'text-gray-600 hover:text-red-500'}`} />
      </button>
    </div>
    <div className="p-4">
      <h3 className="font-semibold text-lg text-gray-800 truncate">{property.title}</h3>
      <p className="text-sm text-gray-500 flex items-center mt-1">
        <MapPin size={14} className="mr-1" /> {property.location}
      </p>
      <div className="mt-4 flex justify-between items-center">
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

const PropertyCardSkeleton = () => (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="relative w-full h-56 bg-gray-200 overflow-hidden"><div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent"></div></div>
        <div className="p-4 space-y-3">
            <div className="relative h-4 bg-gray-200 rounded w-3/4 overflow-hidden"><div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent"></div></div>
            <div className="relative h-3 bg-gray-200 rounded w-1/2 overflow-hidden"><div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent"></div></div>
            <div className="flex justify-between items-center pt-2">
                <div className="relative h-6 bg-gray-200 rounded w-1/3 overflow-hidden"><div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent"></div></div>
                <div className="flex space-x-2">
                    <div className="relative h-5 w-8 bg-gray-200 rounded overflow-hidden"><div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent"></div></div>
                    <div className="relative h-5 w-8 bg-gray-200 rounded overflow-hidden"><div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent"></div></div>
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
        <img src={property.image_urls?.[0] || 'https://placehold.co/600x400/EEE/31343C?text=Sem+Imagem'} alt={property.title} className="w-full h-full max-h-[500px] object-cover" />
      </div>
      <div className="md:col-span-2 p-6 flex flex-col">
        <div className="flex justify-between items-start">
          <h1 className="text-2xl font-bold">{property.title}</h1>
          <button onClick={() => onToggleFavorite(property.id, property.favorited)}>
            <Heart size={24} className={property.favorited ? 'fill-red-500 text-red-500' : 'text-gray-500'} />
          </button>
        </div>
        <p className="flex items-center text-sm text-gray-500 mt-2"><MapPin size={14} className="mr-2" /> {property.location}</p>
        <p className="text-2xl font-bold text-purple-600 my-4">{new Intl.NumberFormat().format(property.price)} AOA</p>
        <div className="flex space-x-4 border-y py-3 text-gray-700">
          <span className="flex items-center"><BedDouble size={20} className="mr-2" /> {property.beds} Quartos</span>
          <span className="flex items-center"><Bath size={20} className="mr-2" /> {property.baths} WC</span>
        </div>
        <div className="mt-4"><h4 className="font-semibold mb-2">Descrição</h4><p className="text-gray-600">{property.description}</p></div>
        <div className="mt-4"><h4 className="font-semibold mb-2">Comodidades</h4><div className="flex flex-wrap gap-2">{property.amenities.map(item => (<span key={item} className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">{item}</span>))}</div></div>
        <button onClick={onContact} className="mt-auto bg-purple-600 text-white w-full py-3 rounded-lg mt-6 hover:bg-purple-700">Contactar Proprietário</button>
      </div>
    </div>
  </div>
);

const NoResultsFound = ({ onClearFilters }) => (
    <div className="text-center py-16">
        <SearchX size={48} className="mx-auto text-gray-400" />
        <h3 className="mt-4 text-xl font-semibold text-gray-800">Nenhum imóvel encontrado</h3>
        <p className="mt-2 text-gray-500">Tente ajustar a sua pesquisa.</p>
        <button onClick={onClearFilters} className="mt-6 px-5 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors">Limpar Filtros</button>
    </div>
);

export default function HomeScreen() {
  const [allProperties, setAllProperties] = useState([]);
  const [propertyList, setPropertyList] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  // MUDANÇA: Adicionado estado para controlar a visibilidade do modal de filtros
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    searchQuery: '',
    location: '',
    propertyType: 'Qualquer',
    priceRange: { min: '', max: '' },
    adType: 'arrendar',
  });

  const supabase = createClient();

  useEffect(() => {
    const fetchProperties = async () => {
        const { data, error } = await supabase.from('properties').select('*').eq('status', 'Ativo'); 
        if (error) { console.error("Erro ao buscar imóveis:", error); } 
        else { setAllProperties(data || []); }
        setIsLoading(false);
    };
    fetchProperties();
  }, []);

  useEffect(() => {
    const filtered = allProperties.filter((prop) => {
      const { searchQuery, location, propertyType, priceRange } = filters;
      const matchSearch = searchQuery ? [prop.title, prop.description, prop.location].some(field => field && field.toLowerCase().includes(searchQuery.toLowerCase())) : true;
      const matchLocation = location ? prop.location.toLowerCase().includes(location.toLowerCase()) : true;
      const matchType = propertyType !== 'Qualquer' ? prop.type === propertyType : true;
      const matchPrice = (priceRange.min ? prop.price >= Number(priceRange.min) : true) && (priceRange.max ? prop.price <= Number(priceRange.max) : true);
      return matchSearch && matchLocation && matchType && matchPrice;
    });
    setPropertyList(filtered);
  }, [filters, allProperties]);

  const toggleFavorite = (id) => { console.log("Favoritar/desfavoritar imóvel:", id); };
  const handleClearFilters = () => { setFilters({ searchQuery: '', location: '', propertyType: 'Qualquer', priceRange: { min: '', max: '' }, adType: 'arrendar' }); };

  return (
    <div className="bg-gray-50 min-h-screen">
      <style>{`@keyframes shimmer { 100% { transform: translateX(100%); } }`}</style>
      <Header />
      
      {!selectedProperty ? (
        <>
          <section className="relative bg-gray-800 h-80 flex items-center justify-center">
              <img src="https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=2670&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-30" alt="Fundo de casas"/>
              <div className="relative z-10 text-center text-white p-4">
                  <h1 className="text-4xl md:text-5xl font-bold">Encontre o seu Próximo Lar</h1>
                  <p className="mt-4 text-lg text-white/90">A maior seleção de imóveis no coração de Angola.</p>
                  <div className="mt-8 w-full max-w-2xl mx-auto">
                    <div className="flex items-center bg-white rounded-full shadow-lg p-2">
                        <input type="text" placeholder="Pesquise por título ou características..." value={filters.searchQuery} onChange={(e) => setFilters(prev => ({...prev, searchQuery: e.target.value}))} className="flex-1 bg-transparent px-4 py-2 outline-none text-gray-800 placeholder-gray-500"/>
                        <button onClick={() => setIsFilterModalOpen(true)} className="flex items-center px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-200">
                            <SlidersHorizontal size={16} className="mr-2"/> Filtros
                        </button>
                        <button className="p-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 ml-2"><Search size={20}/></button>
                    </div>
                  </div>
              </div>
          </section>

          <FilterModal filters={filters} setFilters={setFilters} isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} />

          <main className="container mx-auto px-4 pb-12 mt-8 relative z-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Imóveis Disponíveis</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading
                ? Array(6).fill(0).map((_, i) => <PropertyCardSkeleton key={i} />)
                : propertyList.length > 0
                ? propertyList.map((property, index) => (
                    <div key={property.id} style={{animationDelay: `${index * 100}ms`}} className="animate-fade-in-up">
                      <PropertyCard
                        property={property}
                        onToggleFavorite={toggleFavorite}
                        onClick={() => { setSelectedProperty(property); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      />
                    </div>
                  ))
                : <div className="col-span-full"><NoResultsFound onClearFilters={handleClearFilters} /></div>
              }
            </div>
          </main>
        </>
      ) : (
        <PropertyDetail 
            property={selectedProperty} 
            onGoBack={() => setSelectedProperty(null)}
            onToggleFavorite={toggleFavorite}
            onContact={() => alert('Navegar para a tela de contacto')}
        />
      )}
    </div>
  );
}
