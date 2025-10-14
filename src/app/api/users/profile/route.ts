import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { prisma } from '@/lib/db/prisma'
import bcrypt from 'bcryptjs'

// GET user profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        username: true,
        bannerImage: true,
        bio: true,
        location: true,
        website: true,
        xHandle: true,
        instagram: true,
        youtube: true,
        role: true,
        isPremium: true,
        dynastyScore: true,
        level: true,
        streakDays: true,
        readingMinutesLifetime: true,
        booksCompleted: true,
        followersCount: true,
        followingCount: true,
        thanksReceived: true,
        profileTheme: true,
        isPrivate: true,
        dmOpen: true,
        createdAt: true,
        _count: {
          select: {
            orders: true,
            blogPosts: true,
            comments: true,
            likes: true,
            followers: true,
            following: true,
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

// PATCH update user profile
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      name, 
      bio, 
      image, 
      bannerImage,
      location,
      website,
      xHandle,
      instagram,
      youtube,
      profileTheme,
      isPrivate,
      dmOpen,
      currentPassword, 
      newPassword 
    } = body

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Prepare update data
    const updateData: any = {
      name,
      bio: bio || null,
      image,
      bannerImage: bannerImage || null,
      location: location || null,
      website: website || null,
      xHandle: xHandle || null,
      instagram: instagram || null,
      youtube: youtube || null,
      profileTheme: profileTheme || 'default',
      isPrivate: isPrivate !== undefined ? isPrivate : false,
      dmOpen: dmOpen !== undefined ? dmOpen : true,
      updatedAt: new Date(),
    }

    // Handle password change
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'Current password is required to set a new password' },
          { status: 400 }
        )
      }

      // Verify current password
      if (!user.password) {
        return NextResponse.json(
          { error: 'Cannot change password for social login accounts' },
          { status: 400 }
        )
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        )
      }

      // Validate new password
      if (newPassword.length < 8) {
        return NextResponse.json(
          { error: 'New password must be at least 8 characters long' },
          { status: 400 }
        )
      }

      // Hash new password
      updateData.password = await bcrypt.hash(newPassword, 12)
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        role: true,
        updatedAt: true,
      }
    })

    return NextResponse.json({ 
      message: 'Profile updated successfully',
      user: updatedUser 
    })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
