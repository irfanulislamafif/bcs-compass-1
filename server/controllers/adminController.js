import User from '../models/User.js';
import Question from '../models/Question.js';
import AIGeneration from '../models/AIGeneration.js';
import StudyMaterial from '../models/StudyMaterial.js';

/* ------------------------------------------------------------------ */
/*  GET /api/admin/stats                                              */
/* ------------------------------------------------------------------ */

export async function getStats(_req, res, next) {
  try {
    const [
      totalUsers,
      totalQuestions,
      pendingQuestions,
      approvedQuestions,
      rejectedQuestions,
      aiQuestions,
      totalMaterials,
      totalGenerations,
      generationsToday,
    ] = await Promise.all([
      User.countDocuments(),
      Question.countDocuments(),
      Question.countDocuments({ status: 'pending' }),
      Question.countDocuments({ status: 'approved' }),
      Question.countDocuments({ status: 'rejected' }),
      Question.countDocuments({ sourceType: 'ai' }),
      StudyMaterial.countDocuments(),
      AIGeneration.countDocuments(),
      AIGeneration.countDocuments({
        createdAt: { $gte: startOfToday() },
      }),
    ]);

    res.json({
      ok: true,
      stats: {
        totalUsers,
        totalQuestions,
        pendingQuestions,
        approvedQuestions,
        rejectedQuestions,
        aiQuestions,
        totalMaterials,
        totalGenerations,
        generationsToday,
      },
    });
  } catch (err) {
    next(err);
  }
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/* ------------------------------------------------------------------ */
/*  GET /api/admin/users                                              */
/* ------------------------------------------------------------------ */

export async function listUsers(req, res, next) {
  try {
    const { q = '', role = '' } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ];
    }

    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .limit(100)
      .select('name email role targetExam createdAt');

    res.json({ ok: true, users });
  } catch (err) {
    next(err);
  }
}

/* PATCH /api/admin/users/:id  body: { role } */
export async function updateUserRole(req, res, next) {
  try {
    const { role } = req.body || {};
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role.' });
    }
    if (String(req.params.id) === String(req.user._id) && role !== 'admin') {
      return res
        .status(400)
        .json({ message: 'You cannot remove your own admin role.' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('name email role targetExam createdAt');

    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ ok: true, user });
  } catch (err) {
    next(err);
  }
}

/* ------------------------------------------------------------------ */
/*  GET /api/admin/questions                                          */
/* ------------------------------------------------------------------ */

export async function listQuestionsForAdmin(req, res, next) {
  try {
    const {
      status,
      sourceType,
      subjectId,
      q = '',
      limit = 50,
      skip = 0,
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (sourceType) filter.sourceType = sourceType;
    if (subjectId) filter.subjectId = subjectId;
    if (q) filter.question = { $regex: q, $options: 'i' };

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

/* PATCH /api/admin/questions/:id  body: { status } */
export async function moderateQuestion(req, res, next) {
  try {
    const { status } = req.body || {};
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }

    const q = await Question.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!q) return res.status(404).json({ message: 'Question not found.' });

    res.json({ ok: true, question: q });
  } catch (err) {
    next(err);
  }
}

/* DELETE /api/admin/questions/:id */
export async function deleteQuestionAdmin(req, res, next) {
  try {
    const q = await Question.findByIdAndDelete(req.params.id);
    if (!q) return res.status(404).json({ message: 'Question not found.' });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

/* ------------------------------------------------------------------ */
/*  GET /api/admin/generations                                        */
/* ------------------------------------------------------------------ */

export async function listGenerations(req, res, next) {
  try {
    const { kind, status, limit = 50, skip = 0 } = req.query;

    const filter = {};
    if (kind) filter.kind = kind;
    if (status) filter.status = status;

    const [items, total] = await Promise.all([
      AIGeneration.find(filter)
        .sort({ createdAt: -1 })
        .skip(Number(skip))
        .limit(Math.min(200, Number(limit)))
        .populate('userId', 'name email')
        .select(
          'kind status inputChars materialPreview createdAt errorMessage userId'
        ),
      AIGeneration.countDocuments(filter),
    ]);

    res.json({ ok: true, total, items });
  } catch (err) {
    next(err);
  }
}

/* ------------------------------------------------------------------ */
/*  GET /api/admin/materials                                          */
/* ------------------------------------------------------------------ */

export async function listMaterialsAdmin(req, res, next) {
  try {
    const { q = '', limit = 50, skip = 0 } = req.query;
    const filter = {};
    if (q) filter.title = { $regex: q, $options: 'i' };

    const [items, total] = await Promise.all([
      StudyMaterial.find(filter)
        .sort({ createdAt: -1 })
        .skip(Number(skip))
        .limit(Math.min(200, Number(limit)))
        .populate('userId', 'name email')
        .select(
          'title originalFilename sizeBytes textLength pageCount language userId createdAt'
        ),
      StudyMaterial.countDocuments(filter),
    ]);

    res.json({ ok: true, total, items });
  } catch (err) {
    next(err);
  }
}