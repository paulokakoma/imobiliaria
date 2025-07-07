'use client';

import SwitchButton from 'bootstrap-switch-button-react';
import Dropdown from 'react-bootstrap/Dropdown';
import 'bootstrap/dist/css/bootstrap.min.css';

// --- Tipos ---
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  active: boolean;
}
interface Property {
  id: number;
  title: string;
  status: string;
  price: number;
  statusChangedAt?: string | null;
  type?: string; // 'venda' ou 'arrendamento'
}

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Trash2, CheckCircle, XCircle, User, Home, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
const TABS = [
  { key: "properties", label: "Propriedades", icon: <Home size={18} /> },
  { key: "owners", label: "Proprietários", icon: <User size={18} /> },
  { key: "clients", label: "Clientes", icon: <User size={18} /> },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState("properties");
  const [properties, setProperties] = useState<Property[]>([]);
  const [users, setUsers] = useState<User[]>([]);
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
      const { data } = await supabase.from("properties").select("*");
      setProperties(data || []);
    } else {
      const { data } = await supabase.from("users").select("*");
      setUsers(data || []);
    }
    setLoading(false);
  }

  async function handleApproveProperty(id: number) {
    const supabase = createClient();
    await supabase.from("properties").update({ status: "Ativo" }).eq("id", id);
    fetchData();
  }
  async function handleRejectProperty(id: number) {
    const supabase = createClient();
    await supabase.from("properties").update({ status: "Rejeitado" }).eq("id", id);
    fetchData();
  }
  async function handleToggleUserActive(id: number, active: boolean) {
    const supabase = createClient();
    await supabase.from("users").update({ active: !active }).eq("id", id);
    setUsers((prev) => prev.map(u => u.id === id ? { ...u, active: !active } : u));
  }
  async function handleDeleteProperty(id: number) {
    const supabase = createClient();
    await supabase.from("properties").delete().eq("id", id);
    fetchData();
  }
  async function handleDeleteUser(id: number) {
    const supabase = createClient();
    await supabase.from("users").delete().eq("id", id);
    fetchData();
  }
  async function handleSetStatus(id: number, status: string) {
    const supabase = createClient();
    const now = new Date().toISOString();
    await supabase.from("properties").update({ status, statusChangedAt: ["Arrendado", "Vendido"].includes(status) ? now : null }).eq("id", id);
    setProperties((prev) => prev.map(p => p.id === id ? { ...p, status, statusChangedAt: ["Arrendado", "Vendido"].includes(status) ? now : null } : p));
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
                {properties.filter(p => !(["Arrendado", "Vendido"].includes(p.status) && p.statusChangedAt && new Date().getTime() - new Date(p.statusChangedAt).getTime() > 10*24*60*60*1000)).map((prop) => (
                  <tr key={prop.id} className="border-b">
                    <td className="px-6 py-4">{prop.title}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${prop.status === "Ativo" ? "bg-green-100 text-green-800" : prop.status === "Pendente" ? "bg-yellow-100 text-yellow-800" : prop.status === "Arrendado" ? "bg-blue-100 text-blue-800" : prop.status === "Vendido" ? "bg-gray-300 text-gray-800" : "bg-red-100 text-red-800"}`}>
                        {prop.status || "Pendente"}
                      </span>
                    </td>
                    <td className="px-6 py-4">{prop.price}</td>
                    <td className="px-6 py-4 flex gap-2">
                      {/* Dropdown para permissões */}
                      <Dropdown onSelect={(status) => handleSetStatus(prop.id, status!)}>
                        <Dropdown.Toggle variant="secondary" size="sm" id={`dropdown-status-${prop.id}`}>{prop.status}</Dropdown.Toggle>
                        <Dropdown.Menu>
                          <Dropdown.Item eventKey="Pendente" active={prop.status === "Pendente"}>Pendente</Dropdown.Item>
                          <Dropdown.Item eventKey="Ativo" active={prop.status === "Ativo"}>Permitir</Dropdown.Item>
                          <Dropdown.Item eventKey="Rejeitado" active={prop.status === "Rejeitado"}>Rejeitar</Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                      {/* Switch para Disponível/Vendido ou Disponível/Arrendado */}
                      {prop.status === "Ativo" && prop.type === "venda" && (
                        <SwitchButton
                          checked={prop.status !== "Vendido"}
                          onlabel="Disponível"
                          offlabel="Vendido"
                          onstyle="success"
                          offstyle="secondary"
                          size="sm"
                          style="min-width:90px;"
                          onChange={() => handleSetStatus(prop.id, prop.status === "Vendido" ? "Ativo" : "Vendido")}
                        />
                      )}
                      {prop.status === "Ativo" && prop.type === "arrendamento" && (
                        <SwitchButton
                          checked={prop.status !== "Arrendado"}
                          onlabel="Disponível"
                          offlabel="Arrendado"
                          onstyle="success"
                          offstyle="secondary"
                          offstylecustom="background-color:#888;color:#fff;"
                          size="sm"
                          style="min-width:110px;"
                          onChange={() => handleSetStatus(prop.id, prop.status === "Arrendado" ? "Ativo" : "Arrendado")}
                        />
                      )}
                      <button onClick={() => handleDeleteProperty(prop.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full" title="Excluir"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Histórico */}
            <h3 className="mt-8 mb-2 text-lg font-bold text-gray-700">Histórico (Arrendado/Vendido há mais de 10 dias)</h3>
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-sm font-semibold text-gray-600">Título</th>
                  <th className="px-6 py-3 text-sm font-semibold text-gray-600">Status</th>
                  <th className="px-6 py-3 text-sm font-semibold text-gray-600">Preço</th>
                </tr>
              </thead>
              <tbody>
                {properties.filter(p => (["Arrendado", "Vendido"].includes(p.status) && p.statusChangedAt && new Date().getTime() - new Date(p.statusChangedAt).getTime() > 10*24*60*60*1000)).map((prop) => (
                  <tr key={prop.id} className="border-b">
                    <td className="px-6 py-4">{prop.title}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${prop.status === "Arrendado" ? "bg-blue-100 text-blue-800" : "bg-gray-300 text-gray-800"}`}>{prop.status}</span>
                    </td>
                    <td className="px-6 py-4">{prop.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <UserTable users={users} handleToggleUserActive={handleToggleUserActive} handleDeleteUser={handleDeleteUser} />
        )}
      </main>
    </div>
  );
}

// --- Novo componente Client para tabela de usuários ---
import React from 'react';

interface UserTableProps {
  users: User[];
  handleToggleUserActive: (id: number, active: boolean) => void;
  handleDeleteUser: (id: number) => void;
}
const UserTable: React.FC<UserTableProps> = ({ users, handleToggleUserActive, handleDeleteUser }) => {
  // Detecta se está na aba de clientes
  const isClientsTab = typeof window !== 'undefined' && window.location.hash.includes('clients');
  // Filtra clientes: só role === 'cliente'
  const filteredUsers = users.filter(user => user.email !== 'paulokakoma19@gmail.com' && (!isClientsTab || user.role === 'cliente'));
  return (
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
          {filteredUsers.map((user) => (
            <tr key={user.id} className="border-b">
              <td className="px-6 py-4">{user.name}</td>
              <td className="px-6 py-4">{user.email}</td>
              <td className="px-6 py-4">{user.role || "Cliente"}</td>
              <td className="px-6 py-4">
                <SwitchButton
                  checked={user.active}
                  onlabel="Ativo"
                  offlabel={<span style={{color:'#fff'}}>Inativo</span>}
                  onstyle="success"
                  offstyle="danger"
                  size="sm"
                  style="min-width:90px;"
                  onChange={() => handleToggleUserActive(user.id, user.active)}
                />
              </td>
              <td className="px-6 py-4 flex gap-2">
                <button onClick={() => handleDeleteUser(user.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full" title="Excluir"><Trash2 size={18} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
