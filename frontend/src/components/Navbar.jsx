import { Link, useLocation } from "react-router-dom";
import { useAuth, useClerk } from "@clerk/clerk-react";

const logo = process.env.PUBLIC_URL + "/voplogo1.webp"; // ✅ pulls from public folder

export default function Navbar() {
  const { isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const location = useLocation();

  const publicLinks = [
    { name: "Home", path: "/" },
    { name: "Login", path: "/login" },
    { name: "Sign Up", path: "/register" },
  ];

  const privateLinks = [
    { name: "Dashboard", path: "/dashboard/learner" },
    { name: "Courses", path: "/courses" },
    { name: "Feedback", path: "/feedback" },
    { name: "Profile", path: "/onboarding" },
  ];

  const links = isSignedIn ? privateLinks : publicLinks;

  return (
    <nav className="bg-white/95 backdrop-blur-lg shadow-lg fixed top-0 w-full z-50 border-b border-orange-100">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
            <img src={logo} alt="Voice Of Prophecy Virtual School Logo" className="relative h-12 w-auto transform transition-transform duration-300 group-hover:scale-105" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              Voice Of Prophecy
            </span>
            <span className="text-xs font-semibold text-gray-600 -mt-1">Virtual School</span>
          </div>
        </Link>

        {/* Links */}
        <div className="flex items-center space-x-8">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`font-semibold transition-all duration-200 relative group ${
                location.pathname === link.path
                  ? "text-orange-600"
                  : "text-gray-700 hover:text-orange-600"
              }`}
            >
              {link.name}
              <span className={`absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-orange-500 to-amber-500 transform origin-left transition-transform duration-200 ${
                location.pathname === link.path ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
              }`}></span>
            </Link>
          ))}

          {/* Sign Out */}
          {isSignedIn && (
            <button
              onClick={() => signOut({ redirectUrl: "/" })}
              className="bg-gradient-to-r from-orange-600 to-amber-600 text-white px-6 py-2.5 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 font-semibold"
            >
              Sign Out
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
