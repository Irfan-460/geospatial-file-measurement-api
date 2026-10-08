import React, { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

interface ToastContextValue {
  toast: (message: string, type?: Toast['type']) => void
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000)
  }, [])

  const remove = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id))

  const icons = { success: CheckCircle, error: XCircle, info: AlertCircle }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div style={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        {toasts.map((t) => {
          const Icon = icons[t.type]
          const color = t.type === 'success' ? 'var(--success)' : t.type === 'error' ? 'var(--danger)' : 'var(--info)'
          return (
            <div key={t.id} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              borderLeft: `3px solid ${color}`, borderRadius: 'var(--radius)',
              padding: '10px 14px', minWidth: 280, maxWidth: 400,
              boxShadow: 'var(--shadow)', animation: 'slideIn 0.2s ease',
            }}>
              <Icon size={16} color={color} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1, color: 'var(--text-primary)', fontSize: 13 }}>{t.message}</span>
              <button onClick={() => remove(t.id)} style={{ color: 'var(--text-muted)', padding: 2 }}>
                <X size={14} />
              </button>
            </div>
          )
        })}
      </div>
      <style>{`@keyframes slideIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }`}</style>
    </ToastContext.Provider>
  )
}
