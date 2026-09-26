import Exam from '../models/Exam.js';
import Question from '../models/Question.js';

const DIFFICULTIES = ['any', 'easy', 'medium', 'hard'];

/* POST /api/exams/build
 * body: { title?, subjectId?, topicIds?, difficulty?, count?, durationMin?, source? }
 * Picks random questions from the user's saved AI questions.
 */
export async function buildExam(req, res, next) {
  try {
    const {
      title,
      subjectId,
      topicIds,
      difficulty = 'any',
      count = 20,
      durationMin = 20,
      source = 'ai',
    } = req.body || {};

    const n = Math.min(100, Math.max(1, Number(count) || 20));
    const duration = Math.min(180, Math.max(1, Number(durationMin) || 20));

    if (!DIFFICULTIES.includes(difficulty)) {
      return res.status(400).json({ message: 'Invalid difficulty.' });
    }

    /* Pick from the user's own questions, plus approved public ones */
    const pool = await Question.find({
      $or: [{ userId: req.user._id }, { status: 'approved' }],
      ...(source === 'ai' ? { sourceType: 'ai' } : {}),
      ...(subjectId ? { subjectId } : {}),
      ...(topicIds?.length ? { topicId: { $in: topicIds } } : {}),
      ...(difficulty !== 'any' ? { difficulty } : {}),
    });

    if (pool.length === 0) {
      return res
        .status(400)
        .json({ message: 'No questions match those filters.' });
    }

    /* Shuffle and slice */
    const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, n);

    const exam = await Exam.create({
      userId: req.user._id,
      title: title || `${subjectId ? subjectId : 'Mixed'} AI Exam`,
      subjectId: subjectId || '',
      topicIds: topicIds || [],
      difficulty,
      durationSec: duration * 60,
      totalQuestions: shuffled.length,
      source,
      questions: shuffled.map((q, i) => ({
        questionId: q._id,
        order: i,
      })),
    });

    /* Return the hydrated exam so the frontend can run it immediately */
    const hydrated = await Exam.findById(exam._id).populate({
      path: 'questions.questionId',
      model: 'Question',
    });

    res.status(201).json({ ok: true, exam: hydrated });
  } catch (err) {
    next(err);
  }
}

/* GET /api/exams/:id */
export async function getExam(req, res, next) {
  try {
    const exam = await Exam.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate({ path: 'questions.questionId', model: 'Question' });

    if (!exam) return res.status(404).json({ message: 'Exam not found.' });
    res.json({ ok: true, exam });
  } catch (err) {
    next(err);
  }
}

/* GET /api/exams — history */
export async function listExams(req, res, next) {
  try {
    const items = await Exam.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .select('title subjectId durationSec totalQuestions source createdAt');
    res.json({ ok: true, items });
  } catch (err) {
    next(err);
  }
}