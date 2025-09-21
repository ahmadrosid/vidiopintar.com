import { db } from '@/lib/db';
import { user } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export interface CsvRow {
  email: string;
  dealName: string;
  durationDays: number;
}

export interface ProcessedCsvRow extends CsvRow {
  userId?: string;
  isValid: boolean;
  errors: string[];
}

export interface CsvValidationResult {
  rows: ProcessedCsvRow[];
  validRows: ProcessedCsvRow[];
  invalidRows: ProcessedCsvRow[];
  summary: {
    total: number;
    valid: number;
    invalid: number;
  };
}

export function parseCsvContent(csvContent: string): CsvRow[] {
  const lines = csvContent.trim().split('\n');
  const rows: CsvRow[] = [];

  // Skip header row if it exists
  const startIndex = lines[0]?.toLowerCase().includes('email') ? 1 : 0;

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const columns = line.split(',').map(col => col.trim().replace(/^"|"$/g, ''));
    
    if (columns.length >= 3) {
      const durationDays = parseInt(columns[2]);
      
      rows.push({
        email: columns[0],
        dealName: columns[1],
        durationDays: isNaN(durationDays) ? 0 : durationDays
      });
    }
  }

  return rows;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateDuration(days: number): boolean {
  return days > 0 && days <= 365; // Max 365 days
}

export async function validateAndProcessCsv(csvContent: string): Promise<CsvValidationResult> {
  const rows = parseCsvContent(csvContent);
  const processedRows: ProcessedCsvRow[] = [];

  for (const row of rows) {
    const errors: string[] = [];
    let isValid = true;
    let userId: string | undefined;

    // Validate email format
    if (!validateEmail(row.email)) {
      errors.push('Invalid email format');
      isValid = false;
    }

    // Validate duration
    if (!validateDuration(row.durationDays)) {
      errors.push('Duration must be between 1 and 365 days');
      isValid = false;
    }

    // Validate deal name
    if (!row.dealName || row.dealName.trim().length === 0) {
      errors.push('Deal name is required');
      isValid = false;
    }

    // Check if user exists
    if (isValid) {
      try {
        const existingUser = await db.select()
          .from(user)
          .where(eq(user.email, row.email))
          .limit(1);

        if (existingUser.length === 0) {
          errors.push('User not found with this email');
          isValid = false;
        } else {
          userId = existingUser[0].id;
        }
      } catch (error) {
        errors.push('Error checking user existence');
        isValid = false;
      }
    }

    processedRows.push({
      ...row,
      userId,
      isValid,
      errors
    });
  }

  const validRows = processedRows.filter(row => row.isValid);
  const invalidRows = processedRows.filter(row => !row.isValid);

  return {
    rows: processedRows,
    validRows,
    invalidRows,
    summary: {
      total: processedRows.length,
      valid: validRows.length,
      invalid: invalidRows.length
    }
  };
}