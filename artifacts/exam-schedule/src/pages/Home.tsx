import { useState, useRef } from "react";
import examData from "@/examData.json";
import { Search, BookOpen, Clock, MapPin, Calendar, GraduationCap, X, AlertCircle } from "lucide-react";

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

function getDayColor(day: string): string {
  return DAY_COLORS[getWeekday(day)] || "bg-zinc-900/60 border-zinc-700/50 text-zinc-300";
}

function getDayBadgeColor(day: string): string {
  return DAY_BADGE_COLORS[getWeekday(day)] || "bg-zinc-800/80 text-zinc-300";
}

function getDayAccent(day: string): string {
  return DAY_ACCENT[getWeekday(day)] || "text-zinc-400";
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
    setResults(data[sid] ?? null);
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
                              <span className="text-sm font-semibold text-zinc-200">{exam.time}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 bg-zinc-800/60 rounded-xl px-3.5 py-2.5 border border-zinc-700/50">
                          <MapPin className={`w-4 h-4 shrink-0 ${getDayAccent(exam.day)}`} />
                          <span className="text-sm text-zinc-400">
                            Room{" "}
                            <span className="font-semibold text-zinc-200">{exam.room}</span>
                          </span>
                        </div>
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
      </div>
    </div>
  );
}
