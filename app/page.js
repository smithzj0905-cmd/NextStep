'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [selectedHistory, setSelectedHistory] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('nextstep_history');
      if (saved) setHistory(JSON.parse(saved));
    } catch {}
  }, []);

  function saveHistory(analysis, fileName) {
    const item = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      fileName: fileName || 'Pasted document',
      analysis
    };

    const updated = [item, ...history].slice(0, 25);
    setHistory(updated);

    try {
      localStorage.setItem('nextstep_history', JSON.stringify(updated));
    } catch {}
  }

  function clearHistory() {
    if (!window.confirm('Delete your saved NextStep history on this device?')) return;

    setHistory([]);
    setSelectedHistory(null);

    try {
      localStorage.removeItem('nextstep_history');
    } catch {}
  }

  async function analyze() {
    if (!file && !text.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);
    setSelectedHistory(null);

    const form = new FormData();

    if (file) form.append('file', file);
    if (text.trim()) form.append('text', text.trim());

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: form
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Analysis failed.');
      }

      setResult(data);

      saveHistory(data, file?.name);

      // Clear the upload area after successful analysis.
      setFile(null);
      setText('');

      setTimeout(() => {
        document
          .querySelector('#results')
          ?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (e) {
      setError(e.message || 'Unable to analyze this document right now.');
    } finally {
      setLoading(false);
    }
  }

  function startNew() {
    setFile(null);
    setText('');
    setResult(null);
    setError('');
    setSelectedHistory(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openHistory(item) {
    setSelectedHistory(item);
    setResult(item.analysis);
    setError('');

    setTimeout(() => {
      document
        .querySelector('#results')
        ?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  const displayedResult = selectedHistory
    ? selectedHistory.analysis
    : result;

  return (
    <main>
      <header className="hero">
        <div className="eyebrow">FREE BETA</div>

        <h1>
          Confusing paperwork?
          <br />
          <span>Know exactly what to do next.</span>
        </h1>

        <p>
          Upload a letter, notice, bill, form, or PDF. NextStep turns it into
          plain English, highlights important dates, and creates a simple
          action checklist.
        </p>
      </header>

      <section className="upload-card">
        <label className="upload-box">
          <input
            type="file"
            accept=".pdf,image/*,.txt"
            onChange={(e) => {
              setFile(e.target.files?.[0] || null);
              setError('');
            }}
            hidden
          />

          <div className="upload-icon">▤</div>

          <strong>
            {file ? file.name : 'Upload a document'}
          </strong>

          <span>
            {file
              ? 'Document ready to analyze'
              : 'PDF, image, or text file'}
          </span>
        </label>

        <div className="or">OR</div>

        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setError('');
          }}
          placeholder="Paste the text from your letter here..."
        />

        <button
          className="primary"
          onClick={analyze}
          disabled={loading || (!file && !text.trim())}
        >
          {loading ? 'Analyzing document…' : 'Analyze My Document — Free'}
        </button>

        {file && !loading && (
          <button
            className="secondary"
            onClick={() => setFile(null)}
          >
            Remove document
          </button>
        )}

        {error && <div className="error">{error}</div>}

        <p className="privacy">
          For privacy, do not upload passwords, Social Security numbers,
          bank credentials, or information you do not want processed.
          NextStep provides informational assistance, not professional advice.
        </p>
      </section>

      {history.length > 0 && (
        <section className="history" id="history">
          <div className="section-heading">
            <div>
              <div className="eyebrow">YOUR RECORD</div>
              <h2>Document history</h2>
              <p>
                Revisit documents you have analyzed on this device.
              </p>
            </div>

            <button
              className="text-button"
              onClick={clearHistory}
            >
              Clear history
            </button>
          </div>

          <div className="history-list">
            {history.map((item) => (
              <button
                key={item.id}
                className="history-item"
                onClick={() => openHistory(item)}
              >
                <div>
                  <strong>
                    {item.analysis?.title || item.fileName}
                  </strong>

                  <span>
                    {item.fileName}
                  </span>
                </div>

                <div className="history-date">
                  {new Date(item.createdAt).toLocaleDateString()}
                  <br />
                  View →
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {displayedResult && (
        <section id="results" className="results">
          <div className="result-top">
            <span className="complete">
              ANALYSIS COMPLETE
            </span>

            <span>
              Confidence: {displayedResult.confidence || 'unknown'}
            </span>
          </div>

          <h2>{displayedResult.title}</h2>

          <p>
            <b>Document:</b>{' '}
            {displayedResult.document_type || 'Not specified'}
          </p>

          <p>
            <b>Sender:</b>{' '}
            {displayedResult.issuing_organization || 'Not specified'}
          </p>

          <div className="alert">
            <h3>
              {displayedResult.action_required
                ? 'Action appears to be required'
                : 'No immediate action identified'}
            </h3>

            <p>
              {displayedResult.action_summary ||
                'Review the document and verify any important requirements.'}
            </p>
          </div>

          {displayedResult.deadline && (
            <div className="deadline">
              <small>DEADLINE</small>
              <strong>{displayedResult.deadline}</strong>
              <span>
                {displayedResult.deadline_basis || 'unknown'}
              </span>
            </div>
          )}

          {displayedResult.steps?.length > 0 && (
            <>
              <h3>Your next steps</h3>

              <ol>
                {displayedResult.steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </>
          )}

          {displayedResult.required_documents?.length > 0 && (
            <>
              <h3>Required documents</h3>
              <ul>
                {displayedResult.required_documents.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </>
          )}

          {displayedResult.amounts_or_fees?.length > 0 && (
            <>
              <h3>Amounts / fees mentioned</h3>
              <ul>
                {displayedResult.amounts_or_fees.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </>
          )}

          {displayedResult.consequences?.length > 0 && (
            <>
              <h3>What happens if you do not act</h3>
              <ul>
                {displayedResult.consequences.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </>
          )}

          {displayedResult.official_contact && (
            <p>
              <b>Contact:</b> {displayedResult.official_contact}
            </p>
          )}

          {displayedResult.official_website && (
            <p>
              <b>Official website identified:</b>{' '}
              <a
                href={displayedResult.official_website}
                target="_blank"
                rel="noreferrer"
              >
                Open official site
              </a>
            </p>
          )}

          {displayedResult.caution && (
            <p className="caution">
              ⚠️ {displayedResult.caution}
            </p>
          )}

          <button className="primary" onClick={startNew}>
            Analyze another document
          </button>
        </section>
      )}

      <section className="beta">
        <h2>We are building NextStep with real users.</h2>

        <p>
          Try a real document and tell us what the app got right or wrong.
        </p>

        <button className="primary" onClick={startNew}>
          Analyze another document
        </button>
      </section>

      <footer>
        <b>NextStep</b>
        <span>
          Informational assistance only. Verify important requirements
          with the issuing organization.
        </span>
      </footer>
    </main>
  );
}
