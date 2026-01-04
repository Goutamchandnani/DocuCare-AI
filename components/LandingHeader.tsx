import Link from 'next/link';

export default function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="text-2xl font-bold text-[#2C3E50]">
          MediMind AI
        </div>

        {/* Navigation Links */}
        <div className="space-x-4">
          <Link href="/login" className="text-[#2C3E50] hover:text-[#4A90E2] font-medium">
            Login
          </Link>
          <Link href="/signup" className="text-[#2C3E50] hover:text-[#4A90E2] font-medium">
            Sign Up
          </Link>
        </div>
      </nav>
    </header>
  );
}
