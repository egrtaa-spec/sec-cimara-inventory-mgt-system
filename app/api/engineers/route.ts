import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Engineer } from '@/lib/db-schemas';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const engineers = await db.collection('engineers').find({}).toArray();
    
    return NextResponse.json(engineers);
  } catch (error) {
    console.error('Error fetching engineers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch engineers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: Engineer = await request.json();
    const { db } = await connectToDatabase();

    // Validate required fields
    if (!body.name || !body.email || !body.siteName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const engineer = {
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('engineers').insertOne(engineer);

    return NextResponse.json(
      { _id: result.insertedId, ...engineer },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating engineer:', error);
    return NextResponse.json(
      { error: 'Failed to create engineer' },
      { status: 500 }
    );
  }
}
