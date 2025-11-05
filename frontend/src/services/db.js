// src/services/db.js
import { supabase } from '../utils/supabaseClient';

/** USERS */
export async function upsertUser({
  clerkId, fullName, email, gender = null, dob = null, churchId = null, roleId = 1,
}) {
  const { data, error } = await supabase
    .from('users')
    .upsert(
      { clerk_id: clerkId, full_name: fullName, email, gender, dob, church_id: churchId, role_id: roleId },
      { onConflict: 'clerk_id' }
    )
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getUserByClerkId(clerkId) {
  const { data, error } = await supabase.from('users').select('*').eq('clerk_id', clerkId).single();
  if (error) throw error;
  return data;
}

/** COURSES */
export async function listCourses() {
  const { data, error } = await supabase.from('courses').select('*').order('id', { ascending: true });
  if (error) throw error;
  return data;
}

/** LESSONS */
export async function listLessonsByCourse(courseId) {
  const cid = Number(courseId);
  if (!Number.isFinite(cid) || cid <= 0) {
    // Be forgiving: return empty list instead of throwing
    return [];
  }
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('course_id', cid)
    .order('lesson_number', { ascending: true });
  if (error) throw error;
  return data;
}

/** PROGRESS */
export async function getProgressForUser(userId) {
  const uid = Number(userId);
  if (!Number.isFinite(uid) || uid <= 0) return []; // forgiving
  const { data, error } = await supabase
    .from('progress')
    .select('lesson_id,is_completed,completed_at')
    .eq('user_id', uid);
  if (error) throw error;
  return data;
}

export async function markLessonComplete({ userId, lessonId }) {
  const uid = Number(userId);
  const lid = Number(lessonId);
  if (!Number.isFinite(uid) || !Number.isFinite(lid) || uid <= 0 || lid <= 0) {
    throw new Error('Cannot mark complete: invalid user or lesson id.');
  }
  const { data, error } = await supabase
    .from('progress')
    .upsert(
      { user_id: uid, lesson_id: lid, is_completed: true, completed_at: new Date().toISOString() },
      { onConflict: 'user_id,lesson_id' }
    )
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** DASHBOARD METRICS (baseline) */
export async function getLearnerStats(userId) {
  const uid = Number(userId);
  if (!Number.isFinite(uid) || uid <= 0) return { completed: 0, totalLessons: 0 };

  const [{ count: completed }, { data: lessons }] = await Promise.all([
    supabase.from('progress').select('id', { count: 'exact', head: true }).eq('user_id', uid).eq('is_completed', true),
    supabase.from('lessons').select('id'),
  ]);
  return { completed: completed ?? 0, totalLessons: lessons?.length ?? 0 };
}

/** FAST VIEW-BASED ENDPOINTS */
export async function getLearnerCourseProgress(userId) {
  const uid = Number(userId);
  if (!Number.isFinite(uid) || uid <= 0) return [];
  const { data, error } = await supabase
    .from('vw_learner_course_progress')
    .select('*')
    .eq('learner_id', uid)
    .order('progress_percent', { ascending: false })
    .order('course_id', { ascending: true });
  if (error) throw error;

  return (data || []).map((r) => ({
    id: r.course_id,
    title: r.course_title,
    description: r.course_description,
    totalLessons: r.total_lessons,
    completedLessons: r.completed_lessons,
    progressPct: r.progress_percent,
    lastActivity: r.last_activity ?? null,
  }));
}

export async function getLearnerStatsFast(userId) {
  const uid = Number(userId);
  if (!Number.isFinite(uid) || uid <= 0) return { completed: 0, totalLessons: 0, lastActivity: null };

  const { data, error } = await supabase
    .from('vw_learner_stats')
    .select('completed,total_lessons,last_activity')
    .eq('learner_id', uid)
    .single();
  if (error) throw error;

  return {
    completed: data?.completed ?? 0,
    totalLessons: data?.total_lessons ?? 0,
    lastActivity: data?.last_activity ?? null,
  };
}

/** OPTIONAL: Certificates & Announcements */
export async function getLearnerCertificates(userId) {
  const uid = Number(userId);
  if (!Number.isFinite(uid) || uid <= 0) return [];
  const { data, error } = await supabase
    .from('certificates')
    .select('id, course_id, certificate_url, issued_at, courses(title)')
    .eq('user_id', uid)
    .order('issued_at', { ascending: false });
  if (error) throw error;

  return (data || []).map((row) => ({
    id: row.id,
    course_id: row.course_id,
    course_title: row.courses?.title ?? `Course #${row.course_id}`,
    certificate_url: row.certificate_url,
    issued_at: row.issued_at,
  }));
}

export async function getAnnouncements() {
  const { data, error } = await supabase
    .from('announcements')
    .select('id,title,message,created_at')
    .order('created_at', { ascending: false })
    .limit(20);
  if (error) throw error;
  return data || [];
}

/* ===== Helpers for public lesson URLs ===== */
function generatePublicLessonUrlByTitle(courseTitle, n) {
  const t = (courseTitle || '').toLowerCase();
  if (t === 'discover') return `/lessons/discover/lesson${n}.htm`;
  if (t === 'ugunduzi') return `/lessons/ugunduzi/lesson${n}.htm`;
  return null;
}

/** ===== Public courses seeder (idempotent) ===== */
export async function ensurePublicCourses(manifest) {
  if (!Array.isArray(manifest) || manifest.length === 0) return;

  const { data: existingCourses, error: coursesErr } = await supabase.from('courses').select('id, title');
  if (coursesErr) throw coursesErr;

  const byTitle = Object.create(null);
  for (const c of existingCourses || []) if (c?.title) byTitle[c.title.toLowerCase()] = c;

  for (const course of manifest) {
    const title = course.title?.trim();
    if (!title) continue;

    // ensure course
    let courseId = byTitle[title.toLowerCase()]?.id;
    if (!courseId) {
      const { data: ins, error: insErr } = await supabase
        .from('courses')
        .insert([{ title, description: course.description ?? null }])
        .select('id')
        .single();
      if (insErr) throw insErr;
      courseId = ins.id;
      byTitle[title.toLowerCase()] = { id: courseId, title };
    }

    // existing lessons
    const { data: existingLessons, error: lessonsErr } = await supabase
      .from('lessons')
      .select('id, lesson_number, title, content_url')
      .eq('course_id', courseId);
    if (lessonsErr) throw lessonsErr;

    const have = new Map();
    for (const l of existingLessons || []) have.set(Number(l.lesson_number), l);

    // build upserts
    const toUpsert = [];
    for (const l of course.lessons || []) {
      const num = Number(l.number);
      if (!Number.isFinite(num) || num <= 0) continue;

      const existing = have.get(num);
      const desiredTitle = l.title ?? `Lesson ${num}`;
      const desiredUrl = l.url ?? generatePublicLessonUrlByTitle(title, num);

      if (!existing) {
        toUpsert.push({
          course_id: courseId,
          lesson_number: num,
          title: desiredTitle,
          content_url: desiredUrl ?? null,
        });
      } else {
        const needsUrl = (!existing.content_url || existing.content_url === '') && desiredUrl;
        if (needsUrl || (existing.title == null && desiredTitle)) {
          toUpsert.push({
            id: existing.id,
            course_id: courseId,
            lesson_number: num,
            title: existing.title || desiredTitle,
            content_url: needsUrl ? desiredUrl : (existing.content_url ?? null),
          });
        }
      }
    }

    if (toUpsert.length) {
      const { error: upErr } = await supabase
        .from('lessons')
        .upsert(toUpsert, { onConflict: 'course_id,lesson_number' });
      if (upErr) throw upErr;
    }
  }
}

export async function syncPublicLessonUrls(manifest) {
  if (!Array.isArray(manifest) || manifest.length === 0) return;

  const { data: courses, error } = await supabase.from('courses').select('id, title');
  if (error) throw error;

  for (const course of manifest) {
    const title = course.title?.trim();
    if (!title) continue;

    const match = courses?.find((c) => (c.title || '').toLowerCase() === title.toLowerCase());
    if (!match) continue;

    const courseId = match.id;

    for (const l of course.lessons || []) {
      const num = Number(l.number);
      if (!Number.isFinite(num) || num <= 0) continue;

      const desiredUrl = l.url ?? generatePublicLessonUrlByTitle(title, num);
      if (!desiredUrl) continue;

      await supabase
        .from('lessons')
        .update({ content_url: desiredUrl })
        .eq('course_id', courseId)
        .eq('lesson_number', num)
        .is('content_url', null);
    }
  }
}
