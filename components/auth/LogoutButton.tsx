'use client'

import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'

interface LogoutButtonProps {
  className?: string
}

export function LogoutButton({ className }: LogoutButtonProps) {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await authClient.signOut()
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <Button 
      onClick={handleLogout} 
      variant="ghost" 
      className={className}
    >
      Logout
    </Button>
  )
}
