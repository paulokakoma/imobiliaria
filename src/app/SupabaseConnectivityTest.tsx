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
        const { error: fetchError } = await supabase
          .from('users')
          .select('*')
          .limit(1)
          .single()

        if (fetchError) {
          setStatus('fail')
          setError(fetchError.message)
        } else {
          setStatus('ok')
        }
      } catch (err) {
        const unknownError = err as Error
        setStatus('fail')
        setError(unknownError.message)
      }
    }

    testConnection()
  }, [])

  if (status === 'pending') {
    return <div className="p-4">Testando conexão com Supabase...</div>
  }

  if (status === 'ok') {
    return (
      <div className="p-4 text-green-600 font-bold">
        Conexão com Supabase OK!
      </div>
    )
  }

  return (
    <div className="p-4 text-red-600 font-bold">
      Erro ao conectar com Supabase: {error}
    </div>
  )
}
