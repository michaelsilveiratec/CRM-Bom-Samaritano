import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'

export function useSupabaseData(tableName: string) {
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            const { data: result, error } = await supabase
                .from(tableName)
                .select('*')

            if (!error) setData(result || [])
            setLoading(false)
        }
        fetchData()
    }, [tableName])

    return { data, loading }
}