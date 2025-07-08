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

const SelectField = ({ icon, label, id, value, onChange, options, disabled = false, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                {icon}
            </span>
            <select id={id} value={value} onChange={onChange} disabled={disabled} {...props} className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none disabled:bg-gray-200">
                <option value="" disabled>Selecione uma opção</option>
                {options.map(option => (
                    <option key={option} value={option}>{option}</option>
                ))}
            </select>
        </div>
    </div>
);

const huamboData = {
    "Huambo": ["Académico", "Centro da Cidade", "São João", "Aviação", "Calomanda", "Sassonde"],
    "Caála": ["Centro de Caála", "Cuima", "Catata"],
    "Bailundo": ["Centro de Bailundo", "Luvemba", "Bimbe", "Hengue"],
};

export default function AddPropertyPage() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    
    const [title, setTitle] = useState("");
    const [listingType, setListingType] = useState('para_arrendar');
    const [propertyType, setPropertyType] = useState("");
    const [price, setPrice] = useState("");
    const [municipality, setMunicipality] = useState("");
    const [bairro, setBairro] = useState("");
    const [availableBairros, setAvailableBairros] = useState([]);
    const [beds, setBeds] = useState("");
    const [baths, setBaths] = useState("");
    const [width, setWidth] = useState("");
    const [length, setLength] = useState("");
    const [description, setDescription] = useState("");
    const [amenities, setAmenities] = useState([]);
    
    const router = useRouter();
    const supabase = createClient();

    const propertyTypes = ['Apartamento', 'Vivenda', 'Moradia', 'Terreno', 'Loja', 'Armazém', 'Escritório', 'Quinta'];
    const municipalities = Object.keys(huamboData);

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

    const handleMunicipalityChange = (e) => {
        const selectedMunicipality = e.target.value;
        setMunicipality(selectedMunicipality);
        setBairro(""); 
        setAvailableBairros(huamboData[selectedMunicipality] || []);
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        setImageFiles(prev => [...prev, ...files]);

        const newImageUrls = files.map(file => URL.createObjectURL(file));
        setImagePreviews(prev => [...prev, ...newImageUrls]);
    };

    const removeImage = (index) => {
        setImagePreviews(imagePreviews.filter((_, i) => i !== index));
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

        setSubmitting(true);

        const uploadedImageUrls = [];
        for (const file of imageFiles) {
            const filePath = `${user.id}/${Date.now()}-${file.name}`;
            // MUDANÇA: Corrigido o nome do bucket para 'property-images'
            const { error: uploadError } = await supabase.storage
                .from('property-images')
                .upload(filePath, file);

            if (uploadError) {
                alert('Erro ao fazer upload da imagem: ' + uploadError.message);
                setSubmitting(false);
                return;
            }
            
            const { data: { publicUrl } } = supabase.storage.from('property-images').getPublicUrl(filePath);
            uploadedImageUrls.push(publicUrl);
        }

        const newProperty = {
            user_id: user.id,
            title,
            type: propertyType,
            listing_type: listingType,
            price: Number(price),
            location: `${bairro}, ${municipality}`,
            beds: Number(beds),
            baths: Number(baths),
            width: Number(width),
            length: Number(length),
            description,
            amenities,
            image_urls: uploadedImageUrls,
            status: 'Pendente',
        };

        const { error: insertError } = await supabase.from('properties').insert([newProperty]);

        if (insertError) {
            alert('Erro ao cadastrar imóvel: ' + insertError.message);
        } else {
            alert('Imóvel cadastrado com sucesso! Aguardando aprovação.');
            router.push('/dashboard');
        }
        setSubmitting(false);
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
                        <FormSection title="Objetivo do Anúncio">
                            <div className="flex rounded-lg bg-gray-100 p-1">
                                <button type="button" onClick={() => setListingType('para_arrendar')} className={`w-1/2 py-2 rounded-md text-sm font-semibold transition-colors ${listingType === 'para_arrendar' ? 'bg-purple-600 text-white' : 'text-gray-600'}`}>Arrendar</button>
                                <button type="button" onClick={() => setListingType('para_venda')} className={`w-1/2 py-2 rounded-md text-sm font-semibold transition-colors ${listingType === 'para_venda' ? 'bg-purple-600 text-white' : 'text-gray-600'}`}>Vender</button>
                            </div>
                        </FormSection>
                        <FormSection title="Informações Básicas">
                            <InputField icon={<FileText size={20}/>} label="Título do Anúncio" id="title" type="text" placeholder="Ex: Vivenda T3 com Quintal" value={title} onChange={e => setTitle(e.target.value)} required/>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <SelectField icon={<Home size={20}/>} label="Tipo de Imóvel" id="type" value={propertyType} onChange={e => setPropertyType(e.target.value)} options={propertyTypes} required/>
                                <InputField icon={<DollarSign size={20}/>} label={listingType === 'para_arrendar' ? "Preço (AOA/mês)" : "Preço (AOA)"} id="price" type="number" min="0" placeholder="150000" value={price} onChange={e => setPrice(e.target.value)} required/>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <SelectField icon={<MapPin size={20}/>} label="Município" id="municipality" value={municipality} onChange={handleMunicipalityChange} options={municipalities} required/>
                                <SelectField icon={<MapPin size={20}/>} label="Bairro" id="bairro" value={bairro} onChange={e => setBairro(e.target.value)} options={availableBairros} disabled={!municipality} required/>
                            </div>
                        </FormSection>
                        <FormSection title="Detalhes do Imóvel">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <InputField icon={<BedDouble size={20}/>} label="Quartos" id="beds" type="number" min="0" placeholder="3" value={beds} onChange={e => setBeds(e.target.value)} required/>
                                <InputField icon={<Bath size={20}/>} label="Casas de Banho (WC)" id="baths" type="number" min="0" placeholder="2" value={baths} onChange={e => setBaths(e.target.value)} required/>
                                <div className="flex items-center space-x-2">
                                    <InputField icon={<Ruler size={20}/>} label="Largura (m)" id="width" type="number" min="0" placeholder="15" value={width} onChange={e => setWidth(e.target.value)}/>
                                    <InputField icon={<Ruler size={20}/>} label="Comprimento (m)" id="length" type="number" min="0" placeholder="20" value={length} onChange={e => setLength(e.target.value)}/>
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
                                {imagePreviews.map((url, index) => (
                                    <div key={index} className="relative">
                                        <img src={url} alt={`Preview ${index}`} className="w-full h-32 object-cover rounded-lg"/>
                                        <button type="button" onClick={() => removeImage(index)} className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full">
                                            <X size={16}/>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </FormSection>

                        <div className="flex justify-end">
                            <button type="submit" disabled={submitting} className="flex items-center px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors shadow-md disabled:opacity-50">
                                {submitting ? <LoaderCircle size={20} className="animate-spin mr-2"/> : <Plus size={20} className="mr-2"/>}
                                Publicar Anúncio
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
