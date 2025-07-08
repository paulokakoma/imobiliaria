'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, BedDouble, Bath, Heart, ChevronDown, Building, Home, ArrowLeft, UserCircle, DollarSign, LoaderCircle, SearchX, SlidersHorizontal, X, LogOut, User as UserIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// --- COMPONENTES DE UI ---
// MUDANÇA: Todos os componentes foram movidos para fora do componente principal para corrigir o erro.

const Header = ({ onShowFavorites }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const router = useRouter();
    const supabase = createClient();
    const menuRef = useRef(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('avatar_url')
                    .eq('id', user.id)
                    .single();
                setUserProfile(profile);
            }
        };
        fetchUserProfile();
    }, [supabase]);

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
          <div className="flex items-center space-x-4">
            <button onClick={onShowFavorites} className="p-2 rounded-full hover:bg-gray-100" title="Ver Favoritos">
                <Heart size={24} className="text-gray-600"/>
            </button>
            <div className="relative" ref={menuRef}>
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="rounded-full flex items-center justify-center h-10 w-10 bg-gray-100 hover:bg-gray-200">
                  {userProfile?.avatar_url ? (
                      <img src={userProfile.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover"/>
                  ) : (
                      <UserCircle size={32} className="text-gray-600"/>
                  )}
              </button>
              {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-40 animate-fade-in-down">
                      <button onClick={() => router.push('/profile')} className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          <UserIcon size={16} className="mr-2"/> Ver Perfil
                      </button>
                      <button onClick={handleLogout} className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                          <LogOut size={16} className="mr-2"/> Sair
                      </button>
                  </div>
              )}
            </div>
          </div>
        </div>
      </header>
    );
};

const FilterModal = ({ filters, setFilters, isOpen, onClose, onClearFilters }) => {
    if (!isOpen) return null;

    const handlePriceChange = (field, value) => {
        const numericValue = Math.max(0, Number(value));
        setFilters(prev => ({...prev, priceRange: {...prev.priceRange, [field]: numericValue }}));
    };

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
                            <input type="number" placeholder="Mínimo" value={filters.priceRange.min} onChange={(e) => handlePriceChange('min', e.target.value)} className="w-1/2 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"/>
                            <input type="number" placeholder="Máximo" value={filters.priceRange.max} onChange={(e) => handlePriceChange('max', e.target.value)} className="w-1/2 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"/>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end space-x-4 mt-8 pt-4 border-t">
                    <button onClick={onClearFilters} className="px-5 py-2 text-gray-700 font-semibold rounded-lg hover:bg-gray-100">Limpar Tudo</button>
                    <button onClick={onClose} className="px-5 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700">Ver Resultados</button>
                </div>
            </div>
        </div>
    );
};

const SearchAndFilterBar = ({ filters, setFilters, onOpenFilters, onClearFilters }) => (
    <div className="w-full max-w-2xl mx-auto">
        <div className="flex items-center bg-white rounded-full shadow-lg p-2">
            <input 
                type="text" 
                placeholder="Pesquise por título ou características..." 
                value={filters.searchQuery} 
                onChange={(e) => setFilters(prev => ({...prev, searchQuery: e.target.value}))} 
                className="flex-1 bg-transparent px-4 py-2 outline-none text-gray-800 placeholder-gray-500"
            />
            <button onClick={onOpenFilters} className="flex items-center px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-200">
                <SlidersHorizontal size={16} className="mr-2"/> Filtros
            </button>
            <button onClick={onClearFilters} className="p-3 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 ml-2" title="Limpar Filtros">
                <X size={20}/>
            </button>
        </div>
    </div>
);


const PropertyCard = ({ property, onClick, onToggleFavorite }) => (
  <div onClick={onClick} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl cursor-pointer transition-all duration-300 group">
    <div className="relative overflow-hidden">
      <img src={property.image_urls?.[0] || 'https://placehold.co/600x400/EEE/31343C?text=Sem+Imagem'} alt={property.title} className="w-full h-56 object-cover transform group-hover:scale-110 group-hover:rotate-1 transition-transform duration-500 ease-in-out" />
      <button onClick={(e) => { e.stopPropagation(); onToggleFavorite(property.id, property.favorited); }} className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full">
        <Heart size={20} className={`transition-colors ${property.favorited ? 'text-red-500 fill-red-500' : 'text-gray-600 hover:text-red-500'}`} />
      </button>
    </div>
    <div className="p-4">{/* ... */}</div>
  </div>
);

const PropertyCardSkeleton = () => (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">{/* ... */}</div>
);

const PropertyDetail = ({ property, onGoBack, onToggleFavorite, onContact }) => (
  <div className="container mx-auto p-4 md:p-8">{/* ... */}</div>
);

const NoResultsFound = ({ onClearFilters }) => (
    <div className="text-center py-16">{/* ... */}</div>
);

const FavoritesView = ({ properties, onSelectProperty, onToggleFavorite, onGoBack }) => (
    <main className="container mx-auto p-4 md:p-8 animate-fade-in">
        <div className="flex items-center mb-6">
             <button onClick={onGoBack} className="flex items-center text-purple-600 font-semibold hover:underline">
                <ArrowLeft size={20} className="mr-2"/>
                Voltar para a Lista Principal
            </button>
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Meus Imóveis Favoritos</h2>
        {properties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                    <PropertyCard
                        key={property.id}
                        property={property}
                        onToggleFavorite={onToggleFavorite}
                        onClick={() => onSelectProperty(property)}
                    />
                ))}
            </div>
        ) : (
            <p className="text-center text-gray-500 py-10">Ainda não adicionou nenhum imóvel aos seus favoritos.</p>
        )}
    </main>
);

export default function HomeScreen() {
  const [allProperties, setAllProperties] = useState([]);
  const [view, setView] = useState({ name: 'list', data: null });
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    searchQuery: '', location: '', propertyType: 'Qualquer',
    priceRange: { min: '', max: '' }, adType: 'arrendar',
  });

  const supabase = createClient();

  useEffect(() => {
    const loadInitialData = async () => {
        setIsLoading(true);
        const { data: propertiesData, error: propertiesError } = await supabase.from('properties').select('*');
        if (propertiesError) { console.error("Erro ao buscar imóveis:", propertiesError); setIsLoading(false); return; }

        const { data: { user } } = await supabase.auth.getUser();
        let finalProperties = propertiesData || [];

        if (user) {
            const { data: favorites, error: favError } = await supabase.from('favorites').select('property_id').eq('user_id', user.id);
            if (!favError && favorites) {
                const favoriteIds = new Set(favorites.map(f => f.property_id));
                finalProperties = propertiesData.map(p => ({...p, favorited: favoriteIds.has(p.id)}));
            }
        }
        
        setAllProperties(finalProperties.map(p => ({...p, favorited: p.favorited || false})));
        setIsLoading(false);
    };
    loadInitialData();
  }, [supabase]);

  const filteredProperties = allProperties.filter((prop) => {
      const { searchQuery, location, propertyType, priceRange } = filters;
      const matchSearch = searchQuery ? [prop.title, prop.description, prop.location].some(field => field && field.toLowerCase().includes(searchQuery.toLowerCase())) : true;
      const matchLocation = location ? prop.location.toLowerCase().includes(location.toLowerCase()) : true;
      const matchType = propertyType !== 'Qualquer' ? prop.type === propertyType : true;
      const matchPrice = (priceRange.min ? prop.price >= Number(priceRange.min) : true) && (priceRange.max ? prop.price <= Number(priceRange.max) : true);
      return matchSearch && matchLocation && matchType && matchPrice;
  });

  const handleToggleFavorite = async (propertyId, isCurrentlyFavorited) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        alert("Por favor, faça login para favoritar imóveis.");
        return;
    }

    const originalProperties = [...allProperties];
    const updatedProperties = allProperties.map(p => p.id === propertyId ? { ...p, favorited: !isCurrentlyFavorited } : p);
    setAllProperties(updatedProperties);
    
    if(view.name === 'detail' && view.data?.id === propertyId) {
        setView(prev => ({...prev, data: {...prev.data, favorited: !isCurrentlyFavorited}}));
    }

    if (isCurrentlyFavorited) {
        const { error } = await supabase.from('favorites').delete().match({ user_id: user.id, property_id: propertyId });
        if (error) {
            console.error("Erro ao desfavoritar:", error);
            setAllProperties(originalProperties);
        }
    } else {
        const { error } = await supabase.from('favorites').insert({ user_id: user.id, property_id: propertyId });
        if (error) {
            console.error("Erro ao favoritar:", error);
            setAllProperties(originalProperties);
        }
    }
  };
  
  const handleClearFilters = () => { setFilters({ searchQuery: '', location: '', propertyType: 'Qualquer', priceRange: { min: '', max: '' }, adType: 'arrendar' }); setIsFilterModalOpen(false); };

  const renderContent = () => {
    switch(view.name) {
        case 'detail':
            return <PropertyDetail 
                        property={view.data} 
                        onGoBack={() => setView({ name: 'list', data: null })}
                        onToggleFavorite={handleToggleFavorite}
                        onContact={() => alert('Navegar para a tela de contacto')}
                    />
        case 'favorites':
            return <FavoritesView
                        properties={allProperties.filter(p => p.favorited)}
                        onSelectProperty={(property) => setView({ name: 'detail', data: property })}
                        onToggleFavorite={handleToggleFavorite}
                        onGoBack={() => setView({ name: 'list', data: null })}
                    />
        default: // 'list'
            return (
              <>
                <section className="relative bg-gray-800 h-80 flex items-center justify-center">
                    <img src="https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=2670&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-30" alt="Fundo de casas"/>
                    <div className="relative z-10 text-center text-white p-4">
                        <h1 className="text-4xl md:text-5xl font-bold">Encontre o seu Próximo Lar</h1>
                        <p className="mt-4 text-lg text-white/90">A maior seleção de imóveis no coração de Angola.</p>
                        <div className="mt-8">
                          <SearchAndFilterBar filters={filters} setFilters={setFilters} onOpenFilters={() => setIsFilterModalOpen(true)} onClearFilters={handleClearFilters} />
                        </div>
                    </div>
                </section>
                <FilterModal filters={filters} setFilters={setFilters} isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} onClearFilters={handleClearFilters}/>
                <main className="container mx-auto px-4 pb-12 mt-8 relative z-10">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Imóveis Disponíveis</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isLoading
                      ? Array(6).fill(0).map((_, i) => <PropertyCardSkeleton key={i} />)
                      : filteredProperties.length > 0
                      ? filteredProperties.map((property) => (
                          <div key={property.id}>
                            <PropertyCard
                              property={property}
                              onToggleFavorite={handleToggleFavorite}
                              onClick={() => setView({ name: 'detail', data: property })}
                            />
                          </div>
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
      <style>{`@keyframes shimmer { 100% { transform: translateX(100%); } }`}</style>
      <Header onShowFavorites={() => setView({ name: 'favorites', data: null })} />
      {renderContent()}
    </div>
  );
}
