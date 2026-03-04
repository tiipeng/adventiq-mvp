import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { reportsApi, bookingsApi } from '../utils/api';
import { useAuth } from '../context/AuthContext';

// Simple markdown-to-HTML parser (no extra dependencies)
function renderMarkdown(text) {
  if (!text) return '';
  return text
    .split('\n')
    .map(line => {
      if (line.startsWith('# '))  return `<h1>${line.slice(2)}</h1>`;
      if (line.startsWith('## ')) return `<h2>${line.slice(3)}</h2>`;
      if (line.startsWith('### ')) return `<h3>${line.slice(4)}</h3>`;
      if (line.startsWith('- '))  return `<li>${line.slice(2)}</li>`;
      if (line.match(/^\d+\. /))  return `<li>${line.replace(/^\d+\. /, '')}</li>`;
      if (line.trim() === '')     return '<br/>';
      return `<p>${line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>').replace(/`(.*?)`/g, '<code>$1</code>')}</p>`;
    })
    .join('');
}

export default function Reports() {
  const { bookingId } = useParams();
  const { user } = useAuth();
  const [report, setReport]   = useState(null);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProvider, setIsProvider] = useState(false);

  // Write mode state
  const [writeMode, setWriteMode] = useState(false);
  const [content, setContent]    = useState('');
  const [file, setFile]          = useState(null);
  const [saving, setSaving]      = useState(false);
  const [error, setError]        = useState('');

  useEffect(() => {
    Promise.all([
      bookingsApi.get(bookingId),
      reportsApi.getByBooking(bookingId).catch(() => null),
    ]).then(([bRes, rRes]) => {
      setBooking(bRes.data);
      if (rRes) setReport(rRes.data);
      if (rRes?.data?.content) setContent(rRes.data.content);
    }).catch(console.error).finally(() => setLoading(false));
  }, [bookingId]);

  useEffect(() => {
    if (!user || !booking) return;
    setIsProvider(user.role === 'expert' || user.role === 'lab');
  }, [user, booking]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const fd = new FormData();
    fd.append('booking_id', bookingId);
    fd.append('content', content);
    if (file) fd.append('file', file);

    try {
      const res = await reportsApi.submit(fd);
      setReport(res.data);
      setWriteMode(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save report');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <div className="flex-1 flex items-center justify-center text-gray-400">Loading…</div>
        </div>
      </div>
    );
  }

  function fmtDate(str) {
    if (!str) return '–';
    return new Date(str).toLocaleString('en-DE', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 p-6 max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Consultation Report</h1>
              <p className="text-gray-500 mt-1">Booking #{bookingId} · {booking?.provider_name || booking?.business_name}</p>
            </div>
            {isProvider && !writeMode && (
              <button onClick={() => setWriteMode(true)} className="btn-primary text-sm">
                {report ? '✏️ Edit report' : '📝 Write report'}
              </button>
            )}
          </div>

          {/* Booking context */}
          {booking && (
            <div className="card p-4 mb-6 flex flex-wrap gap-6 text-sm">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Business</p>
                <p className="font-medium">{booking.business_name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">{booking.provider_type === 'expert' ? 'Expert' : 'Lab'}</p>
                <p className="font-medium">{booking.provider_name || '–'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Session</p>
                <p className="font-medium">{fmtDate(booking.slot_start)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Status</p>
                <span className={`badge ${booking.status === 'completed' ? 'badge-green' : 'badge-blue'}`}>{booking.status}</span>
              </div>
            </div>
          )}

          {/* Write mode */}
          {writeMode && isProvider && (
            <div className="card p-6 mb-6">
              <h2 className="font-semibold text-gray-900 mb-4">
                {report ? 'Update Report' : 'Write Report'}
              </h2>
              {error && <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="label">Report content <span className="text-gray-400 font-normal">(Markdown supported)</span></label>
                  </div>
                  <textarea
                    className="input font-mono text-sm"
                    rows={16}
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder={`# Consultation Report\n\n## Executive Summary\n...\n\n## Findings\n...\n\n## Recommendations\n...`}
                  />
                </div>

                <div>
                  <label className="label">Attach file <span className="text-gray-400 font-normal">(PDF, DOCX, XLSX — optional)</span></label>
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt,.md,.xlsx"
                    onChange={e => setFile(e.target.files[0])}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                  />
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setWriteMode(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" className="btn-primary" disabled={saving}>
                    {saving ? 'Saving…' : 'Submit report →'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Report display */}
          {!writeMode && report ? (
            <div className="card p-8">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <div>
                  <p className="font-semibold text-gray-900">Consultation Report</p>
                  <p className="text-sm text-gray-400">Submitted {fmtDate(report.submitted_at)}</p>
                </div>
                {report.file_path && (
                  <a
                    href={report.file_path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary text-sm flex items-center gap-2"
                  >
                    📎 Download attachment
                  </a>
                )}
              </div>

              {report.content ? (
                <div
                  className="prose-report max-w-none"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(report.content) }}
                />
              ) : (
                <div className="text-center py-8">
                  <p className="text-4xl mb-2">📎</p>
                  <p className="text-gray-500">Report attached as file.</p>
                  {report.file_path && (
                    <a href={report.file_path} target="_blank" rel="noopener noreferrer" className="btn-primary mt-3">
                      Download report
                    </a>
                  )}
                </div>
              )}
            </div>
          ) : !writeMode && (
            <div className="card p-12 text-center">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-gray-500 mb-2">
                {isProvider ? 'No report submitted yet.' : 'The report hasn\'t been submitted yet.'}
              </p>
              {isProvider && (
                <button onClick={() => setWriteMode(true)} className="btn-primary mt-2">Write report now</button>
              )}
              {!isProvider && <p className="text-sm text-gray-400">The expert/lab will submit a report after the session.</p>}
            </div>
          )}

          <div className="mt-6">
            <Link to="/dashboard/business" className="btn-secondary text-sm">← Back to dashboard</Link>
          </div>
        </main>
      </div>
    </div>
  );
}
