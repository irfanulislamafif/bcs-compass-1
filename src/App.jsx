import { Routes, Route } from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout.jsx";
import Home from "./pages/Home.jsx";
import Subjects from "./pages/Subjects.jsx";
import SubjectDetail from "./pages/SubjectDetail.jsx";
import TopicDetail from "./pages/TopicDetail.jsx";
import Practice from "./pages/Practice.jsx";
import PracticeResult from "./pages/PracticeResult.jsx";
import Features from "./pages/Features.jsx";
import HowItWorks from "./pages/HowItWorks.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/subjects" element={<Subjects />} />
        <Route path="/subjects/:subjectId" element={<SubjectDetail />} />
        <Route path="/topics/:subjectId/:topicId" element={<TopicDetail />} />

        {/* Practice engine */}
        <Route
          path="/practice/topic/:subjectId/:topicId"
          element={<Practice />}
        />
        <Route path="/practice/subject/:subjectId" element={<Practice />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/practice/result" element={<PracticeResult />} />

        <Route path="/features" element={<Features />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
