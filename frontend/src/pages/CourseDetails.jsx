// src/pages/CourseDetails.jsx
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { BookOpen, ArrowLeft, PlayCircle, Clock, CheckCircle } from "lucide-react";

export default function CourseDetails() {
  const { courseId } = useParams();

  const courseData = {
    discover: {
      title: "Discover",
      description: "A comprehensive 26-lesson journey through Bible foundations and prophecy. Learn about God's love, salvation, and the amazing truths revealed in Scripture.",
      lessons: 26,
      duration: "13 weeks",
      level: "Beginner",
      color: "from-orange-500 to-amber-500"
    },
    ugunduzi: {
      title: "Ugunduzi",
      description: "Discover Swahili lessons covering 26 topics of faith and discovery. Perfect for Swahili-speaking learners in Kenya.",
      lessons: 26,
      duration: "13 weeks",
      level: "Beginner",
      color: "from-emerald-500 to-teal-500"
    },
    "daniel-revelation": {
      title: "Daniel & Revelation",
      description: "Dive into the prophetic books with 21 in-depth lessons full of insight into God's plan for humanity.",
      lessons: 21,
      duration: "11 weeks",
      level: "Intermediate",
      color: "from-purple-500 to-indigo-500"
    },
    health: {
      title: "Health",
      description: "Learn about physical and spiritual wellness through 20 structured lessons on biblical health principles.",
      lessons: 20,
      duration: "10 weeks",
      level: "Beginner",
      color: "from-blue-500 to-cyan-500"
    },
    family: {
      title: "Focus on the Family",
      description: "Discover biblical principles for healthy, faith-filled family relationships through 16 practical lessons.",
      lessons: 16,
      duration: "8 weeks",
      level: "All Levels",
      color: "from-pink-500 to-rose-500"
    }
  };

  const course = courseData[courseId] || {
    title: courseId.replace("-", " "),
    description: "Course details coming soon.",
    lessons: 0,
    duration: "TBA",
    level: "TBA",
    color: "from-orange-500 to-amber-500"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50 flex flex-col">
      <Navbar />

      <div className="pt-28 px-6 flex-grow">
        <div className="max-w-5xl mx-auto">
          {/* Back Button */}
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold mb-8 group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            Back to Courses
          </Link>

          {/* Course Header Card */}
          <div className={`bg-gradient-to-r ${course.color} rounded-3xl shadow-2xl p-10 md:p-12 text-white mb-10`}>
            <div className="flex items-start justify-between mb-6">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
                <BookOpen size={40} />
              </div>
              <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold">
                {course.level}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-4">{course.title}</h1>
            <p className="text-lg md:text-xl text-white/90 leading-relaxed max-w-3xl">
              {course.description}
            </p>
          </div>

          {/* Course Info Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-orange-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <BookOpen size={24} className="text-orange-600" />
                </div>
                <h3 className="font-bold text-gray-700">Lessons</h3>
              </div>
              <p className="text-3xl font-black bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                {course.lessons}
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-orange-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <Clock size={24} className="text-orange-600" />
                </div>
                <h3 className="font-bold text-gray-700">Duration</h3>
              </div>
              <p className="text-3xl font-black bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                {course.duration}
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-orange-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <CheckCircle size={24} className="text-orange-600" />
                </div>
                <h3 className="font-bold text-gray-700">Completion</h3>
              </div>
              <p className="text-3xl font-black bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                0%
              </p>
            </div>
          </div>

          {/* Course Content Section */}
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10 border-2 border-orange-100">
            <h2 className="text-2xl font-black text-gray-900 mb-6">Course Overview</h2>
            <p className="text-gray-600 leading-relaxed mb-8">
              Welcome to the <strong>{course.title}</strong> course! This comprehensive program is designed to help you grow spiritually
              and gain a deeper understanding of God's Word. Each lesson builds on the previous one, creating a structured learning path
              that will enrich your faith journey.
            </p>

            {courseId === "discover" ? (
              <Link
                to={`/courses/${courseId}/lessons/1`}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white px-8 py-4 rounded-2xl hover:shadow-2xl transition-all duration-300 font-bold text-lg group"
              >
                <PlayCircle size={24} className="group-hover:scale-110 transition-transform" />
                Start Learning Now
              </Link>
            ) : (
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 flex items-center border-orange-200 rounded-2xl p-6">
                <p className="text-orange-700 font-semibold text-center">
                  📚 Lessons for this course will be available soon! Stay tuned.
                </p>

                <Link
                  to={`/courses/${courseId}/lessons/1`}
                  className="inline-flex mx-auto items-center gap-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white px-8 py-4 rounded-2xl hover:shadow-2xl transition-all duration-300 font-bold text-lg group"
                >
                  <PlayCircle size={24} className="group-hover:scale-110 transition-transform" />
                  Preview Lessons
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-10 text-gray-600 text-sm mt-16 border-t-2 border-orange-100 bg-white">
        <p className="font-semibold text-gray-700">
          © {new Date().getFullYear()} <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent font-bold">Voice Of Prophecy Virtual School</span>
        </p>
        <p className="mt-2 text-gray-500">
          Powered by{" "}
          <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent font-semibold">
            Kellzman Tech Ltd
          </span>
        </p>
      </footer>
    </div>
  );
}
