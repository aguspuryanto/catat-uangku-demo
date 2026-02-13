import { useState, useEffect, useCallback } from 'react'

// Custom SWR-like hook untuk data fetching dengan caching
interface UseOptimizedDataOptions<T> {
  fetcher: () => Promise<T>
  key: string
  revalidateOnFocus?: boolean
  revalidateOnReconnect?: boolean
  dedupingInterval?: number
  errorRetryCount?: number
  refreshInterval?: number
  fallbackData?: T
}

interface UseOptimizedDataReturn<T> {
  data: T | undefined
  error: Error | undefined
  isLoading: boolean
  isValidating: boolean
  mutate: (data?: T) => Promise<T | undefined>
}

// Cache sederhana di memory
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 menit

export function useOptimizedData<T>({
  fetcher,
  key,
  revalidateOnFocus = true,
  revalidateOnReconnect = true,
  dedupingInterval = 2000,
  errorRetryCount = 3,
  refreshInterval,
  fallbackData,
}: UseOptimizedDataOptions<T>): UseOptimizedDataReturn<T> {
  const [data, setData] = useState<T | undefined>(fallbackData)
  const [error, setError] = useState<Error | undefined>()
  const [isLoading, setIsLoading] = useState(false)
  const [isValidating, setIsValidating] = useState(false)

  const fetchData = useCallback(async (force = false) => {
    try {
      // Check cache
      if (!force) {
        const cached = cache.get(key)
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
          setData(cached.data)
          return cached.data
        }
      }

      setIsValidating(true)
      if (!data) setIsLoading(true)
      setError(undefined)

      const result = await fetcher()
      
      // Update cache
      cache.set(key, { data: result, timestamp: Date.now() })
      setData(result)
      
      return result
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
      setIsValidating(false)
    }
  }, [fetcher, key, data])

  // Initial fetch
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Revalidate on focus
  useEffect(() => {
    if (!revalidateOnFocus) return

    const handleFocus = () => {
      fetchData()
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [revalidateOnFocus, fetchData])

  // Revalidate on reconnect
  useEffect(() => {
    if (!revalidateOnReconnect) return

    const handleOnline = () => {
      fetchData()
    }

    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [revalidateOnReconnect, fetchData])

  // Auto refresh
  useEffect(() => {
    if (!refreshInterval) return

    const interval = setInterval(() => {
      fetchData()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [refreshInterval, fetchData])

  // Deduping
  useEffect(() => {
    if (!dedupingInterval) return

    const timeout = setTimeout(() => {
      fetchData()
    }, dedupingInterval)

    return () => clearTimeout(timeout)
  }, [dedupingInterval, fetchData])

  const mutate = useCallback(async (newData?: T) => {
    if (newData) {
      cache.set(key, { data: newData, timestamp: Date.now() })
      setData(newData)
      return newData
    } else {
      return fetchData(true)
    }
  }, [key, fetchData])

  return {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  }
}

// ISR-like simulation untuk static data dengan revalidation
export function useISRData<T>({
  fetcher,
  key,
  revalidateTime = 60, // seconds
  fallbackData,
}: {
  fetcher: () => Promise<T>
  key: string
  revalidateTime?: number
  fallbackData?: T
}) {
  return useOptimizedData({
    fetcher,
    key,
    refreshInterval: revalidateTime * 1000,
    fallbackData,
  })
}

// Optimized Supabase hooks
export const useOptimizedSupabase = <T>(
  query: () => Promise<T>,
  key: string,
  options?: Partial<UseOptimizedDataOptions<T>>
) => {
  return useOptimizedData({
    fetcher: query,
    key,
    dedupingInterval: 5000, // 5 detik untuk Supabase
    errorRetryCount: 3,
    ...options,
  })
}
