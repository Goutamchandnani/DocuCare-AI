import { createServerClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = createServerClient(cookies())

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-2 items-center justify-center">
      <h1 className="text-3xl font-bold">Welcome to your Dashboard, {user.email}!</h1>
      <form action="/auth/sign-out" method="post">
        <button className="py-2 px-4 rounded-md no-underline bg-btn-background hover:bg-btn-background-hover">
          Logout
        </button>
      </form>
    </div>
  )
}