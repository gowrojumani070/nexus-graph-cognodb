import { NextResponse } from 'next/server';
import { checkDatabaseConnection } from '@/lib/cognodb';

export async function GET() {
  try {
    const status = await checkDatabaseConnection();
    return NextResponse.json(status);
  } catch (error: any) {
    return NextResponse.json({
      isConnected: false,
      isMockFallback: true,
      error: error?.message || 'Database health check failed.',
    }, { status: 500 });
  }
}
