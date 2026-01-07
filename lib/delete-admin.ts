import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function deleteAdmin() {
  console.log('🗑️ Deleting admin@demo.com...')

  try {
    // Check if exists
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@demo.com' }
    })

    if (!admin) {
      console.log('❌ admin@demo.com not found!')
      return
    }

    // Delete the user
    await prisma.user.delete({
      where: { email: 'admin@demo.com' }
    })

    console.log('✅ admin@demo.com deleted successfully!')

    // Show remaining users
    const remainingUsers = await prisma.user.findMany({
      select: { email: true, name: true, role: true }
    })

    console.log('\n📋 Remaining users:')
    remainingUsers.forEach(user => {
      console.log(`   - ${user.email} (${user.role})`)
    })

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

deleteAdmin()