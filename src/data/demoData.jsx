// Demo data — used by the frontend until the backend is available.
// This will be replaced by API calls to /api/subjects and /api/topics.

export const demoSubjects = [
  {
    id: 'bangla',
    name: 'Bangla',
    description: 'বাংলা ব্যাকরণ, সাহিত্য ও ভাষা ব্যবহার।',
    questionsAttempted: 240,
    accuracy: 72,
    progress: 45,
    topics: [
      { id: 'bangla-grammar',    name: 'Bangla Grammar',        progress: 55, priority: 'high',   questions: 120, accuracy: 74 },
      { id: 'bangla-literature', name: 'Bangla Literature',      progress: 42, priority: 'high',   questions: 80,  accuracy: 68 },
      { id: 'bangla-usage',      name: 'Language Usage',         progress: 38, priority: 'medium', questions: 40,  accuracy: 72 },
    ],
  },
  {
    id: 'english',
    name: 'English',
    description: 'Grammar, vocabulary, composition and reading comprehension.',
    questionsAttempted: 310,
    accuracy: 64,
    progress: 52,
    topics: [
      { id: 'english-grammar',      name: 'Grammar',                  progress: 60, priority: 'high',   questions: 130, accuracy: 66 },
      { id: 'english-vocabulary',   name: 'Vocabulary',               progress: 34, priority: 'high',   questions: 90,  accuracy: 55 },
      { id: 'english-comprehension',name: 'Reading Comprehension',    progress: 62, priority: 'medium', questions: 60,  accuracy: 70 },
      { id: 'english-composition',  name: 'Composition',              progress: 45, priority: 'medium', questions: 30,  accuracy: 65 },
    ],
  },
  {
    id: 'math',
    name: 'Mathematical Reasoning',
    description: 'Arithmetic, algebra, geometry, and problem solving.',
    questionsAttempted: 180,
    accuracy: 41,
    progress: 30,
    topics: [
      { id: 'math-arithmetic', name: 'Arithmetic',              progress: 45, priority: 'high',   questions: 70, accuracy: 48 },
      { id: 'math-percentage', name: 'Percentage',              progress: 22, priority: 'high',   questions: 40, accuracy: 38 },
      { id: 'math-algebra',    name: 'Algebra',                 progress: 30, priority: 'high',   questions: 40, accuracy: 40 },
      { id: 'math-geometry',   name: 'Geometry',                progress: 28, priority: 'medium', questions: 30, accuracy: 42 },
    ],
  },
  {
    id: 'bd-affairs',
    name: 'Bangladesh Affairs',
    description: 'History, geography, constitution, economy, and current affairs.',
    questionsAttempted: 420,
    accuracy: 68,
    progress: 60,
    topics: [
      { id: 'bd-history',      name: 'History of Bangladesh',     progress: 70, priority: 'high',   questions: 120, accuracy: 72 },
      { id: 'bd-constitution', name: 'Constitution',              progress: 48, priority: 'high',   questions: 90,  accuracy: 58 },
      { id: 'bd-economy',      name: 'Economy',                   progress: 55, priority: 'medium', questions: 60,  accuracy: 66 },
      { id: 'bd-geography',    name: 'Geography of Bangladesh',   progress: 65, priority: 'medium', questions: 80,  accuracy: 70 },
      { id: 'bd-current',      name: 'Current Affairs',           progress: 40, priority: 'high',   questions: 70,  accuracy: 62 },
    ],
  },
  {
    id: 'intl-affairs',
    name: 'International Affairs',
    description: 'Global politics, organizations, treaties, and world history.',
    questionsAttempted: 150,
    accuracy: 58,
    progress: 38,
    topics: [
      { id: 'intl-orgs',       name: 'International Organizations', progress: 45, priority: 'high',   questions: 50, accuracy: 62 },
      { id: 'intl-world-hist', name: 'World History',               progress: 35, priority: 'medium', questions: 50, accuracy: 55 },
      { id: 'intl-treaties',   name: 'Treaties & Agreements',       progress: 30, priority: 'medium', questions: 30, accuracy: 55 },
    ],
  },
  {
    id: 'science',
    name: 'General Science',
    description: 'Physics, chemistry, biology, and applied science.',
    questionsAttempted: 130,
    accuracy: 61,
    progress: 42,
    topics: [
      { id: 'sci-physics',   name: 'Physics',   progress: 45, priority: 'high',   questions: 50, accuracy: 60 },
      { id: 'sci-chemistry', name: 'Chemistry', progress: 42, priority: 'medium', questions: 40, accuracy: 62 },
      { id: 'sci-biology',   name: 'Biology',   progress: 40, priority: 'medium', questions: 40, accuracy: 62 },
    ],
  },
  {
    id: 'ict',
    name: 'Computer & ICT',
    description: 'Computer fundamentals, networking, and ICT applications.',
    questionsAttempted: 95,
    accuracy: 70,
    progress: 48,
    topics: [
      { id: 'ict-fundamentals', name: 'Computer Fundamentals', progress: 55, priority: 'high',   questions: 40, accuracy: 72 },
      { id: 'ict-networking',   name: 'Networking',            progress: 40, priority: 'medium', questions: 30, accuracy: 70 },
      { id: 'ict-applications', name: 'ICT Applications',      progress: 48, priority: 'medium', questions: 25, accuracy: 68 },
    ],
  },
  {
    id: 'geography',
    name: 'Geography',
    description: 'Bangladesh and world geography, environment, and disasters.',
    questionsAttempted: 110,
    accuracy: 66,
    progress: 44,
    topics: [
      { id: 'geo-bd',       name: 'Geography of Bangladesh', progress: 52, priority: 'high',   questions: 50, accuracy: 68 },
      { id: 'geo-world',    name: 'World Geography',         progress: 40, priority: 'medium', questions: 35, accuracy: 64 },
      { id: 'geo-disaster', name: 'Environment & Disaster',  progress: 38, priority: 'medium', questions: 25, accuracy: 64 },
    ],
  },
  {
    id: 'mental-ability',
    name: 'Mental Ability',
    description: 'Logic, sequences, analogies, and reasoning puzzles.',
    questionsAttempted: 140,
    accuracy: 55,
    progress: 35,
    topics: [
      { id: 'mental-logic',    name: 'Logical Reasoning', progress: 40, priority: 'high',   questions: 50, accuracy: 58 },
      { id: 'mental-sequence', name: 'Sequences',         progress: 30, priority: 'medium', questions: 45, accuracy: 52 },
      { id: 'mental-analogy',  name: 'Analogies',         progress: 35, priority: 'medium', questions: 45, accuracy: 55 },
    ],
  },
  {
    id: 'ethics',
    name: 'Ethics & Good Governance',
    description: 'Ethics, values, governance, and public administration.',
    questionsAttempted: 60,
    accuracy: 62,
    progress: 28,
    topics: [
      { id: 'ethics-values',     name: 'Values & Ethics',      progress: 35, priority: 'high',   questions: 25, accuracy: 64 },
      { id: 'ethics-governance', name: 'Good Governance',      progress: 25, priority: 'high',   questions: 20, accuracy: 60 },
      { id: 'ethics-admin',      name: 'Public Administration',progress: 22, priority: 'medium', questions: 15, accuracy: 60 },
    ],
  },
];

/* ---------- Helper functions ---------- */

export function getSubjectById(id) {
  return demoSubjects.find((s) => s.id === id) || null;
}

export function getTopicById(subjectId, topicId) {
  const subject = getSubjectById(subjectId);
  if (!subject) return null;
  const topic = subject.topics.find((t) => t.id === topicId);
  if (!topic) return null;
  return { subject, topic };
}