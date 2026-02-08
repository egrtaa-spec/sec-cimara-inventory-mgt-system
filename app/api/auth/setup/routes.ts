import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { PREDEFINED_USERS } from '@/lib/auth-constants';
import bcrypt from 'bcrypt';

export async function POST() {
  try {
    const { db } = await connectToDatabase();
    
    // Check if users already exist
    const existingUsers = await db.collection('users').countDocuments();
    
    if (existingUsers > 0) {
      return NextResponse.json({
        success: false,
        message: 'Users already initialized'
      });
    }

    // Hash passwords and insert users
    const usersToInsert = await Promise.all(
      PREDEFINED_USERS.map(async (user) => ({
        username: user.username,
        email: user.email,
        name: user.name,
        passwordHash: await bcrypt.hash(user.password, 10),
        role: user.role,
        createdAt: new Date(),
        status: 'active'
      }))
    );

    const result = await db.collection('users').insertMany(usersToInsert);

    return NextResponse.json({
      success: true,
      message: `Successfully created ${result.insertedCount} users`,
      insertedCount: result.insertedCount
    });
  } catch (error) {
    console.error('[v0] Setup error:', error);
    return NextResponse.json(
      { error: 'Failed to setup users' },
      { status: 500 }
    );
  }
}
