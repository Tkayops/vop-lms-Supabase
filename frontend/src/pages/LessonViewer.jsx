import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useUser } from "@clerk/clerk-react";
import {
  listLessonsByCourse,
  listCourses,
  markLessonComplete,
  getUserByClerkId,
} from "../services/db";
import { ArrowLeft, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";

function Card({ className = "", children }) {
  return (
    <div className={["rounded-3xl border border-black/5 bg-white shadow-[0_1px_0_rgba(0,0,0,0.03),0_8px_30px_rgba(0,0,0,0.04)]", className].join(" ")}>
      {children}
    </div>
  );
}

function fallbackUrl(courseTitle, n) {
  const t = (courseTitle || "").toLowerCase();
  if (t === "discover") return `/lessons/discover/lesson${n}.htm`;
  if (t === "ugunduzi") return `/lessons/ugunduzi/lesson${n}.htm`;
  return null;
}

export default function LessonViewer() {
  // ✅ Match App.js params
  const { courseId: courseIdParam, lessonId: lessonIdParam } = useParams();
  const navigate = useNavigate();

  const courseId = Number(courseIdParam);
  const currentNum = Number(lessonIdParam);

  const { user, isLoaded } = useUser();

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [profile, setProfile] = useState(null);
  const [problem, setProblem] = useState(null);
  const [completeMsg, setCompleteMsg] = useState("");

  useEffect(() => {
    if (!Number.isFinite(courseId) || courseId <= 0) navigate("/courses");
  }, [courseId, navigate]);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setProblem(null);

        const [courses, lessonList] = await Promise.all([
          listCourses(),
          listLessonsByCourse(courseId),
        ]);

        const c = (courses || []).find((k) => Number(k.id) === courseId) || null;
        setCourse(c);

        const sorted = (lessonList || [])
          .filter((l) => Number.isFinite(Number(l.lesson_number)))
          .sort((a, b) => Number(a.lesson_number) - Number(b.lesson_number));
        setLessons(sorted);

        if (isLoaded && user?.id) {
          try {
            const p = await getUserByClerkId(user.id);
            setProfile(p || null);
          } catch {
            setProfile(null);
          }
        }

        if ((!Number.isFinite(currentNum) || currentNum <= 0) && sorted.length) {
          navigate(`/courses/${courseId}/lessons/${sorted[0].lesson_number}`, { replace: true });
        }
      } catch (e) {
        setProblem(e?.message || "Failed to load lesson.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [courseId, currentNum, isLoaded, user, navigate]);

  const currentLesson = useMemo(
    () => lessons.find((l) => Number(l.lesson_number) === currentNum),
    [lessons, currentNum]
  );

  const total = lessons.length;
  const idx = useMemo(
    () => (total ? lessons.findIndex((l) => Number(l.lesson_number) === currentNum) : -1),
    [lessons, currentNum, total]
  );

  const prevNumber = idx > 0 ? Number(lessons[idx - 1].lesson_number) : null;
  const nextNumber = idx >= 0 && idx < total - 1 ? Number(lessons[idx + 1].lesson_number) : null;

  const displayUrl =
    currentLesson?.content_url ||
    (Number.isFinite(currentNum) ? fallbackUrl(course?.title, currentNum) : null);

  async function handleComplete() {
    const uid = Number(profile?.id);
    const lid = Number(currentLesson?.id);
    if (!Number.isFinite(uid) || !Number.isFinite(lid)) {
      setCompleteMsg("Cannot mark complete: invalid user or lesson id.");
      setTimeout(() => setCompleteMsg(""), 3000);
      return;
    }

    try {
      await markLessonComplete({ userId: uid, lessonId: lid });
      setCompleteMsg("Marked complete ✓");
      setTimeout(() => setCompleteMsg(""), 2500);
    } catch (e) {
      setCompleteMsg(e?.message || "Failed to mark complete");
      setTimeout(() => setCompleteMsg(""), 3000);
    }
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_60%,#ffffff_100%)]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-6 md:py-10">
        <div className="mb-4 flex items-center justify-between">
          {/* ✅ Back to details page for this course */}
          <Link to={`/courses/${courseId}`} className="inline-flex items-center gap-2 text-sm opacity-80 hover:opacity-100">
            <ArrowLeft className="w-4 h-4" /> Back to course
          </Link>

          <div className="flex items-center gap-2">
            {prevNumber != null && (
              <button
                onClick={() => navigate(`/courses/${courseId}/lessons/${prevNumber}`)}
                className="inline-flex items-center gap-1 rounded-xl border border-black/10 px-3 py-1.5 text-sm hover:bg-black/5"
                title="Previous lesson"
              >
                <ChevronLeft className="w-4 h-4" />
                Prev
              </button>
            )}
            {nextNumber != null && (
              <button
                onClick={() => navigate(`/courses/${courseId}/lessons/${nextNumber}`)}
                className="inline-flex items-center gap-1 rounded-xl border border-black/10 px-3 py-1.5 text-sm hover:bg-black/5"
                title="Next lesson"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="mb-4">
          <h1 className="text-2xl font-semibold">
            {course?.title || `Course #${courseId}`} — Lesson {Number.isFinite(currentNum) ? currentNum : "?"}
          </h1>
          <div className="text-sm text-black/60 mt-1">
            {idx >= 0 ? `Lesson ${idx + 1} of ${total}` : null}
          </div>
        </div>

        {problem ? (
          <Card className="p-5"><div className="text-sm text-red-700">{problem}</div></Card>
        ) : loading ? (
          <div className="grid gap-4 animate-pulse">
            <Card className="h-10" />
            <Card className="h-[70vh]" />
          </div>
        ) : !currentLesson ? (
          <Card className="p-5">Could not find lesson {currentNum} for this course.</Card>
        ) : displayUrl ? (
          <>
            <Card className="p-3 mb-4 flex items-center justify-between">
              <div className="text-sm">
                <span className="font-medium">Lesson {currentLesson.lesson_number}:</span>{" "}
                {currentLesson.title}
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={displayUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-xl border border-black/10 px-3 py-1.5 text-sm hover:bg-black/5"
                >
                  Open in new tab
                </a>
                <button
                  onClick={handleComplete}
                  className="inline-flex items-center gap-1 rounded-xl bg-black text-white px-3 py-1.5 text-sm hover:opacity-90"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Mark complete
                </button>
              </div>
            </Card>

            <Card className="overflow-hidden">
              <iframe
                title={`Lesson ${currentLesson.lesson_number}`}
                src={displayUrl}
                className="w-full h-[72vh] border-0"
              />
            </Card>

            {completeMsg ? (
              <div className="mt-3 text-sm text-black/70">{completeMsg}</div>
            ) : null}
          </>
        ) : (
          <Card className="p-5">
            We couldn’t find a file for this lesson.
            <div className="text-sm text-black/60 mt-1">
              Ensure the file exists at <code>/public/lessons/&lt;discover|ugunduzi&gt;/lesson{currentNum}.htm</code>
              or set <code>content_url</code> in the database.
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
