"use client"
import React from "react"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  BookOpen,
  Heart,
  Eye,
  Calendar,
  Share2,
  Download,
  Quote,
  Sparkles,
  GraduationCap,
  Briefcase,
  Star,
  User,
} from "lucide-react"

interface PublicBlogViewProps {
  blog: any
}

export default function PublicBlogView({ blog }: PublicBlogViewProps) {
  const [viewCount, setViewCount] = useState(0)

  useEffect(() => {
    // 실제 조회수 기록 및 조회
    const recordViewAndFetchCount = async () => {
      if (!blog?.id || !blog.is_public) return;
      try {
        // Insert a new view record
        await supabase.from("blog_views").insert({ autobiography_id: blog.id, viewer_ip: null });
        // Fetch the updated view count
        const { count } = await supabase
          .from("blog_views")
          .select("id", { count: "exact", head: true })
          .eq("autobiography_id", blog.id);
        setViewCount(count || 0);
      } catch (e) {
        setViewCount(0);
      }
    };
    recordViewAndFetchCount();
  }, [blog?.id, blog?.is_public]);

  // 답변 내용을 문학적으로 확장하는 함수
  const expandAnswer = (question: string, answer: string, sectionId: string) => {
    if (!answer) return ""

    const expansions = {
      childhood: {
        prefix: "어린 시절의 기억을 되짚어보면,",
        suffix: "그 순간들이 지금의 나를 만든 소중한 밑거름이 되었다.",
      },
      school: {
        prefix: "학창시절을 돌이켜보니,",
        suffix: "그때의 경험들이 인생의 나침반이 되어주었다.",
      },
      work: {
        prefix: "사회에 첫발을 내딛으며,",
        suffix: "이 모든 경험이 나를 더욱 단단하게 만들어주었다.",
      },
      love: {
        prefix: "사랑이라는 이름으로,",
        suffix: "그 모든 순간들이 내 마음 속 가장 아름다운 보석이 되었다.",
      },
      present: {
        prefix: "현재를 살아가면서,",
        suffix: "지금 이 순간이 미래를 만들어가는 소중한 시간이다.",
      },
      future: {
        prefix: "미래를 향해 나아가며,",
        suffix: "꿈을 향한 여정은 계속될 것이다.",
      },
    }

    const expansion = expansions[sectionId as keyof typeof expansions]
    return `${expansion.prefix} ${answer} ${expansion.suffix}`
  }

  // 섹션별 아이콘 매핑
  const getSectionIcon = (sectionId: string) => {
    const icons = {
      childhood: <Heart className="w-5 h-5" />,
      school: <GraduationCap className="w-5 h-5" />,
      work: <Briefcase className="w-5 h-5" />,
      love: <Star className="w-5 h-5" />,
      present: <Sparkles className="w-5 h-5" />,
      future: <BookOpen className="w-5 h-5" />,
    }
    return icons[sectionId as keyof typeof icons] || <BookOpen className="w-5 h-5" />
  }

  // 배경 이미지 선택
  const getBackgroundImage = (sectionId: string) => {
    const backgrounds = {
      childhood:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%EC%A2%85%EC%9D%B4%20%EB%B0%B0%EA%B2%BD%EC%9D%B4%EB%AF%B8%EC%A7%80%204-K5ioPMaVCDOk3x5fhPWXCFxriJIYUa.png",
      school:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%EC%A2%85%EC%9D%B4%20%EB%B0%B0%EA%B2%BD%EC%9D%B4%EB%AF%B8%EC%A7%80%203-73pVpRK7F7sIMY9AsFKhkhAIxRGJdF.png",
      work: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%EC%A2%85%EC%9D%B4%20%EB%B0%B0%EA%B2%BD%EC%9D%B4%EB%AF%B8%EC%A7%80%202.png-AaTjnWgsCxpFWP3CbN9xGoFkPlCiyX.jpeg",
      love: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%EC%A2%85%EC%9D%B4%20%EB%B0%B0%EA%B2%BD%EC%9D%B4%EB%AF%B8%EC%A7%80%201.png-3ha2zrIwDuCX6oU5l2q9dlYoCWcx0Y.jpeg",
      present:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%EC%A2%85%EC%9D%B4%20%EB%B0%B0%EA%B2%BD%EC%9D%B4%EB%AF%B8%EC%A7%80%205-jNBpA7c95FBikc6pT4ZVeNOsv7UeNu.png",
      future:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%EC%A2%85%EC%9D%B4%20%EB%B0%B0%EA%B2%BD%EC%9D%B4%EB%AF%B8%EC%A7%80%205-jNBpA7c95FBikc6pT4ZVeNOsv7UeNu.png",
    }
    return (
      backgrounds[sectionId as keyof typeof backgrounds] ||
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%EC%A2%85%EC%9D%B4%20%EB%B0%B0%EA%B2%BD%EC%9D%B4%EB%AF%B8%EC%A7%80%205-jNBpA7c95FBikc6pT4ZVeNOsv7UeNu.png"
    )
  }

  // 배경 테마별 스타일 정의
  const themeStyles: Record<string, any> = {
    bling1: {
      gradient: "from-pink-100 via-yellow-50 to-purple-100",
      particles: ["#fffbe9", "#ffe6fa"],
    },
    bling2: {
      gradient: "from-blue-100 via-teal-50 to-purple-100",
      particles: ["#e0f7fa", "#e3e0ff"],
    },
    bling3: {
      gradient: "from-orange-100 via-yellow-50 to-pink-100",
      particles: ["#fff3e0", "#ffe0ef"],
    },
    bling4: {
      gradient: "from-violet-100 via-sky-50 to-white",
      particles: ["#f3e8ff", "#e0f7fa"],
    },
    bling5: {
      gradient: "from-green-100 via-yellow-50 to-sky-100",
      particles: ["#e0ffe0", "#e0f7fa"],
    },
  };
  const theme = themeStyles[blog.background_theme] || themeStyles.bling1;

  const completedSections =
    blog.sections?.filter((section: any) => section.answers?.some((answer: string) => answer && answer.trim())) || []

  const shareUrl = () => {
    if (navigator.share) {
      navigator.share({
        title: blog.title,
        text: blog.description,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert("URL이 복사되었습니다!")
    }
  }

  const downloadBlog = () => {
    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${blog.title}</title>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
            .header { text-align: center; margin-bottom: 40px; }
            .section { margin-bottom: 30px; page-break-inside: avoid; }
            .question { font-weight: bold; color: #333; margin-bottom: 10px; }
            .answer { margin-bottom: 20px; padding: 15px; background: #f9f9f9; border-radius: 8px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${blog.title}</h1>
            <p>${blog.description}</p>
            <p>작성자: ${blog.users?.name || "익명"}</p>
          </div>
          ${completedSections
            .map(
              (section: any) => `
            <div class="section">
              <h2>${section.title}</h2>
              ${section.questions
                ?.map((question: string, index: number) => {
                  const answer = section.answers?.[index]
                  if (!answer) return ""
                  return `
                  <div class="question">${question}</div>
                  <div class="answer">${expandAnswer(question, answer, section.id)}</div>
                `
                })
                .join("")}
            </div>
          `,
            )
            .join("")}
        </body>
      </html>
    `

    const blob = new Blob([content], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${blog.title}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* 블링블링 배경 레이어 */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* 반짝임 애니메이션 */}
        <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} animate-gradient-move`} style={{ opacity: 0.85 }} />
        {/* 입자 효과 */}
        <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.18 }}>
          <defs>
            <radialGradient id="bling1" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={theme.particles[0]} stopOpacity="0.9" />
              <stop offset="100%" stopColor={theme.particles[0]} stopOpacity="0" />
            </radialGradient>
            <radialGradient id="bling2" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={theme.particles[1]} stopOpacity="0.7" />
              <stop offset="100%" stopColor={theme.particles[1]} stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="20%" cy="30%" r="120" fill="url(#bling1)">
            <animate attributeName="r" values="120;160;120" dur="6s" repeatCount="indefinite" />
          </circle>
          <circle cx="80%" cy="60%" r="90" fill="url(#bling2)">
            <animate attributeName="r" values="90;130;90" dur="7s" repeatCount="indefinite" />
          </circle>
          <circle cx="60%" cy="20%" r="60" fill="url(#bling1)">
            <animate attributeName="r" values="60;100;60" dur="5s" repeatCount="indefinite" />
          </circle>
        </svg>
        {/* 별빛 효과 */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          {[...Array(18)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/70 blur-[2px] animate-twinkle"
              style={{
                width: `${6 + Math.random() * 10}px`,
                height: `${6 + Math.random() * 10}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 6}s`,
              }}
            />
          ))}
        </div>
      </div>
      {/* 기존 내용: z-10 이상으로 올림 */}
      <div className="relative z-10">
        {/* 대표 이미지: 페이지 맨 상단, 이름 오버레이 */}
        {blog.generated_images && blog.generated_images.length > 0 && (
          <div className="relative w-full max-w-6xl mx-auto aspect-[4/1.5] md:aspect-[4/1.8] rounded-b-3xl overflow-hidden mb-[-32px] shadow-lg border border-amber-200 bg-white flex items-center justify-center">
            <img
              src={blog.generated_images[0]}
              alt="대표 이미지"
              className="object-cover w-full h-full"
              style={{ minHeight: 180, maxHeight: 340 }}
            />
            {/* 이름 오버레이 */}
            <div className="absolute left-0 bottom-0 w-full flex items-end p-4 md:p-6 bg-gradient-to-t from-black/40 via-black/10 to-transparent">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 border-2 border-white shadow">
                  <AvatarImage src={blog.users?.avatar_url || "/placeholder.svg"} alt={blog.users?.name} />
                  <AvatarFallback>
                    <User className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
                <span className="text-white text-lg md:text-xl font-bold drop-shadow-lg">{blog.users?.name || "익명"}</span>
              </div>
            </div>
          </div>
        )}
        {/* 헤더 */}
        <div className="bg-white shadow-sm border-b border-amber-200">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4 md:gap-0">
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={blog.users?.avatar_url || "/placeholder.svg"} alt={blog.users?.name} />
                  <AvatarFallback>
                    <User className="w-6 h-6" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                      {blog.title}
                    </h1>
                    {blog.is_public && (
                      <span className="bg-pink-500 text-white text-xs px-2 py-1 rounded shadow ml-1">공개</span>
                    )}
                  </div>
                  <p className="text-gray-600">{blog.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Eye className="w-4 h-4 text-amber-500" />
                    <span className="text-sm text-gray-500">{viewCount}회 조회</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4 md:mt-0">
                <Button
                  onClick={shareUrl}
                  variant="outline"
                  className="border-amber-300 hover:bg-amber-50 bg-transparent"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  공유
                </Button>
                <Button
                  onClick={downloadBlog}
                  variant="outline"
                  className="border-amber-300 hover:bg-amber-50 bg-transparent"
                >
                  <Download className="w-4 h-4 mr-2" />
                  다운로드
                </Button>
              </div>
            </div>

            {/* 메타 정보 */}
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(blog.created_at).toLocaleDateString("ko-KR")}
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {viewCount}회 조회
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                {completedSections.length}개 섹션
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          {completedSections.map((section: any, sectionIndex: number) => {
            let sectionImages: string[] = [];
            try {
              if (section.illustration) {
                const parsed = JSON.parse(section.illustration);
                if (Array.isArray(parsed)) sectionImages = parsed;
              }
            } catch {}
            return (
              <article key={section.id} className="mb-16">
                {/* 섹션 헤더 */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-lg border border-amber-200">
                    <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full flex items-center justify-center text-white">
                      {getSectionIcon(section.id)}
                    </div>
                    <h2 className="text-2xl font-bold text-amber-800">{section.title}</h2>
                  </div>
                </div>
                {/* 섹션별 이미지 갤러리 */}
                {sectionImages.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-4 mb-8">
                    {sectionImages.slice(0, 4).map((img, idx) => (
                      <div key={idx} className="w-40 h-40 rounded-xl overflow-hidden border-2 border-amber-200 shadow">
                        <img src={img} alt={`섹션 이미지 ${idx + 1}`} className="object-cover w-full h-full" />
                      </div>
                    ))}
                  </div>
                )}

              {/* 배경 이미지와 함께 스토리 표시 */}
              <div
                className="relative bg-white rounded-2xl shadow-xl overflow-hidden mb-8"
                style={{
                  backgroundImage: `url(${getBackgroundImage(section.id)})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              >
                <div className="absolute inset-0 bg-white bg-opacity-90"></div>
                <div className="relative z-10 p-8 md:p-12">
                  {section.questions?.map((question: string, qIndex: number) => {
                    const answer = section.answers?.[qIndex]
                    if (!answer || !answer.trim()) return null

                    return (
                      <div key={qIndex} className="mb-8 last:mb-0">
                        <div className="mb-4">
                          <div className="inline-flex items-center gap-2 bg-amber-100 px-4 py-2 rounded-full">
                            <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                              {qIndex + 1}
                            </div>
                            <h3 className="font-semibold text-amber-800">{question}</h3>
                          </div>
                        </div>

                        <div className="bg-white bg-opacity-80 rounded-lg p-6 shadow-sm border border-amber-200">
                          <div className="relative">
                            <Quote className="absolute -top-2 -left-2 w-8 h-8 text-amber-300" />
                            <p className="text-gray-700 leading-relaxed text-lg italic pl-6">
                              {expandAnswer(question, answer, section.id)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* 구분선 */}
              {sectionIndex < completedSections.length - 1 && (
                <div className="flex items-center justify-center my-12">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                    <div className="w-16 h-0.5 bg-gradient-to-r from-amber-400 to-orange-400"></div>
                    <Heart className="w-5 h-5 text-amber-500" />
                    <div className="w-16 h-0.5 bg-gradient-to-r from-orange-400 to-amber-400"></div>
                    <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                  </div>
                </div>
              )}
            </article>
          })}

          {/* 마무리 섹션 */}
          <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl p-8 text-center shadow-xl border border-amber-200">
            <div className="mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-amber-800 mb-2">나의 이야기</h3>
              <p className="text-amber-700">
                모든 순간들이 모여 지금의 나를 만들었습니다. 과거의 경험들이 미래를 향한 소중한 밑거름이 되어, 더욱
                아름다운 내일을 그려나가겠습니다.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {completedSections.map((section: any) => (
                <Badge key={section.id} className="bg-amber-200 text-amber-800 border-amber-300">
                  {section.title}
                </Badge>
              ))}
            </div>

            <div className="text-sm text-amber-600">
              <p>✨ AI 자서전 생성기로 만든 나만의 특별한 이야기 ✨</p>
              <p className="mt-1">{new Date(blog.created_at).toLocaleDateString("ko-KR")} 작성</p>
            </div>
          </div>

          {/* 작성자 정보 */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-lg border border-gray-200">
              <Avatar className="w-8 h-8">
                <AvatarImage src={blog.users?.avatar_url || "/placeholder.svg"} alt={blog.users?.name} />
                <AvatarFallback>
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <span className="text-gray-700">작성자: {blog.users?.name || "익명"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
