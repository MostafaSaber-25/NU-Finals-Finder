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
  "Monday": "bg-blue-50 border-blue-200 text-blue-800",
  "Tuesday": "bg-violet-50 border-violet-200 text-violet-800",
  "Wednesday": "bg-emerald-50 border-emerald-200 text-emerald-800",
  "Thursday": "bg-amber-50 border-amber-200 text-amber-800",
  "Friday": "bg-rose-50 border-rose-200 text-rose-800",
  "Saturday": "bg-cyan-50 border-cyan-200 text-cyan-800",
  "Sunday": "bg-orange-50 border-orange-200 text-orange-800",
};

function getDayColor(day: string): string {
  const weekday = day.split(",")[0];
  return DAY_COLORS[weekday] || "bg-gray-50 border-gray-200 text-gray-800";
}

function getDayBadgeColor(day: string): string {
  const weekday = day.split(",")[0];
  const map: Record<string, string> = {
    "Monday": "bg-blue-100 text-blue-700",
    "Tuesday": "bg-violet-100 text-violet-700",
    "Wednesday": "bg-emerald-100 text-emerald-700",
    "Thursday": "bg-amber-100 text-amber-700",
    "Friday": "bg-rose-100 text-rose-700",
    "Saturday": "bg-cyan-100 text-cyan-700",
    "Sunday": "bg-orange-100 text-orange-700",
  };
  return map[weekday] || "bg-gray-100 text-gray-700";
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
    const exams = data[sid] ?? null;
    setResults(exams);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-slate-800 leading-tight">Exam Schedule</h1>
            <p className="text-xs text-slate-500">Spring 2026 Final Exams</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Hero */}
        {!searched && (
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 shadow-lg mb-5">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Find Your Exam Schedule</h2>
            <p className="text-slate-500 text-base max-w-md mx-auto">
              Enter your student ID to see all your final exams, their dates, times, and room assignments.
            </p>
          </div>
        )}

        {/* Search */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 mb-6">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter your Student ID (e.g. 231001234)"
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all"
              />
              {query && (
                <button
                  onClick={handleClear}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => handleSearch()}
              disabled={!query.trim()}
              className="px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
            >
              Search
            </button>
          </div>
        </div>

        {/* Results */}
        {searched && (
          <div>
            {results === null ? (
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-10 text-center">
                <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-7 h-7 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-1">Student ID Not Found</h3>
                <p className="text-slate-500 text-sm mb-4">
                  No exams found for ID <span className="font-mono font-semibold text-slate-700">{studentId}</span>.
                  Please double-check your student ID and try again.
                </p>
                <button
                  onClick={handleClear}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                >
                  Try another ID
                </button>
              </div>
            ) : (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-0.5">{totalExams}</div>
                    <div className="text-xs text-slate-500 font-medium">Total Exams</div>
                  </div>
                  <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 text-center">
                    <div className="text-2xl font-bold text-emerald-600 mb-0.5">
                      {new Set(results.map(e => e.day)).size}
                    </div>
                    <div className="text-xs text-slate-500 font-medium">Exam Days</div>
                  </div>
                  <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 text-center">
                    <div className="text-2xl font-bold text-violet-600 mb-0.5">
                      {new Set(results.map(e => e.room)).size}
                    </div>
                    <div className="text-xs text-slate-500 font-medium">Rooms</div>
                  </div>
                </div>

                {/* Student ID badge */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm text-slate-500">Results for</span>
                  <span className="font-mono text-sm font-semibold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-md border border-blue-100">
                    {studentId}
                  </span>
                  <button onClick={handleClear} className="ml-auto text-xs text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1">
                    <X className="w-3 h-3" /> Clear
                  </button>
                </div>

                {/* Exam Cards */}
                <div className="space-y-3">
                  {results.map((exam, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
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
                            <h3 className="text-lg font-bold text-slate-800">{exam.subject}</h3>
                            <span className="text-xs text-slate-500">{exam.program}</span>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="flex items-center gap-1.5 text-slate-600 justify-end">
                              <Clock className="w-4 h-4 text-blue-500" />
                              <span className="text-sm font-semibold">{exam.time}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3.5 py-2.5">
                          <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                          <span className="text-sm text-slate-700">
                            <span className="text-slate-500 text-xs">Room</span>{" "}
                            <span className="font-semibold text-slate-800">{exam.room}</span>
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
            <p className="text-xs text-slate-400">
              Spring 2026 · {Object.keys(data).length.toLocaleString()} students · {(() => {
                const total = Object.values(data).reduce((sum, exams) => sum + exams.length, 0);
                return total.toLocaleString();
              })()} exam records
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
