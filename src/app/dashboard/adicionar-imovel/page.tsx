'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Building, Home, DollarSign, BedDouble, Bath, Ruler, FileText, Plus, Upload, X, ArrowLeft, MapPin, LoaderCircle } from 'lucide-react'

// --- COMPONENTES ---

const Header = () => (
  <header className="bg-white shadow-sm sticky top-0 z-30">
    <div className="container mx-auto px-4 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Building className="text-purple-600" size={28} />
        <span className="text-xl font-bold text-gray-800">ImóveisHuambo</span>
      </div>
    </div>
  </header>
);

const FormSection = ({ title, children }) => (
    <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-3 mb-4">{title}</h3>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

const InputField = ({ icon, label, id, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                {icon}
            </span>
            <input id={id} {...props} className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"/>
        </div>
    </div>
);

export default function AddPropertyPage() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [images, setImages] = useState([]);
    const [imageFiles, setImageFiles] = useState([]);
    const [title, setTitle] = useState("");
    const [type, setType] = useState("");
    const [price, setPrice] = useState("");
    const [location, setLocation] = useState("");
    const [beds, setBeds] = useState("");
    const [baths, setBaths] = useState("");
    const [width, setWidth] = useState("");
    const [length, setLength] = useState("");
    const [description, setDescription] = useState("");
    const [amenities, setAmenities] = useState([]);
    
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
            } else {
                setUser(user);
                setLoading(false);
            }
        };
        checkUser();
    }, [router, supabase]);

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const newImageFiles = [...imageFiles, ...files];
        setImageFiles(newImageFiles);

        const newImageUrls = files.map(file => ({
            url: URL.createObjectURL(file),
            name: file.name
        }));
        setImages(prev => [...prev, ...newImageUrls]);
    };

    const removeImage = (index) => {
        setImages(images.filter((_, i) => i !== index));
        setImageFiles(imageFiles.filter((_, i) => i !== index));
    };

    const handleAmenityChange = (amenity) => {
        setAmenities((prev) =>
            prev.includes(amenity)
                ? prev.filter((a) => a !== amenity)
                : [...prev, amenity]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            alert('Sessão expirada. Por favor, faça login novamente.');
            router.push('/login');
            return;
        }

        setLoading(true);

        const imageUrls = [];
        for (const file of imageFiles) {
            const filePath = `${user.id}/${Date.now()}-${file.name}`;
            const { error: uploadError } = await supabase.storage
                .from('property_images')
                .upload(filePath, file);

            if (uploadError) {
                alert('Erro ao fazer upload da imagem: ' + uploadError.message);
                setLoading(false);
                return;
            }
            
            const { data: { publicUrl } } = supabase.storage.from('property_images').getPublicUrl(filePath);
            imageUrls.push(publicUrl);
        }

        const newProperty = {
            user_id: user.id,
            title,
            type,
            price: Number(price),
            location,
            beds: Number(beds),
            baths: Number(baths),
            width: Number(width),
            length: Number(length),
            description,
            amenities,
            image_urls: imageUrls,
            status: 'Pendente',
        };

        const { error: insertError } = await supabase.from('properties').insert([newProperty]);

        if (insertError) {
            alert('Erro ao cadastrar imóvel: ' + insertError.message);
        } else {
            alert('Imóvel cadastrado com sucesso! Aguardando aprovação.');
            router.push('/dashboard');
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <LoaderCircle className="animate-spin h-10 w-10 text-purple-600" />
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
                        <button onClick={() => router.push('/dashboard')} className="flex items-center text-gray-600 hover:text-purple-600 font-semibold">
                            <ArrowLeft size={20} className="mr-2"/>
                            Voltar para o Dashboard
                        </button>
                    </div>

                    <form className="space-y-8" onSubmit={handleSubmit}>
                        <FormSection title="Informações Básicas">
                            <InputField icon={<FileText size={20}/>} label="Título do Anúncio" id="title" type="text" placeholder="Ex: Vivenda T3 com Quintal" value={title} onChange={e => setTitle(e.target.value)} required/>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField icon={<Home size={20}/>} label="Tipo de Imóvel" id="type" type="text" placeholder="Apartamento, Vivenda, etc." value={type} onChange={e => setType(e.target.value)} required/>
                                <InputField icon={<DollarSign size={20}/>} label="Preço (AOA/mês)" id="price" type="number" placeholder="150000" value={price} onChange={e => setPrice(e.target.value)} required/>
                            </div>
                            <InputField icon={<MapPin size={20}/>} label="Localização" id="location" type="text" placeholder="Bairro, Rua, etc." value={location} onChange={e => setLocation(e.target.value)} required/>
                        </FormSection>

                        <FormSection title="Detalhes do Imóvel">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <InputField icon={<BedDouble size={20}/>} label="Quartos" id="beds" type="number" placeholder="3" value={beds} onChange={e => setBeds(e.target.value)} required/>
                                <InputField icon={<Bath size={20}/>} label="Casas de Banho (WC)" id="baths" type="number" placeholder="2" value={baths} onChange={e => setBaths(e.target.value)} required/>
                                <div className="flex items-center space-x-2">
                                    <InputField icon={<Ruler size={20}/>} label="Largura (m)" id="width" type="number" placeholder="15" value={width} onChange={e => setWidth(e.target.value)}/>
                                    <InputField icon={<Ruler size={20}/>} label="Comprimento (m)" id="length" type="number" placeholder="20" value={length} onChange={e => setLength(e.target.value)}/>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                                <textarea id="description" rows="4" className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Descreva os detalhes do seu imóvel..." value={description} onChange={e => setDescription(e.target.value)} required></textarea>
                            </div>
                        </FormSection>

                        <FormSection title="Comodidades">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {['Garagem', 'Quintal', 'Piscina', 'Ar Condicionado', 'Cozinha Equipada', 'Varanda', 'Segurança 24h', 'Elevador'].map(item => (
                                    <div key={item} className="flex items-center">
                                        <input id={item} type="checkbox" className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded" checked={amenities.includes(item)} onChange={() => handleAmenityChange(item)}/>
                                        <label htmlFor={item} className="ml-2 text-gray-700">{item}</label>
                                    </div>
                                ))}
                            </div>
                        </FormSection>
                        
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
                                        <img src={img.url} alt={img.name} className="w-full h-32 object-cover rounded-lg"/>
                                        <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full">
                                            <X size={16}/>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </FormSection>

                        <div className="flex justify-end">
                            <button type="submit" disabled={loading} className="flex items-center px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors shadow-md disabled:opacity-50">
                                {loading ? <LoaderCircle size={20} className="animate-spin mr-2"/> : <Plus size={20} className="mr-2"/>}
                                Publicar Anúncio
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
