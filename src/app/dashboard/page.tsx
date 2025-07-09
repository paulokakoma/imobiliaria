'use client'

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import {
    LayoutDashboard, Building2, MessageSquare, Bell, Settings, LogOut,
    Plus, Search, ChevronDown, ChevronUp, Eye, Tag, DollarSign,
    ArrowRight, Briefcase, UserCircle, LoaderCircle, X, MapPin, BedDouble, Bath, Trash2, Edit
} from 'lucide-react';

// Tipos
interface Property {
    id: string;
    title: string;
    description: string;
    price: number;
    bedrooms: number;
    bathrooms: number;
    address: string;
    image_urls?: string[];
    status: 'Ativo' | 'Inativo' | 'Pendente';
    views?: number;
    created_at: string;
    user_id: string;
}

// Inicializar Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- COMPONENTES DE UI ---

const Sidebar = ({ activePage, onNavigate, onLogout, user }: { activePage: string, onNavigate: (page: string) => void, onLogout: () => void, user: User | null }) => (
    <aside className="w-64 bg-white text-gray-800 flex flex-col h-screen fixed top-0 left-0 shadow-lg z-40">
        <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
                <Building2 className="text-purple-600" size={32} />
                <span className="text-2xl font-bold">Imóveis<span className="text-purple-600">Huambo</span></span>
            </div>
        </div>
        <nav className="flex-grow p-4 space-y-2">
            <a href="#" onClick={() => onNavigate('dashboard')} className={`flex items-center px-4 py-3 rounded-lg transition-colors ${activePage === 'dashboard' ? 'bg-purple-100 text-purple-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}>
                <LayoutDashboard size={20} className="mr-3" />
                Dashboard
            </a>
            <a href="#" onClick={() => onNavigate('imoveis')} className={`flex items-center px-4 py-3 rounded-lg transition-colors ${activePage === 'imoveis' ? 'bg-purple-100 text-purple-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}>
                <Briefcase size={20} className="mr-3" />
                Meus Imóveis
            </a>
            <a href="#" onClick={() => onNavigate('mensagens')} className={`flex items-center px-4 py-3 rounded-lg transition-colors ${activePage === 'mensagens' ? 'bg-purple-100 text-purple-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}>
                <MessageSquare size={20} className="mr-3" />
                Mensagens
            </a>
            <a href="#" onClick={() => onNavigate('notificacoes')} className={`flex items-center px-4 py-3 rounded-lg transition-colors ${activePage === 'notificacoes' ? 'bg-purple-100 text-purple-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}>
                <Bell size={20} className="mr-3" />
                Notificações
            </a>
        </nav>
        <div className="p-4 border-t border-gray-200">
            <div className="px-4 py-3 mb-2 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">ID de Partilha:</p>
                <p className="text-xs font-mono text-gray-700 break-all">{user?.id || 'N/A'}</p>
            </div>
            <a href="#" onClick={() => onNavigate('perfil')} className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg">
                <UserCircle size={20} className="mr-3" />
                Meu Perfil
            </a>
            <a href="#" onClick={onLogout} className="flex items-center px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg">
                <LogOut size={20} className="mr-3" />
                Sair
            </a>
        </div>
    </aside>
);

const DashboardHeader = ({ onAddNew, title, subtitle }: { onAddNew?: () => void, title: string, subtitle: string }) => (
    <header className="flex items-center justify-between mb-8">
        <div>
            <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
            <p className="text-gray-500 mt-1">{subtitle}</p>
        </div>
        {onAddNew && (
            <button onClick={onAddNew} className="flex items-center px-5 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors shadow-md">
                <Plus size={20} className="mr-2" />
                Publicar Novo Imóvel
            </button>
        )}
    </header>
);

const StatCard = ({ icon, title, value, detail, color, onClick }: { 
    icon: React.ReactNode, 
    title: string, 
    value: string | number, 
    detail: string, 
    color: string, 
    onClick?: () => void 
}) => (
    <div className={`p-6 rounded-xl shadow-md flex flex-col justify-between h-full bg-gradient-to-br ${color} transition-transform hover:scale-105 cursor-pointer`} onClick={onClick}>
        <div>
            <div className="flex items-center text-white mb-4">
                {icon}
                <h3 className="font-semibold ml-3">{title}</h3>
            </div>
            <p className="text-4xl font-bold text-white">{value}</p>
        </div>
        <div className="flex items-center justify-between text-white text-sm mt-4 opacity-80">
            <span>{detail}</span>
            <ArrowRight size={16} />
        </div>
    </div>
);

const ActivityItem = ({ icon, text, time }: { icon: React.ReactNode, text: string, time: string }) => (
    <div className="flex items-start space-x-4 py-4">
        <div className="bg-gray-100 p-3 rounded-full">
            {icon}
        </div>
        <div className="flex-grow">
            <p className="text-gray-700">{text}</p>
            <p className="text-xs text-gray-400 mt-1">{time}</p>
        </div>
    </div>
);

const PropertyListItem = ({ property, onViewDetails, onEdit, onDelete }: { 
    property: Property, 
    onViewDetails: () => void, 
    onEdit: () => void,
    onDelete: () => void 
}) => (
    <div onClick={onViewDetails} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 cursor-pointer hover:border-purple-300">
        <img src={property.image_urls?.[0] || 'https://placehold.co/200x150/f3f4f6/31343C?text=Imóvel'} alt={property.title} className="w-full sm:w-32 h-24 object-cover rounded-md" />
        <div className="flex-grow">
            <div className="flex justify-between items-start">
                <h4 className="font-bold text-lg text-gray-800">{property.title}</h4>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${property.status === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {property.status}
                </span>
            </div>
            <div className="flex items-center text-gray-500 text-sm mt-1 space-x-4">
                <span className="flex items-center"><MapPin size={14} className="mr-1.5"/> {property.address}</span>
                <span className="flex items-center"><BedDouble size={14} className="mr-1.5"/> {property.bedrooms}</span>
                <span className="flex items-center"><Bath size={14} className="mr-1.5"/> {property.bathrooms}</span>
            </div>
            <p className="text-purple-600 font-semibold text-lg mt-2">{new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(property.price)}</p>
        </div>
        <div className="flex space-x-2 self-end sm:self-center">
            <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full"><Edit size={18}/></button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full"><Trash2 size={18}/></button>
        </div>
    </div>
);

const LoadingScreen = () => (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
            <LoaderCircle className="animate-spin text-purple-600 mx-auto" size={48} />
            <p className="mt-4 text-gray-600">A carregar o seu dashboard...</p>
        </div>
    </div>
);

const ErrorScreen = ({ message }: { message: string }) => (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="text-center bg-white p-10 rounded-lg shadow-md">
            <X size={48} className="mx-auto text-red-400" />
            <h3 className="mt-4 text-xl font-semibold text-red-800">Ocorreu um Erro</h3>
            <p className="mt-1 text-gray-500">{message}</p>
        </div>
    </div>
);

// --- VISTAS DO DASHBOARD ---

const MainDashboardView = ({ stats, properties, activities, onViewDetails, onDelete, onEdit }) => (
    <>
        <DashboardHeader onAddNew={() => alert("Navegar para Adicionar Imóvel")} title="Bem-vindo de volta!" subtitle="Aqui está um resumo da sua atividade." />
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            <StatCard icon={<Building2 size={24} />} title="Imóveis Ativos" value={stats.activeListings} detail={`${stats.pendingListings} pendente(s)`} color="from-purple-500 to-indigo-600" />
            <StatCard icon={<Eye size={24} />} title="Total de Visitas" value={stats.totalViews} detail="Este mês" color="from-blue-400 to-cyan-500" />
            <StatCard icon={<MessageSquare size={24} />} title="Novas Mensagens" value="8" detail="3 não lidas" color="from-green-400 to-emerald-500" />
        </section>
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Imóveis Recentes</h2>
                <div className="space-y-4">
                   {properties.length > 0 ? (
                        properties.slice(0, 3).map(prop => (
                            <PropertyListItem key={prop.id} property={prop} onViewDetails={() => onViewDetails(prop.id)} onDelete={() => onDelete(prop.id)} onEdit={() => onEdit(prop.id)} />
                        ))
                   ) : (
                        <div className="bg-white p-8 rounded-lg text-center text-gray-500"><p>Ainda não publicou nenhum imóvel.</p></div>
                   )}
                </div>
            </div>
            <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Atividade Recente</h2>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="divide-y divide-gray-100">{activities.map(act => (<ActivityItem key={act.id} icon={act.icon} text={act.text} time={act.time} />))}</div>
                </div>
            </div>
        </section>
    </>
);

const MyPropertiesView = ({ properties, onViewDetails, onDelete, onEdit }) => (
    <>
        <DashboardHeader onAddNew={() => alert("Navegar para Adicionar Imóvel")} title="Meus Imóveis" subtitle="Gira todos os seus anúncios publicados." />
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
            <div className="space-y-4">
                {properties.length > 0 ? (
                    properties.map(prop => (
                        <PropertyListItem key={prop.id} property={prop} onViewDetails={() => onViewDetails(prop.id)} onDelete={() => onDelete(prop.id)} onEdit={() => onEdit(prop.id)} />
                    ))
                ) : (
                    <div className="text-center text-gray-500 py-10"><p>Nenhum imóvel encontrado.</p></div>
                )}
            </div>
        </div>
    </>
);

const PlaceholderView = ({ title }: { title: string }) => (
     <>
        <DashboardHeader title={title} subtitle={`A secção de ${title.toLowerCase()} está em desenvolvimento.`} />
        <div className="bg-white p-8 rounded-lg text-center text-gray-500">
            <p>Conteúdo em breve...</p>
        </div>
    </>
);


// --- COMPONENTE PRINCIPAL ---
export default function CreativeDashboardPage() {
    const [user, setUser] = useState<User | null>(null);
    const [properties, setProperties] = useState<Property[]>([]);
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState('dashboard');
    const router = useRouter();
    
    useEffect(() => {
        const checkAuthAndFetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }
            setUser(user);

            const { data, error } = await supabase
                .from('properties')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Erro ao buscar propriedades:", error);
                setError("Não foi possível carregar os seus imóveis.");
            } else {
                setProperties(data || []);
            }
            
            setActivities([
                { id: 1, icon: <MessageSquare size={20} className="text-green-600"/>, text: "Nova mensagem sobre 'Vivenda V3 no Centro'", time: "há 5 minutos" },
                { id: 2, icon: <Eye size={20} className="text-blue-600"/>, text: "O seu anúncio 'Apartamento T2' recebeu 25 novas visitas.", time: "há 2 horas" },
                { id: 3, icon: <Tag size={20} className="text-orange-600"/>, text: "Recebeu uma nova proposta para 'Loja na Baixa'.", time: "há 1 dia" },
            ]);
            setLoading(false);
        };

        checkAuthAndFetchData();
    }, [router]);
    
    const stats = useMemo(() => {
        const active = properties.filter(p => p.status === 'Ativo').length;
        const totalViews = properties.reduce((acc, p) => acc + (p.views || 0), 0);
        return {
            activeListings: active,
            pendingListings: properties.length - active,
            totalViews: totalViews.toLocaleString('pt-AO'),
        };
    }, [properties]);
    
    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    const handleViewDetails = (propertyId: string) => {
        router.push(`/properties/${propertyId}`);
    };
    
    const handleDelete = async (propertyId: string) => {
        if (confirm("Tem a certeza que quer apagar este imóvel?")) {
            const { error } = await supabase.from('properties').delete().eq('id', propertyId);
            if (error) {
                alert("Erro ao apagar o imóvel.");
            } else {
                setProperties(prev => prev.filter(p => p.id !== propertyId));
            }
        }
    };

    const handleEdit = (propertyId: string) => {
        router.push(`/dashboard/editar-imovel/${propertyId}`);
    };

    const renderContent = () => {
        switch(currentPage) {
            case 'imoveis':
                return <MyPropertiesView properties={properties} onViewDetails={handleViewDetails} onDelete={handleDelete} onEdit={handleEdit} />;
            case 'mensagens':
                return <PlaceholderView title="Mensagens" />;
            case 'notificacoes':
                return <PlaceholderView title="Notificações" />;
            case 'perfil':
                router.push('/profile');
                return null;
            default:
                return <MainDashboardView stats={stats} properties={properties} activities={activities} onViewDetails={handleViewDetails} onDelete={handleDelete} onEdit={handleEdit} />;
        }
    };

    if (loading) return <LoadingScreen />;
    if (error) return <ErrorScreen message={error} />;

    return (
        <div className="bg-gray-50 min-h-screen">
            <Sidebar activePage={currentPage} onNavigate={setCurrentPage} onLogout={handleLogout} user={user} />
            <main className="ml-64 p-8">
                {renderContent()}
            </main>
        </div>
    );
}
