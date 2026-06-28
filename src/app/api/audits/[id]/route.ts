import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAccess } from '@/lib/access-control';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const audit = await prisma.audit.findUnique({
      where: { id },
      include: {
        findings: true,
        recommendations: {
          orderBy: { rank: 'asc' }
        }
      }
    });

    if (!audit) {
      return NextResponse.json({ success: false, error: 'Audit not found' }, { status: 404 });
    }

    const accessState = await checkAccess(id);

    return NextResponse.json({ success: true, ...audit, accessState });
  } catch (error: any) {
    console.error('Fetch audit error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}
