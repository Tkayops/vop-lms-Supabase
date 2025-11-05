// src/pages/Onboarding.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { upsertUser } from "../services/db";
import { User, Church, CheckCircle2, ArrowRight, ArrowLeft, Search, Mail, Phone, MapPin, Calendar, Heart } from "lucide-react";
import logo from "../assets/voplogo1.webp";

export default function Onboarding() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.primaryEmailAddress?.emailAddress || "");
  const [phone, setPhone] = useState(user?.primaryPhoneNumber?.phoneNumber || "");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [isAdventist, setIsAdventist] = useState(null);
  const [query, setQuery] = useState("");
  const [selectedChurch, setSelectedChurch] = useState(null);

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // temporary local list; you’ll swap this with your hierarchy API when ready
  const dummyChurches = useMemo(
    () => [
      { id: "1", name: "NAIRUTIA", district: "JUJA", station: "Central Nairobi", conference: "CKC" },
      { id: "2", name: "GACHORORO", district: "JUJA", station: "Central Nairobi", conference: "CKC" },
      { id: "3", name: "ST. MARY'S", district: "THIKA", station: "Thika", conference: "CKC" },
      { id: "4", name: "EKUC CENTRAL", district: "NAIROBI", station: "Central Nairobi", conference: "EKUC" },
      { id: "5", name: "GITHUNGURI", district: "GITHUNGURI", station: "Kiambu", conference: "CKC" },
      { id: "6", name: "KAREN SDA", district: "NAIROBI", station: "Central Nairobi", conference: "EKUC" },
      { id: "7", name: "KISII CENTRAL", district: "KISII", station: "Kisii", conference: "KNC" },
      { id: "8", name: "NAIROBI WEST", district: "NAIROBI WEST", station: "Central Nairobi", conference: "EKUC" },
      { id: "9", name: "GACHIE", district: "KIAMBU", station: "Kiambu", conference: "CKC" },
    ],
    []
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return dummyChurches;
    return dummyChurches.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.district.toLowerCase().includes(q) ||
        c.station.toLowerCase().includes(q) ||
        c.conference.toLowerCase().includes(q)
    );
  }, [query, dummyChurches]);

  const next = () => setStep((s) => Math.min(3, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  async function handleFinish() {
    try {
      setError("");
      setSaving(true);
      if (!user) throw new Error("Not signed in.");
      if (!fullName || !email) throw new Error("Full name and email are required.");
      const churchId = selectedChurch?.id || null;

      await upsertUser({
        clerkId: user.id,
        fullName,
        email,
        gender: isAdventist === null ? null : isAdventist ? "adventist" : "non-adventist",
        dob: dateOfBirth || null,
        churchId,
        roleId: 1, // learner
      });

      localStorage.setItem("hasOnboarded", "true");
      setSuccess(true);

      // small delay for UX then go to dashboard
      setTimeout(() => navigate("/dashboard/learner"), 800);
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header / branding kept from your original */}
      <header className="flex items-center gap-3 p-4 border-b bg-white/70 backdrop-blur">
        <img alt="VOP" src={logo} className="w-10 h-10 rounded-lg" />
        <div>
          <h1 className="text-xl font-bold">Voice Of Prophecy Virtual School</h1>
          <p className="text-sm text-gray-600">Let’s personalize your experience</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-6">
        {/* Steps */}
        <div className="flex items-center gap-2 text-sm mb-6">
          <Step now={step >= 1} label="Personal" icon={<User size={16} />} />
          <Divider />
          <Step now={step >= 2} label="Church" icon={<Church size={16} />} />
          <Divider />
          <Step now={step >= 3} label="Confirm" icon={<CheckCircle2 size={16} />} />
        </div>

        {/* Step 1: Personal */}
        {step === 1 && (
          <section className="bg-white border rounded-2xl p-5 space-y-4">
            <Field label="Full Name" icon={<User size={16} />}>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="input" placeholder="e.g., Jane Doe" />
            </Field>
            <Field label="Email" icon={<Mail size={16} />}>
              <input value={email} onChange={(e) => setEmail(e.target.value)} className="input" type="email" placeholder="you@example.com" />
            </Field>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Phone" icon={<Phone size={16} />}>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input" placeholder="+254 7XX XXX XXX" />
              </Field>
              <Field label="Date of Birth" icon={<Calendar size={16} />}>
                <input value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className="input" type="date" />
              </Field>
            </div>
            <Field label="Are you Adventist?" icon={<Heart size={16} />}>
              <div className="flex gap-3">
                <button onClick={() => setIsAdventist(true)} className={`chip ${isAdventist === true ? "chip-active" : ""}`}>Yes</button>
                <button onClick={() => setIsAdventist(false)} className={`chip ${isAdventist === false ? "chip-active" : ""}`}>No</button>
              </div>
            </Field>
          </section>
        )}

        {/* Step 2: Church */}
        {step === 2 && (
          <section className="bg-white border rounded-2xl p-5 space-y-4">
            <Field label="Find your church" icon={<Search size={16} />}>
              <input value={query} onChange={(e) => setQuery(e.target.value)} className="input" placeholder="Type name, district, station, or conference" />
            </Field>
            <div className="border rounded-xl max-h-72 overflow-auto divide-y">
              {filtered.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedChurch(c)}
                  className={`w-full text-left p-3 hover:bg-orange-50 ${selectedChurch?.id === c.id ? "bg-orange-100" : ""}`}
                >
                  <div className="font-medium">{c.name}</div>
                  <div className="text-sm text-gray-600 flex gap-3">
                    <span className="flex items-center gap-1"><MapPin size={14} />{c.district}</span>
                    <span>{c.station}</span>
                    <span>{c.conference}</span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <section className="bg-white border rounded-2xl p-5 space-y-4">
            <Summary label="Full Name" value={fullName} />
            <Summary label="Email" value={email} />
            <Summary label="Phone" value={phone || "—"} />
            <Summary label="DOB" value={dateOfBirth || "—"} />
            <Summary label="Adventist" value={isAdventist === null ? "—" : isAdventist ? "Yes" : "No"} />
            <Summary label="Church" value={selectedChurch ? `${selectedChurch.name} (${selectedChurch.district})` : "—"} />
          </section>
        )}

        {/* Actions */}
        {error && <p className="text-red-600 mt-3">{error}</p>}
        <div className="mt-6 flex items-center justify-between">
          <button onClick={back} disabled={step === 1} className="btn-secondary"><ArrowLeft size={16} />Back</button>
          {step < 3 ? (
            <button onClick={next} className="btn-primary">Next<ArrowRight size={16} /></button>
          ) : (
            <button onClick={handleFinish} disabled={saving} className="btn-primary">
              {saving ? "Saving..." : success ? "Saved!" : "Finish"} <CheckCircle2 size={16} />
            </button>
          )}
        </div>
      </main>

      <style>{`
        .input { width:100%; border:1px solid #e5e7eb; border-radius:0.75rem; padding:0.75rem; outline:none }
        .chip { border:1px solid #e5e7eb; border-radius:999px; padding:0.4rem 0.9rem; }
        .chip-active { background:#ffedd5; border-color:#fb923c; }
        .btn-primary { display:flex; align-items:center; gap:8px; background:#ea580c; color:#fff; padding:0.6rem 1rem; border-radius:0.75rem; }
        .btn-secondary { display:flex; align-items:center; gap:8px; border:1px solid #e5e7eb; padding:0.6rem 1rem; border-radius:0.75rem; }
      `}</style>
    </div>
  );
}

function Field({ label, icon, children }) {
  return (
    <div className="space-y-1">
      <label className="text-sm text-gray-700 flex items-center gap-2">{icon}{label}</label>
      {children}
    </div>
  );
}
function Summary({ label, value }) {
  return <div className="flex items-center justify-between"><span className="text-gray-500">{label}</span><span className="font-medium">{value}</span></div>;
}
function Step({ now, label, icon }) {
  return <div className={`flex items-center gap-2 ${now ? "text-orange-600" : "text-gray-400"}`}>{icon}<span>{label}</span></div>;
}
function Divider() { return <div className="h-px flex-1 bg-gray-200" />; }
