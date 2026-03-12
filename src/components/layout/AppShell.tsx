import { ReactNode } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import { useUIStore } from '@/store/useUIStore'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react'

const AppShell = ({ children }: { children: ReactNode }) => {
  const { sidebarCollapsed, toasts, removeToast } = useUIStore()

  const toastIcons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  }

  const toastColors = {
    success: 'border-l-green-500',
    error: 'border-l-red-500',
    warning: 'border-l-yellow-500',
    info: 'border-l-blue-500',
  }

  return (
    <div className="flex h-screen bg-[#0a0a0f] overflow-hidden">
      <Sidebar />
      <Header />

      <main
        className="flex-1 pt-16 transition-all duration-300 overflow-auto"
        style={{ paddingLeft: `${sidebarCollapsed ? 72 : 260}px` }}
      >
        <div
          className="min-h-full p-6"
          style={{
            backgroundImage: `
              linear-gradient(rgba(108, 92, 231, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(108, 92, 231, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        >
          {children}
        </div>
      </main>

      {/* Toast 通知 */}
      <div className="fixed top-20 right-6 z-50 space-y-3">
        <AnimatePresence>
          {toasts.map((toast) => {
            const IconComponent = toastIcons[toast.type]
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: -20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.8 }}
                className={`flex items-start p-4 bg-[#1c1f30] border-l-4 ${toastColors[toast.type]} rounded-lg shadow-lg max-w-md`}
              >
                <IconComponent className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                  toast.type === 'success' ? 'text-green-500' :
                  toast.type === 'error' ? 'text-red-500' :
                  toast.type === 'warning' ? 'text-yellow-500' : 'text-blue-500'
                }`} />
                <div className="ml-3 flex-1">
                  <p className="text-sm text-[#e8e6f0]">{toast.message}</p>
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="ml-4 text-[#9694a8] hover:text-[#e8e6f0] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default AppShell