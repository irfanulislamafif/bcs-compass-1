import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import PublicLayout from "./layouts/PublicLayout.jsx";
import Home from "./pages/Home.jsx";
import Subjects from "./pages/Subjects.jsx";
import SubjectDetail from "./pages/SubjectDetail.jsx";
import TopicDetail from "./pages/TopicDetail.jsx";
import Practice from "./pages/Practice.jsx";
import PracticeResult from "./pages/PracticeResult.jsx";
import ExamBuilder from "./pages/ExamBuilder.jsx";
import ExamRunner from "./pages/ExamRunner.jsx";
import ExamResult from "./pages/ExamResult.jsx";
import Progress from "./pages/Progress.jsx";
import MistakeBook from "./pages/MistakeBook.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Revision from "./pages/Revision.jsx";
import Features from "./pages/Features.jsx";
import HowItWorks from "./pages/HowItWorks.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import NotFound from "./pages/NotFound.jsx";

/* Small helper — wraps a page in ProtectedRoute */
function P({ children }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<PublicLayout />}>
          {/* Public pages */}
          <Route path="/" element={<Home />} />
          <Route path="/subjects" element={<Subjects />} />
          <Route path="/subjects/:subjectId" element={<SubjectDetail />} />
          <Route path="/topics/:subjectId/:topicId" element={<TopicDetail />} />
          <Route path="/features" element={<Features />} />
          <Route path="/how-it-works" element={<HowItWorks />} />

          {/* Protected pages — require login */}
          <Route
            path="/dashboard"
            element={
              <P>
                <Dashboard />
              </P>
            }
          />
          <Route
            path="/revision"
            element={
              <P>
                <Revision />
              </P>
            }
          />
          <Route
            path="/practice/topic/:subjectId/:topicId"
            element={
              <P>
                <Practice />
              </P>
            }
          />
          <Route
            path="/practice/subject/:subjectId"
            element={
              <P>
                <Practice />
              </P>
            }
          />
          <Route
            path="/practice"
            element={
              <P>
                <Practice />
              </P>
            }
          />
          <Route
            path="/practice/result"
            element={
              <P>
                <PracticeResult />
              </P>
            }
          />

          <Route
            path="/exam"
            element={
              <P>
                <ExamBuilder />
              </P>
            }
          />
          <Route
            path="/exam/run"
            element={
              <P>
                <ExamRunner />
              </P>
            }
          />
          <Route
            path="/exam/result"
            element={
              <P>
                <ExamResult />
              </P>
            }
          />

          <Route
            path="/progress"
            element={
              <P>
                <Progress />
              </P>
            }
          />
          <Route
            path="/mistakes"
            element={
              <P>
                <MistakeBook />
              </P>
            }
          />
        </Route>

        {/* Auth pages (no navbar/footer) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}
