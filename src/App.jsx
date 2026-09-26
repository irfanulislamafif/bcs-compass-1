import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminRoute from './components/AdminRoute.jsx';

import PublicLayout from './layouts/PublicLayout.jsx';
import Home from './pages/Home.jsx';
import Subjects from './pages/Subjects.jsx';
import SubjectDetail from './pages/SubjectDetail.jsx';
import TopicDetail from './pages/TopicDetail.jsx';
import Practice from './pages/Practice.jsx';
import PracticeResult from './pages/PracticeResult.jsx';
import ExamBuilder from './pages/ExamBuilder.jsx';
import ExamRunner from './pages/ExamRunner.jsx';
import ExamResult from './pages/ExamResult.jsx';
import Progress from './pages/Progress.jsx';
import MistakeBook from './pages/MistakeBook.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Revision from './pages/Revision.jsx';
import AIStudyLab from './pages/AIStudyLab.jsx';
import QuestionBank from './pages/QuestionBank.jsx';
import CreateQuestion from './pages/CreateQuestion.jsx';
import WrittenPractice from './pages/WrittenPractice.jsx';
import MyPdfs from './pages/MyPdfs.jsx';
import PdfWorkspace from './pages/PdfWorkspace.jsx';
import Features from './pages/Features.jsx';
import HowItWorks from './pages/HowItWorks.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import Settings from './pages/Settings.jsx';
import NotFound from './pages/NotFound.jsx';

import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminUsers from './pages/admin/AdminUsers.jsx';
import AdminQuestions from './pages/admin/AdminQuestions.jsx';
import AdminGenerations from './pages/admin/AdminGenerations.jsx';
import AdminMaterials from './pages/admin/AdminMaterials.jsx';

function P({ children }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}

function A({ children }) {
  return <AdminRoute>{children}</AdminRoute>;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route element={<PublicLayout />}>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/subjects" element={<Subjects />} />
            <Route path="/subjects/:subjectId" element={<SubjectDetail />} />
            <Route path="/topics/:subjectId/:topicId" element={<TopicDetail />} />
            <Route path="/features" element={<Features />} />
            <Route path="/how-it-works" element={<HowItWorks />} />

            {/* Protected */}
            <Route path="/dashboard" element={<P><Dashboard /></P>} />
            <Route path="/settings" element={<P><Settings /></P>} />
            <Route path="/revision" element={<P><Revision /></P>} />
            <Route path="/ai-lab" element={<P><AIStudyLab /></P>} />
            <Route path="/question-bank" element={<P><QuestionBank /></P>} />
            <Route
              path="/question-bank/create"
              element={<P><CreateQuestion /></P>}
            />
            <Route
              path="/written-practice"
              element={<P><WrittenPractice /></P>}
            />
            <Route path="/my-pdfs" element={<P><MyPdfs /></P>} />
            <Route path="/pdf-workspace/:id" element={<P><PdfWorkspace /></P>} />

            <Route
              path="/practice/topic/:subjectId/:topicId"
              element={<P><Practice /></P>}
            />
            <Route
              path="/practice/subject/:subjectId"
              element={<P><Practice /></P>}
            />
            <Route path="/practice" element={<P><Practice /></P>} />
            <Route path="/practice/result" element={<P><PracticeResult /></P>} />

            <Route path="/exam" element={<P><ExamBuilder /></P>} />
            <Route path="/exam/run" element={<P><ExamRunner /></P>} />
            <Route path="/exam/result" element={<P><ExamResult /></P>} />

            <Route path="/progress" element={<P><Progress /></P>} />
            <Route path="/mistakes" element={<P><MistakeBook /></P>} />
          </Route>

          {/* Auth pages (full-screen, no navbar/footer) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Admin (own layout inside each page) */}
          <Route path="/admin" element={<A><AdminDashboard /></A>} />
          <Route path="/admin/users" element={<A><AdminUsers /></A>} />
          <Route path="/admin/questions" element={<A><AdminQuestions /></A>} />
          <Route path="/admin/generations" element={<A><AdminGenerations /></A>} />
          <Route path="/admin/materials" element={<A><AdminMaterials /></A>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}