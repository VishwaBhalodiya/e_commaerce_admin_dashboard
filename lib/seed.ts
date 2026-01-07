import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Hash the password
  const hashedPassword = await hash('Admin@123', 12)
  console.log('✅ Password hashed')

  // Create or update super admin user
  const admin = await prisma.user.upsert({
    where: { email: 'bittupopat439@gmail.com' },
    update: {
      password: hashedPassword,
      name: 'Demo Admin',
      role: 'super-admin'
    },
    create: {
      email: 'bittupopat439@gmail.com',
      password: hashedPassword,
      name: 'Demo Admin',
      role: 'super-admin'
    }
  })

  console.log('✅ Admin user created/updated:', admin.email)

  // Delete all existing products (fresh start)
  await prisma.product.deleteMany({})
  console.log('✅ Cleared existing products')

  // Create sample products (using create, not upsert)
  const products = [
    {
      name: "Wireless Mouse",
      description: "Ergonomic wireless mouse with 2.4GHz connection. Perfect for office work and gaming.",
      price: 29.99,
      stock: 50,
      category: "Electronics",
      images: ["https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400"]
    },
    {
      name: "Mechanical Keyboard",
      description: "RGB mechanical gaming keyboard with blue switches. Tactile feedback and customizable lighting.",
      price: 89.99,
      stock: 30,
      category: "Electronics",
      images: ["https://images.unsplash.com/photo-1595225476474-87563907a212?w=400"]
    },
    {
      name: "USB-C Cable",
      description: "High-speed USB-C charging cable, 6ft length. Supports fast charging and data transfer.",
      price: 12.99,
      stock: 100,
      category: "Accessories",
      images: ["https://images.unsplash.com/photo-1585298723682-7115561c51b7?w=400"]
    },
    {
      name: "Laptop Stand",
      description: "Adjustable aluminum laptop stand. Improves ergonomics and cooling.",
      price: 45.50,
      stock: 25,
      category: "Accessories",
      images: ["https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400"]
    },
    {
      name: "Wireless Headphones",
      description: "Noise-cancelling over-ear headphones with 30-hour battery life.",
      price: 199.99,
      stock: 15,
      category: "Electronics",
      images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"]
    },
    {
      name: "Phone Case",
      description: "Protective silicone phone case. Shockproof and scratch-resistant.",
      price: 15.99,
      stock: 8,
      category: "Accessories",
      images: ["https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400"]
    }
  ]

  for (const product of products) {
    await prisma.product.create({
      data: product
    })
  }

  console.log(`✅ Created ${products.length} sample products`)

  // Create sample sales data for analytics
  const allProducts = await prisma.product.findMany()
  
  for (const product of allProducts) {
    // Create 3-5 random sales for each product
    const salesCount = Math.floor(Math.random() * 3) + 3
    
    for (let i = 0; i < salesCount; i++) {
      const quantity = Math.floor(Math.random() * 5) + 1
      const daysAgo = Math.floor(Math.random() * 30)
      const saleDate = new Date()
      saleDate.setDate(saleDate.getDate() - daysAgo)
      
      await prisma.sale.create({
        data: {
          productId: product.id,
          quantity: quantity,
          revenue: product.price * quantity,
          date: saleDate
        }
      })
    }
  }

  const totalSales = await prisma.sale.count()
  console.log(`✅ Created ${totalSales} sample sales records`)
  
  console.log('')
  console.log('🎉 Database seeded successfully!')
  console.log('')
  console.log('📊 Summary:')
  console.log(`   - Admin users: 1`)
  console.log(`   - Products: ${products.length}`)
  console.log(`   - Sales records: ${totalSales}`)
  console.log('')
  console.log('🔐 Login credentials:')
  console.log('   Email: admin@demo.com')
  console.log('   Password: Admin@123')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })