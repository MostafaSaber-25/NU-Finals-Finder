import { useState, useRef, useEffect } from "react";
import examData from "@/examData.json";
import {
  Search, BookOpen, Clock, MapPin, Calendar,
  GraduationCap, X, AlertCircle, TriangleAlert,
  CalendarPlus, Timer,
} from "lucide-react";

type ExamEntry = {
  subject: string;
  day: string;
  time: string;
  room: string;
  program: string;
};

type ExamIndex = Record<string, ExamEntry[]>;

const data = examData as ExamIndex;

const DAY_COLORS: Record<string, string> = {
  "Monday":    "bg-blue-950/60 border-blue-800/50 text-blue-300",
  "Tuesday":   "bg-violet-950/60 border-violet-800/50 text-violet-300",
  "Wednesday": "bg-emerald-950/60 border-emerald-800/50 text-emerald-300",
  "Thursday":  "bg-amber-950/60 border-amber-800/50 text-amber-300",
  "Friday":    "bg-rose-950/60 border-rose-800/50 text-rose-300",
  "Saturday":  "bg-cyan-950/60 border-cyan-800/50 text-cyan-300",
  "Sunday":    "bg-orange-950/60 border-orange-800/50 text-orange-300",
};

const DAY_BADGE_COLORS: Record<string, string> = {
  "Monday":    "bg-blue-900/80 text-blue-300",
  "Tuesday":   "bg-violet-900/80 text-violet-300",
  "Wednesday": "bg-emerald-900/80 text-emerald-300",
  "Thursday":  "bg-amber-900/80 text-amber-300",
  "Friday":    "bg-rose-900/80 text-rose-300",
  "Saturday":  "bg-cyan-900/80 text-cyan-300",
  "Sunday":    "bg-orange-900/80 text-orange-300",
};

const DAY_ACCENT: Record<string, string> = {
  "Monday":    "text-blue-400",
  "Tuesday":   "text-violet-400",
  "Wednesday": "text-emerald-400",
  "Thursday":  "text-amber-400",
  "Friday":    "text-rose-400",
  "Saturday":  "text-cyan-400",
  "Sunday":    "text-orange-400",
};

function getWeekday(day: string) {
  return day.split(",")[0];
}

function parseExamDate(day: string, time?: string): Date {
  const datePart = day.replace(/^[^,]+,\s*/, "");
  const d = new Date(datePart);
  if (time) {
    const [h, m] = time.split("-")[0].trim().split(":").map(Number);
    d.setHours(h, m, 0, 0);
  }
  return d;
}

function sortByDate(exams: ExamEntry[]): ExamEntry[] {
  return [...exams].sort((a, b) => {
    const diff = parseExamDate(a.day).getTime() - parseExamDate(b.day).getTime();
    if (diff !== 0) return diff;
    return a.time.localeCompare(b.time);
  });
}

function to12Hour(time24: string): string {
  return time24.split("-").map(t => {
    const [h, m] = t.trim().split(":").map(Number);
    const suffix = h >= 12 ? "PM" : "AM";
    const hour = h % 12 || 12;
    return `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
  }).join(" – ");
}

function toGCalDate(day: string, time: string): string {
  const datePart = day.replace(/^[^,]+,\s*/, "");
  const d = new Date(datePart);
  const [startRaw, endRaw] = time.split("-");
  function fmt(base: Date, t: string) {
    const [h, m] = t.trim().split(":").map(Number);
    const dt = new Date(base);
    dt.setHours(h, m, 0, 0);
    return dt.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  }
  return `${fmt(d, startRaw)}/${fmt(d, endRaw)}`;
}

function buildGCalUrl(exam: ExamEntry): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${exam.subject} Final Exam`,
    dates: toGCalDate(exam.day, exam.time),
    location: `Room ${exam.room}, Nile University`,
    details: `${exam.program} — ${exam.subject} Final Examination`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function getDayColor(day: string): string {
  return DAY_COLORS[getWeekday(day)] || "bg-zinc-900/60 border-zinc-700/50 text-zinc-300";
}

function getDayBadgeColor(day: string): string {
  return DAY_BADGE_COLORS[getWeekday(day)] || "bg-zinc-800/80 text-zinc-300";
}

function getDayAccent(day: string): string {
  return DAY_ACCENT[getWeekday(day)] || "text-zinc-400";
}

function useCountdown(targetDate: Date | null) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    if (!targetDate) return;
    function update() {
      const diff = targetDate!.getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ days, hours, minutes, seconds });
    }
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return timeLeft;
}

function CountdownBanner({ firstExam }: { firstExam: ExamEntry }) {
  const target = parseExamDate(firstExam.day, firstExam.time);
  const timeLeft = useCountdown(target);
  if (!timeLeft) return null;

  const isPast = target.getTime() <= Date.now();

  return (
    <div className="bg-gradient-to-r from-blue-950/80 to-violet-950/80 border border-blue-800/50 rounded-2xl p-5 mb-5">
      <div className="flex items-center gap-2 mb-3">
        <Timer className="w-4 h-4 text-blue-400" />
        <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">
          {isPast ? "First Exam Has Started" : "Time Until First Exam"}
        </span>
        <span className="ml-auto text-xs text-zinc-500 font-mono">{firstExam.subject}</span>
      </div>
      {isPast ? (
        <p className="text-zinc-300 text-sm">Your first exam has already begun. Good luck!</p>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Days", value: timeLeft.days },
            { label: "Hours", value: timeLeft.hours },
            { label: "Minutes", value: timeLeft.minutes },
            { label: "Seconds", value: timeLeft.seconds },
          ].map(({ label, value }) => (
            <div key={label} className="bg-zinc-900/80 rounded-xl py-3 text-center border border-zinc-700/40">
              <div className="text-2xl font-bold text-zinc-100 font-mono tabular-nums">
                {String(value).padStart(2, "0")}
              </div>
              <div className="text-xs text-zinc-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProfileCard() {
  return (
    <div className="mt-12 mb-4 flex justify-center">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-8 py-6 text-center w-full max-w-xs shadow-xl shadow-black/40">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center mx-auto mb-3 text-white font-bold text-xl shadow-lg shadow-blue-900/40">
          MS
        </div>
        <h3 className="text-lg font-bold text-zinc-100">Mostafa Saber</h3>
        <p className="text-sm text-zinc-500 mb-4">Software Developer</p>
        <div className="flex gap-3 justify-center">
          <a
            href="https://www.linkedin.com/in/mostafa-mohamed-965343390/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0a66c2] hover:bg-[#0958a8] text-white text-xs font-medium transition-colors shadow-md"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            LinkedIn
          </a>
          <a
            href="https://github.com/MostafaSaber-25"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white text-xs font-medium transition-colors shadow-md"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
            </svg>
            GitHub
          </a>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState<ExamEntry[] | null>(null);
  const [studentId, setStudentId] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSearch(id?: string) {
    const sid = (id ?? query).trim();
    if (!sid) return;
    setSearched(true);
    setStudentId(sid);
    const found = data[sid];
    setResults(found ? sortByDate(found) : null);
  }

  function handleClear() {
    setQuery("");
    setSearched(false);
    setResults(null);
    setStudentId("");
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSearch();
  }

  const totalExams = results?.length ?? 0;
  const firstExam = results?.[0] ?? null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <div className="bg-zinc-900/90 backdrop-blur-sm border-b border-zinc-800 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/40">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-zinc-100 leading-tight">Exam Schedule</h1>
            <p className="text-xs text-zinc-500">Spring 2026 Final Exams</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Hero */}
        {!searched && (
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 shadow-lg shadow-blue-900/50 mb-5">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-zinc-100 mb-2">Find Your Exam Schedule</h2>
            <p className="text-zinc-400 text-base max-w-md mx-auto">
              Enter your student ID to see all your final exams, their dates, times, and room assignments.
            </p>
          </div>
        )}

        {/* Notice */}
        <div className="flex items-start gap-3 bg-amber-950/40 border border-amber-800/50 rounded-xl px-4 py-3 mb-4">
          <TriangleAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-300/90 leading-relaxed">
            <span className="font-semibold text-amber-300">Important:</span> Always cross-check your exam results with the original official exam schedule file to make sure everything is correct.
          </p>
        </div>

        {/* Search */}
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4 mb-6 shadow-xl shadow-black/30">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter your Student ID (e.g. 231001234)"
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-100 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              />
              {query && (
                <button
                  onClick={handleClear}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => handleSearch()}
              disabled={!query.trim()}
              className="px-5 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors shadow-lg shadow-blue-900/30"
            >
              Search
            </button>
          </div>
        </div>

        {/* Results */}
        {searched && (
          <div>
            {results === null ? (
              <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-10 text-center">
                <div className="w-14 h-14 rounded-full bg-red-950/60 border border-red-900/40 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-7 h-7 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-200 mb-1">Student ID Not Found</h3>
                <p className="text-zinc-500 text-sm mb-4">
                  No exams found for ID{" "}
                  <span className="font-mono font-semibold text-zinc-300">{studentId}</span>.
                  Please double-check your student ID and try again.
                </p>
                <button
                  onClick={handleClear}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                >
                  Try another ID
                </button>
              </div>
            ) : (
              <>
                {/* Countdown Banner */}
                {firstExam && <CountdownBanner firstExam={firstExam} />}

                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4 text-center">
                    <div className="text-2xl font-bold text-blue-400 mb-0.5">{totalExams}</div>
                    <div className="text-xs text-zinc-500 font-medium">Total Exams</div>
                  </div>
                  <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4 text-center">
                    <div className="text-2xl font-bold text-emerald-400 mb-0.5">
                      {new Set(results.map(e => e.day)).size}
                    </div>
                    <div className="text-xs text-zinc-500 font-medium">Exam Days</div>
                  </div>
                  <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4 text-center">
                    <div className="text-2xl font-bold text-violet-400 mb-0.5">
                      {new Set(results.map(e => e.room)).size}
                    </div>
                    <div className="text-xs text-zinc-500 font-medium">Rooms</div>
                  </div>
                </div>

                {/* Student ID badge */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm text-zinc-500">Results for</span>
                  <span className="font-mono text-sm font-semibold bg-blue-950/60 text-blue-300 px-2.5 py-0.5 rounded-md border border-blue-900/50">
                    {studentId}
                  </span>
                  <button
                    onClick={handleClear}
                    className="ml-auto text-xs text-zinc-600 hover:text-zinc-400 transition-colors flex items-center gap-1"
                  >
                    <X className="w-3 h-3" /> Clear
                  </button>
                </div>

                {/* Exam Cards */}
                <div className="space-y-3">
                  {results.map((exam, i) => (
                    <div
                      key={i}
                      className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden hover:border-zinc-700 transition-colors"
                    >
                      <div className={`px-5 py-2.5 border-b flex items-center justify-between ${getDayColor(exam.day)}`}>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 opacity-70" />
                          <span className="text-sm font-semibold">{exam.day}</span>
                        </div>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${getDayBadgeColor(exam.day)}`}>
                          Exam {i + 1}
                        </span>
                      </div>
                      <div className="px-5 py-4">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div>
                            <h3 className="text-lg font-bold text-zinc-100">{exam.subject}</h3>
                            <span className="text-xs text-zinc-500">{exam.program}</span>
                          </div>
                          <div className="text-right shrink-0">
                            <div className={`flex items-center gap-1.5 justify-end ${getDayAccent(exam.day)}`}>
                              <Clock className="w-4 h-4" />
                              <span className="text-sm font-semibold text-zinc-200">{to12Hour(exam.time)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 bg-zinc-800/60 rounded-xl px-3.5 py-2.5 border border-zinc-700/50 mb-3">
                          <MapPin className={`w-4 h-4 shrink-0 ${getDayAccent(exam.day)}`} />
                          <span className="text-sm text-zinc-400">
                            Room{" "}
                            <span className="font-semibold text-zinc-200">{exam.room}</span>
                            <span className="text-zinc-600 mx-1">·</span>
                            <span className="text-zinc-500">Nile University</span>
                          </span>
                        </div>
                        <a
                          href={buildGCalUrl(exam)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 text-zinc-300 hover:text-zinc-100 text-xs font-medium transition-all group"
                        >
                          <CalendarPlus className="w-3.5 h-3.5 text-blue-400 group-hover:text-blue-300 transition-colors" />
                          Add to Google Calendar
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Empty state hint */}
        {!searched && (
          <div className="text-center mt-8">
            <p className="text-xs text-zinc-700">
              Spring 2026 · {Object.keys(data).length.toLocaleString()} students ·{" "}
              {Object.values(data).reduce((sum, exams) => sum + exams.length, 0).toLocaleString()} exam records
            </p>
          </div>
        )}

        {/* Developer Profile Card */}
        <ProfileCard />
      </div>
    </div>
  );
}
