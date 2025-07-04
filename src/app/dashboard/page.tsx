'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Eye, Building, ArrowLeft, MapPin, BedDouble, Bath, Search, MessageSquare, Briefcase } from 'lucide-react'
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

// --- Adiciona mocks ao banco se não houver dados ---
const initialUserProperties = [
  {
    id: 1,
    title: 'Vivenda T3 Espaçosa no Bairro Académico',
    image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=2670&auto=format&fit=crop',
    status: 'Ativo',
    price: 150000,
    views: 1245,
    location: 'Académico, Huambo',
    beds: 3,
    baths: 2,
    description: 'Uma vivenda deslumbrante com acabamentos de alta qualidade, localizada numa zona calma e segura. Ideal para famílias que procuram conforto e espaço.',
    amenities: ['Garagem', 'Quintal', 'Cozinha Equipada', 'Ar Condicionado'],
    owner: 'proprietario1@email.com',
  },
  {
    id: 2,
    title: 'Apartamento Moderno no Centro da Cidade',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2670&auto=format&fit=crop',
    status: 'Pendente',
    price: 120000,
    views: 832,
    location: 'Centro, Huambo',
    beds: 2,
    baths: 1,
    description: 'Apartamento totalmente remodelado com um design moderno e minimalista. Perfeito para jovens profissionais ou casais.',
    amenities: ['Elevador', 'Varanda', 'Segurança 24h'],
    owner: 'proprietario2@email.com',
  },
  {
    id: 3,
    title: 'Moradia com Quintal na Zona do Sassonde',
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=2574&auto=format&fit=crop',
    status: 'Arrendado',
    price: 180000,
    views: 2350,
    location: 'Sassonde, Huambo',
    beds: 4,
    baths: 3,
    description: 'Excelente moradia para quem gosta de natureza e tranquilidade. Com um vasto quintal com árvores de fruto e espaço para lazer.',
    amenities: ['Quintal Amplo', 'Lareira', 'Área de Churrasco'],
    owner: 'proprietario3@email.com',
  },
];

// --- COMPONENTES ---

const Header = () => {
  const router = useRouter();
  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
    router.push('/login');
  };
  return (
    <header className="bg-white shadow-sm sticky top-0 z-30">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Building className="text-purple-600" size={28} />
          <span className="text-xl font-bold text-gray-800">ImóveisHuambo</span>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium border border-gray-200 shadow-sm"
        >
          Sair
        </button>
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

const PropertyDetailView = ({ property, onGoBack, showEditButton = false }) => (
    <div className="container mx-auto p-4 md:p-8 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
            <button onClick={onGoBack} className="flex items-center text-purple-600 font-semibold hover:underline">
                <ArrowLeft size={20} className="mr-2"/>
                Voltar para o Dashboard
            </button>
            {showEditButton && (
                <button className="flex items-center px-4 py-2 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 shadow-sm transition-colors">
                    <Edit size={18} className="mr-2"/>
                    Editar Anúncio
                </button>
            )}
        </div>
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <img src={property.image} alt={property.title} className="w-full h-64 object-cover"/>
            <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800">{property.title}</h2>
                <div className="flex items-center text-gray-500 mt-2"><MapPin size={16} className="mr-2" /><p>{property.location}</p></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6 text-center">
                    <div className="bg-gray-100 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Status</p>
                        <p className="text-lg font-bold text-gray-800">{property.status}</p>
                    </div>
                    <div className="bg-gray-100 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Preço (AOA/mês)</p>
                        <p className="text-lg font-bold text-purple-600">{new Intl.NumberFormat().format(property.price)}</p>
                    </div>
                    <div className="bg-gray-100 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Visualizações</p>
                        <p className="text-lg font-bold text-gray-800">{property.views}</p>
                    </div>
                    <div className="bg-gray-100 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Contactos</p>
                        <p className="text-lg font-bold text-gray-800">15</p>
                    </div>
                </div>
                <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Descrição</h3>
                    <p className="text-gray-600 leading-relaxed">{property.description}</p>
                </div>
                <div className="mt-6">
                    <h3 className="font-semibold text-gray-800 mb-3">Comodidades</h3>
                    <div className="flex flex-wrap gap-2">
                        {property.amenities.map(item => <span key={item} className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">{item}</span>)}
                    </div>
                </div>
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
    const [selectedProperty, setSelectedProperty] = useState(null); 
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('Todos');
    const router = useRouter();

    // Busca usuário logado (mock de sessão)
    useEffect(() => {
        async function seedAndFetchProperties() {
            let user = null;
            if (typeof window !== 'undefined') {
                const stored = localStorage.getItem('user');
                if (stored) user = JSON.parse(stored);
            }
            if (!user) return;
            const supabase = createClient();
            // Verifica se já existem propriedades no banco para este usuário
            const { data: existing, error } = await supabase.from('properties').select('*').eq('owner', user.email);
            if (!existing || existing.length === 0) {
                // Adiciona mocks do usuário logado
                const userMocks = initialUserProperties.filter(p => p.owner === user.email);
                if (userMocks.length > 0) {
                    await supabase.from('properties').insert(userMocks.map(({id, ...rest}) => rest));
                }
            }
            // Busca atualizada
            const { data } = await supabase.from('properties').select('*').eq('owner', user.email);
            setProperties(data || []);
        }
        seedAndFetchProperties();
    }, []);

    const filteredProperties = properties.filter(prop => {
        const matchesSearch = prop.title?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'Todos' || prop.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleDeleteClick = (property) => {
        setPropertyToDelete(property);
    };

    const confirmDelete = async () => {
        const supabase = createClient();
        await supabase.from('properties').delete().eq('id', propertyToDelete.id);
        setProperties(properties.filter(p => p.id !== propertyToDelete.id));
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
            case 'Rejeitado':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (selectedProperty) {
        return (
            <div className="bg-gray-50 min-h-screen">
                <Header />
                <PropertyDetailView 
                    property={selectedProperty} 
                    onGoBack={() => setSelectedProperty(null)}
                    showEditButton={true} 
                />
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
                        className="mt-4 md:mt-0 flex items-center px-5 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors shadow-md"
                        onClick={() => router.push('/dashboard/adicionar-imovel')}
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
                                <option>Rejeitado</option>
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
                                    <tr key={prop.id} onClick={() => setSelectedProperty(prop)} className="border-b hover:bg-gray-50 cursor-pointer">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-4">
                                                <img src={prop.image} alt={prop.title} className="w-16 h-12 object-cover rounded-md"/>
                                                <span className="font-medium text-gray-800">{prop.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusChip(prop.status)}`}>
                                                {prop.status || 'Pendente'}
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
