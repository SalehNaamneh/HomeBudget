import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllChecks, deleteCheck, addExpense, getTotalChecks } from '../db/storage';
import { Check } from '../types';
import { formatDate, daysUntil } from '../utils/date';
import { useLanguage } from '../contexts/LanguageContext';

export default function ChecksScreen() {
  const navigate = useNavigate();
  const { s, isRTL } = useLanguage();
  const [checks, setChecks] = useState<Check[]>([]);
  const [total, setTotal] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [passedChecks, setPassedChecks] = useState<Check[]>([]);
  const [showPassedModal, setShowPassedModal] = useState(false);

  const load = async () => {
    const [all, tot] = await Promise.all([getAllChecks(), getTotalChecks()]);
    setChecks(all);
    setTotal(tot);
    const passed = all.filter(c => daysUntil(c.withdrawal_date) < 0);
    if (passed.length > 0) {
      setPassedChecks(passed);
      setShowPassedModal(true);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: number) => {
    await deleteCheck(id);
    setConfirmDelete(null);
    load();
  };

  const moveToExpenses = async (check: Check) => {
    await addExpense(check.amount, `Check - ${check.payee}`, 'Other', check.withdrawal_date, check.payee, check.note || check.check_number || '');
    await deleteCheck(check.id);
    load();
  };

  const moveAll = async () => {
    await Promise.all(passedChecks.map(c => moveToExpenses(c)));
    setShowPassedModal(false);
    load();
  };

  const dir = isRTL ? 'rtl' : 'ltr';

  return (
    <div>
      <div className="total-bar">
        <span className="total-bar-label">{s.pendingChecksTotal}</span>
        <span className="total-bar-amount">₪{total.toLocaleString()}</span>
      </div>

      {checks.length === 0 ? (
        <div className="empty-state">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
          <div className="empty-title">{s.noChecks}</div>
          <div className="empty-sub">{s.noChecksSub}</div>
        </div>
      ) : (
        <div style={{ padding: '10px 0 80px' }}>
          {checks.map(check => {
            const days = daysUntil(check.withdrawal_date);
            const passed = days < 0;
            const urgent = days >= 0 && days <= 3;
            return (
              <div key={check.id} style={{ margin: '0 12px 8px', background: passed ? '#FFF0F0' : urgent ? '#FFF8F0' : '#fff', borderRadius: 12, padding: 12, border: `1px solid ${passed ? '#FFCCCC' : urgent ? '#FFD9AA' : '#E8EDF2'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#1A2D4F', direction: dir }}>{check.payee}</div>
                    {check.check_number && <div style={{ fontSize: 12, color: '#888' }}>#{check.check_number}</div>}
                    {check.note && <div style={{ fontSize: 12, color: '#666', fontStyle: 'italic', direction: dir }}>{check.note}</div>}
                    <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>{formatDate(check.withdrawal_date)}</div>
                  </div>
                  <div style={{ textAlign: isRTL ? 'left' : 'right' }}>
                    <div style={{ fontSize: 17, fontWeight: 700, color: '#1A2D4F' }}>₪{check.amount.toLocaleString()}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: passed ? '#E74C3C' : urgent ? '#E67E22' : '#4A90E2', marginTop: 2 }}>
                      {passed ? s.passed : days === 0 ? s.today : `${days}d`}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 10, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                  {passed && (
                    <button onClick={() => moveToExpenses(check)} style={{ flex: 1, background: '#4A90E2', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 10px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                      {s.addToExpenses}
                    </button>
                  )}
                  <button onClick={() => navigate(`/checks/edit/${check.id}`, { state: { check } })} style={{ flex: passed ? 0 : 1, background: '#F0F4F8', color: '#1A2D4F', border: 'none', borderRadius: 8, padding: '8px 12px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle' }}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                  </button>
                  <button onClick={() => setConfirmDelete(check.id)} style={{ background: '#FEE2E2', color: '#E74C3C', border: 'none', borderRadius: 8, padding: '8px 12px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle' }}><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <button className="fab" onClick={() => navigate('/checks/add')}>
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
      </button>

      {confirmDelete !== null && (
        <div className="confirm-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="confirm-box" onClick={e => e.stopPropagation()}>
            <div className="confirm-title">{s.deleteCheckTitle}</div>
            <div className="confirm-msg">This will permanently delete the check.</div>
            <div className="confirm-btns">
              <button className="confirm-btn cancel" onClick={() => setConfirmDelete(null)}>{s.cancel}</button>
              <button className="confirm-btn danger" onClick={() => handleDelete(confirmDelete)}>{s.delete}</button>
            </div>
          </div>
        </div>
      )}

      {showPassedModal && passedChecks.length > 0 && (
        <div className="confirm-overlay">
          <div className="confirm-box">
            <div className="confirm-title">{s.passedChecksTitle}</div>
            <div className="confirm-msg">{s.passedChecksMsg(passedChecks.length)}</div>
            <div className="confirm-btns" style={{ flexWrap: 'wrap', gap: 8 }}>
              <button className="confirm-btn cancel" style={{ flex: '1 1 80px' }} onClick={() => setShowPassedModal(false)}>{s.cancel}</button>
              <button className="confirm-btn primary" style={{ flex: '1 1 80px' }} onClick={moveAll}>{s.moveAll}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
