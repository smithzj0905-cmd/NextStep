'use client';

import { useEffect, useState } from 'react';

const HISTORY_KEY = 'nextstep_analysis_history_v1';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
      if (Array.isArray(saved)) {
        setHistory(saved);
      }
    } catch {}
  }, []);

  function deleteItem(id) {
    const next = history.filter((item) => item.id !== id);
    setHistory(next);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));

    if (selected?.id === id) {
      setSelected(null);
    }
  }

  function clearHistory() {
    if (!window.confirm('Clear all document history?')) return;

    localStorage.removeItem(HISTORY_KEY);
    setHistory([]);
    setSelected(null);
  }

  function formatDate(value) {
    if (!value) return 'Unknown date';

    try {
      return new Date(value).toLocaleString([], {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch {
      return 'Unknown date';
    }
  }

  const dateLabel =
    selected?.date_label ||
    (selected?.date_type === 'event' ? 'EVENT' : 'DEADLINE');

  const dateValue =
    selected?.date_value ||
    selected?.deadline ||
    'Not identified';

  const required =
    selected?.required_steps?.length
      ? selected.required_steps
      : selected?.steps || [];

  const recommended = selected?.recommended_steps || [];

  return (
    <main>
      <nav className="nav">
        <div className="brand">NextStep</div>

        <div className="nav-links">
          <a href="/">Home</a>
          <a href="/#how">How it works</a>
        </div>
      </nav>

      <section className="history-page">
        <div className="history-page-inner">
          <div className="history-header">
            <div>
              <div className="eyebrow">YOUR RECORD</div>
              <h1>Document history</h1>
              <p>
                Revisit documents you have analyzed on this device.
              </p>
            </div>

            <div className="history-actions">
              <a href="/" className="secondary">
                New analysis
              </a>

              {history.length > 0 && (
                <button
                  type="button"
                  className="danger-button"
                  onClick={clearHistory}
                >
                  Clear history
                </button>
              )}
            </div>
          </div>

          {history.length === 0 ? (
            <div className="empty-history">
              <h2>No documents yet</h2>
              <p>
                Documents you analyze will appear here so you can revisit the
                AI feedback later.
              </p>

              <a href="/" className="primary">
                Analyze a document
              </a>
            </div>
          ) : (
            <div className="history-layout">
              <div className="history-list">
                {history.map((item) => (
                  <div
                    className={`history-card ${
                      selected?.id === item.id ? 'selected' : ''
                    }`}
                    key={item.id}
                  >
                    <button
                      type="button"
                      className="history-card-main"
                      onClick={() => setSelected(item)}
                    >
                      <strong>
                        {item.title || 'Untitled document'}
                      </strong>

                      <span>
                        {item.document_type || 'Document'}
                      </span>

                      <small>
                        Analyzed {formatDate(item.analyzedAt)}
                      </small>
                    </button>

                    <button
                      type="button"
                      className="delete-button"
                      onClick={() => deleteItem(item.id)}
                      aria-label="Delete document"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>

              {selected && (
                <div className="history-result">
                  <div className="result-top">
                    <div>
                      <div className="eyebrow">AI ANALYSIS</div>
                      <h2>{selected.title || 'Document analysis'}</h2>
                    </div>

                    {selected.is_template_or_sample && (
                      <span className="template-badge">
                        SAMPLE OR TEMPLATE
                      </span>
                    )}
                  </div>

                  <div className="result-meta">
                    <div>
                      <span>DOCUMENT</span>
                      <strong>
                        {selected.document_type || 'Not identified'}
                      </strong>
                    </div>

                    <div>
                      <span>FROM</span>
                      <strong>
                        {selected.issuing_organization ||
                          'Not identified'}
                      </strong>
                    </div>

                    <div>
                      <span>DATE</span>
                      <strong>
                        {dateLabel}: {dateValue}
                      </strong>
                    </div>

                    <div>
                      <span>CONFIDENCE</span>
                      <strong>
                        {selected.confidence || 'Not identified'}
                      </strong>
                    </div>
                  </div>

                  <div className="result-section">
                    <h3>What this means</h3>
                    <p>
                      {selected.action_summary ||
                        selected.purpose ||
                        'No summary available.'}
                    </p>
                  </div>

                  {required.length > 0 && (
                    <div className="result-section">
                      <h3>Required actions</h3>

                      <ol className="step-list">
                        {required.map((step, index) => (
                          <li key={index}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {recommended.length > 0 && (
                    <div className="result-section">
                      <h3>Recommended actions</h3>

                      <ol className="step-list">
                        {recommended.map((step, index) => (
                          <li key={index}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {selected.required_documents?.length > 0 && (
                    <div className="result-section">
                      <h3>Documents you may need</h3>

                      <ul>
                        {selected.required_documents.map(
                          (item, index) => (
                            <li key={index}>{item}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                  {selected.amounts_or_fees?.length > 0 && (
                    <div className="result-section">
                      <h3>Amounts and fees</h3>

                      <ul>
                        {selected.amounts_or_fees.map(
                          (item, index) => (
                            <li key={index}>{item}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                  {selected.consequences?.length > 0 && (
                    <div className="result-section">
                      <h3>If you do not act</h3>

                      <ul>
                        {selected.consequences.map(
                          (item, index) => (
                            <li key={index}>{item}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                  {selected.contact && (
                    <div className="result-section">
                      <h3>Contact</h3>
                      <p>{selected.contact}</p>
                    </div>
                  )}

                  {selected.website_listed && (
                    <div className="result-section">
                      <h3>Website listed on document</h3>
                      <p>{selected.website_listed}</p>
                    </div>
                  )}

                  {selected.caution && (
                    <div className="caution">
                      <strong>Important:</strong>
                      <p>{selected.caution}</p>
                    </div>
                  )}

                  <div className="history-result-footer">
                    Analyzed {formatDate(selected.analyzedAt)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
