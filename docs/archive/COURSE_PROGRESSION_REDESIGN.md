# 🎯 Course Progression System Redesign

## 🚨 Current Problems

### Critical Issues

1. **No Sequential Enforcement** - Users can jump to any lesson regardless of progress
2. **Quiz Bypass** - "Next" button skips quiz entirely, goes straight to next lesson
3. **No Validation** - "Mark Complete" button has no requirements
4. **Fake Progress** - Can get certificate without actually studying
5. **Broken Progress Bar** - Percentage doesn't reflect actual completion
6. **Quiz Not Required** - Can complete lesson without taking/passing quiz

### User Can Currently

- ❌ Skip directly to Lesson 7 without watching Lessons 1-6
- ❌ Click "Next" after lesson content and bypass the quiz
- ❌ Mark any lesson as complete without watching video or reading content
- ❌ Get course certificate without completing any lessons or quizzes
- ❌ Have 0% progress but still access all content

---

## ✅ Required Flow (What It Should Be)

### Proper Course Journey

```
1. User starts Course
   ↓
2. Lesson 1 unlocked (others locked)
   ↓
3. User watches/reads Lesson 1
   ↓
4. "Next" button → Takes to QUIZ (not Lesson 2)
   ↓
5. User completes Quiz
   ↓
6. Quiz must score >= passingScore (default 70%)
   ↓
7. If PASS:
   - Lesson 1 marked complete
   - Lesson 2 unlocked
   - Progress updates (1/7 = 14%)
   ↓
8. If FAIL:
   - Must retake quiz (respecting maxAttempts)
   - Can review lesson content
   - Cannot proceed until pass
   ↓
9. Repeat for all lessons
   ↓
10. When 7/7 complete + all quizzes passed:
    - Certificate unlocked
    - Can download certificate
```

---

## 🗄️ Database Changes Needed

### 1. Update `lesson_progress` Table

```sql
ALTER TABLE lesson_progress ADD COLUMN quiz_passed BOOLEAN DEFAULT FALSE;
ALTER TABLE lesson_progress ADD COLUMN quiz_attempts INTEGER DEFAULT 0;
ALTER TABLE lesson_progress ADD COLUMN last_quiz_score INTEGER;
ALTER TABLE lesson_progress ADD COLUMN can_proceed BOOLEAN DEFAULT FALSE;
```

### 2. Update `course_lessons` Table

```sql
ALTER TABLE course_lessons ADD COLUMN requires_quiz BOOLEAN DEFAULT TRUE;
ALTER TABLE course_lessons ADD COLUMN prerequisite_lesson_id TEXT;
ALTER TABLE course_lessons ADD COLUMN is_locked BOOLEAN DEFAULT TRUE;
```

### 3. Create `quiz_attempts` Table

```sql
CREATE TABLE quiz_attempts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  quiz_id TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  score INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  answers JSONB NOT NULL,
  time_taken INTEGER, -- seconds
  attempt_number INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (quiz_id) REFERENCES course_quizzes(id),
  FOREIGN KEY (lesson_id) REFERENCES course_lessons(id),
  FOREIGN KEY (course_id) REFERENCES courses(id)
);

CREATE INDEX idx_quiz_attempts_user ON quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_quiz ON quiz_attempts(quiz_id);
CREATE INDEX idx_quiz_attempts_lesson ON quiz_attempts(lesson_id);
```

---

## 🔧 API Changes Needed

### 1. `/api/lessons/[lessonId]` (GET)

**Current:** Returns lesson data regardless of lock status  
**New:** Check if lesson is unlocked before returning data

```typescript
// Add unlock check
const userProgress = await prisma.lesson_progress.findFirst({
  where: {
    userId: session.user.id,
    lessonId: lessonId,
  },
});

const lesson = await prisma.course_lessons.findUnique({
  where: { id: lessonId },
});

// Check if lesson is locked
if (lesson.is_locked && !userProgress?.can_proceed) {
  // Check if previous lesson is complete
  const previousLesson = await getPreviousLesson(lesson.courseId, lesson.order);
  if (previousLesson) {
    const prevProgress = await prisma.lesson_progress.findFirst({
      where: {
        userId: session.user.id,
        lessonId: previousLesson.id,
      },
    });

    if (!prevProgress?.quiz_passed) {
      return NextResponse.json(
        {
          error: "Complete previous lesson and pass its quiz first",
          locked: true,
          requiresLesson: previousLesson.title,
        },
        { status: 403 }
      );
    }
  }
}
```

### 2. `/api/lessons/[lessonId]/complete` (POST)

**Current:** Marks lesson complete without validation  
**New:** Require quiz pass before allowing completion

```typescript
export async function POST(request, { params }) {
  const { lessonId } = await params;
  const session = await getServerSession(authOptions);

  // Check if quiz exists for this lesson
  const quiz = await prisma.course_quizzes.findFirst({
    where: { lessonId },
  });

  if (quiz) {
    // Check if quiz was passed
    const bestAttempt = await prisma.quiz_attempts.findFirst({
      where: {
        userId: session.user.id,
        lessonId: lessonId,
        passed: true,
      },
      orderBy: { score: "desc" },
    });

    if (!bestAttempt) {
      return NextResponse.json(
        {
          error: "You must pass the quiz before completing this lesson",
          requiresQuiz: true,
        },
        { status: 400 }
      );
    }
  }

  // Mark lesson complete and unlock next
  await prisma.lesson_progress.upsert({
    where: {
      userId_lessonId: {
        userId: session.user.id,
        lessonId: lessonId,
      },
    },
    update: {
      completed: true,
      completedAt: new Date(),
    },
    create: {
      userId: session.user.id,
      lessonId: lessonId,
      completed: true,
      completedAt: new Date(),
    },
  });

  // Unlock next lesson
  const nextLesson = await getNextLesson(/* ... */);
  if (nextLesson) {
    await prisma.course_lessons.update({
      where: { id: nextLesson.id },
      data: { is_locked: false },
    });
  }

  return NextResponse.json({ success: true });
}
```

### 3. `/api/lessons/[lessonId]/quiz/submit` (POST)

**Current:** Returns score but doesn't save attempt  
**New:** Save attempt, check passing, unlock next if passed

```typescript
export async function POST(request, { params }) {
  const { lessonId } = await params;
  const session = await getServerSession(authOptions);
  const body = await request.json();
  const { answers } = body;

  // Get quiz and calculate score (existing logic)
  const quiz = await prisma.course_quizzes.findFirst({
    where: { lessonId },
    include: { quiz_questions: true },
  });

  let correctAnswers = 0;
  let totalPoints = 0;

  quiz.quiz_questions.forEach((question) => {
    totalPoints += question.points || 1;
    const userAnswer = answers[question.id];

    if (userAnswer === question.correctAnswer) {
      correctAnswers += question.points || 1;
    }
  });

  const score = Math.round((correctAnswers / totalPoints) * 100);
  const passed = score >= (quiz.passingScore || 70);

  // Get attempt number
  const attemptCount = await prisma.quiz_attempts.count({
    where: {
      userId: session.user.id,
      quizId: quiz.id,
    },
  });

  const attemptNumber = attemptCount + 1;

  // Check max attempts
  if (quiz.maxAttempts && attemptNumber > quiz.maxAttempts) {
    return NextResponse.json(
      {
        error: "Maximum attempts exceeded",
        maxAttempts: quiz.maxAttempts,
      },
      { status: 400 }
    );
  }

  // Save attempt
  await prisma.quiz_attempts.create({
    data: {
      id: generateId(),
      userId: session.user.id,
      quizId: quiz.id,
      lessonId: lessonId,
      courseId: quiz.courseId,
      score: score,
      passed: passed,
      answers: answers,
      attemptNumber: attemptNumber,
    },
  });

  // Update lesson progress
  await prisma.lesson_progress.upsert({
    where: {
      userId_lessonId: {
        userId: session.user.id,
        lessonId: lessonId,
      },
    },
    update: {
      quiz_passed: passed,
      quiz_attempts: attemptNumber,
      last_quiz_score: score,
      can_proceed: passed,
    },
    create: {
      userId: session.user.id,
      lessonId: lessonId,
      quiz_passed: passed,
      quiz_attempts: attemptNumber,
      last_quiz_score: score,
      can_proceed: passed,
    },
  });

  return NextResponse.json({
    score,
    passed,
    correctAnswers,
    totalQuestions: quiz.quiz_questions.length,
    passingScore: quiz.passingScore || 70,
    attemptNumber,
    maxAttempts: quiz.maxAttempts || 0,
  });
}
```

### 4. `/api/courses/[id]/certificate` (GET)

**Current:** Generates certificate without validation  
**New:** Verify all lessons completed and all quizzes passed

```typescript
export async function GET(request, { params }) {
  const { id: courseId } = await params;
  const session = await getServerSession(authOptions);

  // Get all lessons in course
  const lessons = await prisma.course_lessons.findMany({
    where: { courseId },
    include: {
      course_quizzes: true,
    },
  });

  // Check each lesson has progress and quiz passed
  for (const lesson of lessons) {
    const progress = await prisma.lesson_progress.findFirst({
      where: {
        userId: session.user.id,
        lessonId: lesson.id,
      },
    });

    if (!progress?.completed) {
      return NextResponse.json(
        {
          error: `Lesson "${lesson.title}" not completed`,
          requiresCompletion: true,
        },
        { status: 400 }
      );
    }

    if (lesson.course_quizzes.length > 0 && !progress?.quiz_passed) {
      return NextResponse.json(
        {
          error: `Quiz for "${lesson.title}" not passed`,
          requiresQuizPass: true,
        },
        { status: 400 }
      );
    }
  }

  // All requirements met, generate certificate
  return generateCertificate(session.user, course);
}
```

---

## 🎨 Frontend Changes Needed

### 1. Lesson List (Course Overview Page)

```typescript
// Show lock icons on incomplete lessons
{
  lessons.map((lesson, index) => {
    const isLocked = lesson.is_locked && !canAccessLesson(lesson, userProgress);
    const isPassed = userProgress[lesson.id]?.quiz_passed;

    return (
      <div
        className={`lesson-card ${isLocked ? "locked" : ""}`}
        onClick={() => !isLocked && navigateToLesson(lesson.id)}
      >
        {isLocked && <LockIcon />}
        {isPassed && <CheckIcon className="text-green-500" />}
        <h3>{lesson.title}</h3>
        <p>
          {lesson.order} of {totalLessons}
        </p>
      </div>
    );
  });
}
```

### 2. Lesson Page "Next" Button Logic

```typescript
// Change next button to go to quiz, not next lesson
function handleNextClick() {
  const hasQuiz = lesson.course_quizzes?.length > 0;

  if (hasQuiz && !quizPassed) {
    // Go to quiz page
    router.push(`/lessons/${lesson.id}/quiz`);
  } else {
    // Go to next lesson
    router.push(`/lessons/${nextLesson.id}`);
  }
}

<Button onClick={handleNextClick}>
  {hasQuiz && !quizPassed ? "Take Quiz" : "Next Lesson"}
</Button>;
```

### 3. "Mark Complete" Button

```typescript
// Remove manual "Mark Complete" button entirely
// Auto-mark complete when quiz is passed

// OR keep it but disable until quiz passed:
<Button
  onClick={markComplete}
  disabled={!quizPassed}
  title={!quizPassed ? "Pass the quiz first" : "Mark complete"}
>
  {quizPassed ? "Mark Complete ✓" : "Complete Quiz First 🔒"}
</Button>
```

### 4. Progress Bar Calculation

```typescript
// Calculate progress based on actual completions
const calculateProgress = () => {
  const completedLessons = lessons.filter(lesson => {
    const progress = userProgress[lesson.id];
    return progress?.completed && progress?.quiz_passed;
  });

  return (completedLessons.length / lessons.length) * 100;
};

<ProgressBar value={calculateProgress()} />
<span>{completedLessons}/{totalLessons} Lessons Complete</span>
```

### 5. Certificate Access

```typescript
// Only show certificate when eligible
const canGetCertificate = () => {
  return lessons.every((lesson) => {
    const progress = userProgress[lesson.id];
    return (
      progress?.completed &&
      (lesson.requiresQuiz ? progress?.quiz_passed : true)
    );
  });
};

{
  canGetCertificate() ? (
    <Button href="/certificate">🏆 Get Your Certificate</Button>
  ) : (
    <div className="locked-certificate">
      <p>Complete all lessons and pass all quizzes to unlock certificate</p>
      <Progress value={calculateProgress()} />
    </div>
  );
}
```

---

## 📋 Implementation Checklist

### Phase 1: Database Setup

- [ ] Create migration file for new columns
- [ ] Add `quiz_passed`, `quiz_attempts`, `last_quiz_score`, `can_proceed` to `lesson_progress`
- [ ] Add `requires_quiz`, `prerequisite_lesson_id`, `is_locked` to `course_lessons`
- [ ] Create `quiz_attempts` table
- [ ] Run migration
- [ ] Unlock first lesson of each course (set `is_locked = false` for `order = 0`)

### Phase 2: API Endpoints

- [ ] Fix `/api/lessons/[lessonId]` to check lock status
- [ ] Fix `/api/lessons/[lessonId]/complete` to require quiz pass
- [ ] Update `/api/lessons/[lessonId]/quiz/submit` to save attempts
- [ ] Update `/api/lessons/[lessonId]/quiz/submit` to update progress
- [ ] Fix `/api/courses/[id]/certificate` to validate completion
- [ ] Create `/api/lessons/[lessonId]/unlock` for next lesson unlock logic

### Phase 3: Frontend Updates

- [ ] Add lock icons to lesson list
- [ ] Disable click on locked lessons
- [ ] Change "Next" button logic (lesson → quiz → next lesson)
- [ ] Remove or disable "Mark Complete" until quiz passed
- [ ] Fix progress bar calculation
- [ ] Show quiz requirements in UI
- [ ] Add "Retake Quiz" button if failed
- [ ] Lock certificate until all complete
- [ ] Show completion checklist

### Phase 4: User Experience

- [ ] Add tooltips explaining why lessons are locked
- [ ] Show "X/Y lessons complete" progress indicator
- [ ] Display quiz score and passing score clearly
- [ ] Show attempt number and max attempts
- [ ] Congratulations message when quiz passed
- [ ] Visual feedback when lesson/quiz completed
- [ ] Celebrate certificate unlock 🎉

### Phase 5: Testing

- [ ] Test sequential lesson access
- [ ] Test quiz requirement enforcement
- [ ] Test max attempts limit
- [ ] Test certificate validation
- [ ] Test progress calculation
- [ ] Test unlock next lesson flow
- [ ] Test retake quiz flow

---

## 🚀 Quick Fix Priority

**1. Fix Quiz Grading (DONE ✅)**

- Convert answer format in fetch endpoint

**2. Block Next Lesson Until Quiz Passed**

- Add check in lesson page component

**3. Validate Certificate Generation**

- Add completion check in certificate endpoint

**4. Lock Future Lessons**

- Add UI indication for locked lessons
- Prevent navigation to locked lessons

**5. Calculate Real Progress**

- Use actual completion data for progress bar

---

## 💡 Additional Features (Later)

- **Review Mode**: Let users retake quizzes to improve score
- **Leaderboard**: Show top quiz scores
- **Quiz Timer**: Track time taken for each attempt
- **Quiz Analytics**: Show which questions users struggle with
- **Adaptive Quizzes**: Generate questions based on weak areas
- **Bookmarks**: Let users save difficult questions for review
- **Notes**: Add notes during lessons
- **Discussion**: Comment on specific lesson sections
