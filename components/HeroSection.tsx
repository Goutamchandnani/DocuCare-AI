import Link from 'next/link';
import { Upload, Brain, MessageSquare } from 'lucide-react'; // Assuming lucide-react is installed

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-b from-[#E3F2FD] to-white py-20 md:py-32">
      <div className="container mx-auto px-4 text-center">
        {/* Hero Headline */}
        <h1 className="text-4xl md:text-5xl font-bold text-[#2C3E50] leading-tight mb-6">
          Understand Your Medical Records <br /> in Seconds with AI
        </h1>

        {/* Primary CTA Button */}
        <Link href="/signup" className="inline-block bg-[#4A90E2] text-white text-lg font-semibold px-10 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
          Get Started Free &rarr;
        </Link>

        {/* Feature Cards */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {/* Card 1: Upload Docs */}
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
            <Upload size={32} className="text-[#4A90E2] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[#2C3E50] mb-2">Upload Docs</h3>
            <p className="text-gray-600">Securely upload your medical documents.</p>
          </div>

          {/* Card 2: AI Plain Language */}
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
            <Brain size={32} className="text-[#4A90E2] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[#2C3E50] mb-2">AI Plain Language</h3>
            <p className="text-gray-600">Get complex medical jargon explained simply.</p>
          </div>

          {/* Card 3: Chat with Docs */}
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
            <MessageSquare size={32} className="text-[#4A90E2] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[#2C3E50] mb-2">Chat with Docs</h3>
            <p className="text-gray-600">Ask questions and get answers directly from your documents.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
