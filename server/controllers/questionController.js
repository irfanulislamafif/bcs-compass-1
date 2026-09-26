import Question from '../models/Question.js';

/* POST /api/questions  — save one or many AI-generated questions */
export async function saveQuestions(req, res, next) {
  try {
    const { questions } = req.body || {};
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'No questions provided.' });
    }
    if (questions.length > 50) {
      return res
        .status(400)
        .json({ message: 'Cannot save more than 50 questions at once.' });
    }

    const docs = questions.map((q) => ({
      subjectId: q.subjectId || 'ai-generated',
      topicId: q.topicId || 'ai-generated',
      question: String(q.question || '').trim(),
      options: (q.options || []).map((o) => String(o).trim()),
      answer: Number(q.answer),
      explanation: String(q.explanation || '').trim(),
      difficulty: q.difficulty || 'medium',
      type: 'mcq',
      sourceType: 'ai',
      language: q.language || 'en',
      source: q.source || 'AI generated',
      tags: Array.isArray(q.tags) ? q.tags : [],
      status: 'pending',
      userId: req.user._id,
      generationId: q.generationId || null,
    }));

    /* Validate before inserting */
    for (const d of docs) {
      if (!d.question || d.options.length !== 4) {
        return res
          .status(400)
          .json({ message: 'Every question needs text and exactly 4 options.' });
      }
      if (![0, 1, 2, 3].includes(d.answer)) {
        return res
          .status(400)
          .json({ message: 'Answer must be an index between 0 and 3.' });
      }
    }

    const created = await Question.insertMany(docs);

    res.status(201).json({
      ok: true,
      saved: created.length,
      questions: created.map((q) => q.toObject()),
    });
  } catch (err) {
    next(err);
  }
}

/* GET /api/questions  — filter questions */
export async function listQuestions(req, res, next) {
  try {
    const {
      subjectId,
      topicId,
      difficulty,
      status,
      sourceType,
      language,
      limit = 50,
      skip = 0,
    } = req.query;

    /* Users see their own questions + approved public ones.
       Admins can see anything. */
    const baseFilter = req.user?.role === 'admin'
      ? {}
      : { $or: [{ userId: req.user._id }, { status: 'approved' }] };

    const filter = { ...baseFilter };
    if (subjectId) filter.subjectId = subjectId;
    if (topicId) filter.topicId = topicId;
    if (difficulty) filter.difficulty = difficulty;
    if (status) filter.status = status;
    if (sourceType) filter.sourceType = sourceType;
    if (language) filter.language = language;

    const [items, total] = await Promise.all([
      Question.find(filter)
        .sort({ createdAt: -1 })
        .skip(Number(skip))
        .limit(Math.min(200, Number(limit))),
      Question.countDocuments(filter),
    ]);

    res.json({ ok: true, total, items });
  } catch (err) {
    next(err);
  }
}

/* GET /api/questions/:id */
export async function getQuestion(req, res, next) {
  try {
    const q = await Question.findById(req.params.id);
    if (!q) return res.status(404).json({ message: 'Question not found.' });

    const owns = String(q.userId) === String(req.user._id);
    if (!owns && q.status !== 'approved' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not allowed.' });
    }

    res.json({ ok: true, question: q });
  } catch (err) {
    next(err);
  }
}

/* DELETE /api/questions/:id */
export async function deleteQuestion(req, res, next) {
  try {
    const q = await Question.findById(req.params.id);
    if (!q) return res.status(404).json({ message: 'Question not found.' });

    const owns = String(q.userId) === String(req.user._id);
    if (!owns && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not allowed.' });
    }

    await q.deleteOne();
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}