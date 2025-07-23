import { createClient } from '@/lib/supabase/client'
import { PostgrestError } from '@supabase/supabase-js'

/**
 * Adiciona ou remove um imóvel da lista de favoritos de um utilizador.
 * @param propertyId - O ID do imóvel.
 * @param isCurrentlyFavorited - O estado atual de favorito do imóvel.
 * @param userId - O ID do utilizador.
 * @returns Um objeto com um erro, se a operação falhar.
 */
export const toggleFavorite = async (
  propertyId: number,
  isCurrentlyFavorited: boolean,
  userId: string
): Promise<{ error: PostgrestError | null }> => {
  const supabase = createClient()

  if (isCurrentlyFavorited) {
    // Se já for favorito, apaga o registo
    const { error } = await supabase
      .from('favorites')
      .delete()
      .match({ user_id: userId, property_id: propertyId })
    return { error }
  } else {
    // Se não for favorito, insere um novo registo
    const { error } = await supabase
      .from('favorites')
      .insert({ user_id: userId, property_id: propertyId })
    return { error }
  }
}

/**
 * Busca os IDs dos imóveis favoritos de um utilizador.
 * @param userId - O ID do utilizador.
 * @returns Um objeto com uma lista de IDs e um erro, se a operação falhar.
 */
export const getFavorites = async (
  userId: string
): Promise<{ data: number[]; error: PostgrestError | null }> => {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('favorites')
    .select('property_id')
    .eq('user_id', userId)

  if (error) {
    console.error('Erro ao buscar favoritos:', error)
    return { data: [], error }
  }

  // Extrai apenas os IDs da resposta
  return { data: data.map((fav: { property_id: number }) => fav.property_id), error: null }
}
