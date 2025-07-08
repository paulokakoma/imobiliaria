'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
// MUDANÇA: Adicionados os ícones LogOut e UserIcon
import { ArrowLeft, MapPin, BedDouble, Bath, Heart, Building, UserCircle, Ruler, LoaderCircle, ParkingSquare, Wind, UtensilsCrossed, Wifi, Tv, Droplets, Home, Shield, Eye, Phone, MessageCircle, Mail, LogOut, User as UserIcon } from 'lucide-react'

// --- COMPONENTES ---

// MUDANÇA: Header agora busca e exibe a foto de perfil do utilizador
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
          <div 
            onClick={() => router.push('/screen')}
            className="flex items-center space-x-2 cursor-pointer"
          >
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

const PropertyDetailSkeleton = () => (
    <div className="container mx-auto p-4 md:p-8 animate-pulse">
        <div className="h-6 bg-gray-300 rounded w-48 mb-6"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <div className="bg-gray-300 h-96 rounded-xl"></div>
                <div className="flex mt-2 space-x-2">
                    <div className="w-24 h-20 bg-gray-300 rounded-md"></div>
                    <div className="w-24 h-20 bg-gray-300 rounded-md"></div>
                    <div className="w-24 h-20 bg-gray-300 rounded-md"></div>
                </div>
            </div>
            <div className="lg:col-span-1 space-y-6">
                <div className="h-10 bg-gray-300 rounded w-3/4"></div>
                <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                <div className="h-20 bg-gray-300 rounded-xl"></div>
                <div className="h-24 bg-gray-300 rounded-xl"></div>
            </div>
        </div>
    </div>
);

const FacebookIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/>
    </svg>
);

const ContactOwner = ({ owner }) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const userAgent = typeof window.navigator === "undefined" ? "" : navigator.userAgent;
        const mobile = Boolean(userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i));
        setIsMobile(mobile);
    }, []);

    const phoneNumber = owner?.phone_number || '';
    const whatsappNumber = owner?.whatsapp_number || phoneNumber;
    const whatsappLink = `https://wa.me/244${whatsappNumber.replace(/\D/g, '')}`;
    const smsLink = `sms:+244${phoneNumber}`;
    const callLink = `tel:+244${phoneNumber}`;
    const emailLink = `mailto:${owner?.email || ''}`;
    const facebookLink = owner?.facebook_url || '#';

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Informações do Anunciante</h3>
            <div className="flex items-center space-x-4">
                <img src={owner.avatar_url || `https://ui-avatars.com/api/?name=${owner.first_name}+${owner.last_name}`} alt="Avatar do proprietário" className="w-16 h-16 rounded-full object-cover"/>
                <div>
                    <p className="font-bold text-gray-800">{owner.first_name} {owner.last_name}</p>
                    <p className="text-sm text-gray-500">Proprietário</p>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
                {isMobile ? (
                    <>
                        <a href={callLink} className="flex items-center justify-center py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors">
                            <Phone size={18} className="mr-2"/> Ligar
                        </a>
                        <a href={smsLink} className="flex items-center justify-center py-2 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors">
                            <MessageCircle size={18} className="mr-2"/> SMS
                        </a>
                        <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors">
                            <MessageCircle size={18} className="mr-2"/> WhatsApp
                        </a>
                         <a href={facebookLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center py-2 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors">
                            <FacebookIcon className="mr-2"/> Facebook
                        </a>
                    </>
                ) : (
                     <>
                        <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="col-span-2 flex items-center justify-center py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors">
                            <MessageCircle size={18} className="mr-2"/> WhatsApp
                        </a>
                        <a href={emailLink} className="flex-1 flex items-center justify-center py-2 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors">
                            <Mail size={18} className="mr-2"/> E-mail
                        </a>
                        <a href={facebookLink} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center py-2 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors">
                            <FacebookIcon className="mr-2"/> Facebook
                        </a>
                    </>
                )}
            </div>
        </div>
    );
};


export default function PropertyDetailPage() {
    const [property, setProperty] = useState(null);
    const [owner, setOwner] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isFavorited, setIsFavorited] = useState(false);
    const router = useRouter();
    const params = useParams();
    const { id } = params;
    const supabase = createClient();

    const amenityIcons = {
        'Garagem': <ParkingSquare size={16} className="mr-2 flex-shrink-0" />,
        'Quintal': <Home size={16} className="mr-2 flex-shrink-0" />,
        'Cozinha Equipada': <UtensilsCrossed size={16} className="mr-2 flex-shrink-0" />,
        'Ar Condicionado': <Wind size={16} className="mr-2 flex-shrink-0" />,
        'Elevador': <Building size={16} className="mr-2 flex-shrink-0" />,
        'Varanda': <Home size={16} className="mr-2 flex-shrink-0" />,
        'Segurança 24h': <Shield size={16} className="mr-2 flex-shrink-0" />,
        'Lareira': <Home size={16} className="mr-2 flex-shrink-0" />,
        'Piscina': <Droplets size={16} className="mr-2 flex-shrink-0" />,
        'Jardim': <Home size={16} className="mr-2 flex-shrink-0" />,
        'Mobilado': <BedDouble size={16} className="mr-2 flex-shrink-0" />,
        'Terraço': <Home size={16} className="mr-2 flex-shrink-0" />,
        'Vista Panorâmica': <Eye size={16} className="mr-2 flex-shrink-0" />,
    };

    useEffect(() => {
        const fetchPropertyAndOwner = async () => {
            if (!id) return;
            
            const { data: propertyData, error: propertyError } = await supabase
                .from('properties')
                .select('*')
                .eq('id', id)
                .single();

            if (propertyError) {
                console.error("Erro ao buscar detalhes do imóvel:", propertyError);
                setLoading(false);
                return;
            } 
            
            if (propertyData && propertyData.user_id) {
                const { data: ownerData, error: ownerError } = await supabase
                    .from('profiles')
                    .select('first_name, last_name, avatar_url, email, phone_number, whatsapp_number, facebook_url')
                    .eq('id', propertyData.user_id)
                    .single();
                
                if (ownerError) {
                    console.error("Erro ao buscar perfil do proprietário:", ownerError);
                } else {
                    setOwner(ownerData);
                }
            }
            
            setProperty(propertyData);

            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: favorite } = await supabase
                    .from('favorites')
                    .select('id')
                    .eq('user_id', user.id)
                    .eq('property_id', propertyData.id)
                    .single();
                if (favorite) setIsFavorited(true);
            }

            if (propertyData.image_gallery && propertyData.image_gallery.length > 0) {
                setSelectedImage(propertyData.image_gallery[0]);
            } else if (propertyData.image_urls && propertyData.image_urls.length > 0) {
                setSelectedImage({ name: 'Vista Principal', url: propertyData.image_urls[0] });
            }
            setLoading(false);
        };

        fetchPropertyAndOwner();
    }, [id, supabase]);

    const handleToggleFavorite = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            alert("Por favor, faça login para favoritar imóveis.");
            router.push('/login');
            return;
        }

        const currentlyFavorited = isFavorited;
        setIsFavorited(!currentlyFavorited);

        if (currentlyFavorited) {
            await supabase.from('favorites').delete().match({ user_id: user.id, property_id: property.id });
        } else {
            await supabase.from('favorites').insert({ user_id: user.id, property_id: property.id });
        }
    };

    if (loading) {
        return (
            <div className="bg-gray-100 min-h-screen">
                <Header />
                <PropertyDetailSkeleton />
            </div>
        );
    }

    if (!property) {
        return (
            <div className="bg-gray-100 min-h-screen">
                <Header />
                <div className="text-center py-20">
                    <h2 className="text-2xl font-bold">Imóvel não encontrado</h2>
                    <button onClick={() => router.push('/screen')} className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg">Voltar à lista</button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 min-h-screen">
            <Header />
            <main className="container mx-auto p-4 md:p-8">
                <button onClick={() => router.back()} className="flex items-center text-purple-600 font-semibold mb-6 hover:underline">
                    <ArrowLeft size={20} className="mr-2" /> Voltar
                </button>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                            <div className="p-4 border-b">
                                <h3 className="text-xl font-semibold text-center text-gray-800">{selectedImage?.name || 'Vista Principal'}</h3>
                            </div>
                            <img src={selectedImage?.url || 'https://placehold.co/600x400/EEE/31343C?text=Sem+Imagem'} alt={selectedImage?.name} className="w-full h-96 object-cover"/>
                            <div className="flex p-2 space-x-2 overflow-x-auto bg-gray-50">
                                {property.image_gallery?.map((img, index) => (
                                    <button key={index} onClick={() => setSelectedImage(img)} className={`w-24 h-20 flex-shrink-0 rounded-md overflow-hidden transition-all ${img.url === selectedImage?.url ? 'ring-2 ring-purple-600' : 'opacity-70 hover:opacity-100'}`}>
                                        <img src={img.url} alt={img.name} className="w-full h-full object-cover"/>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">{property.title}</h1>
                                <p className="flex items-center text-gray-500 mt-2"><MapPin size={16} className="mr-2" /> {property.location}</p>
                            </div>
                            <div className="flex justify-between items-center border-t border-b py-4">
                                <div>
                                    <p className="text-sm text-gray-500">Preço</p>
                                    <p className="text-2xl font-bold text-purple-600">{new Intl.NumberFormat().format(property.price)} AOA</p>
                                </div>
                                <button onClick={handleToggleFavorite} className="p-3 bg-gray-100 rounded-full">
                                    <Heart size={24} className={`transition-colors ${isFavorited ? 'text-red-500 fill-red-500' : 'text-gray-500 hover:text-red-500'}`} />
                                </button>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div><p className="font-bold text-xl">{property.beds}</p><p className="text-sm text-gray-500">Quartos</p></div>
                                <div><p className="font-bold text-xl">{property.baths}</p><p className="text-sm text-gray-500">WC</p></div>
                                <div><p className="font-bold text-xl">{property.width}x{property.length}</p><p className="text-sm text-gray-500">m</p></div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800 mb-2">Descrição</h3>
                                <p className="text-gray-600 leading-relaxed">{property.description}</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800 mb-2">Comodidades</h3>
                                <div className="flex flex-wrap gap-2">
                                    {property.amenities.map(item => (
                                        <span key={item} className="flex items-center px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                                            {amenityIcons[item] || <Home size={16} className="mr-2 flex-shrink-0" />}
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        {owner && <ContactOwner owner={owner} />}
                    </div>
                </div>
            </main>
        </div>
    );
}
