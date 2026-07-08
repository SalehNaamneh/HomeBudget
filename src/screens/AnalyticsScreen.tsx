import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getExpenseSummaryByCategory, getTotalExpenses } from '../db/storage';
import { CATEGORY_COLORS, ExpenseCategory } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

export default function AnalyticsScreen() {
  const { s, isRTL } = useLanguage();
  const [summary, setSummary] = useState<{ category: string; total: number }[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setSummary(getExpenseSummaryByCategory());
    setTotal(getTotalExpenses());
  }, []);

  const dir = isRTL ? 'rtl' : 'ltr';

  if (summary.length === 0) {
    return (
      <div className="empty-state">
        <svg width="70" height="70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
        <div className="empty-title">{s.noData}</div>
        <div className="empty-sub">{s.noDataSub}</div>
      </div>
    );
  }

  const chartData = summary.map(item => ({
    name: (s as any)[item.category] ?? item.category,
    value: item.total,
    color: CATEGORY_COLORS[item.category as ExpenseCategory] ?? '#95A5A6',
  }));

  return (
    <div style={{ paddingBottom: 16 }}>
      {/* Header */}
      <div style={{ background: '#1A2D4F', padding: 20, textAlign: 'center' }}>
        <div style={{ color: '#A0B4C8', fontSize: 13 }}>{s.totalSpent}</div>
        <div style={{ color: '#fff', fontSize: 32, fontWeight: 800, marginTop: 4 }}>₪{total.toLocaleString()}</div>
      </div>

      {/* Pie chart */}
      <div style={{ background: '#fff', margin: 16, borderRadius: 16, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#1A2D4F', marginBottom: 8, textAlign: 'center' }}>{s.spendingByCategory}</div>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={chartData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
              {chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
            </Pie>
            <Tooltip formatter={(value: number) => `₪${value.toLocaleString()}`} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Breakdown */}
      <div style={{ background: '#fff', margin: '0 16px', borderRadius: 16, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#1A2D4F', marginBottom: 8, direction: dir }}>{s.breakdown}</div>
        {summary.map(item => {
          const color = CATEGORY_COLORS[item.category as ExpenseCategory] ?? '#95A5A6';
          const pct = total > 0 ? ((item.total / total) * 100).toFixed(1) : '0';
          const label = (s as any)[item.category] ?? item.category;
          return (
            <div key={item.category} style={{ display: 'flex', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #F0F4F8', gap: 10, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
              <div style={{ width: 4, height: 36, borderRadius: 2, background: color, flexShrink: 0 }} />
              <div style={{ flex: 1, fontSize: 14, fontWeight: 600, color: '#1A2D4F', direction: dir }}>{label}</div>
              <div style={{ textAlign: isRTL ? 'left' : 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#4A90E2' }}>{pct}%</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1A2D4F' }}>₪{item.total.toLocaleString()}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
