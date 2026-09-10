'use client';
import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function analyze() {
    if (!file && !text.trim()) return;
    setLoading(true); setError(''); setResult(null);
    const form = new FormData();
    if (file) form.append('file', file);
    if (text.trim()) form.append('text', text.trim());
    try {
      const res = await fetch('/api/analyze', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed.');
      setResult(data);
      setTimeout(() => document.querySelector('#results')?.scrollIntoView({behavior:'smooth'}), 50);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  return <main>
    <nav className="nav"><div className="brand">NextStep</div><a href="#how">How it works</a></nav>
    <section className="hero">
      <div className="pill">FREE BETA</div>
      <h1>Confusing paperwork?<br/><span>Know exactly what to do next.</span></h1>
      <p className="sub">Upload a letter, notice, bill, form, or PDF. NextStep turns it into plain English, highlights important dates, and creates a simple action checklist.</p>
      <div className="card upload-card">
        <label className="upload-box"><input type="file" accept=".pdf,.png,.jpg,.jpeg,.txt" onChange={e=>setFile(e.target.files?.[0]||null)}/><strong>{file ? file.name : '📎 Upload a document'}</strong><small>PDF, image, or text file</small></label>
        <div className="or">OR</div>
        <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Paste the text from your letter here..." />
        <button className="primary" onClick={analyze} disabled={loading || (!file && !text.trim())}>{loading ? 'Analyzing…' : 'Analyze My Document — Free'}</button>
        {error && <div className="error">{error}</div>}
        <p className="tiny">For privacy, don't upload passwords, Social Security numbers, bank credentials, or information you don't want processed. NextStep provides informational assistance, not professional advice.</p>
      </div>
    </section>
    <section id="how" className="how"><h2>Three steps. No bureaucratic maze.</h2><div className="grid"><div><b>01</b><h3>Upload it</h3><p>Take a picture, upload a PDF, or paste the text.</p></div><div><b>02</b><h3>Understand it</h3><p>Get a plain-English explanation of what the document appears to say.</p></div><div><b>03</b><h3>Take action</h3><p>See deadlines, required steps, and what to verify next.</p></div></div></section>
    {result && <section id="results" className="results"><div className="result-card">
      <div className="result-top"><span className="success">ANALYSIS COMPLETE</span><span>Confidence: {result.confidence || 'unknown'}</span></div>
      <h2>{result.title}</h2><p><b>Document:</b> {result.document_type}</p><p><b>Sender:</b> {result.issuing_organization || 'Not identified'}</p>
      <div className="alert"><b>{result.action_required ? 'Action appears to be required' : 'No clear action identified'}</b><p>{result.action_summary}</p></div>
      <div className="deadline"><small>DEADLINE</small><strong>{result.deadline || 'Not identified'}</strong><span>{result.deadline_basis || 'unknown'}</span></div>
      <h3>Your next steps</h3><ol>{(result.steps||[]).map((s,i)=><li key={i}>{s}</li>)}</ol>
      {result.required_documents?.length>0 && <><h3>Documents you may need</h3><ul>{result.required_documents.map((s,i)=><li key={i}>{s}</li>)}</ul></>}
      {result.amounts_or_fees?.length>0 && <><h3>Amounts / fees mentioned</h3><ul>{result.amounts_or_fees.map((s,i)=><li key={i}>{s}</li>)}</ul></>}
      {result.official_website && <p><b>Official website identified:</b> <a href={result.official_website} target="_blank" rel="noreferrer">Open official site</a></p>}
      <p className="caution">⚠️ {result.caution}</p>
      <div className="feedback"><h3>Was this useful?</h3><div className="feedback-buttons"><button onClick={()=>alert('Thanks!')}>👍 Yes</button><button onClick={()=>alert('Thanks! We’ll improve it.')}>👎 Not really</button></div><textarea placeholder="What should NextStep do better? (optional)" /></div>
    </div></section>}
    <section className="beta"><h2>We're building NextStep with real users.</h2><p>Try a real document and tell us what the app got right or wrong.</p><button className="primary" onClick={()=>window.scrollTo({top:0,behavior:'smooth'})}>Analyze another document</button></section>
    <footer><b>NextStep</b><span>Informational assistance only. Verify important requirements with the issuing organization.</span></footer>
  </main>
}
