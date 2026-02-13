import { lazy, Suspense } from 'react'

// Lazy loading untuk komponen berat
const LazyPinjaman = lazy(() => import('../Pinjaman'))
const LazyTransactionList = lazy(() => import('../TransactionList'))
const LazyTransactionForm = lazy(() => import('../TransactionForm'))
const LazyDashboard = lazy(() => import('../Dashboard'))

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
  </div>
)

// Export lazy components dengan loading fallback
export const OptimizedPinjaman = (props: any) => (
  <Suspense fallback={<LoadingSpinner />}>
    <LazyPinjaman {...props} />
  </Suspense>
)

export const OptimizedTransactionList = (props: any) => (
  <Suspense fallback={<LoadingSpinner />}>
    <LazyTransactionList {...props} />
  </Suspense>
)

export const OptimizedTransactionForm = (props: any) => (
  <Suspense fallback={<LoadingSpinner />}>
    <LazyTransactionForm {...props} />
  </Suspense>
)

export const OptimizedDashboard = (props: any) => (
  <Suspense fallback={<LoadingSpinner />}>
    <LazyDashboard {...props} />
  </Suspense>
)
