import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseMetaAdsCsv } from '@/lib/csv-parser';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const deviceId = (formData.get('deviceId') as string) || 'unknown-device';
    const email = (formData.get('email') as string) || `guest-${deviceId}@adaudit.ai`;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    const text = await file.text();
    const { data, errors } = parseMetaAdsCsv(text);

    if (data.length === 0) {
      return NextResponse.json({ success: false, error: 'Failed to parse CSV or no valid rows found', details: errors }, { status: 400 });
    }

    let user = await prisma.user.findFirst({ where: { email } });
    if (!user) {
      const now = new Date();
      // Trial is 10 hours by default (can be overridden by settings later, but hardcoded here for simplicity or we can fetch it)
      const trialDurationHours = 10;
      const trialEndsAt = new Date(now.getTime() + trialDurationHours * 60 * 60 * 1000);
      
      // @ts-ignore: Prisma types are out of sync until server restart
      user = await prisma.user.create({ 
        data: { 
          email, 
          name: 'Guest User',
          trialStartedAt: now,
          trialEndsAt: trialEndsAt
        } as any
      });
    }

    const uploadsDir = join(process.cwd(), 'uploads');
    await mkdir(uploadsDir, { recursive: true });
    
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = join(uploadsDir, fileName);
    await writeFile(filePath, text);

    const upload = await prisma.upload.create({
      data: {
        userId: user.id,
        fileName: file.name,
        storagePath: filePath,
        fileSizeBytes: file.size,
        uploadStatus: 'parsed',
      }
    });

    return NextResponse.json({ success: true, uploadId: upload.id, status: 'parsed' });

  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}
