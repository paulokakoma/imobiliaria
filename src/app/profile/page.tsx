'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User, Mail, Edit3, Shield, Trash2, Save, X, LoaderCircle, Building, ChevronDown, Camera } from 'lucide-react'

// --- COMPONENTES ---

const Header = () => {
    const router = useRouter();
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
        </div>
      </header>
    );
};

const ChevronDownIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="m6 9 6 6 6-6"/>
    </svg>
);

const ProfileCard = ({ profile, onEdit, onAvatarChange, isUploading }) => (
    <div className="flex items-center space-x-6">
        <div className="relative">
            <img 
                className="h-24 w-24 rounded-full object-cover" 
                src={profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.first_name}+${profile.last_name}&background=8b5cf6&color=fff&size=128`} 
                alt="Avatar do utilizador" 
            />
            <label htmlFor="avatar-upload" className="absolute -bottom-1 -right-1 bg-purple-600 p-2 rounded-full cursor-pointer hover:bg-purple-700 transition-colors border-2 border-white">
                {isUploading ? <LoaderCircle size={16} className="text-white animate-spin"/> : <Camera size={16} className="text-white"/>}
            </label>
            <input id="avatar-upload" type="file" accept="image/*" className="sr-only" onChange={onAvatarChange} disabled={isUploading}/>
        </div>
        <div>
            <h2 className="text-2xl font-bold text-gray-800">{profile.first_name} {profile.last_name}</h2>
            <p className="text-gray-500 flex items-center mt-1"><Mail size={16} className="mr-2"/>{profile.email}</p>
        </div>
        <button onClick={onEdit} className="ml-auto p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-full">
            <Edit3 size={20} />
        </button>
    </div>
);

const EditProfileForm = ({ profile, setProfile, onSave, onCancel }) => (
    <div className="animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
                type="text" 
                value={profile.first_name}
                onChange={(e) => setProfile({...profile, first_name: e.target.value})}
                placeholder="Nome"
                className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <input 
                type="text" 
                value={profile.last_name}
                onChange={(e) => setProfile({...profile, last_name: e.target.value})}
                placeholder="Sobrenome"
                className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
        </div>
        <div className="flex justify-end space-x-4 mt-4">
            <button onClick={onCancel} className="flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
                <X size={18} className="mr-2"/>Cancelar
            </button>
            <button onClick={onSave} className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                <Save size={18} className="mr-2"/>Guardar
            </button>
        </div>
    </div>
);

const ChangePasswordForm = ({ onSave, onCancel }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleSave = () => {
        if (newPassword.length < 6) { setError('A nova senha deve ter pelo menos 6 caracteres.'); return; }
        if (newPassword !== confirmPassword) { setError('As senhas não coincidem.'); return; }
        setError('');
        onSave(newPassword);
    };

    return (
        <div className="animate-fade-in space-y-4 pt-4">
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Nova Senha" className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"/>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirmar Nova Senha" className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"/>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex justify-end space-x-4 mt-4">
                <button onClick={onCancel} className="flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"><X size={18} className="mr-2"/>Cancelar</button>
                <button onClick={handleSave} className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"><Save size={18} className="mr-2"/>Alterar Senha</button>
            </div>
        </div>
    );
};

const DeleteAccountModal = ({ onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4 animate-fade-in-up">
            <h3 className="text-lg font-bold text-gray-800">Apagar Conta</h3>
            <p className="mt-2 text-gray-600">Tem a certeza absoluta? Esta ação é permanente e todos os seus dados e anúncios serão apagados.</p>
            <div className="mt-6 flex justify-end space-x-4">
                <button onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancelar</button>
                <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Sim, apagar a minha conta</button>
            </div>
        </div>
    </div>
);


export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [originalProfile, setOriginalProfile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    
    const [securityView, setSecurityView] = useState('default'); 
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const fetchUserData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push('/login'); return; }
            setUser(user);

            const { data: profileData, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            
            if (error) { console.error("Erro ao buscar perfil:", error); } 
            else {
                const fullProfile = { ...profileData, email: user.email };
                setProfile(fullProfile);
                setOriginalProfile(fullProfile);
            }
            setLoading(false);
        };
        fetchUserData();
    }, [router, supabase]);

    const handleEditToggle = () => {
        if (isEditing) { setProfile(originalProfile); }
        setIsEditing(!isEditing);
    };

    const handleSaveProfile = async () => {
        if (!profile) return;
        const { error } = await supabase.from('profiles').update({ first_name: profile.first_name, last_name: profile.last_name }).eq('id', user.id);
        if (error) { alert("Erro ao atualizar o perfil: " + error.message); } 
        else { setOriginalProfile(profile); setIsEditing(false); alert("Perfil atualizado com sucesso!"); }
    };

    const handleUpdatePassword = async (newPassword) => {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) { alert("Erro ao alterar a senha: " + error.message); } 
        else { alert("Senha alterada com sucesso!"); setSecurityView('default'); }
    };

    const handleAvatarUpload = async (event) => {
        if (!event.target.files || event.target.files.length === 0) return;
        const file = event.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;
        
        setIsUploading(true);
        
        const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });

        if (uploadError) {
            alert("Erro ao fazer upload da imagem: " + uploadError.message);
            setIsUploading(false);
            return;
        }

        const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
        const publicUrl = data.publicUrl;

        const { error: updateError } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);

        if (updateError) {
            alert("Erro ao guardar o URL do avatar: " + updateError.message);
        } else {
            setProfile(prev => ({...prev, avatar_url: publicUrl}));
            setOriginalProfile(prev => ({...prev, avatar_url: publicUrl}));
        }
        setIsUploading(false);
    };

    const handleDeleteAccount = async () => {
        alert("Funcionalidade de apagar conta em desenvolvimento. Por agora, a sua sessão será terminada.");
        await supabase.auth.signOut();
        router.push('/login');
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    if (loading || !profile) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <LoaderCircle className="animate-spin text-purple-600" size={48} />
            </div>
        );
    }

    return (
        <div className="bg-gray-100 min-h-screen">
            <Header />
            <main className="container mx-auto p-4 md:p-8">
                <div className="max-w-2xl mx-auto space-y-8">
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        {!isEditing ? (
                            <ProfileCard profile={profile} onEdit={handleEditToggle} onAvatarChange={handleAvatarUpload} isUploading={isUploading}/>
                        ) : (
                            <EditProfileForm profile={profile} setProfile={setProfile} onSave={handleSaveProfile} onCancel={handleEditToggle} />
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-3 mb-4">Segurança da Conta</h3>
                        {securityView === 'default' && (
                            <div className="space-y-4 animate-fade-in">
                                <button onClick={() => setSecurityView('changePassword')} className="w-full flex justify-between items-center p-4 text-left text-gray-700 hover:bg-gray-50 rounded-lg border">
                                    <span className="flex items-center"><Shield size={20} className="mr-3 text-purple-600"/> Alterar Senha</span>
                                    <ChevronDownIcon className="-rotate-90"/>
                                </button>
                                <button onClick={() => setShowDeleteModal(true)} className="w-full flex justify-between items-center p-4 text-left text-red-600 hover:bg-red-50 rounded-lg border border-red-200">
                                    <span className="flex items-center"><Trash2 size={20} className="mr-3"/> Apagar Conta</span>
                                    <ChevronDownIcon className="-rotate-90"/>
                                </button>
                            </div>
                        )}
                        {securityView === 'changePassword' && (
                            <ChangePasswordForm onSave={handleUpdatePassword} onCancel={() => setSecurityView('default')} />
                        )}
                    </div>

                    <div className="pt-4">
                        <button onClick={handleLogout} className="w-full py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors">
                            Sair da Conta
                        </button>
                    </div>
                </div>
            </main>
            {showDeleteModal && <DeleteAccountModal onConfirm={handleDeleteAccount} onCancel={() => setShowDeleteModal(false)} />}
        </div>
    );
}
