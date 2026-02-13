import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { db } = await connectToDatabase();
    const engineer = await db.collection('engineers').findOne({
      _id: new ObjectId(params.id),
    });

    if (!engineer) {
      return NextResponse.json(
        { error: 'Engineer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(engineer);
  } catch (error) {
    console.error('Error fetching engineer:', error);
    return NextResponse.json(
      { error: 'Failed to fetch engineer' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { db } = await connectToDatabase();

    const result = await db.collection('engineers').updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          ...body,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Engineer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Engineer updated successfully' });
  } catch (error) {
    console.error('Error updating engineer:', error);
    return NextResponse.json(
      { error: 'Failed to update engineer' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { db } = await connectToDatabase();

    const result = await db.collection('engineers').deleteOne({
      _id: new ObjectId(params.id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Engineer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Engineer deleted successfully' });
  } catch (error) {
    console.error('Error deleting engineer:', error);
    return NextResponse.json(
      { error: 'Failed to delete engineer' },
      { status: 500 }
    );
  }
}
