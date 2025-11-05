import { useState, useMemo, useEffect } from "react";
import { Users, Award, TrendingUp, BookOpen, Search, Download, Filter, AlertCircle, Building2 } from "lucide-react";
import { getLearnersByChurch, getStatistics } from "../data/mockLearners";
import { getChurches } from "../services/api";

export default function InstructorDashboard() {
  const [selectedChurch, setSelectedChurch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const [churches, setChurches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChurches = async () => {
      try {
        setLoading(true);
        setError(null);
        const churchData = await getChurches();
        const activeChurches = (churchData || []).filter(c => c.isactive === "1");
        setChurches(activeChurches);
        
        if (activeChurches.length > 0) {
          setSelectedChurch(activeChurches[0].id);
        }
      } catch (err) {
        console.error('Error fetching churches:', err);
        setError('Unable to connect to church database. Please try again.');
        setChurches([]);
      } finally {
        setLoading(false);
      }
    };

    fetchChurches();
  }, []);

  const churchLearners = useMemo(() => {
    if (!selectedChurch) return [];
    return getLearnersByChurch(selectedChurch);
  }, [selectedChurch]);

  const filteredLearners = useMemo(() => {
    let filtered = churchLearners;

    if (searchQuery) {
      filtered = filtered.filter(
        (l) =>
          l.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter === "active") {
      filtered = filtered.filter((l) => !l.graduated && l.progress > 0);
    } else if (statusFilter === "graduated") {
      filtered = filtered.filter((l) => l.graduated);
    } else if (statusFilter === "inactive") {
      filtered = filtered.filter((l) => !l.graduated && l.progress === 0);
    }

    return filtered;
  }, [churchLearners, searchQuery, statusFilter]);

  const stats = getStatistics(churchLearners);

  const courseBreakdown = useMemo(() => {
    const courses = ["Discover", "Believe", "Guides"];
    return courses.map((course) => {
      const enrolled = churchLearners.filter((l) => l.enrolledCourse === course);
      const graduated = enrolled.filter((l) => l.graduated);
      const avgProgress = enrolled.length > 0
        ? Math.round(enrolled.reduce((sum, l) => sum + l.progress, 0) / enrolled.length)
        : 0;

      return {
        name: course,
        enrolled: enrolled.length,
        graduated: graduated.length,
        avgProgress,
      };
    });
  }, [churchLearners]);

  const getStatusBadge = (learner) => {
    if (learner.graduated) {
      return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Graduated</span>;
    }
    if (learner.progress > 0) {
      return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">Active</span>;
    }
    return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">Inactive</span>;
  };

  const exportReport = () => {
    const selectedChurchData = churches.find(c => c.id === selectedChurch);
    const churchName = selectedChurchData ? selectedChurchData.name.replace(/\s+/g, '_') : 'Church';
    
    const headers = ["Name", "Email", "Age", "Gender", "Course", "Progress", "Score", "Status", "Last Active"];
    const rows = filteredLearners.map((l) => [
      l.fullName,
      l.email,
      l.age,
      l.gender,
      l.enrolledCourse,
      `${l.progress}%`,
      `${l.currentScore}%`,
      l.graduated ? "Graduated" : l.progress > 0 ? "Active" : "Inactive",
      new Date(l.lastActive).toLocaleDateString(),
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Instructor_${churchName}_Report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200 border-t-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-semibold text-lg">Loading Dashboard...</p>
          <p className="text-gray-500 text-sm mt-2">Preparing your church data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-white pb-12">
      <header className="bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold">Instructor Dashboard</h1>
              <p className="text-orange-100 mt-1">Voice Of Prophecy Virtual School - Church Management</p>
              {error && (
                <div className="flex items-center gap-2 mt-2 bg-orange-500/30 backdrop-blur-sm px-3 py-2 rounded-lg">
                  <AlertCircle size={16} />
                  <p className="text-orange-100 text-sm">{error}</p>
                </div>
              )}
            </div>
            <button
              onClick={exportReport}
              disabled={!selectedChurch || filteredLearners.length === 0}
              className="flex items-center gap-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 px-6 py-3 rounded-xl transition-all font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={20} />
              Export CSV
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="bg-white rounded-2xl shadow-xl border border-orange-100 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-gradient-to-br from-orange-100 to-amber-100 rounded-lg">
              <Building2 className="text-orange-600" size={24} />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-800">Church Assignment</h2>
              <p className="text-sm text-gray-500">
                {churches.length} {churches.length === 1 ? 'church' : 'churches'} available
              </p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Church to Manage
            </label>
            <select
              value={selectedChurch}
              onChange={(e) => setSelectedChurch(e.target.value)}
              className="w-full md:w-1/2 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all outline-none bg-white"
            >
              <option value="">-- Select a Church --</option>
              {churches.map((church) => (
                <option key={church.id} value={church.id}>
                  {church.name} ({church.church_code})
                </option>
              ))}
            </select>
            {selectedChurch && (
              <p className="mt-3 text-sm text-gray-600 bg-orange-50 px-4 py-2 rounded-lg inline-block">
                Currently managing: <span className="font-bold text-orange-600">
                  {churches.find(c => c.id === selectedChurch)?.name}
                </span>
              </p>
            )}
          </div>
        </div>

        {selectedChurch && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl shadow-lg border-2 border-orange-200 p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium mb-1">Total Learners</p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                      {stats.total}
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl flex items-center justify-center">
                    <Users className="text-orange-600" size={32} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border-2 border-green-200 p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium mb-1">Graduated</p>
                    <p className="text-4xl font-bold text-green-600">{stats.graduated}</p>
                    <p className="text-xs text-gray-500 mt-1">{stats.graduationRate}% completion</p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center">
                    <Award className="text-green-600" size={32} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-200 p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium mb-1">Active Learners</p>
                    <p className="text-4xl font-bold text-blue-600">{stats.active}</p>
                    <p className="text-xs text-gray-500 mt-1">Currently studying</p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center">
                    <TrendingUp className="text-blue-600" size={32} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border-2 border-purple-200 p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium mb-1">Avg Progress</p>
                    <p className="text-4xl font-bold text-purple-600">{stats.avgProgress}%</p>
                    <p className="text-xs text-gray-500 mt-1">Avg score: {stats.avgScore}%</p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center">
                    <BookOpen className="text-purple-600" size={32} />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-orange-100 to-amber-100 rounded-lg">
                  <BookOpen className="text-orange-600" size={24} />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Course Breakdown</h2>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {courseBreakdown.map((course, idx) => (
                  <div key={idx} className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border-2 border-orange-200 hover:border-orange-400 transition-all">
                    <h3 className="font-bold text-gray-800 text-xl mb-4">{course.name}</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 font-medium">Enrolled:</span>
                        <span className="font-bold text-gray-800">{course.enrolled}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 font-medium">Graduated:</span>
                        <span className="font-bold text-green-600">{course.graduated}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 font-medium">Avg Progress:</span>
                        <span className="font-bold text-orange-600">{course.avgProgress}%</span>
                      </div>
                      <div className="w-full bg-orange-200 rounded-full h-2.5 mt-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-orange-500 to-amber-500 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${course.avgProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-orange-100 to-amber-100 rounded-lg">
                  <Users className="text-orange-600" size={24} />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Student Management</h2>
              </div>

              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all outline-none"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="text-gray-400" size={20} />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all outline-none bg-white"
                  >
                    <option value="all">All Students</option>
                    <option value="active">Active Only</option>
                    <option value="graduated">Graduated Only</option>
                    <option value="inactive">Inactive Only</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200 bg-gray-50">
                      <th className="text-left py-4 px-4 font-bold text-gray-700">Student</th>
                      <th className="text-left py-4 px-4 font-bold text-gray-700">Contact</th>
                      <th className="text-left py-4 px-4 font-bold text-gray-700">Course</th>
                      <th className="text-left py-4 px-4 font-bold text-gray-700">Progress</th>
                      <th className="text-left py-4 px-4 font-bold text-gray-700">Status</th>
                      <th className="text-left py-4 px-4 font-bold text-gray-700">Last Active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLearners.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-12 text-gray-500">
                          {searchQuery || statusFilter !== "all"
                            ? "No students match your search criteria"
                            : "No students enrolled in this church yet"}
                        </td>
                      </tr>
                    ) : (
                      filteredLearners.map((learner) => (
                        <tr key={learner.id} className="border-b border-gray-100 hover:bg-orange-50 transition-colors">
                          <td className="py-4 px-4">
                            <p className="font-bold text-gray-800">{learner.fullName}</p>
                            <p className="text-xs text-gray-500">{learner.age} years • {learner.gender}</p>
                          </td>
                          <td className="py-4 px-4 text-gray-600 text-sm">{learner.email}</td>
                          <td className="py-4 px-4">
                            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">
                              {learner.enrolledCourse}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 bg-gray-200 rounded-full h-2.5 min-w-[100px] overflow-hidden">
                                <div
                                  className="bg-gradient-to-r from-orange-500 to-amber-500 h-2.5 rounded-full transition-all duration-500"
                                  style={{ width: `${learner.progress}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-bold text-gray-700 min-w-[45px]">
                                {learner.progress}%
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4">{getStatusBadge(learner)}</td>
                          <td className="py-4 px-4 text-gray-600 text-sm">
                            {new Date(learner.lastActive).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 pt-4 border-t-2 border-gray-200">
                <p className="text-sm text-gray-600">
                  Showing <span className="font-bold text-orange-600">{filteredLearners.length}</span> of{" "}
                  <span className="font-bold text-gray-800">{churchLearners.length}</span> students
                </p>
              </div>
            </div>
          </>
        )}

        {!selectedChurch && !loading && (
          <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-12 text-center">
            <div className="p-4 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
              <Building2 className="text-orange-600" size={48} />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Select Your Church</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Choose your assigned church from the dropdown above to view student enrollment, track progress, and manage learners.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}