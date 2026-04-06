import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { ProjectListPage } from './pages/ProjectListPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<ProjectListPage />} />
          <Route path="/projects/:projectId/phase/:phaseId" element={<ProjectDetailPage />} />
          <Route path="/projects/:projectId" element={<Navigate to="phase/1" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
