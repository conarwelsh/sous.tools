import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export async function POST() {
  try {
    // Run the CLI forge command via the root pnpm script
    // We use --filter to ensure we hit the right package if needed, 
    // but root 'pnpm sous' already does that.
    const { stdout, stderr } = await execAsync('pnpm sous dev quality forge', { 
      cwd: path.join(process.cwd(), '../../..') 
    });
    
    return NextResponse.json({ success: true, output: stdout });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
