import { createServerClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { redirect } from 'next/navigation'

export async function POST(request: Request) {
  const requestUrl = new URL(request.url)
  const supabase = createServerClient(cookies())

  await supabase.auth.signOut()

  return NextResponse.redirect(`${requestUrl.origin}/login`, {
    status: 302,
  })
}
