'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Plus, Edit, Trash2, Eye, Building, ArrowLeft, MapPin, BedDouble, Bath, Search, MessageSquare, Briefcase, UserCircle, LogOut, User as UserIcon, LoaderCircle } from 'lucide-react'

// --- COMPONENTES ---

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

const DeleteConfirmationModal = ({ propertyTitle, onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-gray-800">Confirmar Exclusão</h3>
            <p className="mt-2 text-gray-600">
                Tem a certeza de que deseja apagar o anúncio para <span className="font-semibold">"{propertyTitle}"</span>? Esta ação não pode ser desfeita.
            </p>
            <div className="mt-6 flex justify-end space-x-4">
                <button onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
                    Cancelar
                </button>
                <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                    Apagar
                </button>
            </div>
        </div>
    </div>
);

const StatCard = ({ icon, title, value, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-md flex items-center space-x-4">
        <div className={`p-3 rounded-full ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);


export default function SellerDashboardPage() {
    const [properties, setProperties] = useState([]);
    const [propertyToDelete, setPropertyToDelete] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('Todos');

    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const fetchUserProperties = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push('/login');
                return;
            }

            const { data, error } = await supabase
                .from('properties')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Erro ao buscar imóveis:", error);
            } else {
                setProperties(data || []);
            }
            setLoading(false);
        };

        fetchUserProperties();
    }, [router, supabase]);

    const filteredProperties = properties.filter(prop => {
        const matchesSearch = prop.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'Todos' || prop.status === statusFilter;
        return matchesSearch && matchesStatus;
    });
    
    const handleDeleteClick = (property) => {
        setPropertyToDelete(property);
    };

    const confirmDelete = async () => {
        if (!propertyToDelete) return;
        const { error } = await supabase.from('properties').delete().eq('id', propertyToDelete.id);
        
        if (error) {
            alert("Erro ao apagar o imóvel: " + error.message);
        } else {
            setProperties(properties.filter(p => p.id !== propertyToDelete.id));
        }
        setPropertyToDelete(null);
    };

    const cancelDelete = () => {
        setPropertyToDelete(null);
    };

    const getStatusChip = (status) => {
        switch (status) {
            case 'Ativo':
                return 'bg-green-100 text-green-800';
            case 'Pendente':
                return 'bg-yellow-100 text-yellow-800';
            case 'Arrendado':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };
    
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <LoaderCircle className="animate-spin text-purple-600" size={48} />
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <Header />
            
            {propertyToDelete && (
                <DeleteConfirmationModal
                    propertyTitle={propertyToDelete.title}
                    onConfirm={confirmDelete}
                    onCancel={cancelDelete}
                />
            )}

            <main className="container mx-auto p-4 md:p-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">O Meu Dashboard</h1>
                        <p className="mt-1 text-gray-500">Gestão dos seus anúncios de imóveis.</p>
                    </div>
                    <button 
                        onClick={() => router.push('/dashboard/adicionar-imovel')}
                        className="mt-4 md:mt-0 flex items-center px-5 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors shadow-md"
                    >
                        <Plus size={20} className="mr-2" />
                        Publicar Novo Imóvel
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard icon={<Briefcase size={24} className="text-purple-600"/>} title="Total de Imóveis" value={properties.length} color="bg-purple-100"/>
                    <StatCard icon={<Eye size={24} className="text-blue-600"/>} title="Total de Visualizações" value={properties.reduce((acc, p) => acc + (p.views || 0), 0).toLocaleString()} color="bg-blue-100"/>
                    <StatCard icon={<MessageSquare size={24} className="text-green-600"/>} title="Novas Mensagens" value="5" color="bg-green-100"/>
                </div>

                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="p-4 border-b flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="relative w-full md:w-1/3">
                            <input 
                                type="text"
                                placeholder="Pesquisar nos seus anúncios..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        </div>
                        <div className="flex items-center space-x-2">
                            <label htmlFor="status" className="text-sm font-medium text-gray-600">Status:</label>
                            <select 
                                id="status"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="bg-gray-100 border-transparent rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                                <option>Todos</option>
                                <option>Ativo</option>
                                <option>Pendente</option>
                                <option>Arrendado</option>
                            </select>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-sm font-semibold text-gray-600">Imóvel</th>
                                    <th className="px-6 py-3 text-sm font-semibold text-gray-600">Status</th>
                                    <th className="px-6 py-3 text-sm font-semibold text-gray-600">Preço (AOA/mês)</th>
                                    <th className="px-6 py-3 text-sm font-semibold text-gray-600">Visualizações</th>
                                    <th className="px-6 py-3 text-sm font-semibold text-gray-600 text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProperties.map(prop => (
                                    <tr key={prop.id} className="border-b hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-4">
                                                <img src={prop.image_urls?.[0] || 'https://placehold.co/600x400/EEE/31343C?text=Sem+Imagem'} alt={prop.title} className="w-16 h-12 object-cover rounded-md"/>
                                                <span className="font-medium text-gray-800">{prop.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusChip(prop.status)}`}>
                                                {prop.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-700">{new Intl.NumberFormat().format(prop.price)}</td>
                                        <td className="px-6 py-4 text-gray-700">{prop.views || 0}</td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center space-x-2">
                                                <button onClick={(e) => { e.stopPropagation(); alert('Editar imóvel ' + prop.id); }} className="p-2 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-full"><Edit size={18}/></button>
                                                <button onClick={(e) => { e.stopPropagation(); handleDeleteClick(prop); }} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full"><Trash2 size={18}/></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
