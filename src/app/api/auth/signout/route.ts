import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (session) {
    // In a real app, you might want to log the logout
    console.log(`User ${session.user.email} logged out`);
  }

  // NextAuth handles the actual signout via the form action
  // This route just provides a programmatic way to sign out
  return NextResponse.redirect(new URL('/auth/login', request.url));
}