import { createClient } from '@/lib/supabase/client';

// Função para buscar os IDs dos imóveis favoritos de um utilizador
export const fetchUserFavoriteIds = async (userId: string) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('favorites')
    .select('property_id')
    .eq('user_id', userId);

  if (error) {
    console.error("Erro ao buscar favoritos:", error);
    return new Set();
  }
  return new Set(data.map(f => f.property_id));
};

// Função para adicionar ou remover um favorito na base de dados
export const toggleFavoriteInDB = async (userId: string, propertyId: number, isCurrentlyFavorited: boolean) => {
  const supabase = createClient();
  if (isCurrentlyFavorited) {
    // Remove o favorito
    const { error } = await supabase.from('favorites').delete().match({ user_id: userId, property_id: propertyId });
    if (error) {
      console.error("Erro ao desfavoritar:", error);
      return false; // Indica que a operação falhou
    }
  } else {
    // Adiciona o favorito
    const { error } = await supabase.from('favorites').insert({ user_id: userId, property_id: propertyId });
    if (error) {
      console.error("Erro ao favoritar:", error);
      return false; // Indica que a operação falhou
    }
  }
  return true; // Indica que a operação foi bem-sucedida
};
