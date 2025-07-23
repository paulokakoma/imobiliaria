'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Building, Home, DollarSign, BedDouble, Bath, Ruler, FileText, Save, Upload, X, ArrowLeft, MapPin, LoaderCircle, Trash2, Plus } from 'lucide-react'

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

export default function EditPropertyPage() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({
        title: "",
        listing_type: 'para_arrendar',
        property_type: "",
        price: "",
        municipality: "",
        bairro: "",
        beds: "",
        baths: "",
        width: "",
        length: "",
        description: "",
        amenities: [],
        image_gallery: [],
    });
    
    const [imagesToDelete, setImagesToDelete] = useState([]);

    const router = useRouter();
    const params = useParams();
    const { id } = params;

    const supabase = createClient();

    const propertyTypes = ['Apartamento', 'Vivenda', 'Moradia', 'Terreno', 'Loja', 'Armazém', 'Escritório', 'Quinta'];
    const municipalities = Object.keys(huamboData);
    const availableBairros = formData.municipality ? huamboData[formData.municipality] || [] : [];

    useEffect(() => {
        const fetchProperty = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }
            setUser(user);

            const { data, error } = await supabase.from('properties').select('*').eq('id', id).single();

            if (error || !data) {
                alert("Imóvel não encontrado ou erro ao carregar.");
                router.push('/dashboard');
                return;
            }

            const locationParts = data.location ? data.location.split(', ') : ['', ''];
            setFormData({
                ...data,
                municipality: locationParts[1] || '',
                bairro: locationParts[0] || '',
                property_type: data.type || "",
                image_gallery: data.image_gallery || []
            });
            setLoading(false);
        };
        fetchProperty();
    }, [id, router, supabase]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMunicipalityChange = (e) => {
        const selectedMunicipality = e.target.value;
        setFormData(prev => ({
            ...prev,
            municipality: selectedMunicipality,
            bairro: ''
        }));
    };

    const handleImageChange = (index, file) => {
        const newGallery = [...formData.image_gallery];
        newGallery[index] = {
            ...newGallery[index],
            file: file,
            url: URL.createObjectURL(file)
        };
        setFormData(prev => ({ ...prev, image_gallery: newGallery }));
    };

    const handleImageNameChange = (index, name) => {
        const newGallery = [...formData.image_gallery];
        newGallery[index].name = name;
        setFormData(prev => ({ ...prev, image_gallery: newGallery }));
    };

    const addImageSlot = () => {
        setFormData(prev => ({
            ...prev,
            image_gallery: [...prev.image_gallery, { file: null, url: '', name: '' }]
        }));
    };

    const removeImage = (index, image) => {
        setFormData(prev => ({...prev, image_gallery: prev.image_gallery.filter((_, i) => i !== index)}));
        if (image.url && !image.url.startsWith('blob:')) {
            setImagesToDelete(prev => [...prev, image]);
        }
    };

    const handleAmenityChange = (amenity) => {
        setFormData(prev => ({
            ...prev,
            amenities: prev.amenities.includes(amenity)
                ? prev.amenities.filter((a) => a !== amenity)
                : [...prev.amenities, amenity]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        if (imagesToDelete.length > 0) {
            const filePaths = imagesToDelete.map(img => img.url.substring(img.url.indexOf(user.id)));
            await supabase.storage.from('property-images').remove(filePaths);
        }

        const updatedImageGallery = await Promise.all(
            formData.image_gallery.map(async (image) => {
                if (image.file) {
                    const filePath = `${user.id}/${image.name.replace(/\s+/g, '_') || 'imagem'}/${Date.now()}-${image.file.name}`;
                    const { error: uploadError } = await supabase.storage.from('property-images').upload(filePath, image.file);
                    if (uploadError) {
                        alert('Erro ao fazer upload da imagem: ' + uploadError.message);
                        throw uploadError;
                    }
                    const { data: { publicUrl } } = supabase.storage.from('property-images').getPublicUrl(filePath);
                    return { name: image.name, url: publicUrl };
                }
                return image;
            })
        );

        const updatedProperty = {
            title: formData.title,
            type: formData.property_type,
            listing_type: formData.listing_type,
            price: Number(formData.price),
            location: `${formData.bairro}, ${formData.municipality}`,
            beds: Number(formData.beds),
            baths: Number(formData.baths),
            width: Number(formData.width),
            length: Number(formData.length),
            description: formData.description,
            amenities: formData.amenities,
            image_gallery: updatedImageGallery,
            image_urls: updatedImageGallery.map(img => img.url),
        };

        const { error: updateError } = await supabase.from('properties').update(updatedProperty).eq('id', id);

        if (updateError) {
            alert('Erro ao atualizar imóvel: ' + updateError.message);
        } else {
            alert('Imóvel atualizado com sucesso!');
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
                        <h1 className="text-3xl font-bold text-gray-800">Editar Imóvel</h1>
                        <button onClick={() => router.push('/dashboard')} className="flex items-center text-gray-600 hover:text-purple-600 font-semibold">
                            <ArrowLeft size={20} className="mr-2"/>
                            Voltar para o Dashboard
                        </button>
                    </div>

                    <form className="space-y-8" onSubmit={handleSubmit}>
                        <FormSection title="Informações Básicas">
                            <InputField icon={<FileText size={20}/>} label="Título do Anúncio" id="title" name="title" type="text" value={formData.title || ''} onChange={handleChange} required/>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <SelectField icon={<Home size={20}/>} label="Tipo de Imóvel" id="property_type" name="property_type" value={formData.property_type || ''} onChange={handleChange} options={propertyTypes} required/>
                                <InputField icon={<DollarSign size={20}/>} label="Preço (AOA)" id="price" name="price" type="number" min="0" value={formData.price || ''} onChange={handleChange} required/>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <SelectField icon={<MapPin size={20}/>} label="Município" id="municipality" value={formData.municipality || ''} onChange={handleMunicipalityChange} options={municipalities} required/>
                                <SelectField icon={<MapPin size={20}/>} label="Bairro" id="bairro" name="bairro" value={formData.bairro || ''} onChange={handleChange} options={availableBairros} disabled={!formData.municipality} required/>
                            </div>
                        </FormSection>

                        <FormSection title="Detalhes do Imóvel">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <InputField icon={<BedDouble size={20}/>} label="Quartos" id="beds" name="beds" type="number" min="0" value={formData.beds || ''} onChange={handleChange} required/>
                                <InputField icon={<Bath size={20}/>} label="Casas de Banho (WC)" id="baths" name="baths" type="number" min="0" value={formData.baths || ''} onChange={handleChange} required/>
                                <div className="flex items-center space-x-2">
                                    <InputField icon={<Ruler size={20}/>} label="Largura (m)" id="width" name="width" type="number" min="0" value={formData.width || ''} onChange={handleChange}/>
                                    <InputField icon={<Ruler size={20}/>} label="Comprimento (m)" id="length" name="length" type="number" min="0" value={formData.length || ''} onChange={handleChange}/>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                                <textarea id="description" name="description" rows="4" className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" value={formData.description || ''} onChange={handleChange} required></textarea>
                            </div>
                        </FormSection>

                        <FormSection title="Comodidades">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {['Garagem', 'Quintal', 'Piscina', 'Ar Condicionado', 'Cozinha Equipada', 'Varanda', 'Segurança 24h', 'Elevador'].map(item => (
                                    <div key={item} className="flex items-center">
                                        <input id={item} type="checkbox" className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded" checked={formData.amenities.includes(item)} onChange={() => handleAmenityChange(item)}/>
                                        <label htmlFor={item} className="ml-2 text-gray-700">{item}</label>
                                    </div>
                                ))}
                            </div>
                        </FormSection>

                        <FormSection title="Galeria de Imagens">
                            <p className="text-sm text-gray-500">Adicione ou remova imagens para cada compartimento.</p>
                            <div className="space-y-4">
                                {formData.image_gallery.map((image, index) => (
                                    <div key={index} className="flex items-center space-x-4">
                                        <label htmlFor={`image-upload-${index}`} className="flex-shrink-0 w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-purple-500">
                                            {image.url ? (
                                                <img src={image.url} alt="Preview" className="w-full h-full object-cover rounded-lg"/>
                                            ) : (
                                                <Upload size={32} className="text-gray-400"/>
                                            )}
                                            <input id={`image-upload-${index}`} type="file" accept="image/*" className="sr-only" onChange={(e) => handleImageChange(index, e.target.files[0])}/>
                                        </label>
                                        <div className="flex-grow">
                                            <InputField icon={<Home size={20}/>} label="Nome do Compartimento" id={`compartment-name-${index}`} type="text" placeholder="Ex: Sala de Estar" value={image.name} onChange={(e) => handleImageNameChange(index, e.target.value)} />
                                        </div>
                                        <button type="button" onClick={() => removeImage(index, image)} className="p-2 text-red-500 hover:bg-red-100 rounded-full">
                                            <Trash2 size={20}/>
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button type="button" onClick={addImageSlot} className="mt-4 flex items-center text-purple-600 font-semibold hover:underline">
                                <Plus size={18} className="mr-2"/> Adicionar mais um compartimento
                            </button>
                        </FormSection>

                        <div className="flex justify-end">
                            <button type="submit" disabled={submitting} className="flex items-center px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors shadow-md disabled:opacity-50">
                                {submitting ? <LoaderCircle size={20} className="animate-spin mr-2"/> : <Save size={20} className="mr-2"/>}
                                Guardar Alterações
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
