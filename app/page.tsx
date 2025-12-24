import { createServerClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import HealthTimelineClient from '@/components/HealthTimelineClient'

export default async function Index() {
  const supabase = createServerClient(cookies())

  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect('/login')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-8">Health Timeline</h1>
      <HealthTimelineClient />
    </div>
  )
}
