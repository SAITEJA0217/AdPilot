import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function GET() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Respond with exactly: "Gemini connected successfully"',
    });

    const text = response.text;
    
    if (text && text.includes('Gemini connected successfully')) {
      return NextResponse.json({ success: true, response: "Gemini connected successfully" });
    } else {
      return NextResponse.json({ success: false, response: text }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Test AI error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
