import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllWorkers, getTotalPaidForWorker, deleteWorker } from '../db/storage';
import { Worker } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

export default function WorkersScreen() {
  const navigate = useNavigate();
  const { s, isRTL } = useLanguage();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [paidMap, setPaidMap] = useState<Record<number, number>>({});
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const load = async () => {
    const ws = await getAllWorkers();
    setWorkers(ws);
    const paid = await Promise.all(ws.map(w => getTotalPaidForWorker(w.id)));
    const map: Record<number, number> = {};
    ws.forEach((w, i) => { map[w.id] = paid[i]; });
    setPaidMap(map);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: number) => {
    await deleteWorker(id);
    setConfirmId(null);
    load();
  };

  const dir = isRTL ? 'rtl' : 'ltr';

  const totalFeeAll = workers.reduce((s, w) => s + w.totalFee, 0);
  const totalPaidAll = workers.reduce((s, w) => s + (paidMap[w.id] ?? 0), 0);
  const totalRemaining = totalFeeAll - totalPaidAll;

  return (
    <div>
      {/* Summary bar */}
      <div style={{ background: '#1A2D4F', padding: '14px 16px' }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 12px' }}>
            <div style={{ fontSize: 11, color: '#A0B4C8', fontWeight: 500 }}>{s.totalFee}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginTop: 2 }}>₪{totalFeeAll.toLocaleString()}</div>
          </div>
          <div style={{ flex: 1, background: 'rgba(46,204,113,0.15)', borderRadius: 10, padding: '10px 12px' }}>
            <div style={{ fontSize: 11, color: '#2ECC71', fontWeight: 500 }}>{s.totalPaid}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#2ECC71', marginTop: 2 }}>₪{totalPaidAll.toLocaleString()}</div>
          </div>
          <div style={{ flex: 1, background: totalRemaining === 0 ? 'rgba(46,204,113,0.1)' : 'rgba(230,126,34,0.15)', borderRadius: 10, padding: '10px 12px' }}>
            <div style={{ fontSize: 11, color: totalRemaining === 0 ? '#2ECC71' : '#E67E22', fontWeight: 500 }}>{s.remaining}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: totalRemaining === 0 ? '#2ECC71' : '#E67E22', marginTop: 2 }}>₪{totalRemaining.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {workers.length === 0 ? (
        <div className="empty-state">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
          <div className="empty-title">{s.noWorkers}</div>
          <div className="empty-sub">{s.noWorkersSub}</div>
        </div>
      ) : (
        <div style={{ padding: '10px 0 80px' }}>
          {workers.map(worker => {
            const paid = paidMap[worker.id] ?? 0;
            const remaining = worker.totalFee - paid;
            const pct = worker.totalFee > 0 ? Math.min(100, (paid / worker.totalFee) * 100) : 0;
            const fullyPaid = remaining <= 0;
            return (
              <div key={worker.id} onClick={() => navigate(`/workers/${worker.id}`, { state: { worker } })} style={{ margin: '0 12px 10px', background: '#fff', borderRadius: 14, padding: 14, cursor: 'pointer', border: `1px solid ${fullyPaid ? '#D1FAE5' : '#E8EDF2'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#1A2D4F', direction: dir }}>{worker.name}</div>
                    <div style={{ fontSize: 13, color: '#666', marginTop: 2, direction: dir }}>{worker.trade}</div>
                  </div>
                  {fullyPaid
                    ? <span style={{ background: '#D1FAE5', color: '#059669', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20 }}>{s.fullyPaid}</span>
                    : <span style={{ background: '#FEF3C7', color: '#D97706', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20 }}>{remaining > 0 ? `₪${remaining.toLocaleString()} ${s.remaining}` : ''}</span>
                  }
                </div>

                {/* Progress bar */}
                <div style={{ margin: '12px 0 8px', background: '#F0F4F8', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 4, background: fullyPaid ? '#2ECC71' : '#4A90E2', width: `${pct}%`, transition: 'width 0.3s' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                  <div style={{ textAlign: isRTL ? 'right' : 'left' }}>
                    <div style={{ fontSize: 11, color: '#888' }}>{s.totalFee}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1A2D4F' }}>₪{worker.totalFee.toLocaleString()}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: '#888' }}>{s.totalPaid}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#2ECC71' }}>₪{paid.toLocaleString()}</div>
                  </div>
                  <div style={{ textAlign: isRTL ? 'left' : 'right' }}>
                    <div style={{ fontSize: 11, color: '#888' }}>{s.remaining}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: fullyPaid ? '#2ECC71' : '#E67E22' }}>₪{Math.max(0, remaining).toLocaleString()}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 10, flexDirection: isRTL ? 'row-reverse' : 'row' }} onClick={e => e.stopPropagation()}>
                  <button onClick={() => navigate(`/workers/edit/${worker.id}`, { state: { worker } })} style={{ flex: 1, background: '#F0F4F8', color: '#1A2D4F', border: 'none', borderRadius: 8, padding: '8px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                  </button>
                  <button onClick={() => navigate(`/workers/${worker.id}/pay`, { state: { worker } })} style={{ flex: 2, background: '#4A90E2', color: '#fff', border: 'none', borderRadius: 8, padding: '8px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    {s.addPayment}
                  </button>
                  <button onClick={() => setConfirmId(worker.id)} style={{ background: '#FEE2E2', color: '#E74C3C', border: 'none', borderRadius: 8, padding: '8px 12px', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <button className="fab" onClick={() => navigate('/workers/add')}>
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
      </button>

      {confirmId !== null && (
        <div className="confirm-overlay" onClick={() => setConfirmId(null)}>
          <div className="confirm-box" onClick={e => e.stopPropagation()}>
            <div className="confirm-title">{s.deleteWorker}</div>
            <div className="confirm-msg">This will delete the worker and all their payment history.</div>
            <div className="confirm-btns">
              <button className="confirm-btn cancel" onClick={() => setConfirmId(null)}>{s.cancel}</button>
              <button className="confirm-btn danger" onClick={() => handleDelete(confirmId)}>{s.delete}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
