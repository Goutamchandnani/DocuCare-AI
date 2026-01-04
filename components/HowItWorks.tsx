export default function HowItWorks() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-[#2C3E50] mb-12">How It Works</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Step 1 */}
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#4A90E2] text-white text-2xl font-bold mb-6 shadow-md">
              1
            </div>
            <h3 className="text-xl font-semibold text-[#2C3E50] mb-3">Upload Your Documents</h3>
            <p className="text-gray-600">Securely upload your medical records, prescriptions, and lab results.</p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#4A90E2] text-white text-2xl font-bold mb-6 shadow-md">
              2
            </div>
            <h3 className="text-xl font-semibold text-[#2C3E50] mb-3">AI Analyzes & Simplifies</h3>
            <p className="text-gray-600">Our AI processes your documents, extracting key information and translating complex medical jargon into plain language.</p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#4A90E2] text-white text-2xl font-bold mb-6 shadow-md">
              3
            </div>
            <h3 className="text-xl font-semibold text-[#2C3E50] mb-3">Ask Questions & Get Answers</h3>
            <p className="text-gray-600">Chat with your documents, ask questions, and get instant, accurate answers about your health.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
