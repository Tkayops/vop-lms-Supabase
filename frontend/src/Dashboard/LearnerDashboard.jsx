// src/Dashboard/LearnerDashboard.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useClerk, useUser } from "@clerk/clerk-react";
import Navbar from "../components/Navbar";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  TrendingUp,
  BookOpen,
  GraduationCap,
  Award,
  AlertCircle,
  Download,
  ArrowRight,
  Clock,
} from "lucide-react";

import {
  getUserByClerkId,
  getLearnerStats,
  getLearnerStatsFast,
  getLearnerCourseProgress,
  getLearnerCertificates,
  getAnnouncements,
  ensurePublicCourses,
} from "../services/db";

import { PUBLIC_COURSES } from "../data/publicCourses.manifest";

/* ----------------------------- small ui bits ----------------------------- */
function Card({ className = "", children }) {
  return (
    <div
      className={[
        "rounded-3xl border border-black/5 bg-white/70 backdrop-blur-sm shadow-[0_1px_0_rgba(0,0,0,0.03),0_8px_30px_rgba(0,0,0,0.04)]",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function SectionTitle({ icon: Icon, children, right = null }) {
  return (
    <div className="flex items-center justify-between gap-2 mb-3">
      <div className="flex items-center gap-2">
        <span className="inline-grid place-items-center w-7 h-7 rounded-xl bg-black/5">
          <Icon className="w-4 h-4" />
        </span>
        <h3 className="font-semibold tracking-tight">{children}</h3>
      </div>
      {right}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <Card className="p-5 transition hover:shadow-lg">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-2xl bg-black/5">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-black/60">{label}</div>
          <div className="text-2xl font-semibold leading-tight">{value ?? "—"}</div>
          {sub ? <div className="text-xs text-black/50 mt-0.5">{sub}</div> : null}
        </div>
      </div>
    </Card>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5">
        <Icon className="w-4 h-4 text-black/60" />
      </div>
      <div>
        <div className="text-[10px] font-medium uppercase tracking-wider text-black/60">
          {label}
        </div>
        <div className="text-sm">{value || "Not set"}</div>
      </div>
    </div>
  );
}

function ProgressBar({ percent = 0 }) {
  const p = Math.min(100, Math.max(0, Math.round(percent)));
  return (
    <div className="h-2 rounded-full bg-black/[0.06] overflow-hidden">
      <div className="h-full rounded-full bg-black transition-all" style={{ width: `${p}%` }} />
    </div>
  );
}

function CourseCard({ course }) {
  const percent = Math.min(100, Math.max(0, Math.round(course.progressPct ?? 0)));
  return (
    <Card className="p-5 group hover:shadow-xl transition">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-grid place-items-center w-7 h-7 rounded-xl bg-black/5">
              <BookOpen className="w-4 h-4" />
            </span>
            <h4 className="font-semibold leading-snug">{course.title}</h4>
          </div>
          {course.description ? (
            <p className="text-sm text-black/70 mt-2 line-clamp-2">{course.description}</p>
          ) : null}
        </div>

        <Link
          to={`/courses/${course.id}`}
          className="inline-flex items-center gap-1 text-sm font-medium opacity-80 hover:opacity-100"
        >
          Continue <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-xs text-black/60">
          <span>Progress</span>
          <span>{percent}%</span>
        </div>
        <ProgressBar percent={percent} />
        <div className="text-xs text-black/60">
          {course.completedLessons}/{course.totalLessons} lessons
        </div>
      </div>
    </Card>
  );
}

function AnnouncementItem({ item }) {
  return (
    <Card className="p-4 hover:shadow-lg transition">
      <div className="flex items-center gap-2">
        <span className="inline-grid place-items-center w-6 h-6 rounded-lg bg-black/5">
          <AlertCircle className="w-4 h-4" />
        </span>
        <div className="font-medium">{item.title}</div>
      </div>
      <p className="text-sm text-black/70 mt-2">{item.message}</p>
      <div className="text-xs text-black/50 mt-1">
        {new Date(item.created_at).toLocaleString()}
      </div>
    </Card>
  );
}

function CertificateCard({ cert }) {
  return (
    <Card className="p-5 hover:shadow-lg transition">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="inline-grid place-items-center w-8 h-8 rounded-xl bg-black/5">
            <Award className="w-5 h-5" />
          </span>
          <div>
            <div className="font-medium leading-tight">{cert.course_title}</div>
            <div className="text-xs text-black/60">
              Awarded {new Date(cert.issued_at).toLocaleDateString()}
            </div>
          </div>
        </div>
        <a
          href={cert.certificate_url || cert.file_url || cert.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium opacity-80 hover:opacity-100"
        >
          <Download className="w-4 h-4" />
          Download
        </a>
      </div>
    </Card>
  );
}

/* --------------------------------- page --------------------------------- */
export default function LearnerDashboard() {
  const { signOut } = useClerk();
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [problem, setProblem] = useState(null);

  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ completed: 0, totalLessons: 0, lastActivity: null });
  const [courses, setCourses] = useState([]);
  const [certs, setCerts] = useState([]);
  const [announcements, setAnnouncementsState] = useState([]);

  const initials = useMemo(() => {
    const full = profile?.full_name || user?.fullName || user?.username || "";
    const parts = full.trim().split(/\s+/).slice(0, 2);
    return parts.map((p) => p?.[0]?.toUpperCase() ?? "").join("");
  }, [profile, user]);

  useEffect(() => {
    if (!isLoaded) return;

    async function load() {
      try {
        setLoading(true);
        setProblem(null);

        // 1) Profile
        const p = await getUserByClerkId(user.id);
        if (!p) {
          navigate("/onboarding");
          return;
        }
        setProfile(p);

        // 1.5) Seed public courses/lessons (Discover & Ugunduzi)
        try {
          await ensurePublicCourses(PUBLIC_COURSES);
        } catch (seedErr) {
          console.warn("Seeding public courses skipped:", seedErr?.message || seedErr);
        }

        // 2) Stats (view first, fallback to simple)
        let s;
        try {
          s = await getLearnerStatsFast(p.id);
        } catch {
          s = await getLearnerStats(p.id);
        }
        setStats(s || { completed: 0, totalLessons: 0, lastActivity: null });

        // 3) Course progress
        const progress = await getLearnerCourseProgress(p.id);
        setCourses(progress);

        // 4) Optional: certs + announcements
        const [certList, ann] = await Promise.all([
          getLearnerCertificates?.(p.id).catch(() => []),
          getAnnouncements?.().catch(() => []),
        ]);
        setCerts(certList ?? []);
        setAnnouncementsState(
          (ann ?? []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        );
      } catch (err) {
        console.error(err);
        setProblem(err?.message || "Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [isLoaded, user, navigate]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="animate-pulse text-sm text-black/60">Preparing your dashboard…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_60%,#ffffff_100%)]">
      <Navbar />

      {/* Hero header */}
      <header className="relative isolate">
        <div className="absolute inset-0 -z-10 opacity-[0.035] bg-[radial-gradient(600px_200px_at_20%_0%,#000_10%,transparent_60%)]" />
        <div className="max-w-7xl mx-auto px-4 pt-6 md:pt-10">
          <Card className="px-5 py-6 md:px-8 md:py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                {user?.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt="avatar"
                    className="w-16 h-16 rounded-2xl object-cover border border-black/10"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl grid place-items-center text-lg font-semibold border border-black/10">
                    {initials || <User className="w-5 h-5" />}
                  </div>
                )}
                <div>
                  <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
                    Welcome{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""} 👋
                  </h1>
                  <p className="text-sm text-black/60">
                    Here’s a snapshot of your learning
                    {stats?.lastActivity
                      ? ` • Last activity ${new Date(stats.lastActivity).toLocaleDateString()}`
                      : ""}.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  to="/profile"
                  className="rounded-xl border border-black/10 px-3 py-2 text-sm hover:bg-black/5"
                >
                  Edit profile
                </Link>
                <button
                  onClick={() => signOut()}
                  className="rounded-xl bg-black text-white px-4 py-2 text-sm hover:opacity-90"
                >
                  Sign out
                </button>
              </div>
            </div>
          </Card>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pb-12">
        {/* Error */}
        {problem && (
          <div className="mt-6">
            <Card className="p-4 border-red-200 bg-red-50/80">
              <div className="text-sm text-red-700">{problem}</div>
            </Card>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
            <Card className="h-28" />
            <Card className="h-28" />
            <Card className="h-28" />
            <Card className="h-28" />
            <Card className="h-56 md:col-span-3" />
            <Card className="h-56" />
          </div>
        ) : (
          <>
            {/* Stats */}
            <section className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard
                icon={TrendingUp}
                label="Lessons Completed"
                value={stats?.completed ?? 0}
                sub={
                  (stats?.totalLessons ?? 0) > 0
                    ? `${Math.round(((stats.completed || 0) / stats.totalLessons) * 100)}% of all lessons`
                    : ""
                }
              />
              <StatCard icon={BookOpen} label="Total Lessons" value={stats?.totalLessons ?? 0} />
              <StatCard
                icon={GraduationCap}
                label="Active Courses"
                value={courses.filter((c) => c.totalLessons > 0).length}
              />
              <StatCard
                icon={Clock}
                label="Last Activity"
                value={stats?.lastActivity ? new Date(stats.lastActivity).toLocaleDateString() : "—"}
                sub="Based on completed lessons"
              />
            </section>

            {/* Profile + Courses */}
            <section className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Profile */}
              <Card className="p-5 md:col-span-1">
                <SectionTitle icon={User}>Your Profile</SectionTitle>
                <div className="space-y-4">
                  <InfoRow icon={User} label="Full name" value={profile?.full_name || user?.fullName} />
                  <InfoRow icon={Mail} label="Email" value={profile?.email || user?.primaryEmailAddress?.emailAddress} />
                  <InfoRow icon={Phone} label="Phone" value={profile?.phone} />
                  <InfoRow
                    icon={MapPin}
                    label="Church"
                    value={profile?.church_name || (profile?.church_id ? `#${profile.church_id}` : null)}
                  />
                  <InfoRow
                    icon={Calendar}
                    label="Joined"
                    value={profile?.created_at && new Date(profile.created_at).toLocaleDateString()}
                  />
                </div>
              </Card>

              {/* Courses */}
              <div className="md:col-span-2">
                <SectionTitle
                  icon={TrendingUp}
                  right={
                    <Link to="/courses" className="text-sm opacity-80 hover:opacity-100 inline-flex items-center gap-1">
                      Browse catalog <ArrowRight className="w-4 h-4" />
                    </Link>
                  }
                >
                  Your Courses
                </SectionTitle>

                {courses?.length ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {courses.map((c) => (
                      <CourseCard key={c.id} course={c} />
                    ))}
                  </div>
                ) : (
                  <Card className="p-6 text-center">
                    <div className="text-sm text-black/70">
                      No courses yet. Browse the catalog to get started.
                    </div>
                    <div className="mt-3">
                      <Link
                        to="/courses"
                        className="inline-flex items-center gap-1 rounded-xl bg-black text-white px-3 py-2 text-sm hover:opacity-90"
                      >
                        Explore courses <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </Card>
                )}
              </div>
            </section>

            {/* Announcements */}
            <section className="mt-8">
              <SectionTitle icon={AlertCircle}>Announcements</SectionTitle>
              {announcements?.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {announcements.slice(0, 6).map((a) => (
                    <AnnouncementItem key={a.id} item={a} />
                  ))}
                </div>
              ) : (
                <Card className="p-5 text-sm text-black/70">No announcements yet.</Card>
              )}
            </section>

            {/* Certificates */}
            <section className="mt-8">
              <SectionTitle icon={Award}>Certificates</SectionTitle>
              {certs?.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {certs.map((cert) => (
                    <CertificateCard key={cert.id} cert={cert} />
                  ))}
                </div>
              ) : (
                <Card className="p-5 text-sm text-black/70">
                  You’ll see your certificates here once you complete courses.
                </Card>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
