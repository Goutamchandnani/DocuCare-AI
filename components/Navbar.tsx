"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SheetTrigger, SheetContent, Sheet } from "@/components/ui/sheet";
import { MenuIcon } from "lucide-react";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export function Navbar() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }
    getUser();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <header className="flex h-16 items-center justify-between px-4 md:px-6 border-b">
      <Link className="mr-6 hidden lg:flex" href="#">
        <MedicalCrossIcon className="h-6 w-6" />
        <span className="sr-only">DocuCare AI</span>
      </Link>
      <div className="flex items-center gap-4">
        <Link className="lg:hidden" href="#">
          <MedicalCrossIcon className="h-6 w-6" />
          <span className="sr-only">DocuCare AI</span>
        </Link>
      </div>
      <nav className="hidden lg:flex lg:items-center lg:gap-4">
        <Link className="font-semibold" href="/dashboard">
          Dashboard
        </Link>
        <Link className="font-semibold" href="/documents">
          Documents
        </Link>
        <Link className="font-semibold" href="/medications">
          Medications
        </Link>
        <Link className="font-semibold" href="/chat">
          Chat
        </Link>
        <Link className="font-semibold" href="/timeline">
          Timeline
        </Link>
      </nav>
      <div className="flex items-center gap-4">
        {user ? (
          <Button size="sm" variant="outline" onClick={handleSignOut}>
            Logout
          </Button>
        ) : (
          <Button size="sm" variant="outline" onClick={() => router.push('/login')}>
            Sign In
          </Button>
        )}
      </div>
    </header>
  );
}

function MedicalCrossIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 12H14" />
      <path d="M12 10V14" />
      <path d="M4 12C4 8.68629 6.68629 6 10 6H14C17.3137 6 20 8.68629 20 12C20 15.3137 17.3137 18 14 18H10C6.68629 18 4 15.3137 4 12Z" />
    </svg>
  );
}
