import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllExpenses, deleteExpense } from '../db/storage';
import { Expense, getCategoryColor } from '../types';
import { formatDate } from '../utils/date';
import { useLanguage } from '../contexts/LanguageContext';

type Section = { title: string; data: Expense[]; total: number };

function groupBy(expenses: Expense[], key: 'category' | 'payee', unknown: string): Section[] {
  const map: Record<string, Expense[]> = {};
  for (const e of expenses) {
    const k = (e[key] || unknown).trim() || unknown;
    if (!map[k]) map[k] = [];
    map[k].push(e);
  }
  return Object.entries(map)
    .map(([title, data]) => ({ title, data, total: data.reduce((s, e) => s + e.amount, 0) }))
    .sort((a, b) => b.total - a.total);
}

export default function ExpensesScreen() {
  const navigate = useNavigate();
  const { s, isRTL } = useLanguage();
  const [sections, setSections] = useState<Section[]>([]);
  const [grandTotal, setGrandTotal] = useState(0);
  const [mode, setMode] = useState<'category' | 'name'>('category');
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const load = async (m: 'category' | 'name' = mode) => {
    const expenses = await getAllExpenses();
    setSections(groupBy(expenses, m === 'category' ? 'category' : 'payee', s.unknown));
    setGrandTotal(expenses.reduce((sum, e) => sum + e.amount, 0));
  };

  useEffect(() => { load(); }, [mode]);

  const switchMode = (m: 'category' | 'name') => { setMode(m); load(m); };

  const handleDelete = async (id: number) => {
    await deleteExpense(id);
    setConfirmId(null);
    load();
  };

  const dir = isRTL ? 'rtl' : 'ltr';

  return (
    <div>
      <div className="total-bar">
        <span className="total-bar-label">{s.totalExpenses}</span>
        <span className="total-bar-amount">₪{grandTotal.toLocaleString()}</span>
      </div>

      <div className="toggle-row">
        <button className={`toggle-btn${mode === 'category' ? ' active' : ''}`} onClick={() => switchMode('category')}>{s.groupByCategory}</button>
        <button className={`toggle-btn${mode === 'name' ? ' active' : ''}`} onClick={() => switchMode('name')}>{s.groupByName}</button>
      </div>

      {sections.length === 0 ? (
        <div className="empty-state">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          <div className="empty-title">{s.noExpenses}</div>
          <div className="empty-sub">{s.noExpensesSub}</div>
        </div>
      ) : (
        sections.map(section => {
          const color = mode === 'category' ? getCategoryColor(section.title) : '#4A90E2';
          const label = mode === 'category'
            ? ((s as any)[section.title] ?? section.title)
            : section.title;
          return (
            <div key={section.title}>
              <div className="section-header-bar" style={{ borderLeft: isRTL ? 'none' : `4px solid ${color}`, borderRight: isRTL ? `4px solid ${color}` : 'none', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                <div className="section-dot" style={{ background: color }} />
                <span className="section-title-text" style={{ direction: dir }}>{label}</span>
                <span className="section-total-text">₪{section.total.toLocaleString()}</span>
              </div>
              {section.data.map(item => (
                <div key={item.id} className="list-item" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: '#1A2D4F', direction: dir }}>{item.description}</span>
                    {item.payee && <span style={{ fontSize: 12, color: '#555', direction: dir }}>{item.payee}</span>}
                    {item.note && <span style={{ fontSize: 12, color: '#888', fontStyle: 'italic', direction: dir }}>{item.note}</span>}
                    <span style={{ fontSize: 11, color: '#AAA', marginTop: 2 }}>{formatDate(item.date)}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: isRTL ? 'flex-start' : 'flex-end', gap: 8, marginLeft: isRTL ? 0 : 8, marginRight: isRTL ? 8 : 0 }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: '#1A2D4F' }}>₪{item.amount.toLocaleString()}</span>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button onClick={() => navigate(`/expenses/edit/${item.id}`, { state: { expense: item } })} style={{ color: '#4A90E2', background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      </button>
                      <button onClick={() => setConfirmId(item.id)} style={{ color: '#E74C3C', background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        })
      )}

      <button className="fab" onClick={() => navigate('/expenses/add')}>
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
      </button>

      {confirmId !== null && (
        <div className="confirm-overlay" onClick={() => setConfirmId(null)}>
          <div className="confirm-box" onClick={e => e.stopPropagation()}>
            <div className="confirm-title">{s.delete}?</div>
            <div className="confirm-msg">This will permanently delete the expense.</div>
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
