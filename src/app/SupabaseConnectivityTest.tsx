// Teste simples de conectividade com Supabase
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function SupabaseConnectivityTest() {
  const [status, setStatus] = useState<'pending' | 'ok' | 'fail'>('pending')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const testConnection = async () => {
      try {
        const supabase = createClient()
        // Tenta buscar 1 usuário só para testar
        const { data, error } = await supabase.from('users').select('*').limit(1)
        if (error) {
          setStatus('fail')
          setError(error.message)
        } else {
          setStatus('ok')
        }
      } catch (err: any) {
        setStatus('fail')
        setError(err.message)
      }
    }
    testConnection()
  }, [])

  if (status === 'pending') return <div className="p-4">Testando conexão com Supabase...</div>
  if (status === 'ok') return <div className="p-4 text-green-600 font-bold">Conexão com Supabase OK!</div>
  return <div className="p-4 text-red-600 font-bold">Erro ao conectar com Supabase: {error}</div>
}
