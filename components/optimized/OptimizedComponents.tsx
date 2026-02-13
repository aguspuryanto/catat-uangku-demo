import React, { memo, useMemo, useCallback, useState, useEffect, useRef } from 'react'

// 1. Memoized Transaction Card
interface TransactionCardProps {
  transaction: {
    id: string
    description: string
    amount: number
    type: 'income' | 'expense'
    category: string
    date: string
  }
  onDelete: (id: string) => void
  onClick: (transaction: any) => void
}

export const OptimizedTransactionCard = memo<TransactionCardProps>(({ 
  transaction, 
  onDelete, 
  onClick 
}) => {
  // Memoize formatted values
  const formattedAmount = useMemo(() => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(transaction.amount)
  }, [transaction.amount])

  const formattedDate = useMemo(() => {
    return new Date(transaction.date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }, [transaction.date])

  // Memoize event handlers
  const handleDelete = useCallback(() => {
    onDelete(transaction.id)
  }, [onDelete, transaction.id])

  const handleClick = useCallback(() => {
    onClick(transaction)
  }, [onClick, transaction])

  return (
    <div 
      className={`p-4 rounded-lg border transition-colors ${
        transaction.type === 'expense' 
          ? 'bg-red-50 border-red-200' 
          : 'bg-emerald-50 border-emerald-200'
      }`}
      onClick={handleClick}
    >
      <div className="flex justify-between items-center">
        <div>
          <h4 className="font-semibold text-gray-800">{transaction.description}</h4>
          <p className="text-sm text-gray-500">{formattedDate}</p>
          <p className="text-xs text-gray-400">{transaction.category}</p>
        </div>
        <div className="text-right">
          <p className={`font-bold ${
            transaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'
          }`}>
            {transaction.type === 'income' ? '+' : '-'} {formattedAmount}
          </p>
          <button 
            onClick={handleDelete}
            className="text-xs text-red-500 hover:text-red-700 mt-1"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
})

OptimizedTransactionCard.displayName = 'OptimizedTransactionCard'

// 2. Virtual List untuk long lists
interface VirtualListProps<T> {
  items: T[]
  itemHeight: number
  containerHeight: number
  renderItem: (item: T, index: number) => React.ReactNode
  overscan?: number
}

export function VirtualList<T>({ 
  items, 
  itemHeight, 
  containerHeight, 
  renderItem,
  overscan = 5 
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const visibleItems = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    )

    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      index: startIndex + index,
    }))
  }, [items, itemHeight, scrollTop, containerHeight, overscan])

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  const totalHeight = items.length * itemHeight

  return (
    <div 
      ref={containerRef}
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: index * itemHeight,
              left: 0,
              right: 0,
              height: itemHeight,
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  )
}

// 3. Optimized Form Component
interface OptimizedFormProps {
  onSubmit: (data: any) => void
  initialData?: any
}

export const OptimizedForm = memo<OptimizedFormProps>(({ onSubmit, initialData }) => {
  const [formData, setFormData] = useState(initialData || {})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Debounced submit
  const debouncedSubmit = useMemo(
    () => debounce(async (data: any) => {
      setIsSubmitting(true)
      try {
        await onSubmit(data)
      } finally {
        setIsSubmitting(false)
      }
    }, 300),
    [onSubmit]
  )

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }, [])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    debouncedSubmit(formData)
  }, [formData, debouncedSubmit])

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        name="description"
        value={formData.description || ''}
        onChange={handleChange}
        placeholder="Description"
        className="w-full p-2 border rounded"
      />
      <input
        type="number"
        name="amount"
        value={formData.amount || ''}
        onChange={handleChange}
        placeholder="Amount"
        className="w-full p-2 border rounded"
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full p-2 bg-blue-500 text-white rounded disabled:opacity-50"
      >
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  )
})

OptimizedForm.displayName = 'OptimizedForm'

// 4. Debounce utility
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// 5. Optimized Dashboard Stats
interface DashboardStatsProps {
  transactions: Array<{
    amount: number
    type: 'income' | 'expense'
  }>
}

export const OptimizedDashboardStats = memo<DashboardStatsProps>(({ transactions }) => {
  const stats = useMemo(() => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const balance = income - expense
    
    return { income, expense, balance }
  }, [transactions])

  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value)
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-emerald-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-emerald-800">Income</h3>
        <p className="text-lg font-bold text-emerald-600">
          {formatCurrency(stats.income)}
        </p>
      </div>
      <div className="bg-red-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-red-800">Expense</h3>
        <p className="text-lg font-bold text-red-600">
          {formatCurrency(stats.expense)}
        </p>
      </div>
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-blue-800">Balance</h3>
        <p className="text-lg font-bold text-blue-600">
          {formatCurrency(stats.balance)}
        </p>
      </div>
    </div>
  )
})

OptimizedDashboardStats.displayName = 'OptimizedDashboardStats'
