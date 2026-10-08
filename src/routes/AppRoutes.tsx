import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from '../layouts/AppLayout'
import DashboardPage from '../pages/DashboardPage'
import UploadPage from '../pages/UploadPage'
import FilesPage from '../pages/FilesPage'
import FileDetailPage from '../pages/FileDetailPage'
import FeaturesPage from '../pages/FeaturesPage'
import MeasurementsPage from '../pages/MeasurementsPage'
import GlobalMeasurementsPage from '../pages/GlobalMeasurementsPage'
import GlobalFeaturesPage from '../pages/GlobalFeaturesPage'
import ApiDocsPage from '../pages/ApiDocsPage'
import SettingsPage from '../pages/SettingsPage'

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/files" element={<FilesPage />} />
        <Route path="/files/:id" element={<FileDetailPage />} />
        <Route path="/files/:id/features" element={<FeaturesPage />} />
        <Route path="/files/:id/measurements" element={<MeasurementsPage />} />
        <Route path="/measurements" element={<GlobalMeasurementsPage />} />
        <Route path="/features" element={<GlobalFeaturesPage />} />
        <Route path="/api-docs" element={<ApiDocsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  )
}
