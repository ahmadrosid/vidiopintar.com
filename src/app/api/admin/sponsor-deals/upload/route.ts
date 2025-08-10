import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-admin';
import { validateAndProcessCsv } from '@/lib/csv-utils';
import { db } from '@/lib/db';
import { sponsorDeals } from '@/lib/db/schema';

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'File must be a CSV' },
        { status: 400 }
      );
    }

    const csvContent = await file.text();
    const validationResult = await validateAndProcessCsv(csvContent);

    if (validationResult.validRows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No valid rows found in CSV',
        result: validationResult
      }, { status: 400 });
    }

    // Insert valid sponsor deals into database
    const sponsorDealsToInsert = validationResult.validRows.map(row => ({
      userId: row.userId!,
      dealName: row.dealName,
      expiresAt: new Date(Date.now() + (row.durationDays * 24 * 60 * 60 * 1000)),
      createdBy: admin.id,
    }));

    const insertedDeals = await db.insert(sponsorDeals)
      .values(sponsorDealsToInsert)
      .returning();

    return NextResponse.json({
      success: true,
      message: `Successfully created ${insertedDeals.length} sponsor deals`,
      result: validationResult,
      insertedDeals: insertedDeals.length
    });

  } catch (error) {
    console.error('Error processing CSV upload:', error);
    
    if (error instanceof Response && error.status === 302) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}