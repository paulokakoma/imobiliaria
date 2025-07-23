'use client'

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import {
    LayoutDashboard, Building2, Users, LogOut,
    CheckCircle, XCircle, Briefcase, LoaderCircle, X, Trash2, ShieldCheck, ShieldOff,
    Eye, DollarSign, MessageSquare, ArrowRight, Search, ChevronLeft, ChevronRight
} from 'lucide-react';

// Tipos
interface Property {
    id: string;
    title: string;
    price: number;
    status: 'Ativo' | 'Inativo' | 'Pendente' | 'Rejeitado';
    created_at: string;
    user_id: string;
    views?: number;
    profiles: { full_name: string }; 
}
interface Profile {
    id: string;
    full_name: string;
    email: string;
    role: 'admin' | 'vendedor_anunciante' | 'cliente';
    active: boolean;
}

// Inicializar Supabase
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// --- COMPONENTES DE UI ---

const Sidebar = ({ activePage, onNavigate, onLogout, user }: { activePage: string, onNavigate: (page: string) => void, onLogout: () => void, user: User | null }) => (
    <aside className="w-64 bg-white text-gray-800 flex flex-col h-screen fixed top-0 left-0 shadow-lg z-40">
        <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
                <Building2 className="text-purple-600" size={32} />
                <span className="text-2xl font-bold">Admin</span>
            </div>
        </div>
        <nav className="flex-grow p-4 space-y-2">
            <a href="#" onClick={() => onNavigate('dashboard')} className={`flex items-center px-4 py-3 rounded-lg transition-colors ${activePage === 'dashboard' ? 'bg-purple-100 text-purple-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}>
                <LayoutDashboard size={20} className="mr-3" />
                Dashboard
            </a>
            <a href="#" onClick={() => onNavigate('properties')} className={`flex items-center px-4 py-3 rounded-lg transition-colors ${activePage === 'properties' ? 'bg-purple-100 text-purple-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}>
                <Briefcase size={20} className="mr-3" />
                Gerir Imóveis
            </a>
            <a href="#" onClick={() => onNavigate('users')} className={`flex items-center px-4 py-3 rounded-lg transition-colors ${activePage === 'users' ? 'bg-purple-100 text-purple-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}>
                <Users size={20} className="mr-3" />
                Gerir Utilizadores
            </a>
        </nav>
        <div className="p-4 border-t border-gray-200">
            <a href="#" onClick={onLogout} className="flex items-center px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg">
                <LogOut size={20} className="mr-3" />
                Sair
            </a>
        </div>
    </aside>
);

const DashboardHeader = ({ title, subtitle }: { title: string, subtitle: string }) => (
    <header className="flex items-center justify-between mb-8">
        <div>
            <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
            <p className="text-gray-500 mt-1">{subtitle}</p>
        </div>
    </header>
);

const StatCard = ({ icon, title, value, detail, color }: { icon: React.ReactNode, title: string, value: string | number, detail: string, color: string }) => (
    <div className={`p-6 rounded-xl shadow-md flex flex-col justify-between h-full bg-gradient-to-br ${color}`}>
        <div>
            <div className="flex items-center text-white mb-4">
                {icon}
                <h3 className="font-semibold ml-3">{title}</h3>
            </div>
            <p className="text-4xl font-bold text-white">{value}</p>
        </div>
        <p className="text-white text-sm mt-4 opacity-80">{detail}</p>
    </div>
);

const LoadingScreen = () => (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
            <LoaderCircle className="animate-spin text-purple-600 mx-auto" size={48} />
            <p className="mt-4 text-gray-600">A carregar o painel de administração...</p>
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

const ToggleSwitch = ({ checked, onChange }) => (
    <button
        onClick={onChange}
        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${checked ? 'bg-purple-600' : 'bg-gray-300'}`}
    >
        <span
            className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ease-in-out ${checked ? 'translate-x-6' : 'translate-x-1'}`}
        />
    </button>
);

// --- VISTAS DO DASHBOARD ---

const MainDashboardView = ({ stats }) => (
    <>
        <DashboardHeader title="Visão Geral" subtitle="Resumo da atividade da plataforma." />
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            <StatCard icon={<Building2 size={24} />} title="Total de Imóveis" value={stats.totalProperties} detail={`${stats.pendingProperties} pendente(s)`} color="from-purple-500 to-indigo-600" />
            <StatCard icon={<Users size={24} />} title="Total de Utilizadores" value={stats.totalUsers} detail={`${stats.sellerCount} Vendedores`} color="from-blue-400 to-cyan-500" />
            <StatCard icon={<Eye size={24} />} title="Total de Visitas" value={stats.totalViews} detail="Este mês" color="from-green-400 to-emerald-500" />
            <StatCard icon={<DollarSign size={24} />} title="Novos Anúncios" value={stats.newToday} detail="Hoje" color="from-orange-400 to-red-500" />
        </section>
    </>
);

const PropertiesView = ({ properties, onStatusChange, onDelete, onViewDetails }) => {
    const [filter, setFilter] = useState('Todos');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7;

    const filteredProperties = useMemo(() => {
        return properties
            .filter(p => filter === 'Todos' || p.status === filter)
            .filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [properties, filter, searchTerm]);

    const paginatedProperties = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredProperties.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredProperties, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);

    return (
        <>
            <DashboardHeader title="Gerir Imóveis" subtitle="Aprove, rejeite e gira todos os anúncios da plataforma." />
            <div className="flex justify-between mb-4">
                <div className="flex space-x-2">
                    {['Todos', 'Pendente', 'Ativo', 'Inativo', 'Rejeitado'].map(status => (
                        <button key={status} onClick={() => { setFilter(status); setCurrentPage(1); }} className={`px-4 py-2 text-sm font-semibold rounded-full ${filter === status ? 'bg-purple-600 text-white' : 'bg-white hover:bg-gray-100'}`}>{status}</button>
                    ))}
                </div>
                <div className="relative">
                    <input type="text" placeholder="Pesquisar por título..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border rounded-lg"/>
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                </div>
            </div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="p-4 font-semibold">Título</th>
                            <th className="p-4 font-semibold">Proprietário</th>
                            <th className="p-4 font-semibold">Status</th>
                            <th className="p-4 font-semibold text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedProperties.map(prop => (
                            <tr key={prop.id} onClick={() => onViewDetails(prop.id)} className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer">
                                <td className="p-4">{prop.title}</td>
                                <td className="p-4 text-gray-600">{prop.profiles?.full_name || 'N/A'}</td>
                                <td className="p-4"><span className={`px-3 py-1 text-xs font-semibold rounded-full ${prop.status === 'Ativo' ? 'bg-green-100 text-green-800' : prop.status === 'Pendente' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{prop.status}</span></td>
                                <td className="p-4 flex justify-end space-x-2">
                                    {prop.status === 'Pendente' && (
                                        <>
                                            <button onClick={(e) => { e.stopPropagation(); onStatusChange(prop.id, 'Ativo'); }} className="p-2 text-green-600 hover:bg-green-50 rounded-full" title="Aprovar"><CheckCircle size={18}/></button>
                                            <button onClick={(e) => { e.stopPropagation(); onStatusChange(prop.id, 'Rejeitado'); }} className="p-2 text-red-600 hover:bg-red-50 rounded-full" title="Rejeitar"><XCircle size={18}/></button>
                                        </>
                                    )}
                                    <button onClick={(e) => { e.stopPropagation(); onDelete(prop.id); }} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full" title="Apagar"><Trash2 size={18}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {totalPages > 1 && (
                <div className="flex justify-center items-center mt-4 space-x-2">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-full disabled:opacity-50"><ChevronLeft/></button>
                    <span>Página {currentPage} de {totalPages}</span>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-full disabled:opacity-50"><ChevronRight/></button>
                </div>
            )}
        </>
    );
};

const UsersView = ({ users, onStatusChange, onDelete }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('Todos');

    const filteredUsers = useMemo(() => {
        return users
            .filter(u => roleFilter === 'Todos' || u.role === roleFilter)
            .filter(u => u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [users, roleFilter, searchTerm]);

    return (
        <>
            <DashboardHeader title="Gerir Utilizadores" subtitle="Ative, desative e gira todos os utilizadores da plataforma." />
            <div className="flex justify-between mb-4">
                <div className="flex space-x-2">
                    {['Todos', 'vendedor_anunciante', 'cliente'].map(role => (
                        <button key={role} onClick={() => setRoleFilter(role)} className={`px-4 py-2 text-sm font-semibold rounded-full ${roleFilter === role ? 'bg-purple-600 text-white' : 'bg-white hover:bg-gray-100'}`}>{role}</button>
                    ))}
                </div>
                <div className="relative">
                    <input type="text" placeholder="Pesquisar por nome ou email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border rounded-lg"/>
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                </div>
            </div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="p-4 font-semibold">Nome</th>
                            <th className="p-4 font-semibold">Email</th>
                            <th className="p-4 font-semibold">Função</th>
                            <th className="p-4 font-semibold">Status</th>
                            <th className="p-4 font-semibold text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id} className="border-b border-gray-200">
                                <td className="p-4">{user.full_name}</td>
                                <td className="p-4 text-gray-600">{user.email}</td>
                                <td className="p-4 text-gray-600">{user.role}</td>
                                <td className="p-4">
                                    <ToggleSwitch
                                        checked={user.active}
                                        onChange={() => onStatusChange(user.id, !user.active)}
                                    />
                                </td>
                                <td className="p-4 flex justify-end space-x-2">
                                    <button onClick={() => onDelete(user.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full"><Trash2 size={18}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

const PlaceholderView = ({ title }: { title: string }) => (
     <>
        <DashboardHeader title={title} subtitle={`A secção de ${title.toLowerCase()} está em desenvolvimento.`} />
        <div className="bg-white p-8 rounded-lg text-center text-gray-500">
            <p>Conteúdo em breve...</p>
        </div>
    </>
);


// --- COMPONENTE PRINCIPAL ---
export default function AdminDashboardPage() {
    const [user, setUser] = useState<User | null>(null);
    const [properties, setProperties] = useState<Property[]>([]);
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState('dashboard');
    const router = useRouter();

    useEffect(() => {
        const fetchAllData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }
            
            const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
            if (profile?.role !== 'admin') {
                router.push('/dashboard');
                return;
            }
            
            setUser(user);

            // MUDANÇA: Lógica de busca de dados separada para evitar erros de RLS em joins
            const { data: propertiesData, error: propertiesError } = await supabase.from('properties').select('*');
            const { data: profilesData, error: profilesError } = await supabase.from('profiles').select('*');

            if (propertiesError || profilesError) {
                setError("Não foi possível carregar os dados da plataforma.");
            } else {
                const profilesMap = new Map(profilesData.map(p => [p.id, p]));
                const propertiesWithProfiles = (propertiesData || []).map(prop => ({
                    ...prop,
                    profiles: profilesMap.get(prop.user_id) || { full_name: 'Utilizador Removido' }
                }));
                setProperties(propertiesWithProfiles);
                setUsers((profilesData || []).filter(p => p.role !== 'admin'));
            }
            
            setLoading(false);
        };
        fetchAllData();
    }, [router]);
    
    const stats = useMemo(() => ({
        totalProperties: properties.length,
        pendingProperties: properties.filter(p => p.status === 'Pendente').length,
        totalUsers: users.length,
        sellerCount: users.filter(u => u.role === 'vendedor_anunciante').length,
        totalViews: properties.reduce((acc, p) => acc + (p.views || 0), 0).toLocaleString('pt-AO'),
        newToday: properties.filter(p => new Date(p.created_at).toDateString() === new Date().toDateString()).length,
    }), [properties, users]);
    
    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    const handlePropertyStatusChange = async (id, status) => {
        const { error } = await supabase.from('properties').update({ status }).eq('id', id);
        if (error) { alert("Erro ao atualizar status do imóvel."); } 
        else { setProperties(prev => prev.map(p => p.id === id ? { ...p, status } : p)); }
    };

    const handlePropertyDelete = async (id) => {
        if (confirm("Tem a certeza que quer apagar este imóvel?")) {
            const { error } = await supabase.from('properties').delete().eq('id', id);
            if (error) { alert("Erro ao apagar imóvel."); }
            else { setProperties(prev => prev.filter(p => p.id !== id)); }
        }
    };

    const handleUserStatusChange = async (id, active) => {
        const { error } = await supabase.from('profiles').update({ active }).eq('id', id);
        if (error) { alert("Erro ao atualizar status do utilizador."); }
        else { setUsers(prev => prev.map(u => u.id === id ? { ...u, active } : u)); }
    };

    const handleUserDelete = async (id) => {
        if (confirm("Tem a certeza que quer apagar este utilizador? Esta ação é irreversível.")) {
            const { error } = await supabase.from('profiles').delete().eq('id', id);
            if (error) { alert("Erro ao apagar utilizador."); }
            else { setUsers(prev => prev.filter(u => u.id !== id)); }
        }
    };
    
    const handleViewDetails = (propertyId: string) => {
        router.push(`/properties/${propertyId}`);
    };
    
    const renderContent = () => {
        switch(currentPage) {
            case 'dashboard':
                return <MainDashboardView stats={stats} />;
            case 'properties':
                return <PropertiesView properties={properties} onStatusChange={handlePropertyStatusChange} onDelete={handlePropertyDelete} onViewDetails={handleViewDetails} />;
            case 'users':
                return <UsersView users={users} onStatusChange={handleUserStatusChange} onDelete={handleUserDelete} />;
            default:
                return <PlaceholderView title={currentPage.charAt(0).toUpperCase() + currentPage.slice(1)} />;
        }
    };

    if (loading) return <LoadingScreen />;
    if (error) return <ErrorScreen message={error} />;

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="flex">
                <Sidebar activePage={currentPage} onNavigate={setCurrentPage} onLogout={handleLogout} user={user} />
                <main className="ml-64 p-8 flex-1">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
}
