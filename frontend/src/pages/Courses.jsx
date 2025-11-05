import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { listCourses, ensurePublicCourses } from "../services/db";
import { PUBLIC_COURSES } from "../data/publicCourses.manifest";
import { BookOpen } from "lucide-react";

function Card({ className = "", children }) {
  return (
    <div className={["rounded-3xl border border-black/5 bg-white shadow-[0_1px_0_rgba(0,0,0,0.03),0_8px_30px_rgba(0,0,0,0.04)] p-5", className].join(" ")}>
      {children}
    </div>
  );
}

export default function Courses() {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [problem, setProblem] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setProblem(null);
        try { await ensurePublicCourses(PUBLIC_COURSES); } catch {}
        const data = await listCourses();
        setCourses((data || []).filter(c => Number.isFinite(Number(c.id))));
      } catch (e) {
        setProblem(e?.message || "Failed to load courses.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_60%,#ffffff_100%)]">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6 md:py-10">
        <h1 className="text-2xl font-semibold mb-4">Courses</h1>

        {problem ? (
          <Card><div className="text-sm text-red-700">{problem}</div></Card>
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
            <Card className="h-28" /><Card className="h-28" /><Card className="h-28" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(courses || []).map((c) => {
              const courseId = Number(c.id);
              if (!Number.isFinite(courseId)) return null;
              return (
                <Card key={courseId} className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="inline-grid place-items-center w-9 h-9 rounded-xl bg-black/5">
                      <BookOpen className="w-5 h-5" />
                    </span>
                    <div>
                      <div className="font-medium">{c.title}</div>
                      {c.description ? <div className="text-sm text-black/60">{c.description}</div> : null}
                    </div>
                  </div>

                  {/* ✅ Link to details page per App.js */}
                  <Link
                    to={`/courses/${courseId}`}
                    className="text-sm font-medium opacity-80 hover:opacity-100 rounded-xl border border-black/10 px-3 py-1.5"
                  >
                    View lessons
                  </Link>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
