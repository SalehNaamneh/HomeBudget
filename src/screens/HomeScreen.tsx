import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTotalExpenses, getTotalChecks, getAllChecks } from '../db/storage';
import { exportExpenses, exportChecks, exportWorkers } from '../utils/export';
import { formatDate, daysUntil } from '../utils/date';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Check } from '../types';

export default function HomeScreen() {
  const navigate = useNavigate();
  const { s, isRTL, toggleLanguage } = useLanguage();
  const { user, logout } = useAuth();
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalChecks, setTotalChecks] = useState(0);
  const [upcomingChecks, setUpcomingChecks] = useState<Check[]>([]);
  const [showExport, setShowExport] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  useEffect(() => {
    setTotalExpenses(getTotalExpenses());
    setTotalChecks(getTotalChecks());
    setUpcomingChecks(getAllChecks().filter(c => daysUntil(c.withdrawal_date) >= 0).slice(0, 3));
  }, []);

  const dir = isRTL ? 'rtl' : 'ltr';

  return (
    <div>
      {/* Header */}
      <div style={{ background: '#1A2D4F', padding: '16px 16px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', direction: dir }}>{s.appTitle}</div>
            {user && <div style={{ fontSize: 12, color: '#A0B4C8', marginTop: 1 }}>{user.name}</div>}
          </div>
          {/* Export button */}
          <button onClick={() => setShowExport(true)} title="Export data" style={{ background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: 10, padding: '7px 10px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </button>
          {/* Lang toggle */}
          <button onClick={toggleLanguage} style={{ background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: 10, padding: '7px 10px', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            {s.langCode}
          </button>
          {/* Logout */}
          <button onClick={() => setShowLogout(true)} title="Logout" style={{ background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: 10, padding: '7px 10px', color: '#A0B4C8', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="card-row">
        <div className="stat-card" style={{ background: '#4A90E2' }}>
          <span className="stat-card-label">{s.totalExpenses}</span>
          <span className="stat-card-amount">₪{totalExpenses.toLocaleString()}</span>
        </div>
        <div className="stat-card" style={{ background: '#E67E22' }}>
          <span className="stat-card-label">{s.pendingChecks}</span>
          <span className="stat-card-amount">₪{totalChecks.toLocaleString()}</span>
        </div>
      </div>

      <div style={{ margin: '0 16px 16px', background: '#1A2D4F', borderRadius: 14, padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', direction: dir }}>
        <span style={{ fontSize: 14, color: '#A0B4C8', fontWeight: 500 }}>{s.totalCommitted}</span>
        <span style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>₪{(totalExpenses + totalChecks).toLocaleString()}</span>
      </div>

      {/* Upcoming checks */}
      <div className="section-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, direction: dir }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#1A2D4F' }}>{s.upcomingChecks}</span>
          <button onClick={() => navigate('/checks')} style={{ fontSize: 13, color: '#4A90E2', background: 'none', border: 'none', cursor: 'pointer' }}>{s.seeAll}</button>
        </div>
        {upcomingChecks.length === 0
          ? <p style={{ color: '#999', fontSize: 14 }}>{s.noUpcomingChecks}</p>
          : upcomingChecks.map(check => {
              const days = daysUntil(check.withdrawal_date);
              const urgent = days <= 3;
              return (
                <div key={check.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid #F0F4F8', background: urgent ? '#FFF5F5' : 'transparent', borderRadius: urgent ? 8 : 0, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1A2D4F', direction: dir }}>{check.payee}</div>
                    <div style={{ fontSize: 12, color: '#888' }}>{formatDate(check.withdrawal_date)}</div>
                  </div>
                  <div style={{ textAlign: isRTL ? 'left' : 'right' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1A2D4F' }}>₪{check.amount.toLocaleString()}</div>
                    <div style={{ fontSize: 12, color: urgent ? '#E74C3C' : '#4A90E2', fontWeight: 500 }}>
                      {days === 0 ? s.today : `${days}d`}
                    </div>
                  </div>
                </div>
              );
            })}
      </div>

      {/* Quick Add */}
      <div style={{ margin: '0 16px 16px' }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#1A2D4F', marginBottom: 10, direction: dir }}>{s.quickAdd}</div>
        <div style={{ display: 'flex', gap: 10, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
          <button onClick={() => navigate('/expenses/add')} style={{ flex: 1, background: '#4A90E2', borderRadius: 12, padding: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
            {s.btnExpense}
          </button>
          <button onClick={() => navigate('/checks/add')} style={{ flex: 1, background: '#E67E22', borderRadius: 12, padding: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
            {s.btnCheck}
          </button>
          <button onClick={() => navigate('/workers/add')} style={{ flex: 1, background: '#9B59B6', borderRadius: 12, padding: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
            {s.btnWorker}
          </button>
        </div>
      </div>

      {/* Export modal */}
      {showExport && (
        <div className="confirm-overlay" onClick={() => setShowExport(false)}>
          <div className="confirm-box" onClick={e => e.stopPropagation()}>
            <div className="confirm-title" style={{ marginBottom: 6 }}>Export Data as CSV</div>
            <div style={{ fontSize: 13, color: '#666', marginBottom: 18 }}>Download your data as spreadsheet files you can open in Excel or Google Sheets.</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button onClick={() => { exportExpenses(); setShowExport(false); }} style={{ background: '#4A90E2', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download Expenses
              </button>
              <button onClick={() => { exportChecks(); setShowExport(false); }} style={{ background: '#E67E22', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download Checks
              </button>
              <button onClick={() => { exportWorkers(); setShowExport(false); }} style={{ background: '#9B59B6', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download Workers & Payments
              </button>
            </div>
            <button onClick={() => setShowExport(false)} style={{ marginTop: 14, width: '100%', background: '#F0F4F8', color: '#1A2D4F', border: 'none', borderRadius: 10, padding: '11px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Logout confirm */}
      {showLogout && (
        <div className="confirm-overlay" onClick={() => setShowLogout(false)}>
          <div className="confirm-box" onClick={e => e.stopPropagation()}>
            <div className="confirm-title">Sign Out?</div>
            <div className="confirm-msg">You'll need to sign in again to access your data.</div>
            <div className="confirm-btns">
              <button className="confirm-btn cancel" onClick={() => setShowLogout(false)}>Cancel</button>
              <button className="confirm-btn danger" onClick={() => { logout(); navigate('/login', { replace: true }); }}>Sign Out</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
