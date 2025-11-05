import { useState, useMemo, useEffect } from "react";
import { BarChart3, Users, Award, MapPin, Calendar, Download, TrendingUp, Filter, AlertCircle } from "lucide-react";
import { mockLearners, getLearnersByConference, getLearnersByChurch, getStatistics } from "../data/mockLearners";
import { getConferences, getStations, getDistricts, getChurches } from "../services/api";

export default function AdminDashboard() {
  const [selectedConference, setSelectedConference] = useState("all");
  const [selectedStation, setSelectedStation] = useState("all");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [selectedChurch, setSelectedChurch] = useState("all");
  
  const [conferences, setConferences] = useState([]);
  const [stations, setStations] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [churches, setChurches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [confData, statData, distData, churchData] = await Promise.all([
          getConferences(),
          getStations(),
          getDistricts(),
          getChurches()
        ]);
        setConferences(confData || []);
        setStations(statData || []);
        setDistricts(distData || []);
        setChurches(churchData || []);
      } catch (err) {
        console.error('Error fetching church hierarchy:', err);
        setError('Unable to connect to church database. Showing cached data.');
        setConferences([]);
        setStations([]);
        setDistricts([]);
        setChurches([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredLearners = useMemo(() => {
    if (selectedChurch !== "all") {
      return getLearnersByChurch(selectedChurch);
    } else if (selectedConference !== "all") {
      return getLearnersByConference(selectedConference);
    }
    return mockLearners;
  }, [selectedConference, selectedChurch]);

  const stats = getStatistics(filteredLearners);

  const ageDistribution = useMemo(() => {
    const ranges = [
      { label: "18-25", min: 18, max: 25, count: 0 },
      { label: "26-35", min: 26, max: 35, count: 0 },
      { label: "36-45", min: 36, max: 45, count: 0 },
      { label: "46+", min: 46, max: 100, count: 0 },
    ];
    
    filteredLearners.forEach(learner => {
      const range = ranges.find(r => learner.age >= r.min && learner.age <= r.max);
      if (range) range.count++;
    });
    
    return ranges;
  }, [filteredLearners]);

  const countyDistribution = useMemo(() => {
    const countyMap = {};
    filteredLearners.forEach(learner => {
      countyMap[learner.county] = (countyMap[learner.county] || 0) + 1;
    });
    
    return Object.entries(countyMap)
      .map(([county, count]) => ({ county, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [filteredLearners]);

  const conferenceDistribution = useMemo(() => {
    const confMap = {};
    filteredLearners.forEach(learner => {
      confMap[learner.conferenceName] = (confMap[learner.conferenceName] || 0) + 1;
    });
    
    return Object.entries(confMap)
      .map(([conference, count]) => ({ conference, count }))
      .sort((a, b) => b.count - a.count);
  }, [filteredLearners]);

  const genderDistribution = useMemo(() => {
    const male = filteredLearners.filter(l => l.gender === "Male").length;
    const female = filteredLearners.filter(l => l.gender === "Female").length;
    const total = filteredLearners.length || 1;
    return [
      { gender: "Male", count: male, percentage: Math.round((male / total) * 100) },
      { gender: "Female", count: female, percentage: Math.round((female / total) * 100) }
    ];
  }, [filteredLearners]);

  const availableStations = useMemo(() => {
    if (selectedConference === "all") return [];
    return stations.filter(s => s.conf_id === selectedConference && s.isactive === "1");
  }, [selectedConference, stations]);

  const availableDistricts = useMemo(() => {
    if (selectedStation === "all") return [];
    return districts.filter(d => d.station_id === selectedStation && d.isactive === "1");
  }, [selectedStation, districts]);

  const availableChurches = useMemo(() => {
    if (selectedDistrict === "all") return [];
    return churches.filter(c => c.district_id === selectedDistrict && c.isactive === "1");
  }, [selectedDistrict, churches]);

  const exportReport = () => {
    const level = selectedChurch !== "all" ? "Church" : 
                  selectedDistrict !== "all" ? "District" : 
                  selectedStation !== "all" ? "Station" : 
                  selectedConference !== "all" ? "Conference" : "National";
    
    const headers = ["Name", "Email", "Age", "Gender", "County", "Church", "Conference", "Course", "Progress", "Graduated", "Last Active"];
    const rows = filteredLearners.map(l => [
      l.fullName,
      l.email,
      l.age,
      l.gender,
      l.county,
      l.churchName,
      l.conferenceName,
      l.enrolledCourse,
      `${l.progress}%`,
      l.graduated ? "Yes" : "No",
      new Date(l.lastActive).toLocaleDateString()
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `VOP_Admin_${level}_Report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200 border-t-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-semibold text-lg">Loading Dashboard...</p>
          <p className="text-gray-500 text-sm mt-2">Fetching church hierarchy data</p>
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
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-orange-100 mt-1">Voice Of Prophecy Virtual School - National Administration</p>
              {error && (
                <div className="flex items-center gap-2 mt-2 bg-orange-500/30 backdrop-blur-sm px-3 py-2 rounded-lg">
                  <AlertCircle size={16} />
                  <p className="text-orange-100 text-sm">{error}</p>
                </div>
              )}
            </div>
            <button
              onClick={exportReport}
              className="flex items-center gap-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 px-6 py-3 rounded-xl transition-all font-semibold shadow-lg hover:shadow-xl"
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
              <Filter className="text-orange-600" size={24} />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-800">Hierarchical Filters</h2>
              <p className="text-sm text-gray-500">
                {conferences.length} Conferences · {stations.length} Stations · {districts.length} Districts · {churches.length} Churches
              </p>
            </div>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Conference</label>
              <select
                value={selectedConference}
                onChange={(e) => {
                  setSelectedConference(e.target.value);
                  setSelectedStation("all");
                  setSelectedDistrict("all");
                  setSelectedChurch("all");
                }}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all outline-none bg-white"
              >
                <option value="all">All Conferences</option>
                {conferences.filter(c => c.isactive !== "0").map(conf => (
                  <option key={conf.id} value={conf.id}>{conf.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Station</label>
              <select
                value={selectedStation}
                onChange={(e) => {
                  setSelectedStation(e.target.value);
                  setSelectedDistrict("all");
                  setSelectedChurch("all");
                }}
                disabled={selectedConference === "all"}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all outline-none disabled:bg-gray-100 disabled:cursor-not-allowed bg-white"
              >
                <option value="all">All Stations</option>
                {availableStations.map(station => (
                  <option key={station.id} value={station.id}>{station.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">District</label>
              <select
                value={selectedDistrict}
                onChange={(e) => {
                  setSelectedDistrict(e.target.value);
                  setSelectedChurch("all");
                }}
                disabled={selectedStation === "all"}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all outline-none disabled:bg-gray-100 disabled:cursor-not-allowed bg-white"
              >
                <option value="all">All Districts</option>
                {availableDistricts.map(district => (
                  <option key={district.id} value={district.id}>{district.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Church</label>
              <select
                value={selectedChurch}
                onChange={(e) => setSelectedChurch(e.target.value)}
                disabled={selectedDistrict === "all"}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all outline-none disabled:bg-gray-100 disabled:cursor-not-allowed bg-white"
              >
                <option value="all">All Churches</option>
                {availableChurches.map(church => (
                  <option key={church.id} value={church.id}>{church.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

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
                <p className="text-xs text-gray-500 mt-1">{stats.total > 0 ? Math.round((stats.active/stats.total)*100) : 0}% active</p>
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
                <BarChart3 className="text-purple-600" size={32} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-orange-100 to-amber-100 rounded-lg">
                <Calendar className="text-orange-600" size={24} />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Age Distribution</h2>
            </div>
            <div className="space-y-4">
              {ageDistribution.map((range, idx) => {
                const percentage = stats.total > 0 ? Math.round((range.count / stats.total) * 100) : 0;
                return (
                  <div key={idx}>
                    <div className="flex justify-between text-sm font-medium mb-2">
                      <span className="text-gray-700">{range.label} years</span>
                      <span className="text-gray-600">{range.count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-amber-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-orange-100 to-amber-100 rounded-lg">
                <Users className="text-orange-600" size={24} />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Gender Distribution</h2>
            </div>
            <div className="space-y-6">
              {genderDistribution.map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-sm font-medium mb-2">
                    <span className="text-gray-700">{item.gender}</span>
                    <span className="text-gray-600">{item.count} ({item.percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        item.gender === "Male"
                          ? "bg-gradient-to-r from-blue-500 to-cyan-500"
                          : "bg-gradient-to-r from-pink-500 to-purple-500"
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-orange-100 to-amber-100 rounded-lg">
              <MapPin className="text-orange-600" size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Top 10 Counties by Enrollment</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {countyDistribution.map((item, idx) => {
              const percentage = stats.total > 0 ? Math.round((item.count / stats.total) * 100) : 0;
              return (
                <div key={idx} className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border-2 border-orange-200 hover:border-orange-400 transition-all">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-gray-800 text-lg">#{idx + 1} {item.county}</span>
                    <span className="text-orange-600 font-bold text-lg">{item.count}</span>
                  </div>
                  <div className="w-full bg-orange-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-orange-500 to-amber-500 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(percentage * 2, 100)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-orange-100 to-amber-100 rounded-lg">
              <BarChart3 className="text-orange-600" size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Conference Distribution</h2>
          </div>
          <div className="space-y-4">
            {conferenceDistribution.map((item, idx) => {
              const percentage = stats.total > 0 ? Math.round((item.count / stats.total) * 100) : 0;
              return (
                <div key={idx}>
                  <div className="flex justify-between text-sm font-medium mb-2">
                    <span className="text-gray-700 font-semibold">{item.conference}</span>
                    <span className="text-gray-600">{item.count} learners ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-orange-500 to-amber-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}