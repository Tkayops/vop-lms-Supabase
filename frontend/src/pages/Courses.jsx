// src/pages/Courses.jsx
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { BookOpen, Clock, CheckCircle2, Lock } from "lucide-react";
import { listCourses } from "../services/db";
import { useNavigate } from "react-router-dom";

export default function Courses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const rows = await listCourses();
        setCourses(rows || []);
      } catch (e) {
        console.error(e);
        setErr("Failed to load courses.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <section className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-2"><BookOpen /> Courses</h1>
        {loading && <p>Loading…</p>}
        {err && <p className="text-red-600">{err}</p>}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((c) => (
            <button
              key={c.id}
              onClick={() => navigate(`/courses/${c.id}`)}
              className="text-left border rounded-2xl p-5 hover:shadow-md transition bg-white"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">{c.title}</h3>
                <Lock className="text-gray-300" />
              </div>
              <p className="text-gray-600 mt-2 line-clamp-3">{c.description || "—"}</p>
              <div className="mt-4 flex items-center gap-3 text-sm text-gray-500">
                <Clock size={16} /> {c.total_lessons ?? 0} lessons
                <CheckCircle2 size={16} className="ml-auto" />
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
