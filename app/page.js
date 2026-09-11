'use client';
import { useEffect, useState } from 'react';

const HISTORY_KEY = 'nextstep_analysis_history_v1';

export default function Home() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [inputKey, setInputKey] = useState(0);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
      if (Array.isArray(saved)) setHistory(saved);
    } catch {}
  }, []);

  function saveToHistory(data) {
    const record = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      analyzedAt: new Date().toISOString(),
      ...data
    };
    const next = [record, ...history].slice(0, 50);
    setHistory(next);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    } catch {}
    return record;
  }

  function openHistory(record) {
    setResult(record);
    setError('');
    setTimeout(() => {
      document.querySelector('#results')?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  }

  function deleteHistory(id) {
    const next = history.filter(item => item.id !== id);
    setHistory(next);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    } catch {}
  }

  function startNewAnalysis() {
    setResult(null);
    setError('');
    setFile(null);
    setText('');
    setInputKey(k => k + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function analyze() {
    if (!file && !text.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

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

      const saved = saveToHistory(data);

      setResult(saved);
      setFile(null);
      setText('');
      setInputKey(k => k + 1);

      setTimeout(() => {
        document.querySelector('#results')?.scrollIntoView({
          behavior: 'smooth'
        });
      }, 50);

    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const dateLabel =
    result?.date_label ||
    (result?.date_type === 'event' ? 'EVENT' : 'DEADLINE');

  const dateValue =
    result?.date_value ||
    result?.deadline ||
    'Not identified';

  const required =
    result?.required_steps?.length
      ? result.required_steps
      : (result?.steps || []);

  const recommended =
    result?.recommended_steps || [];

  return (
    <main>

      <nav className="nav">
        <div className="brand">NextStep</div>

        <div className="nav-links">
          <a href="#history">History</a>
          <a href="#how">How it works</a>
        </div>
      </nav>

      <section className="hero">

        <div className="pill">FREE BETA</div>

        <h1>
          Confusing paperwork?
          <br />
          <span>Know exactly what to do next.</span>
        </h1>

        <p className="sub">
          Upload a letter, notice, bill, form, or PDF.
          NextStep turns it into plain English, highlights
          important dates, and creates a simple action checklist.
        </p>

        <div className="card upload-card">

          <label className="upload-box">

            <input
              key={inputKey}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.txt"
              onChange={e =>
                setFile(e.target.files?.[0] || null)
              }
            />

            <strong>
              {file
                ? `[FILE] ${file.name}`
                : '[UPLOAD] Upload a document'}
            </strong>

            <small>
              PDF, image, or text file
            </small>

          </label>

          <div className="or">OR</div>

          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Paste the text from your letter here..."
          />

          <button
            className="primary"
            onClick={analyze}
            disabled={
              loading ||
              (!file && !text.trim())
            }
          >
            {loading
              ? 'Analyzing...'
              : 'Analyze My Document - Free'}
          </button>

          {error && (
            <div className="error">
              {error}
            </div>
          )}

          <p className="tiny">
            For privacy, do not upload passwords, Social Security
            numbers, bank credentials, or information you do not
            want processed. NextStep provides informational
            assistance, not professional advice.
          </p>

        </div>
      </section>

      {history.length > 0 && (
        <section
          id="history"
          className="history"
        >
          <div className="history-inner">

            <div className="section-heading">

              <div>
                <span className="eyebrow">
                  YOUR RECORDS
                </span>

                <h2>
                  Analysis history
                </h2>

                <p>
                  Saved on this device so you can revisit
                  previous NextStep analyses.
                </p>
              </div>

              <button
                className="secondary"
                onClick={startNewAnalysis}
              >
                New analysis
              </button>

            </div>

            <div className="history-list">

              {history.map(item => (
                <div
                  className="history-item"
                  key={item.id}
                >

                  <button
                    className="history-open"
                    onClick={() =>
                      openHistory(item)
                    }
                  >
                    <strong>
                      {item.title ||
                        'Untitled document'}
                    </strong>

                    <span>
                      {item.document_type ||
                        'Document'}
                      {' - '}
                      {new Date(
                        item.analyzedAt
                      ).toLocaleString()}
                    </span>

                  </button>

                  <button
                    className="delete-history"
                    onClick={() =>
                      deleteHistory(item.id)
                    }
                    aria-label="Delete record"
                  >
                    Delete
                  </button>

                </div>
              ))}

            </div>

            <p className="tiny">
              History is currently stored locally in this
              browser/device. It is not yet synced across
              devices or accounts.
            </p>

          </div>
        </section>
      )}

      <section
        id="how"
        className="how"
      >

        <h2>
          Three steps. No bureaucratic maze.
        </h2>

        <div className="grid">

          <div>
            <b>01</b>
            <h3>Upload it</h3>
            <p>
              Take a picture, upload a PDF,
              or paste the text.
            </p>
          </div>

          <div>
            <b>02</b>
            <h3>Understand it</h3>
            <p>
              Get a plain-English explanation
              of what the document appears to say.
            </p>
          </div>

          <div>
            <b>03</b>
            <h3>Take action</h3>
            <p>
              See deadlines, required steps,
              and what to verify next.
            </p>
          </div>

        </div>
      </section>

      {result && (
        <section
          id="results"
          className="results"
        >

          <div className="result-card">

            <div className="result-top">

              <span className="success">
                ANALYSIS COMPLETE
              </span>

              <span>
                Confidence: {result.confidence || 'unknown'}
              </span>

            </div>

            {result.is_template_or_sample && (
              <div className="template-badge">
                SAMPLE / TEMPLATE DOCUMENT
              </div>
            )}

            <h2>
              {result.title}
            </h2>

            <p>
              <b>Document:</b>{' '}
              {result.document_type}
            </p>

            <p>
              <b>Sender:</b>{' '}
              {result.issuing_organization ||
                'Not identified'}

              {result.is_template_or_sample
                ? ' - sample/template indicators detected'
                : ''}
            </p>

            <div className="alert">

              <b>
                {result.action_required
                  ? 'Action appears to be required'
                  : 'No clear action identified'}
              </b>

              <p>
                {result.action_summary}
              </p>

            </div>

            <div className="deadline">

              <small>
                {dateLabel}
              </small>

              <strong>
                {dateValue}
              </strong>

              <span>
                {result.date_basis ||
                  result.deadline_basis ||
                  'unknown'}
              </span>

            </div>

            {required.length > 0 && (
              <>
                <h3>
                  Required by the document
                </h3>

                <ol>
                  {required.map((s, i) => (
                    <li key={i}>
                      {s}
                    </li>
                  ))}
                </ol>
              </>
            )}

            {recommended.length > 0 && (
              <>
                <h3>
                  Recommended next steps
                </h3>

                <ol>
                  {recommended.map((s, i) => (
                    <li key={i}>
                      {s}
                    </li>
                  ))}
                </ol>
              </>
            )}

            {result.required_documents?.length > 0 && (
              <>
                <h3>
                  Documents you may need
                </h3>

                <ul>
                  {result.required_documents.map((s, i) => (
                    <li key={i}>
                      {s}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {result.amounts_or_fees?.length > 0 && (
              <>
                <h3>
                  Amounts / fees mentioned
                </h3>

                <ul>
                  {result.amounts_or_fees.map((s, i) => (
                    <li key={i}>
                      {s}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {result.consequences?.length > 0 && (
              <>
                <h3>
                  What may happen if you do not act
                </h3>

                <ul>
                  {result.consequences.map((s, i) => (
                    <li key={i}>
                      {s}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {result.contact && (
              <p>
                <b>Contact:</b>{' '}
                {result.contact}
              </p>
            )}

            {result.website_listed && (
              <p>
                <b>
                  Website listed on document:
                </b>{' '}

                <a
                  href={
                    result.website_listed.startsWith('http')
                      ? result.website_listed
                      : `https://${result.website_listed}`
                  }
                  target="_blank"
                  rel="noreferrer"
                >
                  Open website
                </a>
              </p>
            )}

            <p className="caution">
              Warning: {result.caution}
            </p>

            <div className="feedback">

              <h3>
                Was this useful?
              </h3>

              <div className="feedback-buttons">

                <button
                  onClick={() =>
                    alert('Thanks!')
                  }
                >
                  Yes
                </button>

                <button
                  onClick={() =>
                    alert(
                      'Thanks! We will improve it.'
                    )
                  }
                >
                  Not really
                </button>

              </div>

              <textarea
                placeholder="What should NextStep do better? (optional)"
              />

            </div>

            <button
              className="primary"
              onClick={startNewAnalysis}
            >
              Analyze another document
            </button>

          </div>

        </section>
      )}

      <section className="beta">

        <h2>
          We are building NextStep with real users.
        </h2>

        <p>
          Try a real document and tell us what the
          app got right or wrong.
        </p>

        <button
          className="primary"
          onClick={startNewAnalysis}
        >
          Analyze another document
        </button>

      </section>

      <footer>
        <b>NextStep</b>

        <span>
          Informational assistance only.
          Verify important requirements with
          the issuing organization.
        </span>
      </footer>

    </main>
  );
}
