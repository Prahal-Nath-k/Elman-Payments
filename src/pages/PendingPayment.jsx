import { Lock, CheckCircle2, Clock } from 'lucide-react';

const FEATURES = [
  'Unlimited company payment tracking',
  'Smart overdue & due-soon alerts',
  'Full payment history & audit trail',
  'Secure, role-based access control',
  'Export & reporting tools',
];

export function PendingPayment() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        padding: '1.5rem',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
      }}
    >
      {/* Decorative blobs */}
      <div style={{
        position: 'absolute', top: '-80px', left: '-80px',
        width: '350px', height: '350px',
        background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-100px', right: '-60px',
        width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(239,68,68,0.1) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      <div style={{
        width: '100%', maxWidth: '480px',
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.09)',
        borderRadius: '28px',
        padding: '2.5rem 2.5rem 2.25rem',
        boxShadow: '0 32px 64px rgba(0,0,0,0.5)',
        position: 'relative',
        zIndex: 10,
      }}>

        {/* Icon + badge */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem', gap: '0.75rem' }}>
          <div style={{
            width: '68px', height: '68px',
            background: 'linear-gradient(135deg, #1e293b, #334155)',
            border: '1.5px solid rgba(239,68,68,0.35)',
            borderRadius: '20px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(239,68,68,0.12)',
          }}>
            <Lock size={30} color="#f87171" />
          </div>
          <span style={{
            background: 'rgba(239,68,68,0.12)', color: '#f87171',
            border: '1px solid rgba(239,68,68,0.28)',
            borderRadius: '99px', padding: '3px 14px',
            fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}>Access Restricted</span>
        </div>

        <h1 style={{
          textAlign: 'center', color: '#f8fafc',
          fontSize: '1.6rem', fontWeight: 800, lineHeight: 1.25,
          marginBottom: '0.65rem', letterSpacing: '-0.02em',
        }}>
          Payment Pending
        </h1>
        <p style={{
          textAlign: 'center', color: '#94a3b8',
          fontSize: '0.92rem', lineHeight: 1.65,
          marginBottom: '2rem',
        }}>
          Your account is awaiting payment confirmation. Access to ElmanPay is temporarily suspended until your subscription is activated.
        </p>

        {/* Feature list */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
          marginBottom: '1.75rem',
        }}>
          <p style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '0.85rem' }}>
            Features included in your plan
          </p>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {FEATURES.map((f) => (
              <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <CheckCircle2 size={15} color="#475569" style={{ flexShrink: 0 }} />
                <span style={{ color: '#64748b', fontSize: '0.87rem' }}>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Status indicator */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
          color: '#64748b', fontSize: '0.82rem',
        }}>
          <Clock size={14} color="#64748b" />
          <span>Awaiting payment confirmation from your administrator</span>
        </div>
      </div>
    </div>
  );
}
