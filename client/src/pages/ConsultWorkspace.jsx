import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

function buildResponse(question) {
  return {
    summary: `You are addressing: ${question || 'a technical research challenge'}.`,
    recommendations: [
      'Prioritize a quick validation experiment to reduce implementation risk.',
      'Define measurable success criteria and align stakeholders before execution.',
      'Use a phased rollout with clear checkpoints and decision gates.',
    ],
    nextSteps: 'Schedule a 60-minute working session to finalize scope, timeline, and owners.',
    resources: 'Suggested resources: domain benchmark papers, compliance checklist, and implementation template.',
  };
}

export default function ConsultWorkspace() {
  const { id } = useParams();
  const consult = useMemo(() => JSON.parse(localStorage.getItem(`consult_${id}`) ?? 'null'), [id]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!consult) {
    return (
      <div className="flex min-h-screen bg-[var(--bg-base)]">
        <Sidebar />
        <div className="flex-1 min-w-0">
          <Navbar />
          <div className="container-app py-10">Consultation not found.</div>
        </div>
      </div>
    );
  }

  const response = buildResponse(consult.question);

  return (
    <div className="flex min-h-screen bg-[var(--bg-base)]">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Navbar />
        <div className="container-app py-8">
          <h1 className="mb-2">Consultation Workspace</h1>
          <p className="text-[var(--text-muted)] mb-6">Consult ID: {id}</p>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="card p-5">
              <h3 className="mb-3">Your Brief</h3>
              <p className="text-sm mb-3">{consult.question}</p>
              <p className="text-sm text-[var(--text-muted)] mb-3">Format: {consult.format} · Urgency: {consult.urgency}</p>
              <button className="btn-secondary">Mock Upload File</button>
            </div>

            <div className="card p-5">
              <h3 className="mb-3">Expert Response</h3>
              {loading ? (
                <p className="text-sm text-[var(--text-muted)]">Expert is preparing your response...</p>
              ) : (
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">Problem Summary</p>
                    <p>{response.summary}</p>
                  </div>
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">Key Recommendations</p>
                    <ul className="list-disc pl-4">
                      {response.recommendations.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">Next Steps</p>
                    <p>{response.nextSteps}</p>
                  </div>
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">Suggested Resources</p>
                    <p>{response.resources}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 mt-5">
            <button className="btn-secondary">Save Report</button>
            <button className="btn-secondary">Download PDF</button>
            <button className="btn-secondary">Download as PDF</button>
            <Link className="btn-primary" to={`/book/expert/${consult.expert?.id}`}>Book Follow-up</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
