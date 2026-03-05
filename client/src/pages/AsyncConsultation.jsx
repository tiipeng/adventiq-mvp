import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { expertsApi, asyncApi } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { MOCK_EXPERTS } from '../utils/mockData';

const SLA_OPTIONS = [
  { hours: 48, price: 80, label: '48-hour response', desc: 'Standard — ideal for non-urgent questions', icon: '📬', recommended: false },
  { hours: 24, price: 120, label: '24-hour response', desc: 'Priority — faster expert attention', icon: '⚡', recommended: true },
];

const STEPS = ['Write question', 'Select SLA', 'Payment', 'Confirmation'];

// Mock email preview component
function EmailPreview({ expert, question, sla, bookingRef }) {
  const [showPreview, setShowPreview] = useState(false);
  if (!showPreview) {
    return (
      <button onClick={() => setShowPreview(true)} className="btn-secondary text-sm w-full justify-center mt-3">
        📧 Preview Confirmation Email
      </button>
    );
  }
  return (
    <div className="mt-4 border border-[var(--border)] rounded-xl overflow-hidden">
      <div className="bg-[var(--bg-subtle)] px-4 py-2.5 flex items-center justify-between">
        <span className="text-xs font-semibold text-[var(--text-muted)]">📧 Email Preview (mock)</span>
        <button onClick={() => setShowPreview(false)} className="text-xs text-[var(--text-muted)] hover:text-[var(--text-muted)]">Close</button>
      </div>
      <div className="p-4 bg-white text-sm space-y-2">
        <p><span className="text-[var(--text-muted)]">To:</span> <span className="font-medium">your@email.com</span></p>
        <p><span className="text-[var(--text-muted)]">Subject:</span> <span className="font-medium">Async consultation confirmed — {expert?.name}</span></p>
        <div className="border-t border-[var(--border)] pt-3 text-[var(--text-muted)] space-y-2 text-xs">
          <p>Hi there,</p>
          <p>Your async consultation request has been confirmed.</p>
          <p><strong>Expert:</strong> {expert?.name}</p>
          <p><strong>SLA:</strong> Response within {sla.hours} hours</p>
          <p><strong>Price paid:</strong> €{sla.price}</p>
          <p><strong>Reference:</strong> {bookingRef}</p>
          <p className="text-[var(--text-muted)] mt-3">You'll be notified by email when {expert?.name?.split(' ')[0]} responds. You can also check your dashboard under "Async Q's".</p>
        </div>
      </div>
      <div className="bg-[var(--bg-subtle)] px-4 py-2 flex justify-end">
        <button className="text-xs text-primary-600 hover:underline">Resend Email (mock)</button>
      </div>
    </div>
  );
}

export default function AsyncConsultation() {
  const { id: expertId } = useParams(); // expert user_id
  const { user } = useAuth();
  const navigate = useNavigate();

  const [expert, setExpert]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep]       = useState(1);

  // Form state
  const [question, setQuestion] = useState('');
  const [selectedSla, setSelectedSla] = useState(SLA_OPTIONS[0]);

  // Payment mock
  const [card, setCard]         = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [paying, setPaying]     = useState(false);

  // Confirmation
  const [consultation, setConsultation] = useState(null);

  // Toast
  const [toast, setToast] = useState('');

  useEffect(() => {
    expertsApi.get(expertId)
      .then(r => setExpert(r?.data && !Array.isArray(r.data) ? r.data : MOCK_EXPERTS.find(e => e.id === Number(expertId)) ?? null))
      .catch(() => setExpert(MOCK_EXPERTS.find(e => e.id === Number(expertId)) ?? null))
      .finally(() => setLoading(false));
  }, [expertId]);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  }

  async function handlePay() {
    if (!user) { navigate('/login'); return; }
    setPaying(true);
    try {
      // Get the expert profile id (not user_id)
      const r = await asyncApi.create({
        expert_id: expert.id,  // experts table id
        question: question.trim(),
        sla_hours: selectedSla.hours,
      });
      setConsultation(r.data);
      setStep(4);
      showToast('Booking confirmed! Check your email.');
    } catch (e) {
      alert(e.response?.data?.error || 'Payment failed. Please try again.');
    } finally {
      setPaying(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-subtle)]">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-12 animate-pulse">
          <div className="h-8 bg-[var(--bg-subtle)] rounded w-1/3 mb-4" />
          <div className="h-64 bg-[var(--bg-subtle)] rounded" />
        </div>
      </div>
    );
  }

  if (!expert) {
    return (
      <div className="min-h-screen bg-[var(--bg-subtle)]">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <p className="text-[var(--text-muted)]">Expert not found.</p>
          <Link to="/experts" className="btn-primary mt-4">Browse experts</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-subtle)]">
      <Navbar />

      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium animate-fade-in">
          <span>✅</span> {toast}
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        {/* Breadcrumb */}
        <nav className="text-sm text-[var(--text-muted)] mb-6 flex gap-2 items-center">
          <Link to="/experts" className="hover:text-primary-600">Experts</Link>
          <span>/</span>
          <Link to={`/experts/${expertId}`} className="hover:text-primary-600">{expert.name}</Link>
          <span>/</span>
          <span className="text-[var(--text-muted)]">Async Question</span>
        </nav>

        {/* Expert mini card */}
        <div className="card p-4 mb-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-lg">{expert.name?.charAt(0)}</span>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-[var(--text-primary)]">{expert.name}</p>
            <p className="text-sm text-[var(--text-muted)]">{expert.location} · €{expert.hourly_rate}/hr live</p>
          </div>
          {expert.avg_response_time && (
            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">⚡ {expert.avg_response_time} response</span>
          )}
        </div>

        {/* Progress steps */}
        <div className="flex items-center mb-8">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div className="flex items-center gap-1.5">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step > i + 1 ? 'bg-green-500 text-white' : step === i + 1 ? 'bg-primary-600 text-white' : 'bg-[var(--bg-subtle)] text-[var(--text-muted)]'}`}>
                  {step > i + 1 ? '✓' : i + 1}
                </div>
                <span className={`text-xs hidden sm:block ${step === i + 1 ? 'text-[var(--text-primary)] font-medium' : 'text-[var(--text-muted)]'}`}>{s}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${step > i + 1 ? 'bg-green-400' : 'bg-[var(--border)]'}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Write question */}
        {step === 1 && (
          <div className="card p-6 space-y-4">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Write your question</h2>
            <p className="text-sm text-[var(--text-muted)]">Ask anything within {expert.name?.split(' ')[0]}'s expertise. Be specific for a more useful answer.</p>

            <div>
              <label className="label">Your question</label>
              <textarea
                className="input"
                rows={8}
                placeholder={`Describe your technical challenge in detail. E.g.:\n\n"We are considering migrating our ML pipeline from batch to real-time streaming. We currently process 50k events/minute for fraud detection. What architecture would you recommend and what are the key trade-offs between Kafka Streams and Flink?"`}
                value={question}
                onChange={e => setQuestion(e.target.value)}
              />
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-[var(--text-muted)]">Min. 50 characters for a quality response</p>
                <p className={`text-xs ${question.length < 50 ? 'text-[var(--text-muted)]' : 'text-green-600'}`}>{question.length} chars</p>
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
              <p className="text-xs text-blue-700">
                <strong>🤖 AI-assisted response:</strong> {expert.name?.split(' ')[0]} will receive an AI-drafted starting point based on your question, helping them respond faster and more thoroughly.
              </p>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={question.trim().length < 50}
              className="btn-primary w-full py-3"
            >
              Continue → Select SLA
            </button>
          </div>
        )}

        {/* Step 2: Select SLA */}
        {step === 2 && (
          <div className="card p-6 space-y-4">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Select response time</h2>
            <p className="text-sm text-[var(--text-muted)]">How quickly do you need an answer?</p>

            <div className="space-y-3">
              {SLA_OPTIONS.map(sla => (
                <button
                  key={sla.hours}
                  onClick={() => setSelectedSla(sla)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${selectedSla.hours === sla.hours ? 'border-primary-500 bg-primary-50' : 'border-[var(--border)] hover:border-[var(--border-strong)] bg-white'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{sla.icon}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[var(--text-primary)]">{sla.label}</span>
                          {sla.recommended && <span className="px-1.5 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full font-medium">Recommended</span>}
                        </div>
                        <p className="text-sm text-[var(--text-muted)]">{sla.desc}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary-600">€{sla.price}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-secondary flex-1">← Back</button>
              <button onClick={() => setStep(3)} className="btn-primary flex-1 py-3">Continue → Payment</button>
            </div>
          </div>
        )}

        {/* Step 3: Mock payment */}
        {step === 3 && (
          <div className="space-y-4">
            {/* Order summary */}
            <div className="card p-5 bg-primary-50 border-primary-200">
              <h3 className="font-semibold text-[var(--text-primary)] mb-3">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Async consultation — {expert.name}</span>
                  <span className="font-medium">€{selectedSla.price}</span>
                </div>
                <div className="flex justify-between text-[var(--text-muted)]">
                  <span>Platform fee (5%)</span>
                  <span>€{(selectedSla.price * 0.05).toFixed(2)}</span>
                </div>
                <div className="border-t border-primary-200 pt-2 flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-primary-600">€{(selectedSla.price * 1.05).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment form */}
            <div className="card p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">💳</span>
                <h3 className="font-semibold text-[var(--text-primary)]">Payment Details</h3>
                <span className="text-xs px-2 py-0.5 bg-[var(--bg-subtle)] text-[var(--text-muted)] rounded-full ml-auto">Mock — no real charge</span>
              </div>

              <div>
                <label className="label">Card number</label>
                <input className="input font-mono" placeholder="4242 4242 4242 4242" maxLength={19}
                  value={card.number}
                  onChange={e => setCard(c => ({ ...c, number: e.target.value.replace(/[^0-9]/g, '').replace(/(.{4})/g, '$1 ').trim() }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Expiry</label>
                  <input className="input" placeholder="MM/YY" maxLength={5}
                    value={card.expiry}
                    onChange={e => setCard(c => ({ ...c, expiry: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="label">CVV</label>
                  <input className="input font-mono" placeholder="123" maxLength={4}
                    value={card.cvv}
                    onChange={e => setCard(c => ({ ...c, cvv: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className="label">Cardholder name</label>
                <input className="input" placeholder="Full name on card"
                  value={card.name}
                  onChange={e => setCard(c => ({ ...c, name: e.target.value }))}
                />
              </div>

              {!user && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">You need to <Link to="/login" className="underline font-medium">sign in</Link> to submit your question.</p>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="btn-secondary flex-1">← Back</button>
                <button
                  onClick={handlePay}
                  disabled={paying}
                  className="btn-primary flex-1 py-3"
                >
                  {paying ? '⏳ Processing…' : `Pay €${(selectedSla.price * 1.05).toFixed(2)} →`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === 4 && consultation && (
          <div className="text-center space-y-6">
            <div>
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Question Submitted!</h2>
              <p className="text-[var(--text-muted)]">
                {expert.name} has been notified and will respond within <strong>{selectedSla.hours} hours</strong>.
              </p>
            </div>

            <div className="card p-5 text-left space-y-3">
              <h3 className="font-semibold text-[var(--text-primary)]">Booking details</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[var(--text-muted)] text-xs uppercase tracking-wide mb-0.5">Reference</p>
                  <p className="font-mono font-medium">AQ-{consultation.id?.toString().padStart(4,'0') || '0001'}</p>
                </div>
                <div>
                  <p className="text-[var(--text-muted)] text-xs uppercase tracking-wide mb-0.5">Expert</p>
                  <p className="font-medium">{expert.name}</p>
                </div>
                <div>
                  <p className="text-[var(--text-muted)] text-xs uppercase tracking-wide mb-0.5">SLA</p>
                  <p className="font-medium">{selectedSla.hours}h response</p>
                </div>
                <div>
                  <p className="text-[var(--text-muted)] text-xs uppercase tracking-wide mb-0.5">Paid</p>
                  <p className="font-bold text-primary-600">€{(selectedSla.price * 1.05).toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="card p-4 bg-green-50 border-green-200 text-left">
              <p className="text-sm text-green-800 font-medium mb-1">What happens next?</p>
              <ol className="text-sm text-green-700 space-y-1">
                <li>1. {expert.name?.split(' ')[0]} reviews your question with an AI-drafted starting point</li>
                <li>2. They craft a detailed, personalized response</li>
                <li>3. You'll receive an email notification + it appears in your dashboard</li>
              </ol>
            </div>

            <EmailPreview
              expert={expert}
              question={question}
              sla={selectedSla}
              bookingRef={`AQ-${consultation.id?.toString().padStart(4,'0') || '0001'}`}
            />

            <div className="flex gap-3">
              <Link to="/dashboard/business" className="btn-secondary flex-1 justify-center">Go to Dashboard</Link>
              <Link to="/experts" className="btn-primary flex-1 justify-center">Browse more experts</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
