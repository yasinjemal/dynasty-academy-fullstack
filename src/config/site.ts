export const siteConfig = {
  name: 'Dynasty Built Academy',
  description: 'Premium books, courses, and resources for building your dynasty',
  url: 'https://dynastyacademy.com',
  ogImage: 'https://dynastyacademy.com/og.jpg',
  links: {
    twitter: 'https://twitter.com/dynastyacademy',
    instagram: 'https://instagram.com/dynastyacademy',
    linkedin: 'https://linkedin.com/company/dynastyacademy',
  },
  creator: 'Dynasty Built Academy',
}

export const categories = [
  'Business',
  'Personal Development',
  'Finance',
  'Marketing',
  'Entrepreneurship',
  'Leadership',
  'Productivity',
  'Health & Wellness',
  'Technology',
  'Other',
] as const

export const bookContentTypes = [
  'PDF',
  'Video Course',
  'Audio Book',
  'Bundle',
] as const

export const navigation = {
  main: [
    { name: 'Home', href: '/' },
    { name: 'Works', href: '/works' },
    { name: 'Blog', href: '/blog' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ],
  dashboard: [
    { name: 'Overview', href: '/dashboard' },
    { name: 'My Library', href: '/dashboard/library' },
    { name: 'Purchases', href: '/dashboard/orders' },
    { name: 'Bookmarks', href: '/dashboard/bookmarks' },
    { name: 'Settings', href: '/dashboard/settings' },
  ],
  admin: [
    { name: 'Dashboard', href: '/admin' },
    { name: 'Books', href: '/admin/books' },
    { name: 'Blog', href: '/admin/blog' },
    { name: 'Orders', href: '/admin/orders' },
    { name: 'Users', href: '/admin/users' },
    { name: 'Analytics', href: '/admin/analytics' },
  ],
}

export const theme = {
  colors: {
    primary: '#D4AF37', // Gold
    secondary: '#000000', // Black
    accent: '#1a1a1a',
    background: '#0a0a0a',
    foreground: '#ffffff',
  },
  fonts: {
    heading: 'Playfair Display, serif',
    body: 'Inter, sans-serif',
  },
}
