'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Building, Home, DollarSign, BedDouble, Bath, Ruler, FileText, Plus, Upload, X, ArrowLeft, MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// --- COMPONENTES ---

const Header = () => (
  <header className="bg-white shadow-sm sticky top-0 z-30">
    <div className="container mx-auto px-4 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Building className="text-purple-600" size={28} />
        <span className="text-xl font-bold text-gray-800">ImóveisHuambo</span>
      </div>
      {/* Aqui poderia ter um menu de perfil do vendedor */}
    </div>
  </header>
);

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
}
const FormSection = ({ title, children }: FormSectionProps) => (
    <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-3 mb-4">{title}</h3>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon: React.ReactNode;
  label: string;
  id: string;
}
const InputField = ({ icon, label, id, ...props }: InputFieldProps) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                {icon}
            </span>
            <input id={id} {...props} className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
        </div>
    </div>
);



interface ImageItem {
  url: string;
  name: string;
}

export default function AddPropertyPage() {
    const [loading, setLoading] = useState(true);
    const [images, setImages] = useState<ImageItem[]>([]);
    const [title, setTitle] = useState("");
    const [type, setType] = useState("");
    const [price, setPrice] = useState("");
    const [location, setLocation] = useState("");
    const [beds, setBeds] = useState("");
    const [baths, setBaths] = useState("");
    const [area, setArea] = useState("");
    const [description, setDescription] = useState("");
    const [amenities, setAmenities] = useState<string[]>([]);
    // MUDANÇA: Reativado o hook para navegação
    const router = useRouter();

    // Simula um loading inicial para UX melhor
    useEffect(() => {
        const timeout = setTimeout(() => setLoading(false), 400); // 400ms para UX
        return () => clearTimeout(timeout);
    }, []);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const newImages = files.map((file) => ({
            url: URL.createObjectURL(file as Blob),
            name: (file as File).name
        }));
        setImages((prev) => [...prev, ...newImages]);
    };

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const handleAmenityChange = (amenity: string) => {
        setAmenities((prev) =>
            prev.includes(amenity)
                ? prev.filter((a) => a !== amenity)
                : [...prev, amenity]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const supabase = createClient();
        // Recupera usuário logado do localStorage
        let user = null;
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('user');
            if (stored) user = JSON.parse(stored);
        }
        if (!user || !user.email) {
            alert('Você precisa estar logado para cadastrar um imóvel.');
            router.push('/login');
            return;
        }
        // Prepara os dados para o Supabase
        const newProperty = {
            title,
            type,
            price: Number(price),
            location,
            beds: Number(beds),
            baths: Number(baths),
            area: Number(area),
            description,
            amenities,
            image: images[0]?.url || '',
            owner: user.email,
        };
        // Insere no Supabase
        const { error } = await supabase.from('properties').insert([newProperty]);
        if (error) {
            alert('Erro ao cadastrar imóvel: ' + error.message);
            return;
        }
        router.push('/screen');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="flex flex-col items-center">
                    <svg className="animate-spin h-10 w-10 text-purple-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                    <span className="text-gray-700 font-semibold">Carregando formulário...</span>
                </div>
            </div>
        );
    }
    return (
        <div className="bg-gray-50 min-h-screen">
            <Header />
            <main className="container mx-auto p-4 md:p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-3xl font-bold text-gray-800">Publicar Novo Imóvel</h1>
                        {/* MUDANÇA: Adicionada a função de clique para navegar */}
                        <button 
                            onClick={() => router.push('/dashboard')} 
                            className="flex items-center text-gray-600 hover:text-purple-600 font-semibold"
                        >
                            <ArrowLeft size={20} className="mr-2"/>
                            Voltar para o Dashboard
                        </button>
                    </div>
                    <form className="space-y-8" onSubmit={handleSubmit}>
                        {/* Informações Básicas */}
                        <FormSection title="Informações Básicas">
                            <InputField icon={<FileText size={20}/>} label="Título do Anúncio" id="title" type="text" placeholder="Ex: Vivenda T3 com Quintal" value={title} onChange={e => setTitle(e.target.value)} />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField icon={<Home size={20}/>} label="Tipo de Imóvel" id="type" type="text" placeholder="Apartamento, Vivenda, etc." value={type} onChange={e => setType(e.target.value)} />
                                <InputField icon={<DollarSign size={20}/>} label="Preço (AOA/mês)" id="price" type="number" placeholder="150000" value={price} onChange={e => setPrice(e.target.value)} />
                            </div>
                            <InputField icon={<MapPin size={20}/>} label="Localização" id="location" type="text" placeholder="Bairro, Rua, etc." value={location} onChange={e => setLocation(e.target.value)} />
                        </FormSection>
                        {/* Detalhes do Imóvel */}
                        <FormSection title="Detalhes do Imóvel">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <InputField icon={<BedDouble size={20}/>} label="Quartos" id="beds" type="number" placeholder="3" value={beds} onChange={e => setBeds(e.target.value)} />
                                <InputField icon={<Bath size={20}/>} label="Casas de Banho (WC)" id="baths" type="number" placeholder="2" value={baths} onChange={e => setBaths(e.target.value)} />
                                <InputField icon={<Ruler size={20}/>} label="Área (m²)" id="area" type="number" placeholder="120" value={area} onChange={e => setArea(e.target.value)} />
                            </div>
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                                <textarea id="description" rows={4} className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Descreva os detalhes do seu imóvel..." value={description} onChange={e => setDescription(e.target.value)} />
                            </div>
                        </FormSection>
                        {/* Comodidades */}
                        <FormSection title="Comodidades">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {['Garagem', 'Quintal', 'Piscina', 'Ar Condicionado', 'Cozinha Equipada', 'Varanda', 'Segurança 24h', 'Elevador'].map(item => (
                                    <div key={item} className="flex items-center">
                                        <input id={item} type="checkbox" className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded" checked={amenities.includes(item)} onChange={() => handleAmenityChange(item)} />
                                        <label htmlFor={item} className="ml-2 text-gray-700">{item}</label>
                                    </div>
                                ))}
                            </div>
                        </FormSection>
                        {/* Upload de Imagens */}
                        <FormSection title="Galeria de Imagens">
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                <Upload size={48} className="mx-auto text-gray-400"/>
                                <p className="mt-2 text-gray-600">Arraste e solte as imagens aqui, ou</p>
                                <label htmlFor="image-upload" className="cursor-pointer font-semibold text-purple-600 hover:underline">
                                    clique para selecionar
                                    <input id="image-upload" type="file" multiple accept="image/*" className="sr-only" onChange={handleImageUpload}/>
                                </label>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                {images.map((img, index) => (
                                    <div key={index} className="relative">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={img.url} alt={img.name} className="w-full h-32 object-cover rounded-lg"/>
                                        <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full">
                                            <X size={16}/>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </FormSection>
                        <div className="flex justify-end">
                            <button type="submit" className="flex items-center px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors shadow-md">
                                <Plus size={20} className="mr-2"/>
                                Publicar Anúncio
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
