// src/App.js
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Onboarding from "./pages/Onboarding";
import Courses from "./pages/Courses";
import CourseDetails from "./pages/CourseDetails";
import LessonViewer from "./pages/LessonViewer";
import TestPage from "./pages/TestPage";
import Feedback from "./pages/Feedback";
import LearnerDashboard from "./Dashboard/LearnerDashboard";
import AdminDashboard from "./Dashboard/AdminDashboard";
import InstructorDashboard from "./Dashboard/InstructorDashboard";
import OfflineIndicator from "./components/OfflineIndicator";
import { SignUp, SignIn, useAuth } from "@clerk/clerk-react";
import logo from "./assets/voplogo1.webp";

// 🧠 Loading Spinner
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
    </div>
  );
}

// 🔒 Protected Route Wrapper with Onboarding Check
function ProtectedRoute({ children }) {
  const { isSignedIn, isLoaded } = useAuth();
  const location = useLocation();
  
  // Show loading while auth state is being determined
  if (!isLoaded) return <LoadingSpinner />;
  
  // Redirect to login if not signed in
  if (!isSignedIn) return <Navigate to="/login" replace />;
  
  // Check if user has completed onboarding
  const hasOnboarded = localStorage.getItem("hasOnboarded") === "true";
  
  // If user hasn't onboarded and is not already on onboarding page, redirect to onboarding
  if (!hasOnboarded && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }
  
  return (
    <>
      <OfflineIndicator />
      {children}
    </>
  );
}

// 🌟 Reusable Auth Layout (for Sign In / Sign Up)
function AuthLayout({ children, title }) {
  return (
    <div className="relative flex min-h-screen overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
        {/* Animated orbs */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-amber-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Content Container */}
      <div className="relative flex flex-col w-full">
        {/* Header */}
        <header className="flex items-center justify-center py-8 z-10">
          <div className="flex flex-col items-center space-y-3">
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
              <img 
                src={logo} 
                alt="VOP Logo" 
                className="relative h-16 w-auto transform transition-transform duration-300 group-hover:scale-110" 
              />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent tracking-tight">
              Voice Of Prophecy Virtual School
            </h1>
            <p className="text-gray-600 text-sm font-medium">{title}</p>
          </div>
        </header>

        {/* Main Auth Card */}
        <main className="flex flex-1 items-center justify-center px-4 pb-12 z-10">
          <div className="relative w-full max-w-md">
            {/* Decorative elements */}
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-orange-400/20 to-transparent rounded-full blur-2xl"></div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-tl from-amber-400/20 to-transparent rounded-full blur-2xl"></div>
            
            {/* Card */}
            <div className="relative bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8 md:p-10 border border-white/20 transform transition-all duration-300 hover:shadow-orange-200/50 hover:-translate-y-1">
              {/* Accent bar */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-1.5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"></div>
              
              {children}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center text-gray-600 text-sm pb-6 z-10">
          <p className="font-semibold">
            © {new Date().getFullYear()} Voice Of Prophecy Virtual School
          </p>
          <p className="mt-1">
            Powered by{" "}
            <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent font-semibold">
              Kellzman Tech Ltd
            </span>
          </p>
        </footer>
      </div>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🌍 Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* 🧡 Sign Up */}
        <Route
          path="/register"
          element={
            <AuthLayout title="Create your account">
              <SignUp
                signInUrl="/login"
                forceRedirectUrl="/onboarding"
                appearance={{
                  elements: {
                    card: "bg-transparent shadow-none p-0 border-0",
                    formButtonPrimary:
                      "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-xl py-3 px-6 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]",
                    formFieldInput:
                      "border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all duration-200 px-4 py-3",
                    formFieldLabel: "text-gray-700 font-medium text-sm",
                    headerTitle: "text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent",
                    headerSubtitle: "text-gray-600",
                    socialButtonsBlockButton:
                      "border-2 border-gray-200 hover:border-orange-300 hover:bg-orange-50 rounded-xl transition-all duration-200",
                    dividerLine: "bg-gray-200",
                    dividerText: "text-gray-500 font-medium",
                    footerActionLink: "text-orange-600 hover:text-orange-700 font-semibold",
                  },
                }}
              />
            </AuthLayout>
          }
        />

        {/* 🧡 Sign In */}
        <Route
          path="/login"
          element={
            <AuthLayout title="Welcome back! Sign in to continue">
              <SignIn
                signUpUrl="/register"
                forceRedirectUrl="/onboarding"
                appearance={{
                  elements: {
                    card: "bg-transparent shadow-none p-0 border-0",
                    formButtonPrimary:
                      "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-xl py-3 px-6 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]",
                    formFieldInput:
                      "border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all duration-200 px-4 py-3",
                    formFieldLabel: "text-gray-700 font-medium text-sm",
                    headerTitle: "text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent",
                    headerSubtitle: "text-gray-600",
                    socialButtonsBlockButton:
                      "border-2 border-gray-200 hover:border-orange-300 hover:bg-orange-50 rounded-xl transition-all duration-200",
                    dividerLine: "bg-gray-200",
                    dividerText: "text-gray-500 font-medium",
                    footerActionLink: "text-orange-600 hover:text-orange-700 font-semibold",
                  },
                }}
              />
            </AuthLayout>
          }
        />

        {/* 🧭 Onboarding */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          }
        />

        {/* 📘 Courses */}
        <Route
          path="/courses"
          element={
            <ProtectedRoute>
              <Courses />
            </ProtectedRoute>
          }
        />

        {/* 📗 Course Details */}
        <Route
          path="/courses/:courseId"
          element={
            <ProtectedRoute>
              <CourseDetails />
            </ProtectedRoute>
          }
        />

        {/* 📖 Lesson Viewer */}
        <Route
          path="/courses/:courseId/lessons/:lessonId"
          element={
            <ProtectedRoute>
              <LessonViewer />
            </ProtectedRoute>
          }
        />

        {/* 📝 Test Page */}
        <Route
          path="/courses/:courseId/lessons/:lessonId/test"
          element={
            <ProtectedRoute>
              <TestPage />
            </ProtectedRoute>
          }
        />

        {/* 💬 Feedback */}
        <Route
          path="/feedback"
          element={
            <ProtectedRoute>
              <Feedback />
            </ProtectedRoute>
          }
        />

        {/* 🧑‍🎓 Dashboards */}
        <Route
          path="/dashboard/learner"
          element={
            <ProtectedRoute>
              <LearnerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/instructor"
          element={
            <ProtectedRoute>
              <InstructorDashboard />
            </ProtectedRoute>
          }
        />

        {/* 🚧 Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;