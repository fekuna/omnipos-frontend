import { ReactNode, useEffect, useState } from 'react'
import { useUserStore } from '@/store/useUserStore'

interface ProtectProps {
  permission: string
  children: ReactNode
  fallback?: ReactNode
}

export const Protect = ({ permission, children, fallback = null }: ProtectProps) => {
  const { hasPermission } = useUserStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  if (!hasPermission(permission)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
