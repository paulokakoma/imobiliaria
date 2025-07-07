import { createClient } from '@/lib/supabase/client'

// Função para buscar todos os imóveis ativos
export const fetchAllActiveProperties = async () => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('status', 'Ativo');

  if (error) {
    console.error("Erro ao buscar imóveis:", error);
    return [];
  }
  return data || [];
};