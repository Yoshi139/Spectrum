// src/app/api/get-results/route.ts

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// These variables are safe to use here because this code ONLY runs on the server.
// NEVER expose your service_role key in frontend code.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { question_id } = await request.json();

    if (question_id === undefined) {
      return NextResponse.json({ error: 'question_id is required' }, { status: 400 });
    }
    
    // Call the database function we created earlier
    const { data, error } = await supabase
      .rpc('get_question_results', { q_id: question_id });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json(data[0]);

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}