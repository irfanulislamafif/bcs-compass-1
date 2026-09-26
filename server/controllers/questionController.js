import Question from "../models/Question.js";

/* ------------------------------------------------------------------ */
/*  POST /api/questions  — save AI-generated questions                */
/* ------------------------------------------------------------------ */

export async function saveQuestions(req, res, next) {
  try {
    const { questions } = req.body || {};
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: "No questions provided." });
    }
    if (questions.length > 50) {
      return res
        .status(400)
        .json({ message: "Cannot save more than 50 questions at once." });
    }

    const docs = questions.map((q) => ({
      subjectId: q.subjectId || "ai-generated",
      topicId: q.topicId || "ai-generated",
      section: String(q.section || "").slice(0, 120),
      question: String(q.question || "").trim(),
      options: (q.options || []).map((o) => String(o).trim()),
      answer: Number(q.answer),
      explanation: String(q.explanation || "").trim(),
      difficulty: q.difficulty || "medium",
      type: "mcq",
      sourceType: "ai",
      language: q.language || "en",
      source: q.source || "AI generated",
      tags: Array.isArray(q.tags) ? q.tags : [],
      status: "pending",
      userId: req.user._id,
      generationId: q.generationId || null,
    }));

    for (const d of docs) {
      if (!d.question || d.options.length !== 4) {
        return res
          .status(400)
          .json({
            message: "Every question needs text and exactly 4 options.",
          });
      }
      if (![0, 1, 2, 3].includes(d.answer)) {
        return res
          .status(400)
          .json({ message: "Answer must be an index between 0 and 3." });
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

/* ------------------------------------------------------------------ */
/*  POST /api/questions/manual  — save one manually created question  */
/* ------------------------------------------------------------------ */

export async function saveManualQuestion(req, res, next) {
  try {
    const {
      subjectId,
      topicId,
      section,
      question,
      options,
      answer,
      explanation,
      difficulty,
      language,
      marks,
      timeLimitSec,
      isPublic,
      tags,
    } = req.body || {};

    /* Validate */
    if (!subjectId || typeof subjectId !== "string") {
      return res.status(400).json({ message: "Subject is required." });
    }
    if (!topicId || typeof topicId !== "string") {
      return res.status(400).json({ message: "Topic is required." });
    }
    if (!question || question.trim().length < 5) {
      return res
        .status(400)
        .json({ message: "Question must be at least 5 characters." });
    }
    if (question.length > 1000) {
      return res
        .status(400)
        .json({ message: "Question is too long (max 1000 characters)." });
    }
    if (!Array.isArray(options) || options.length !== 4) {
      return res
        .status(400)
        .json({ message: "Exactly 4 options are required." });
    }
    for (let i = 0; i < 4; i++) {
      const o = options[i];
      if (!o || String(o).trim().length === 0) {
        return res
          .status(400)
          .json({ message: `Option ${"ABCD"[i]} cannot be empty.` });
      }
      if (String(o).length > 500) {
        return res
          .status(400)
          .json({ message: "Each option must be under 500 characters." });
      }
    }
    if (![0, 1, 2, 3].includes(Number(answer))) {
      return res
        .status(400)
        .json({ message: "Please select the correct answer." });
    }
    if (explanation && explanation.length > 2000) {
      return res
        .status(400)
        .json({ message: "Explanation is too long (max 2000 characters)." });
    }

    const doc = await Question.create({
      subjectId: String(subjectId)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .slice(0, 80),
      topicId: String(topicId)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .slice(0, 80),
      section: String(section || "")
        .trim()
        .slice(0, 120),
      question: question.trim(),
      options: options.map((o) => String(o).trim()),
      answer: Number(answer),
      explanation: String(explanation || "").trim(),
      difficulty: ["easy", "medium", "hard"].includes(difficulty)
        ? difficulty
        : "medium",
      type: "mcq",
      sourceType: "user",
      language: language === "bn" ? "bn" : "en",
      source: "User created",
      marks: Math.min(100, Math.max(0, Number(marks) || 1)),
      timeLimitSec: Math.min(3600, Math.max(5, Number(timeLimitSec) || 60)),
      isPublic: !!isPublic,
      tags: Array.isArray(tags) ? tags.slice(0, 10) : [],
      /* Private questions auto-approve. Public ones wait for admin. */
      status: isPublic ? "pending" : "approved",
      userId: req.user._id,
    });

    res.status(201).json({ ok: true, question: doc.toObject() });
  } catch (err) {
    next(err);
  }
}

/* ------------------------------------------------------------------ */
/*  GET /api/questions  — filter questions                            */
/* ------------------------------------------------------------------ */

export async function listQuestions(req, res, next) {
  try {
    const {
      subjectId,
      topicId,
      section,
      difficulty,
      status,
      sourceType,
      language,
      isPublic,
      limit = 50,
      skip = 0,
    } = req.query;

    /* Users see their own + all approved public ones.
       Admins see everything. */
    const baseFilter =
      req.user?.role === "admin"
        ? {}
        : { $or: [{ userId: req.user._id }, { status: "approved" }] };

    const filter = { ...baseFilter };
    if (subjectId) filter.subjectId = subjectId;
    if (topicId) filter.topicId = topicId;
    if (section) filter.section = section;
    if (difficulty) filter.difficulty = difficulty;
    if (status) filter.status = status;
    if (sourceType) filter.sourceType = sourceType;
    if (language) filter.language = language;
    if (isPublic === "true") filter.isPublic = true;
    if (isPublic === "false") filter.isPublic = false;

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
    if (!q) return res.status(404).json({ message: "Question not found." });

    const owns = String(q.userId) === String(req.user._id);
    if (!owns && q.status !== "approved" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not allowed." });
    }

    res.json({ ok: true, question: q });
  } catch (err) {
    next(err);
  }
}

/* PATCH /api/questions/:id — owner can edit their own question */
export async function updateQuestion(req, res, next) {
  try {
    const q = await Question.findById(req.params.id);
    if (!q) return res.status(404).json({ message: "Question not found." });

    const owns = String(q.userId) === String(req.user._id);
    if (!owns && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not allowed." });
    }

    const {
      subjectId,
      topicId,
      section,
      question,
      options,
      answer,
      explanation,
      difficulty,
      language,
      marks,
      timeLimitSec,
      isPublic,
      tags,
    } = req.body || {};

    if (subjectId !== undefined)
      q.subjectId = String(subjectId)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .slice(0, 80);
    if (topicId !== undefined)
      q.topicId = String(topicId)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .slice(0, 80);
    if (section !== undefined) q.section = String(section).trim().slice(0, 120);
    if (question !== undefined) q.question = String(question).trim();
    if (options !== undefined) {
      if (!Array.isArray(options) || options.length !== 4) {
        return res.status(400).json({ message: "Exactly 4 options required." });
      }
      q.options = options.map((o) => String(o).trim());
    }
    if (answer !== undefined) {
      if (![0, 1, 2, 3].includes(Number(answer))) {
        return res.status(400).json({ message: "Answer must be 0–3." });
      }
      q.answer = Number(answer);
    }
    if (explanation !== undefined) q.explanation = String(explanation).trim();
    if (
      difficulty !== undefined &&
      ["easy", "medium", "hard"].includes(difficulty)
    ) {
      q.difficulty = difficulty;
    }
    if (language !== undefined && ["en", "bn"].includes(language)) {
      q.language = language;
    }
    if (marks !== undefined)
      q.marks = Math.min(100, Math.max(0, Number(marks) || 1));
    if (timeLimitSec !== undefined) {
      q.timeLimitSec = Math.min(3600, Math.max(5, Number(timeLimitSec) || 60));
    }
    if (isPublic !== undefined) {
      q.isPublic = !!isPublic;
      /* If visibility changed to public, reset moderation status */
      if (q.isPublic && q.sourceType === "user") q.status = "pending";
    }
    if (tags !== undefined && Array.isArray(tags)) {
      q.tags = tags.slice(0, 10).map((t) => String(t).slice(0, 40));
    }

    await q.save();
    res.json({ ok: true, question: q.toObject() });
  } catch (err) {
    next(err);
  }
}

/* DELETE /api/questions/:id */
export async function deleteQuestion(req, res, next) {
  try {
    const q = await Question.findById(req.params.id);
    if (!q) return res.status(404).json({ message: "Question not found." });

    const owns = String(q.userId) === String(req.user._id);
    if (!owns && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not allowed." });
    }

    await q.deleteOne();
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}
