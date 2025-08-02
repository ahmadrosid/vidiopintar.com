import { Loader } from 'lucide-react'

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex items-center space-x-2">
        <Loader className="h-6 w-6 animate-spin" />
        <span>Loading...</span>
      </div>
    </div>
  )
}