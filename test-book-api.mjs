// Test the books API after Prisma regeneration
console.log('🧪 Testing Books API...\n')

// Test 1: Fetch books
console.log('📖 Test 1: Fetching books list...')
fetch('http://localhost:3000/api/admin/books')
  .then(res => res.json())
  .then(data => {
    if (data.books) {
      console.log(`✅ SUCCESS: Found ${data.books.length} books`)
      console.log('First book:', data.books[0]?.title || 'None')
      if (data.books[0]) {
        console.log('  - Total Pages:', data.books[0].totalPages)
        console.log('  - Preview Pages:', data.books[0].previewPages)
      }
    } else {
      console.error('❌ FAILED:', data.error || 'Unknown error')
    }
    console.log('\n')
    
    // Test 2: Create book
    console.log('📚 Test 2: Creating a new book...')
    return fetch('http://localhost:3000/api/admin/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Test Book - API Verification',
        description: 'This book was created to test the API after Prisma regeneration',
        category: 'Business',
        price: 99.99,
        contentType: 'PDF',
        tags: ['test', 'api']
      })
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.book) {
      console.log('✅ SUCCESS: Book created!')
      console.log('  - ID:', data.book.id)
      console.log('  - Title:', data.book.title)
      console.log('  - Slug:', data.book.slug)
    } else {
      console.error('❌ FAILED:', data.error || 'Unknown error')
    }
  })
  .catch(error => {
    console.error('❌ Request error:', error.message)
  })
