import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

async function getBlogPosts() {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/blog?limit=10`, {
      cache: 'no-store',
    })
    if (!res.ok) return { posts: [], pagination: null }
    return await res.json()
  } catch (error) {
    return { posts: [], pagination: null }
  }
}

export default async function BlogPage() {
  const { posts, pagination } = await getBlogPosts()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-yellow-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Navigation */}
      <nav className="border-b border-purple-500/20 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50 shadow-lg shadow-purple-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-600/50 group-hover:shadow-purple-600/80 transition-all group-hover:scale-110">
                <span className="text-white font-bold text-xl">DB</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                Dynasty Built Academy
              </span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/about" className="text-gray-300 hover:text-purple-400 transition-all hover:scale-110 font-medium">
                About
              </Link>
              <Link href="/books" className="text-gray-300 hover:text-purple-400 transition-all hover:scale-110 font-medium">
                Books
              </Link>
              <Link href="/blog" className="relative text-purple-400 font-bold">
                Blog
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full"></span>
              </Link>
              <Link href="/works" className="text-gray-300 hover:text-purple-400 transition-all hover:scale-110 font-medium">
                Works
              </Link>
              <Link href="/contact" className="text-gray-300 hover:text-purple-400 transition-all hover:scale-110 font-medium">
                Contact
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-purple-600/20">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg shadow-purple-600/50 hover:shadow-purple-600/80 hover:scale-105 transition-all">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Header - Premium Hero */}
      <section className="relative py-20 overflow-hidden">
        {/* Animated Grid Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ 
            backgroundImage: 'linear-gradient(rgba(147, 51, 234, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(147, 51, 234, 0.3) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-6">
            {/* Floating Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-purple-500/30 rounded-full backdrop-blur-sm animate-float">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-ping"></span>
              <span className="text-sm text-purple-200 font-medium">Fresh insights every week</span>
            </div>

            {/* Main Title with Gradient Animation */}
            <h1 className="text-5xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-blue-200 mb-4 animate-fade-in">
              Blog & Insights
            </h1>
            
            {/* Decorative Line */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="h-px w-16 bg-gradient-to-r from-transparent via-purple-500 to-transparent animate-pulse"></div>
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
              <div className="h-px w-16 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pulse"></div>
            </div>

            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Discover the latest trends, tips, and stories from our community of learners and experts.
              <span className="block mt-2 text-yellow-400 font-semibold">Level up your knowledge with Dynasty Built</span>
            </p>

            {/* Stats Bar */}
            <div className="flex items-center justify-center gap-8 mt-8 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                  </svg>
                </div>
                <span className="text-gray-400">{posts.length}+ Articles</span>
              </div>
              <div className="h-4 w-px bg-purple-500/30"></div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                </div>
                <span className="text-gray-400">Expert Authors</span>
              </div>
              <div className="h-4 w-px bg-purple-500/30"></div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-yellow-400/20 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <span className="text-gray-400">Premium Content</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search & Filter Section - Glassmorphism */}
      <section className="py-6 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-slate-900/80 via-purple-900/20 to-slate-900/80 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6 shadow-2xl shadow-purple-900/20">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search Bar with Icon */}
              <div className="w-full md:w-96 relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400 group-focus-within:text-purple-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <Input 
                  type="search" 
                  placeholder="Search articles..." 
                  className="w-full pl-12 bg-slate-800/50 border-slate-700 focus:border-purple-500 text-white placeholder-gray-500 rounded-xl h-12" 
                />
              </div>
              
              <div className="flex gap-3 w-full md:w-auto">
                <select className="flex-1 md:flex-none px-4 py-3 border border-slate-700 bg-slate-800/50 rounded-xl text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all">
                  <option value="">All Categories</option>
                  <option value="programming">Programming</option>
                  <option value="technology">Technology</option>
                  <option value="business">Business</option>
                  <option value="design">Design</option>
                </select>
                
                <select className="flex-1 md:flex-none px-4 py-3 border border-slate-700 bg-slate-800/50 rounded-xl text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all">
                  <option value="newest">Newest First</option>
                  <option value="popular">Most Popular</option>
                  <option value="trending">Trending</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts - Premium Cards */}
      <section className="py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {posts.length === 0 ? (
            <div className="text-center py-20">
              <div className="relative inline-flex items-center justify-center w-32 h-32 mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-slate-800 to-slate-900 rounded-full flex items-center justify-center border border-purple-500/30">
                  <svg className="w-10 h-10 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-3xl font-bold text-white mb-3">No Blog Posts Yet</h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                Blog posts will appear here once they are published by administrators.
              </p>
              <Link href="/dashboard">
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg shadow-purple-600/50">
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="space-y-8">
                {posts.map((post: any, index: number) => (
                  <div 
                    key={post.id} 
                    className="group relative"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Card with Glassmorphism */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 border border-purple-500/20 shadow-2xl shadow-purple-900/20 hover:shadow-purple-500/30 transition-all duration-500 backdrop-blur-xl">
                      {/* Animated Gradient Border on Hover */}
                      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                        <div className="absolute inset-[-2px] bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 rounded-2xl blur-sm animate-pulse" />
                      </div>

                      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                        {/* Featured Image with Overlay Effects */}
                        <div className={`md:col-span-1 ${index % 2 === 0 ? 'md:order-1' : 'md:order-2'}`}>
                          <div className="relative h-64 md:h-full rounded-xl overflow-hidden group/image">
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10 opacity-60 group-hover/image:opacity-40 transition-opacity" />
                            
                            {/* Image */}
                            {post.coverImage ? (
                              <img
                                src={post.coverImage}
                                alt={post.title}
                                className="w-full h-full object-cover group-hover/image:scale-110 transition-transform duration-700"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/30 to-blue-900/30">
                                <svg className="w-20 h-20 text-purple-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                </svg>
                              </div>
                            )}

                            {/* Featured Badge */}
                            {post.featured && (
                              <div className="absolute top-4 left-4 z-20">
                                <div className="flex items-center gap-1 px-3 py-1.5 bg-yellow-400/90 backdrop-blur-sm rounded-full shadow-lg">
                                  <svg className="w-4 h-4 text-yellow-900" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                  <span className="text-xs font-bold text-yellow-900">Featured</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Content */}
                        <div className={`md:col-span-2 ${index % 2 === 0 ? 'md:order-2' : 'md:order-1'} flex flex-col justify-between`}>
                          <div>
                            {/* Meta Info */}
                            <div className="flex items-center gap-3 mb-4">
                              <span className="px-3 py-1 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 text-purple-300 rounded-full text-xs font-semibold uppercase tracking-wider">
                                {post.category}
                              </span>
                              <div className="flex items-center gap-1.5 text-gray-400">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-sm">{post.readTime} min read</span>
                              </div>
                            </div>
                            
                            {/* Title */}
                            <Link href={`/blog/${post.slug}`}>
                              <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-blue-400 transition-all duration-300 line-clamp-2">
                                {post.title}
                              </h3>
                            </Link>
                            
                            {/* Excerpt */}
                            <p className="text-gray-400 leading-relaxed line-clamp-3 mb-6">
                              {post.excerpt}
                            </p>
                          </div>

                          {/* Footer */}
                          <div className="space-y-4">
                            {/* Author & Stats */}
                            <div className="flex items-center justify-between">
                              {/* Author Info */}
                              <div className="flex items-center gap-3">
                                <div className="relative">
                                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg ring-2 ring-purple-500/20">
                                    <span className="text-white font-bold">
                                      {post.author.name?.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-slate-900"></div>
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-white">
                                    {post.author.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(post.createdAt).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                    })}
                                  </p>
                                </div>
                              </div>

                              {/* Engagement Stats */}
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5 text-gray-400 hover:text-red-400 transition-colors">
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                  </svg>
                                  <span className="text-sm font-medium">{post._count.likes}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-gray-400 hover:text-blue-400 transition-colors">
                                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                  </svg>
                                  <span className="text-sm font-medium">{post._count.comments}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-gray-400">
                                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                  <span className="text-sm font-medium">{post.viewCount}</span>
                                </div>
                              </div>
                            </div>

                            {/* Read More Button */}
                            <Link href={`/blog/${post.slug}`}>
                              <button className="group/btn relative w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-purple-600/50 overflow-hidden">
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                  Read Full Article
                                  <svg className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                  </svg>
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 via-yellow-400/20 to-yellow-400/0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                              </button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination - Premium Design */}
              {pagination && pagination.totalPages > 1 && (
                <div className="mt-16">
                  <div className="flex items-center justify-center gap-3">
                    {/* Previous Button */}
                    <button 
                      disabled={pagination.page === 1}
                      className="group relative px-6 py-3 bg-slate-800/50 border border-slate-700 hover:border-purple-500 text-white rounded-xl font-medium transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg hover:shadow-purple-500/20"
                    >
                      <span className="flex items-center gap-2">
                        <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Previous
                      </span>
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-2">
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => i + 1).map((pageNum) => (
                        <button
                          key={pageNum}
                          className={`relative w-12 h-12 rounded-xl font-bold transition-all duration-300 hover:scale-110 ${
                            pageNum === pagination.page
                              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-600/50'
                              : 'bg-slate-800/50 border border-slate-700 text-gray-300 hover:border-purple-500 hover:text-white'
                          }`}
                        >
                          {pageNum === pagination.page && (
                            <div className="absolute inset-[-2px] bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 rounded-xl blur-sm animate-pulse" />
                          )}
                          <span className="relative z-10">{pageNum}</span>
                        </button>
                      ))}
                      
                      {pagination.totalPages > 5 && (
                        <>
                          <span className="text-gray-500 px-2">...</span>
                          <button className="w-12 h-12 bg-slate-800/50 border border-slate-700 text-gray-300 rounded-xl font-bold hover:border-purple-500 hover:text-white hover:scale-110 transition-all">
                            {pagination.totalPages}
                          </button>
                        </>
                      )}
                    </div>

                    {/* Next Button */}
                    <button 
                      disabled={!pagination.hasMore}
                      className="group relative px-6 py-3 bg-slate-800/50 border border-slate-700 hover:border-purple-500 text-white rounded-xl font-medium transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg hover:shadow-purple-500/20"
                    >
                      <span className="flex items-center gap-2">
                        Next
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </button>
                  </div>

                  {/* Page Info */}
                  <p className="text-center text-gray-500 mt-6 text-sm">
                    Showing page <span className="text-purple-400 font-semibold">{pagination.page}</span> of{' '}
                    <span className="text-purple-400 font-semibold">{pagination.totalPages}</span>
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Footer CTA Section */}
      <section className="py-16 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900/50 via-blue-900/50 to-purple-900/50 border border-purple-500/30 p-12 backdrop-blur-xl">
            {/* Animated Background */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-0 left-0 w-64 h-64 bg-purple-600 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <div className="relative z-10 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Start Your Journey?
              </h2>
              <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                Join thousands of learners building their dynasty. Get access to exclusive content, courses, and community.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/register">
                  <Button className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-bold px-8 py-6 rounded-xl shadow-2xl shadow-yellow-400/50 hover:scale-110 transition-all">
                    Get Started Free
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-black px-8 py-6 rounded-xl font-bold hover:scale-110 transition-all">
                    Contact Us
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
