import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { listLessonsByCourse, listCourses, ensurePublicCourses } from "../services/db";
import { PUBLIC_COURSES } from "../data/publicCourses.manifest";
import { BookOpen, ArrowLeft, Play } from "lucide-react";

function Card({ className = "", children }) {
  return (
    <div className={["rounded-3xl border border-black/5 bg-white shadow-[0_1px_0_rgba(0,0,0,0.03),0_8px_30px_rgba(0,0,0,0.04)] p-5", className].join(" ")}>
      {children}
    </div>
  );
}

export default function CourseDetails() {
  const { courseId: courseIdParam } = useParams();
  const navigate = useNavigate();
  const courseId = Number(courseIdParam);

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [problem, setProblem] = useState(null);

  useEffect(() => {
    if (!Number.isFinite(courseId) || courseId <= 0) {
      navigate("/courses");
      return;
    }

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

        let list = (lessonList || [])
          .filter((l) => Number.isFinite(Number(l.lesson_number)))
          .sort((a, b) => Number(a.lesson_number) - Number(b.lesson_number));

        if ((!list || list.length === 0) && c?.title) {
          try {
            await ensurePublicCourses(PUBLIC_COURSES);
            const after = await listLessonsByCourse(courseId);
            list = (after || [])
              .filter((l) => Number.isFinite(Number(l.lesson_number)))
              .sort((a, b) => Number(a.lesson_number) - Number(b.lesson_number));
          } catch {}
        }

        setLessons(list);
      } catch (e) {
        setProblem(e?.message || "Failed to load course.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [courseId, navigate]);

  const firstLessonNum = useMemo(
    () => (lessons.length ? Number(lessons[0].lesson_number) : null),
    [lessons]
  );

  const handleStart = () => {
    if (firstLessonNum != null) {
      // ✅ matches App.js: /courses/:courseId/lessons/:lessonId
      navigate(`/courses/${courseId}/lessons/${firstLessonNum}`);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_60%,#ffffff_100%)]">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-6 md:py-10">
        <div className="mb-4 flex items-center justify-between">
          {/* ✅ Back to /courses */}
          <Link to="/courses" className="inline-flex items-center gap-2 text-sm opacity-80 hover:opacity-100">
            <ArrowLeft className="w-4 h-4" /> Back to courses
          </Link>

          <button
            onClick={handleStart}
            disabled={firstLessonNum == null}
            className="inline-flex items-center gap-2 rounded-xl bg-black text-white px-3 py-1.5 text-sm hover:opacity-90 disabled:opacity-40"
            title={firstLessonNum == null ? "No lessons yet" : "Start course"}
          >
            <Play className="w-4 h-4" />
            Start course
          </button>
        </div>

        <div className="mb-4">
          <h1 className="text-2xl font-semibold">{course?.title || `Course #${courseId}`}</h1>
          {course?.description ? (
            <p className="text-sm text-black/60 mt-1">{course.description}</p>
          ) : null}
        </div>

        {problem ? (
          <Card><div className="text-sm text-red-700">{problem}</div></Card>
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-pulse">
            <Card className="h-24" /><Card className="h-24" /><Card className="h-24" /><Card className="h-24" />
          </div>
        ) : lessons?.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {lessons.map((l) => {
              const lessonId = Number(l.lesson_number);
              if (!Number.isFinite(lessonId)) return null;
              return (
                <Card key={l.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="inline-grid place-items-center w-8 h-8 rounded-xl bg-black/5">
                      <BookOpen className="w-4 h-4" />
                    </span>
                    <div>
                      <div className="font-medium">Lesson {lessonId}</div>
                      <div className="text-sm text-black/60">{l.title}</div>
                      <div className="text-xs text-black/50 mt-1">
                        {l.content_url ? "File linked" : "No file on record (viewer will try fallback)"}
                      </div>
                    </div>
                  </div>

                  {/* ✅ Link to viewer using :courseId and :lessonId */}
                  <Link
                    to={`/courses/${courseId}/lessons/${lessonId}`}
                    className="text-sm font-medium opacity-80 hover:opacity-100"
                  >
                    Open
                  </Link>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>No lessons found for this course.</Card>
        )}
      </main>
    </div>
  );
}
