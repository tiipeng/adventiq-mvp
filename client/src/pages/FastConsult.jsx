import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { expertsApi } from '../utils/api';
import { MOCK_EXPERTS } from '../utils/mockData';

const urgencyOptions = [
  { id: 'normal', label: 'Normal (48h)', fee: 89 },
  { id: 'express', label: 'Express (24h)', fee: 149 },
  { id: 'urgent', label: 'Urgent (4h)', fee: 249 },
];

const formatOptions = ['Written Report', 'Video Call', 'Voice Note'];

export default function FastConsult() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [expert, setExpert] = useState(null);
  const [question, setQuestion] = useState('');
  const [urgency, setUrgency] = useState(urgencyOptions[0].id);
  const [format, setFormat] = useState(formatOptions[0]);

  useEffect(() => {
    expertsApi.get(id)
      .then((response) => {
        const data = response?.data ?? MOCK_EXPERTS;
        setExpert(Array.isArray(data) ? data.find((e) => Number(e.id) === Number(id)) : data);
      })
      .catch(() => setExpert(MOCK_EXPERTS.find((e) => Number(e.id) === Number(id))));
  }, [id]);

  const fee = useMemo(() => urgencyOptions.find((o) => o.id === urgency)?.fee ?? 89, [urgency]);

  return (
    <div className="flex min-h-screen bg-[var(--bg-base)]">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Navbar />
        <div className="container-app py-8 max-w-3xl">
          <h1 className="mb-2">Fast Consult</h1>
          <p className="text-[var(--text-muted)] mb-6">Start an instant consultation with {expert?.name || 'expert'}.</p>

          <div className="card p-5 space-y-4">
            <div>
              <label className="label">Your question / challenge (max 300 chars)</label>
              <textarea className="input" maxLength={300} value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="What do you need help with?" />
              <small>{question.length}/300</small>
            </div>

            <div>
              <label className="label">Urgency</label>
              <div className="grid sm:grid-cols-3 gap-2">
                {urgencyOptions.map((option) => (
                  <button key={option.id} className={`h-10 rounded-[10px] border text-sm ${urgency === option.id ? 'border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent)]' : 'border-[var(--border)] text-[var(--text-secondary)]'}`} onClick={() => setUrgency(option.id)}>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Preferred format</label>
              <div className="grid sm:grid-cols-3 gap-2">
                {formatOptions.map((option) => (
                  <button key={option} className={`h-10 rounded-[10px] border text-sm ${format === option ? 'border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent)]' : 'border-[var(--border)] text-[var(--text-secondary)]'}`} onClick={() => setFormat(option)}>
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="card p-4 bg-[var(--bg-subtle)]">
              <p className="text-sm text-[var(--text-primary)] font-medium">Instant match confirmation</p>
              <p className="text-sm text-[var(--text-secondary)]">Status: {urgency === 'urgent' ? 'Available now' : 'Responds within 2h'}</p>
              <p className="text-sm text-[var(--accent)] font-semibold mt-1">Flat fee: €{fee}</p>
            </div>

            <button
              className="btn-primary w-full"
              disabled={question.trim().length < 10}
              onClick={() => navigate('/payment', { state: { flow: 'fast-consult', provider: expert, question, urgency, format, fee, totalPrice: fee } })}
            >
              Continue to Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
