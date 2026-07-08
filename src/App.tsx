import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, NavLink, Outlet, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { notifyOnOpen, getUrgentChecks } from './utils/notifications';
import HomeScreen from './screens/HomeScreen';
import ExpensesScreen from './screens/ExpensesScreen';
import AddExpenseScreen from './screens/AddExpenseScreen';
import ChecksScreen from './screens/ChecksScreen';
import AddCheckScreen from './screens/AddCheckScreen';
import AnalyticsScreen from './screens/AnalyticsScreen';
import WorkersScreen from './screens/WorkersScreen';
import AddWorkerScreen from './screens/AddWorkerScreen';
import WorkerDetailScreen from './screens/WorkerDetailScreen';
import AddPaymentScreen from './screens/AddPaymentScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';

function HomeIcon({ active }: { active: boolean }) {
  return <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
}
function ReceiptIcon({ active }: { active: boolean }) {
  return <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>;
}
function CheckIcon({ active }: { active: boolean }) {
  return <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
}
function WorkerIcon({ active }: { active: boolean }) {
  return <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
}
function ChartIcon({ active }: { active: boolean }) {
  return <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>;
}

function BottomNav({ urgentCount }: { urgentCount: number }) {
  const { s } = useLanguage();
  return (
    <nav className="bottom-nav">
      <NavLink to="/" end className={({ isActive }) => `nav-tab${isActive ? ' active' : ''}`}>
        {({ isActive }) => <><HomeIcon active={isActive} /><span>{s.tabHome}</span></>}
      </NavLink>
      <NavLink to="/expenses" className={({ isActive }) => `nav-tab${isActive ? ' active' : ''}`}>
        {({ isActive }) => <><ReceiptIcon active={isActive} /><span>{s.tabExpenses}</span></>}
      </NavLink>
      <NavLink to="/checks" className={({ isActive }) => `nav-tab${isActive ? ' active' : ''}`}>
        {({ isActive }) => (
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <CheckIcon active={isActive} />
            {urgentCount > 0 && (
              <span style={{ position: 'absolute', top: -4, right: -6, background: '#E74C3C', color: '#fff', borderRadius: 10, fontSize: 10, fontWeight: 700, minWidth: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px' }}>
                {urgentCount}
              </span>
            )}
            <span>{s.tabChecks}</span>
          </div>
        )}
      </NavLink>
      <NavLink to="/workers" className={({ isActive }) => `nav-tab${isActive ? ' active' : ''}`}>
        {({ isActive }) => <><WorkerIcon active={isActive} /><span>{s.tabWorkers}</span></>}
      </NavLink>
      <NavLink to="/analytics" className={({ isActive }) => `nav-tab${isActive ? ' active' : ''}`}>
        {({ isActive }) => <><ChartIcon active={isActive} /><span>{s.tabAnalytics}</span></>}
      </NavLink>
    </nav>
  );
}

function TabLayout() {
  const [urgentCount, setUrgentCount] = useState(0);

  useEffect(() => {
    notifyOnOpen();
    getUrgentChecks().then(checks => setUrgentCount(checks.length));
  }, []);

  return (
    <div className="app-shell">
      <div className="screen-content">
        <Outlet />
      </div>
      <BottomNav urgentCount={urgentCount} />
    </div>
  );
}

function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ minHeight: '100vh', background: '#1A2D4F' }} />;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/register" element={<RegisterScreen />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<TabLayout />}>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/expenses" element={<ExpensesScreen />} />
          <Route path="/checks" element={<ChecksScreen />} />
          <Route path="/workers" element={<WorkersScreen />} />
          <Route path="/analytics" element={<AnalyticsScreen />} />
        </Route>
        <Route path="/expenses/add" element={<AddExpenseScreen />} />
        <Route path="/expenses/edit/:id" element={<AddExpenseScreen />} />
        <Route path="/checks/add" element={<AddCheckScreen />} />
        <Route path="/checks/edit/:id" element={<AddCheckScreen />} />
        <Route path="/workers/add" element={<AddWorkerScreen />} />
        <Route path="/workers/edit/:id" element={<AddWorkerScreen />} />
        <Route path="/workers/:id" element={<WorkerDetailScreen />} />
        <Route path="/workers/:id/pay" element={<AddPaymentScreen />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <LanguageProvider>
          <AppRoutes />
        </LanguageProvider>
      </AuthProvider>
    </HashRouter>
  );
}
