import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { getWorker, getWorkerPayments, getTotalPaidForWorker, deleteWorkerPayment } from '../db/storage';
import { Worker, WorkerPayment } from '../types';
import { formatDate } from '../utils/date';
import { useLanguage } from '../contexts/LanguageContext';

export default function WorkerDetailScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { s, isRTL } = useLanguage();

  const [worker, setWorker] = useState<Worker | undefined>(location.state?.worker);
  const [payments, setPayments] = useState<WorkerPayment[]>([]);
  const [paid, setPaid] = useState(0);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const load = () => {
    const wid = parseInt(id!);
    const w = getWorker(wid);
    if (w) setWorker(w);
    const p = getWorkerPayments(wid);
    setPayments(p);
    setPaid(getTotalPaidForWorker(wid));
  };

  useEffect(() => { load(); }, [id]);

  const handleDeletePayment = (pid: number) => {
    deleteWorkerPayment(pid);
    setConfirmId(null);
    load();
  };

  if (!worker) return null;

  const remaining = worker.totalFee - paid;
  const fullyPaid = remaining <= 0;
  const pct = worker.totalFee > 0 ? Math.min(100, (paid / worker.totalFee) * 100) : 0;
  const dir = isRTL ? 'rtl' : 'ltr';

  return (
    <div className="app-shell">
      <div className="sub-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points={isRTL ? '9 18 15 12 9 6' : '15 18 9 12 15 6'} />
          </svg>
        </button>
        <span className="sub-header-title">{worker.name}</span>
        <button onClick={() => navigate(`/workers/edit/${worker.id}`, { state: { worker } })} style={{ color: '#A0B4C8', padding: '4px', background: 'none', border: 'none', cursor: 'pointer' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
        </button>
      </div>

      <div className="screen-content" style={{ paddingBottom: 20 }}>
        {/* Summary card */}
        <div style={{ background: '#1A2D4F', padding: 16, margin: 16, borderRadius: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#fff', direction: dir }}>{worker.name}</span>
            <span style={{ fontSize: 13, color: '#A0B4C8', direction: dir }}>{worker.trade}</span>
          </div>
          {worker.note && <div style={{ fontSize: 12, color: '#A0B4C8', marginBottom: 12, direction: dir }}>{worker.note}</div>}

          <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 12px' }}>
              <div style={{ fontSize: 11, color: '#A0B4C8' }}>{s.totalFee}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>₪{worker.totalFee.toLocaleString()}</div>
            </div>
            <div style={{ flex: 1, background: 'rgba(46,204,113,0.15)', borderRadius: 10, padding: '10px 12px' }}>
              <div style={{ fontSize: 11, color: '#2ECC71' }}>{s.totalPaid}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#2ECC71' }}>₪{paid.toLocaleString()}</div>
            </div>
            <div style={{ flex: 1, background: fullyPaid ? 'rgba(46,204,113,0.1)' : 'rgba(230,126,34,0.15)', borderRadius: 10, padding: '10px 12px' }}>
              <div style={{ fontSize: 11, color: fullyPaid ? '#2ECC71' : '#E67E22' }}>{s.remaining}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: fullyPaid ? '#2ECC71' : '#E67E22' }}>₪{Math.max(0, remaining).toLocaleString()}</div>
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 4, height: 8, overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 4, background: fullyPaid ? '#2ECC71' : '#4A90E2', width: `${pct}%`, transition: 'width 0.3s' }} />
          </div>
          <div style={{ textAlign: 'center', fontSize: 12, color: '#A0B4C8', marginTop: 6 }}>
            {pct.toFixed(0)}% {s.paid}
            {fullyPaid && <span style={{ color: '#2ECC71', marginLeft: 8, fontWeight: 700 }}>{s.fullyPaid}</span>}
          </div>
        </div>

        {/* Add payment button */}
        <div style={{ margin: '0 16px 16px' }}>
          <button onClick={() => navigate(`/workers/${worker.id}/pay`, { state: { worker } })} style={{ width: '100%', background: '#4A90E2', color: '#fff', border: 'none', borderRadius: 12, padding: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
            {s.addPayment}
          </button>
        </div>

        {/* Payment history */}
        <div className="section-card" style={{ margin: '0 16px' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#1A2D4F', marginBottom: 12, direction: dir }}>{s.payments}</div>
          {payments.length === 0
            ? <div style={{ fontSize: 14, color: '#999', textAlign: 'center', padding: '16px 0' }}>{s.noPayments}</div>
            : payments.map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #F0F4F8', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#2ECC71' }}>₪{p.amount.toLocaleString()}</div>
                    <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{formatDate(p.date)}</div>
                    {p.note && <div style={{ fontSize: 12, color: '#666', fontStyle: 'italic', direction: dir }}>{p.note}</div>}
                  </div>
                  <button onClick={() => setConfirmId(p.id)} style={{ background: 'none', border: 'none', color: '#E74C3C', cursor: 'pointer', padding: 6 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></svg>
                  </button>
                </div>
              ))
          }
        </div>
      </div>

      {confirmId !== null && (
        <div className="confirm-overlay" onClick={() => setConfirmId(null)}>
          <div className="confirm-box" onClick={e => e.stopPropagation()}>
            <div className="confirm-title">{s.deletePayment}</div>
            <div className="confirm-msg">This will permanently delete this payment record.</div>
            <div className="confirm-btns">
              <button className="confirm-btn cancel" onClick={() => setConfirmId(null)}>{s.cancel}</button>
              <button className="confirm-btn danger" onClick={() => handleDeletePayment(confirmId)}>{s.delete}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
