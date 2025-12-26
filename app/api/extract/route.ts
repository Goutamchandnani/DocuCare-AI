import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { extractedText } = body;

    if (!extractedText) {
      return NextResponse.json({ error: 'Extracted text is required' }, { status: 400 });
    }

    const prompt = `You are a highly skilled medical assistant. Your task is to extract structured health information and provide a plain-language summary from the following medical document text.

First, identify and extract the following entities into a JSON object:
- **Patient Information**: Name, Date of Birth, Gender, Address, Contact.
- **Diagnoses**: List of medical conditions or diagnoses.
- **Medications**: List of medications, including name, dosage, frequency, and instructions.
- **Lab Results**: Any significant lab test results with values and units.
- **Appointments**: Dates and times of future or past appointments.
- **Doctor Information**: Name, Specialty, Contact.

If an entity is not found, omit it or provide an empty array/string as appropriate.

Second, provide a concise, plain-language summary of the medical document.

Combine both the structured data and the summary into a single JSON object with two keys: "structuredData" and "summary".

Medical Document Text:
"""
${extractedText}
"""

JSON Output:`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 2000,
      messages: [
        { role: 'user', content: prompt }
      ],
    });

    const llmOutput = response.content[0].text;

    // Attempt to parse the JSON output from the LLM
    let structuredData;
    let aiSummary = '';
    try {
      const parsedOutput = JSON.parse(llmOutput);
      structuredData = parsedOutput.structuredData || {};
      aiSummary = parsedOutput.summary || '';
    } catch (parseError) {
      console.error('Error parsing LLM output as JSON:', parseError);
      console.error('LLM Output:', llmOutput);
      return NextResponse.json({ error: 'Failed to parse structured data and summary from LLM', llmOutput }, { status: 500 });
    }

    return NextResponse.json({ structuredData, aiSummary }, { status: 200 });

  } catch (error) {
    console.error('Error in AI data extraction API route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
