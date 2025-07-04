"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Edit, Trash2, Eye, CheckCircle, XCircle, User, Home, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const TABS = [
  { key: "properties", label: "Propriedades", icon: <Home size={18} /> },
  { key: "owners", label: "Proprietários", icon: <User size={18} /> },
  { key: "clients", label: "Clientes", icon: <User size={18} /> },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState("properties");
  const [properties, setProperties] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();

  // Protege acesso: só admin logado pode acessar
  useEffect(() => {
    let isAdmin = false;
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('user');
      if (stored) {
        const user = JSON.parse(stored);
        if (user.email === 'paulokakoma19@gmail.com') isAdmin = true;
      }
    }
    if (!isAdmin) {
      router.replace('/login');
      return;
    }
    setAuthChecked(true);
  }, []);

  useEffect(() => {
    if (!authChecked) return;
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, authChecked]);

  async function fetchData() {
    setLoading(true);
    const supabase = createClient();
    if (tab === "properties") {
      const { data, error } = await supabase.from("properties").select("*");
      setProperties(data || []);
    } else {
      const { data, error } = await supabase.from("users").select("*");
      setUsers(data || []);
    }
    setLoading(false);
  }

  async function handleApproveProperty(id) {
    const supabase = createClient();
    await supabase.from("properties").update({ status: "Ativo" }).eq("id", id);
    fetchData();
  }
  async function handleRejectProperty(id) {
    const supabase = createClient();
    await supabase.from("properties").update({ status: "Rejeitado" }).eq("id", id);
    fetchData();
  }
  async function handleToggleUserActive(id, active) {
    const supabase = createClient();
    await supabase.from("users").update({ active: !active }).eq("id", id);
    fetchData();
  }
  async function handleDeleteProperty(id) {
    const supabase = createClient();
    await supabase.from("properties").delete().eq("id", id);
    fetchData();
  }
  async function handleDeleteUser(id) {
    const supabase = createClient();
    await supabase.from("users").delete().eq("id", id);
    fetchData();
  }

  if (!authChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <span className="text-gray-700 font-semibold">Verificando permissão...</span>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <span className="text-xl font-bold text-gray-800 flex items-center gap-2">
            Painel Admin
          </span>
        </div>
      </header>
      <main className="container mx-auto p-4 md:p-8">
        <div className="flex gap-4 mb-8">
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold border transition-colors ${tab === t.key ? "bg-purple-600 text-white" : "bg-white text-gray-700 border-gray-200 hover:bg-purple-50"}`}
              onClick={() => setTab(t.key)}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-purple-600" size={32} />
          </div>
        ) : tab === "properties" ? (
          <div className="bg-white rounded-xl shadow-md overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-sm font-semibold text-gray-600">Título</th>
                  <th className="px-6 py-3 text-sm font-semibold text-gray-600">Status</th>
                  <th className="px-6 py-3 text-sm font-semibold text-gray-600">Preço</th>
                  <th className="px-6 py-3 text-sm font-semibold text-gray-600">Ações</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((prop) => (
                  <tr key={prop.id} className="border-b">
                    <td className="px-6 py-4">{prop.title}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${prop.status === "Ativo" ? "bg-green-100 text-green-800" : prop.status === "Pendente" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}>
                        {prop.status || "Pendente"}
                      </span>
                    </td>
                    <td className="px-6 py-4">{prop.price}</td>
                    <td className="px-6 py-4 flex gap-2">
                      {prop.status !== "Ativo" && (
                        <button onClick={() => handleApproveProperty(prop.id)} className="p-2 text-green-600 hover:bg-green-50 rounded-full" title="Aprovar"><CheckCircle size={18} /></button>
                      )}
                      {prop.status !== "Rejeitado" && (
                        <button onClick={() => handleRejectProperty(prop.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-full" title="Rejeitar"><XCircle size={18} /></button>
                      )}
                      <button onClick={() => handleDeleteProperty(prop.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full" title="Excluir"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-sm font-semibold text-gray-600">Nome</th>
                  <th className="px-6 py-3 text-sm font-semibold text-gray-600">E-mail</th>
                  <th className="px-6 py-3 text-sm font-semibold text-gray-600">Tipo</th>
                  <th className="px-6 py-3 text-sm font-semibold text-gray-600">Status</th>
                  <th className="px-6 py-3 text-sm font-semibold text-gray-600">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b">
                    <td className="px-6 py-4">{user.name}</td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">{user.role || "Cliente"}</td>
                    <td className="px-6 py-4">
                      <button onClick={() => handleToggleUserActive(user.id, user.active)} className={`px-3 py-1 text-xs font-semibold rounded-full ${user.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                        {user.active ? "Ativo" : "Inativo"}
                      </button>
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <button onClick={() => handleDeleteUser(user.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full" title="Excluir"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
