import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Clinic from '@/models/Clinic';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  await connectDB();
  let clinic = await Clinic.findOne({});
  if (!clinic) clinic = await Clinic.create({ name: 'DentalCare Dental Clinic' });
  return NextResponse.json({ clinic });
}

export async function PUT(req: NextRequest) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if ((session.user as any).role !== 'admin')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const clinic = await Clinic.findOneAndUpdate({}, body, { new: true, upsert: true });
  return NextResponse.json({ clinic });
}
