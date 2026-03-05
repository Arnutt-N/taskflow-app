// API: Upload Excel File
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as XLSX from 'xlsx';
import { rateLimiters, checkRateLimit } from '@/lib/rateLimit';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit

// Ensure upload directory exists
async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
}

// Validate file type by magic bytes (not just extension)
async function validateFileType(buffer: Buffer, filename: string): Promise<boolean> {
  // Check file extension first
  const validExtensions = ['.xlsx', '.xls'];
  const hasValidExt = validExtensions.some(ext => filename.toLowerCase().endsWith(ext));
  if (!hasValidExt) return false;

  // Check magic bytes for Excel files
  // XLSX files are ZIP archives starting with PK
  // XLS files start with D0 CF 11 E0
  if (filename.toLowerCase().endsWith('.xlsx')) {
    // XLSX is a ZIP file, should start with PK (0x504B)
    return buffer.length >= 2 && buffer[0] === 0x50 && buffer[1] === 0x4B;
  } else if (filename.toLowerCase().endsWith('.xls')) {
    // XLS (OLE compound document)
    return buffer.length >= 4 && 
           buffer[0] === 0xD0 && 
           buffer[1] === 0xCF && 
           buffer[2] === 0x11 && 
           buffer[3] === 0xE0;
  }
  
  return false;
}

export async function POST(req: NextRequest) {
  try {
    // 🔒 SECURITY: Check authentication
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please login first.' },
        { status: 401 }
      );
    }

    // 🔒 SECURITY: Rate limiting
    const rateLimitResponse = await checkRateLimit(req, rateLimiters.upload);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Check user role (if using role-based access)
    // if (session.user.role !== 'admin') {
    //   return NextResponse.json(
    //     { error: 'Forbidden. Admin access required.' },
    //     { status: 403 }
    //   );
    // }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // 🔒 SECURITY: Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Read file buffer for validation
    const buffer = Buffer.from(await file.arrayBuffer());

    // 🔒 SECURITY: Validate file type by magic bytes
    const isValidType = await validateFileType(buffer, file.name);
    if (!isValidType) {
      return NextResponse.json(
        { error: 'Invalid file type. Only .xlsx and .xls files are allowed' },
        { status: 400 }
      );
    }

    // Generate unique filename to prevent overwrites
    const ext = path.extname(file.name).toLowerCase();
    const safeFilename = `${uuidv4()}${ext}`;
    const filePath = path.join(UPLOAD_DIR, safeFilename);

    // Ensure upload directory exists
    await ensureUploadDir();

    // Save file
    await fs.writeFile(filePath, buffer);

    // Parse preview data (first sheet)
    let preview: any[] = [];
    let columns: string[] = [];
    let totalRows = 0;

    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      if (workbook.SheetNames.length > 0) {
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(worksheet, { defval: '' }) as Record<string, any>[];
        totalRows = rows.length;
        preview = rows.slice(0, 20);
        columns = rows.length > 0 ? Object.keys(rows[0]) : [];
      }
    } catch (err) {
      console.error('Preview parse error:', err);
    }

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      filename: safeFilename,
      originalName: file.name,
      size: file.size,
      preview,
      columns,
      totalRows,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed. Please try again.' },
      { status: 500 }
    );
  }
}
