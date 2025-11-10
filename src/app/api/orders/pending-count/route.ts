import { NextResponse } from 'next/server';
import { getPendingOrdersCount } from '@/lib/data';

export async function GET() {
  try {
    const count = await getPendingOrdersCount();
    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error fetching pending orders count:', error);
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}