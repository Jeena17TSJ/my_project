import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Notification from '@/models/Notification';

export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const query = userId ? { userId } : {};
  const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(20);
  return NextResponse.json({ notifications });
}

export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();
  const notification = await Notification.create(body);
  return NextResponse.json({ notification }, { status: 201 });
}
