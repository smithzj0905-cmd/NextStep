import OpenAI from 'openai';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const instructions = `You are NextStep, an informational document-to-action assistant.
Analyze the user's document and return ONLY valid JSON matching this shape:
{
  "title": string,
  "document_type": string,
  "issuing_organization": string,
  "recipient": string,
  "purpose": string,
  "action_required": boolean,
  "action_summary": string,
  "deadline": string | null,
  "deadline_basis": "explicit" | "calculated" | "unknown",
  "confidence": "high" | "medium" | "low",
  "steps": string[],
  "required_documents": string[],
  "amounts_or_fees": string[],
  "consequences": string[],
  "official_contact": string | null,
  "official_website": string | null,
  "caution": string
}
Rules:
- Never invent dates, deadlines, fees, contact information, or requirements.
- If information is absent or unclear, use null, [] or say that it is unclear.
- Distinguish an explicit deadline from a deadline calculated from a stated period.
- If a deadline is relative (for example, 30 days after the date of the notice), explain that in deadline_basis and do not silently calculate unless the document date is clear.
- Preserve important numbers and dates accurately.
- Explain in plain English.
- Do not provide legal, tax, medical, immigration, financial, or other professional advice. Describe what the document appears to require and recommend verification with the issuing organization for consequential matters.
- If the document is malicious, asks for passwords, payment credentials, cryptocurrency, or suspicious transfers, flag that clearly in caution.
- Keep steps concise and actionable.`;

export async function POST(request) {
  try {
    const key = process.env.OPENAI_API_KEY;
    if (!key) return NextResponse.json({ error: 'OPENAI_API_KEY is not configured.' }, { status: 500 });

    const form = await request.formData();
    const file = form.get('file');
    const text = String(form.get('text') || '').trim();
    if (!file && !text) return NextResponse.json({ error: 'Upload a document or paste its text.' }, { status: 400 });

    const client = new OpenAI({ apiKey: key });
    const content = [{ type: 'input_text', text: instructions }];

    if (text) content.push({ type: 'input_text', text: `DOCUMENT TEXT:\n${text}` });

    if (file && typeof file.arrayBuffer === 'function') {
      const bytes = Buffer.from(await file.arrayBuffer());
      const base64 = bytes.toString('base64');
      const mime = file.type || 'application/octet-stream';
      if (mime === 'application/pdf') {
        content.push({ type: 'input_file', filename: file.name || 'document.pdf', file_data: `data:application/pdf;base64,${base64}` });
      } else if (mime.startsWith('image/')) {
        content.push({ type: 'input_image', image_url: `data:${mime};base64,${base64}` });
      } else if (!text) {
        const decoded = bytes.toString('utf8');
        content.push({ type: 'input_text', text: `DOCUMENT TEXT:\n${decoded}` });
      }
    }

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || 'gpt-5.6-luna',
      input: [{ role: 'user', content }],
      text: { format: { type: 'json_object' } },
      store: false
    });

    const raw = response.output_text;
    let result;
    try { result = JSON.parse(raw); }
    catch { return NextResponse.json({ error: 'The AI returned an invalid analysis. Please try again.' }, { status: 502 }); }

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Unable to analyze this document right now.' }, { status: 500 });
  }
}
