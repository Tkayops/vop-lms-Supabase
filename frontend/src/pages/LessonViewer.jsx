// src/pages/LessonViewer.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, ChevronRight, Award, Clock } from "lucide-react";
import { listLessonsByCourse, getUserByClerkId, markLessonComplete } from "../services/db";
import { useAuth } from "@clerk/clerk-react";

export default function LessonViewer() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { userId } = useAuth();
  const [userRow, setUserRow] = useState(null);

  const [lessons, setLessons] = useState([]);
  const [current, setCurrent] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [err, setErr] = useState("");

  const currentLesson = useMemo(() => lessons.find(l => l.lesson_number === current), [lessons, current]);

  useEffect(() => {
    (async () => {
      try {
        setErr("");
        // fetch learner row
        const u = await getUserByClerkId(userId);
        setUserRow(u);
        // get lessons
        const l = await listLessonsByCourse(Number(courseId));
        setLessons(l || []);
        if (l?.length) setCurrent(l[0].lesson_number);
      } catch (e) {
        console.error(e);
        setErr("Failed to load lesson.");
      }
    })();
  }, [courseId, userId]);

  async function completeCurrent() {
    if (!userRow || !currentLesson) return;
    try {
      setIsSaving(true);
      await markLessonComplete({ userId: userRow.id, lessonId: currentLesson.id });
    } catch (e) {
      console.error(e);
      setErr("Could not mark complete.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center gap-3 p-4 border-b bg-white">
        <button onClick={() => navigate(-1)} className="btn-secondary"><ArrowLeft size={16}/>Back</button>
        <h1 className="text-xl font-semibold">Course #{courseId} • Lesson {current}</h1>
      </header>

      <main className="max-w-6xl mx-auto p-4 grid md:grid-cols-5 gap-6">
        <aside className="md:col-span-2 border rounded-2xl p-3">
          <h3 className="font-semibold mb-2">Lessons</h3>
          <div className="grid gap-1">
            {lessons.map((l) => (
              <button key={l.id} onClick={() => setCurrent(l.lesson_number)} className={`flex items-center gap-2 p-2 rounded-lg border ${current === l.lesson_number ? "bg-orange-50 border-orange-200" : "bg-white"}`}>
                <span className="w-7 h-7 flex items-center justify-center rounded-md bg-gray-100">{l.lesson_number}</span>
                <span className="truncate">{l.title}</span>
                <ChevronRight className="ml-auto text-gray-400" size={16}/>
              </button>
            ))}
          </div>
        </aside>

        <section className="md:col-span-3 border rounded-2xl p-4">
          {!currentLesson ? (
            <p className="text-gray-600">{err || "No lesson selected."}</p>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">{currentLesson.title}</h2>
                <span className="text-sm text-gray-500 flex items-center gap-1"><Clock size={16}/> {currentLesson.duration ?? 0} min</span>
              </div>
              <hr className="my-3"/>
              {currentLesson.file_path ? (
                <iframe title="lesson" src={currentLesson.file_path} className="w-full h-[60vh] border rounded-lg" />
              ) : (
                <p className="text-gray-600">No lesson file provided yet.</p>
              )}

              <div className="mt-4 flex items-center justify-between">
                <button onClick={completeCurrent} disabled={isSaving} className="btn-primary">
                  {isSaving ? "Saving..." : "Mark complete"} <CheckCircle size={16}/>
                </button>
                <button className="btn-secondary">
                  Take Test <Award size={16}/>
                </button>
              </div>
            </>
          )}
        </section>
      </main>

      <style>{`
        .btn-primary { display:flex; align-items:center; gap:8px; background:#ea580c; color:#fff; padding:0.6rem 1rem; border-radius:0.75rem; }
        .btn-secondary { display:flex; align-items:center; gap:8px; border:1px solid #e5e7eb; padding:0.6rem 1rem; border-radius:0.75rem; }
      `}</style>
    </div>
  );
}
