'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, BedDouble, Bath, Heart, Building, UserCircle, LoaderCircle, SearchX, LogOut, User as UserIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// --- COMPONENTES DE UI ---

const Header = () => {
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
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => router.push('/screen')}>
            <Building className="text-purple-600" size={28} />
            <span className="text-xl font-bold text-gray-800">ImóveisHuambo</span>
          </div>
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
      </header>
    );
};

const PropertyCard = ({ property, onClick, onToggleFavorite }) => (
  <div onClick={onClick} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl cursor-pointer transition-all duration-300 group">
    <div className="relative overflow-hidden">
      <img src={property.image_urls?.[0] || 'https://placehold.co/600x400/EEE/31343C?text=Sem+Imagem'} alt={property.title} className="w-full h-56 object-cover transform group-hover:scale-110 group-hover:rotate-1 transition-transform duration-500 ease-in-out" />
      <button onClick={(e) => { e.stopPropagation(); onToggleFavorite(property.id, property.favorited); }} className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full">
        <Heart size={20} className={`transition-colors ${property.favorited ? 'text-red-500 fill-red-500' : 'text-gray-600 hover:text-red-500'}`} />
      </button>
    </div>
    <div className="p-4">
      <h3 className="font-semibold text-lg text-gray-800 truncate">{property.title}</h3>
      <p className="text-sm text-gray-500 flex items-center mt-1"><MapPin size={14} className="mr-1" /> {property.location}</p>
      <div className="mt-4 flex justify-between items-center">
        <p className="text-purple-600 font-bold text-lg">{new Intl.NumberFormat().format(property.price)} AOA</p>
        <div className="text-sm text-gray-600 flex gap-3">
          <span className="flex items-center"><BedDouble size={16} className="mr-1" /> {property.beds}</span>
          <span className="flex items-center"><Bath size={16} className="mr-1" /> {property.baths}</span>
        </div>
      </div>
    </div>
  </div>
);

const PropertyCardSkeleton = () => (
    <div className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
        <div className="w-full h-56 bg-gray-300"></div>
        <div className="p-4 space-y-4">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            <div className="flex justify-between items-center pt-2">
                <div className="h-6 bg-gray-300 rounded w-1/3"></div>
                <div className="flex space-x-4">
                    <div className="h-5 w-10 bg-gray-300 rounded"></div>
                    <div className="h-5 w-10 bg-gray-300 rounded"></div>
                </div>
            </div>
        </div>
    </div>
);

const NoResultsFound = () => (
    <div className="text-center py-16 col-span-full">
        <SearchX size={48} className="mx-auto text-gray-400" />
        <h3 className="mt-4 text-xl font-semibold text-gray-800">Nenhum imóvel encontrado</h3>
        <p className="mt-2 text-gray-500">De momento não há imóveis disponíveis.</p>
    </div>
);

export default function HomeScreen() {
  const [allProperties, setAllProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const loadInitialData = async () => {
        setIsLoading(true);
        const { data: propertiesData, error: propertiesError } = await supabase.from('properties').select('*').eq('status', 'Ativo'); 
        
        if (propertiesError) {
            console.error("Erro ao buscar imóveis:", propertiesError);
            setIsLoading(false);
            return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        let finalProperties = propertiesData || [];

        if (user && propertiesData) {
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

  const handleToggleFavorite = async (propertyId, isCurrentlyFavorited) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        alert("Por favor, faça login para favoritar imóveis.");
        router.push('/login');
        return;
    }

    const originalProperties = [...allProperties];
    const updatedProperties = allProperties.map(p => p.id === propertyId ? { ...p, favorited: !isCurrentlyFavorited } : p);
    setAllProperties(updatedProperties);

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

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      <section className="relative bg-gray-800 h-80 flex items-center justify-center">
          <img src="https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=2670&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-30" alt="Fundo de casas"/>
          <div className="relative z-10 text-center text-white p-4">
              <h1 className="text-4xl md:text-5xl font-bold">Encontre o seu Próximo Lar</h1>
              <p className="mt-4 text-lg text-white/90">A maior seleção de imóveis no coração de Angola.</p>
          </div>
      </section>
      <main className="container mx-auto px-4 pb-12 -mt-16 relative z-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Imóveis Disponíveis</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading
            ? Array(12).fill(0).map((_, i) => <PropertyCardSkeleton key={i} />)
            : allProperties.length > 0
            ? allProperties.map((property) => (
                <div key={property.id}>
                  <PropertyCard
                    property={property}
                    onToggleFavorite={handleToggleFavorite}
                    onClick={() => router.push(`/properties/${property.id}`)}
                  />
                </div>
              ))
            : <NoResultsFound />
          }
        </div>
      </main>
    </div>
  );
}
