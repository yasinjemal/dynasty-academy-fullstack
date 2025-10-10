import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function WorksPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <nav className="border-b border-purple-100 dark:border-purple-900 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">DB</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Dynasty Built Academy
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/login"><Button variant="ghost" size="sm">Sign In</Button></Link>
              <Link href="/register"><Button size="sm">Get Started</Button></Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">Our Works</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          Explore our portfolio and projects.
        </p>
        <Link href="/"><Button>Back to Home</Button></Link>
      </div>
    </div>
  )
}
