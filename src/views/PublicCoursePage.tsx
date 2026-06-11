"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { BookOpen, PlayCircle, ChevronDown, ShoppingCart } from "lucide-react";
import { supabase } from "@/lib/supabase/browser";

interface Course {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  slug: string;
  creator_id: string;
  payment_link: string | null;
}

interface Lesson {
  id: string;
  title: string;
  position: number;
  module_id: string;
}

interface Module {
  id: string;
  title: string;
  position: number;
  lessons: Lesson[];
}

interface CreatorProfile {
  full_name: string | null;
  avatar_url: string | null;
}

export default function PublicCoursePage() {
  const _params = useParams<{ slug: string }>();
  const slug = _params?.slug;
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [creator, setCreator] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({});

  const toggleModule = (id: string) =>
    setOpenModules((prev) => ({ ...prev, [id]: !prev[id] }));

  useEffect(() => {
    if (!slug) return;

    const load = async () => {
      const { data: courseData, error } = await supabase
        .from("courses")
        .select("id, title, description, image_url, slug, creator_id, is_published, payment_link")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();

      if (error || !courseData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setCourse(courseData as unknown as Course);

      // Fetch modules
      const { data: modulesData } = await supabase
        .from("modules")
        .select("id, title, position")
        .eq("course_id", courseData.id)
        .order("position");

      if (modulesData && modulesData.length > 0) {
        const moduleIds = modulesData.map((m) => m.id);

        // Fetch all lessons for all modules in one query
        const { data: lessonsData } = await supabase
          .from("lessons")
          .select("id, title, position, module_id")
          .in("module_id", moduleIds)
          .order("position");

        const lessonsMap: Record<string, Lesson[]> = {};
        (lessonsData || []).forEach((l) => {
          const mid = l.module_id ?? "";
          if (!lessonsMap[mid]) lessonsMap[mid] = [];
          lessonsMap[mid].push(l as unknown as Lesson);
        });

        setModules(
          modulesData.map((m) => ({
            ...m,
            lessons: lessonsMap[m.id] || [],
          }))
        );
      }

      // Fetch creator
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", courseData.creator_id ?? "")
        .single();

      if (profileData) setCreator(profileData as CreatorProfile);

      setLoading(false);
    };

    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#d4a017]" />
      </div>
    );
  }

  if (notFound || !course) {
    return (
      <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#0a192f] mb-2">Pagina nu a fost găsită</h1>
          <p className="text-[#5a6a7a]">Acest curs nu există sau nu este public.</p>
        </div>
      </div>
    );
  }

  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);

  return (
    <>
      


      

      <div className="min-h-screen bg-[#fafaf8] font-sans">

        {/* Hero */}
        <div
          className="relative bg-[#0a192f] text-white px-4 py-20 text-center"
          style={course.image_url ? {
            backgroundImage: `linear-gradient(rgba(10,25,47,0.85), rgba(10,25,47,0.92)), url(${course.image_url})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          } : {}}
        >
          <div className="max-w-2xl mx-auto">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d4a017] mb-4">Curs online</p>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-5 text-white" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.4)" }}>
              {course.title}
            </h1>
            {course.description && (
              <p className="text-lg text-white/80 mb-8 leading-relaxed">{course.description}</p>
            )}

            {/* Stats */}
            <div className="flex items-center justify-center gap-6 text-sm text-white/70 mb-8">
              {modules.length > 0 && (
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-[#d4a017]" />
                  {modules.length} module
                </span>
              )}
              {totalLessons > 0 && (
                <span className="flex items-center gap-1.5">
                  <PlayCircle className="w-4 h-4 text-[#d4a017]" />
                  {totalLessons} lecții
                </span>
              )}
            </div>

            {/* CTA button */}
            {course.payment_link && (
              <a
                href={course.payment_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#d4a017] hover:bg-[#c4911a] text-[#0a192f] font-bold px-8 py-4 rounded-xl transition-colors text-lg shadow-lg"
              >
                <ShoppingCart className="w-5 h-5" />
                Cumpără cursul
              </a>
            )}

          </div>
        </div>

        {/* Modules accordion */}
        {modules.length > 0 && (
          <div className="max-w-2xl mx-auto px-4 py-14">
            <h2 className="text-2xl font-bold text-[#0a192f] mb-6">Conținutul cursului</h2>
            <div className="space-y-3">
              {modules.map((mod, i) => {
                const isOpen = !!openModules[mod.id];
                return (
                  <div
                    key={mod.id}
                    className="rounded-xl border border-[#e8e4dc] bg-white overflow-hidden"
                  >
                    {/* Header modul — click pentru expand */}
                    <button
                      onClick={() => toggleModule(mod.id)}
                      className="w-full flex items-center gap-4 p-4 text-left hover:bg-[#fafaf8] transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#0a192f]/10 flex items-center justify-center shrink-0 text-sm font-bold text-[#0a192f]">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#0a192f]">{mod.title}</p>
                        {mod.lessons.length > 0 && (
                          <p className="text-xs text-[#5a6a7a] mt-0.5">
                            {mod.lessons.length} {mod.lessons.length === 1 ? "lecție" : "lecții"}
                          </p>
                        )}
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-[#5a6a7a] shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {/* Lista lecții */}
                    {isOpen && mod.lessons.length > 0 && (
                      <div className="border-t border-[#e8e4dc]">
                        {mod.lessons.map((lesson, j) => (
                          <div
                            key={lesson.id}
                            className="flex items-center gap-3 px-4 py-2.5 border-b border-[#f0ede6] last:border-0"
                          >
                            <span className="text-xs text-[#5a6a7a] w-5 shrink-0 text-right">
                              {j + 1}.
                            </span>
                            <PlayCircle className="w-3.5 h-3.5 text-[#d4a017] shrink-0" />
                            <span className="text-sm text-[#0a192f]">{lesson.title}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Instructor */}
        {creator?.full_name && (
          <div className="bg-[#f3f1ec] border-t border-[#e8e4dc] px-4 py-12">
            <div className="max-w-2xl mx-auto flex items-center gap-5">
              {creator.avatar_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={creator.avatar_url}
                  alt={creator.full_name}
                  className="w-16 h-16 rounded-full object-cover shrink-0 border-2 border-[#d4a017]"
                />
              )}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#d4a017] mb-0.5">Instructor</p>
                <p className="font-bold text-[#0a192f] text-lg">{creator.full_name}</p>
              </div>
            </div>
          </div>
        )}


        <footer className="text-center py-5 text-xs text-[#5a6a7a] border-t border-[#e8e4dc] bg-[#fafaf8]">
          Curs creat cu{" "}
          <a href="https://www.docourse.ro" className="hover:underline text-[#0a192f]">DoCourse</a>
        </footer>
      </div>
    </>
  );
}
