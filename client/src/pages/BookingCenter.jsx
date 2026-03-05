import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const SERVICES = [
  {
    title: 'Expert Booking',
    description: 'Book scheduled sessions with verified experts via date/time booking and payment.',
    primary: { to: '/experts', label: 'Choose Expert' },
    flow: ['Select expert', 'Set time and session type', 'Pay', 'Get confirmation'],
  },
  {
    title: 'Lab Booking',
    description: 'Reserve lab capacity, select services/equipment, and complete booking checkout.',
    primary: { to: '/labs', label: 'Choose Lab' },
    flow: ['Select lab', 'Pick services and slot', 'Pay', 'Get confirmation'],
  },
  {
    title: 'Fast Consult',
    description: 'Ask an urgent question, pick urgency, pay, and continue in the consult workspace.',
    primary: { to: '/experts', label: 'Start Fast Consult' },
    flow: ['Select expert', 'Define urgency', 'Pay', 'Enter workspace'],
  },
  {
    title: 'Async Consultation',
    description: 'Submit a detailed async question with SLA and payment, then track responses.',
    primary: { to: '/experts', label: 'Start Async Consult' },
    flow: ['Select expert', 'Write question and SLA', 'Pay', 'Receive confirmation'],
  },
];

export default function BookingCenter() {
  return (
    <div className="flex min-h-screen bg-[var(--bg-base)]">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Navbar />

        <main className="container-app py-8">
          <h1 className="mb-2">Booking Center</h1>
          <p className="text-[var(--text-muted)] mb-6">Use one place to start every service booking flow.</p>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {SERVICES.map((service) => (
              <div key={service.title} className="card p-5">
                <h3 className="mb-2">{service.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] mb-4">{service.description}</p>
                <div className="space-y-1 mb-4 text-sm text-[var(--text-secondary)]">
                  {service.flow.map((step, index) => (
                    <p key={step}><strong>{index + 1}.</strong> {step}</p>
                  ))}
                </div>
                <Link to={service.primary.to} className="btn-primary">{service.primary.label}</Link>
              </div>
            ))}
          </div>

          <div className="card p-5">
            <h3 className="mb-2">AI First Option</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-4">Already know your challenge? Start with AI matching and then continue to booking.</p>
            <Link to="/ai-recommend" className="btn-secondary">Open AI Expert Finder</Link>
          </div>
        </main>
      </div>
    </div>
  );
}
