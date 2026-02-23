import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getSession } from '@/lib/session';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, username, password, siteName, department } = body;

    if (!name || !username || !password || !siteName) {
      return NextResponse.json({ error: 'Name, username, password, and site are required' }, { status: 400 });
    }

    // Using warehouse DB to store engineers centrally
    const db = await getDb('WAREHOUSE');
    const collection = db.collection('engineers');

    const existingEngineer = await collection.findOne({ username });
    if (existingEngineer) {
      return NextResponse.json({ error: 'Engineer with this username already exists' }, { status: 409 });
    }

    const result = await collection.insertOne({
      name,
      username,
      password, // In a real app, you would hash this
      siteName,
      department,
      role: 'ENGINEER',
      createdAt: new Date(),
    });

    return NextResponse.json({ message: 'Engineer registered successfully', engineerId: result.insertedId });
  } catch (error) {
    console.error('Error registering engineer:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}