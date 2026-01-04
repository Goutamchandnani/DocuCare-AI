import { createServerClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import HealthTimelineClient from '@/components/HealthTimelineClient'
import LandingHeader from '@/components/LandingHeader'
import HeroSection from '@/components/HeroSection'
import HowItWorks from '@/components/HowItWorks'

export default async function Index() {
  const supabase = createServerClient(cookies())

  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    return (
      <>
        <LandingHeader />
        <HeroSection />
        <HowItWorks />
      </>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-8">Health Timeline</h1>
      <HealthTimelineClient />
    </div>
  )
}
