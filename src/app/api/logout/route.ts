import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/app/actions';

export async function POST() {
  await clearSessionCookie();
  return NextResponse.json({ success: true });
}
