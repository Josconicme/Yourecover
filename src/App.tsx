import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { SignIn } from './pages/auth/SignIn';
import { SignUp } from './pages/auth/SignUp';
import { PatientDashboard } from './pages/dashboard/PatientDashboard';
import { CounsellorDashboard } from './pages/dashboard/CounsellorDashboard';
import { AdminDashboard } from './pages/dashboard/AdminDashboard';
import { TalkToCounsellor } from './pages/TalkToCounsellor';
import { ArticlesPage } from './pages/ArticlesPage';
import { BlogsPage } from './pages/BlogsPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { AboutPage } from './pages/AboutPage';
import { AdminSignIn } from './pages/auth/AdminSignIn';
import { CounsellorSignUp } from './pages/auth/CounsellorSignUp';
import { AdminManagement } from './pages/admin/AdminManagement';
import { MentalHealthTrackerAdmin } from './pages/admin/MentalHealthTrackerAdmin';

// Protected Route Component
const ProtectedRoute: React.FC<{ 
  children: React.ReactNode; 
  allowedRoles?: string[];
}> = ({ children, allowedRoles }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-u-recover-green mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  if (!user.email_confirmed_at) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Email Verification Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please check your email and click the verification link to access your dashboard.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-u-recover-green text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            I've verified my email
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-u-recover-green mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Setting up your profile...</p>
        </div>
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Dashboard Router Component
const DashboardRouter: React.FC = () => {
  const { profile } = useAuth();

  if (!profile) return <Navigate to="/signin" replace />;

  switch (profile.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'counsellor':
      return <CounsellorDashboard />;
    case 'user':
      return <PatientDashboard />;
    default:
      return <Navigate to="/" replace />;
  }
};

// Layout Component
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                },
              }}
            />
            
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Layout><LandingPage /></Layout>} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/admin/signin" element={<AdminSignIn />} />
              <Route path="/counsellor/signup" element={<CounsellorSignUp />} />
              
              {/* Protected Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <DashboardRouter />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/admin/*" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Layout>
                      <AdminDashboard />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/counsellor/*" 
                element={
                  <ProtectedRoute allowedRoles={['counsellor']}>
                    <Layout>
                      <CounsellorDashboard />
                    </Layout>
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/talk-to-counsellor" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <TalkToCounsellor />
                    </Layout>
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/messages" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <div className="p-8 text-center">Messages page coming soon...</div>
                    </Layout>
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/tracker" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <div className="p-8 text-center">Mental Health Tracker coming soon...</div>
                    </Layout>
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/journal" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <div className="p-8 text-center">Journal page coming soon...</div>
                    </Layout>
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/goals" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <div className="p-8 text-center">Goals & Habits page coming soon...</div>
                    </Layout>
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/appointments" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <div className="p-8 text-center">Appointments page coming soon...</div>
                    </Layout>
                  </ProtectedRoute>
                } 
              />

              {/* Counsellor Routes */}
              <Route 
                path="/counsellor/messages" 
                element={
                  <ProtectedRoute allowedRoles={['counsellor']}>
                    <Layout>
                      <div className="p-8 text-center">Counsellor Messages coming soon...</div>
                    </Layout>
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/counsellor/patients" 
                element={
                  <ProtectedRoute allowedRoles={['counsellor']}>
                    <Layout>
                      <div className="p-8 text-center">My Patients page coming soon...</div>
                    </Layout>
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/counsellor/patient-records" 
                element={
                  <ProtectedRoute allowedRoles={['counsellor']}>
                    <Layout>
                      <div className="p-8 text-center">Patient Mental Health Records coming soon...</div>
                    </Layout>
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/counsellor/notes" 
                element={
                  <ProtectedRoute allowedRoles={['counsellor']}>
                    <Layout>
                      <div className="p-8 text-center">Session Notes coming soon...</div>
                    </Layout>
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/counsellor/schedule" 
                element={
                  <ProtectedRoute allowedRoles={['counsellor']}>
                    <Layout>
                      <div className="p-8 text-center">Schedule Management coming soon...</div>
                    </Layout>
                  </ProtectedRoute>
                } 
              />

              {/* Admin Routes */}
              <Route 
                path="/admin/patients" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Layout>
                      <div className="p-8 text-center">Patient Management coming soon...</div>
                    </Layout>
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/admin/counsellors" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Layout>
                      <div className="p-8 text-center">Counsellor Management coming soon...</div>
                    </Layout>
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/admin/security" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Layout>
                      <AdminManagement />
                    </Layout>
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/admin/mental-health-tracker" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Layout>
                      <MentalHealthTrackerAdmin />
                    </Layout>
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/admin/messages" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Layout>
                      <div className="p-8 text-center">Messages & Communications coming soon...</div>
                    </Layout>
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/admin/content" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Layout>
                      <div className="p-8 text-center">Content Management coming soon...</div>
                    </Layout>
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/admin/analytics" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Layout>
                      <div className="p-8 text-center">Analytics & Reports coming soon...</div>
                    </Layout>
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/admin/settings" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Layout>
                      <div className="p-8 text-center">System Settings coming soon...</div>
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              {/* Placeholder routes for other pages */}
              <Route path="/articles" element={<Layout><ArticlesPage /></Layout>} />
              <Route path="/blogs" element={<Layout><BlogsPage /></Layout>} />
              <Route path="/resources" element={<Layout><ResourcesPage /></Layout>} />
              <Route path="/about" element={<Layout><AboutPage /></Layout>} />
              <Route path="/notifications" element={<Layout><div className="p-8 text-center">Notifications page coming soon...</div></Layout>} />
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;