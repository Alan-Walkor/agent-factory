/**
 * UI 状态管理。
 * 管理通知、侧边栏折叠、全局模态框等。
 */
import { create } from 'zustand'

interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
}

interface UIState {
  // 侧边栏
  sidebarCollapsed: boolean
  toggleSidebar: () => void

  // 通知
  toasts: Toast[]
  addToast: (type: Toast['type'], message: string, duration?: number) => void
  removeToast: (id: string) => void

  // 全局模态框
  modalOpen: boolean
  modalContent: { title: string; body: string } | null
  openModal: (title: string, body: string) => void
  closeModal: () => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  toasts: [],
  addToast: (type, message, duration = 4000) => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2)
    set((s) => ({ toasts: [...s.toasts, { id, type, message, duration }] }))
    if (duration > 0) {
      setTimeout(() => {
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
      }, duration)
    }
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  modalOpen: false,
  modalContent: null,
  openModal: (title, body) => set({ modalOpen: true, modalContent: { title, body } }),
  closeModal: () => set({ modalOpen: false, modalContent: null }),
}))