import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Permission {
  code: string
}

interface Role {
  id: string
  name: string
  permissions: Permission[]
}

interface User {
  id: string
  username: string
  full_name: string
  role?: Role
}

interface UserState {
  merchant: {
    id: string
    name: string
    phone: string
  } | null
  user: User | null // Staff user
  userManagementEnabled: boolean
  availableUsers: { id: string; username: string; full_name: string; role_name: string }[]
  
  setMerchant: (merchant: UserState['merchant']) => void
  setUser: (user: User | null) => void
  setUserManagementEnabled: (enabled: boolean) => void
  setAvailableUsers: (users: UserState['availableUsers']) => void
  logout: () => void
  hasPermission: (permission: string) => boolean
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      merchant: null,
      user: null,
      userManagementEnabled: false,
      availableUsers: [],
      
      setMerchant: (merchant) => set({ merchant }),
      setUser: (user) => set({ user }),
      setUserManagementEnabled: (enabled) => set({ userManagementEnabled: enabled }),
      setAvailableUsers: (users) => set({ availableUsers: users }),
      
      logout: () => set({ merchant: null, user: null, userManagementEnabled: false, availableUsers: [] }),
      hasPermission: (permission) => {
        const { merchant, user } = get()
        // Merchant owner has all permissions
        if (merchant && !user) return true
        
        if (user && user.role) {
           return user.role.permissions.some(p => p.code === permission)
        }
        
        return false
      }
    }),
    {
      name: 'omnipos-user-storage',
    }
  )
)

