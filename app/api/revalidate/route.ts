import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

/**
 * On-demand revalidation endpoint.
 *
 * Called by admin save actions to bust the ISR cache so that
 * public pages reflect changes immediately (within seconds).
 *
 * POST /api/revalidate
 * Body: { paths?: string[] }
 *
 * If no paths are provided, revalidates the homepage and layout.
 */
export async function POST(request: NextRequest) {
  try {
    // Verify the request comes from an authenticated admin
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const paths: string[] = body.paths || ['/'];

    for (const path of paths) {
      revalidatePath(path);
    }

    // Always revalidate the layout (header/footer data)
    revalidatePath('/', 'layout');

    return NextResponse.json({
      revalidated: true,
      paths,
      timestamp: Date.now(),
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Revalidation failed' },
      { status: 500 }
    );
  }
}
