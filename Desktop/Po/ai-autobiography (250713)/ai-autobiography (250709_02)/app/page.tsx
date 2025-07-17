"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import {
  Mic,
  MicOff,
  Play,
  Pause,
  Download,
  Edit3,
  Heart,
  Sparkles,
  BookOpen,
  GraduationCap,
  Briefcase,
  Star,
  ArrowLeft,
  Quote,
  Share2,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"
import BlogDisplay from "@/components/blog-display"
import GoogleAuth from "@/components/auth/google-auth"
import BlogSettings from "@/components/blog/blog-settings"
import MyBlogs from "@/components/blog/my-blogs"
import { extractKoreanNouns } from "@/lib/utils";
import { supabase } from "@/lib/supabase"
import AIDiary from "@/components/ai-diary"

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition
    webkitSpeechRecognition: typeof SpeechRecognition
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null
  onend: ((this: SpeechRecognition, ev: Event) => any) | null
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult
  length: number
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative
  length: number
  isFinal?: boolean
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition
  new (): SpeechRecognition
  new (): SpeechRecognition
  new (): SpeechRecognition
  new (): SpeechRecognition
  new (): SpeechRecognition
}

interface StorySection {
  id: string
  title: string
  icon: React.ReactNode
  color: string
  questions: string[]
  answers: string[]
  illustration?: string
}

const storyStages: StorySection[] = [
  {
    id: "childhood",
    title: "어린시절",
    icon: <Heart className="w-5 h-5" />,
    color: "bg-pink-100 text-pink-700 border-pink-200",
    questions: [
      "어린 시절 가장 좋아했던 놀이나 장난감은 무엇이었나요?",
      "기억에 남는 가족과의 추억이 있다면 들려주세요.",
      "어릴 때 꿈꿨던 장래희망은 무엇이었나요?",
      "가장 무서웠던 경험이나 용감했던 순간이 있나요?",
    ],
    answers: [],
  },
  {
    id: "school",
    title: "학창시절",
    icon: <GraduationCap className="w-5 h-5" />,
    color: "bg-purple-100 text-purple-700 border-purple-200",
    questions: [
      "학교에서 가장 좋아했던 과목이나 선생님은 누구였나요?",
      "친구들과의 특별한 추억이 있다면 말해주세요.",
      "학창시절 가장 열심히 했던 활동은 무엇인가요?",
      "졸업할 때의 기분과 미래에 대한 생각은 어땠나요?",
    ],
    answers: [],
  },
  {
    id: "work",
    title: "사회생활",
    icon: <Briefcase className="w-5 h-5" />,
    color: "bg-blue-100 text-blue-700 border-blue-200",
    questions: [
      "첫 직장에서의 경험은 어땠나요?",
      "직장생활에서 가장 보람찼던 순간은 언제인가요?",
      "동료들과의 관계에서 배운 점이 있다면?",
      "커리어에서 가장 중요한 전환점은 무엇이었나요?",
    ],
    answers: [],
  },
  {
    id: "love",
    title: "연애시절",
    icon: <Star className="w-5 h-5" />,
    color: "bg-rose-100 text-rose-700 border-rose-200",
    questions: [
      "첫사랑에 대한 기억을 들려주세요.",
      "가장 로맨틱했던 순간은 언제였나요?",
      "연애를 통해 배운 가장 소중한 것은 무엇인가요?",
      "사랑에 대한 당신만의 철학이 있다면?",
    ],
    answers: [],
  },
  {
    id: "present",
    title: "현재",
    icon: <Sparkles className="w-5 h-5" />,
    color: "bg-green-100 text-green-700 border-green-200",
    questions: [
      "현재 가장 중요하게 생각하는 가치는 무엇인가요?",
      "지금 이 순간 가장 감사한 것은 무엇인가요?",
      "현재의 나를 한 문장으로 표현한다면?",
      "요즘 가장 행복을 느끼는 순간은 언제인가요?",
    ],
    answers: [],
  },
  {
    id: "future",
    title: "미래",
    icon: <BookOpen className="w-5 h-5" />,
    color: "bg-indigo-100 text-indigo-700 border-indigo-200",
    questions: [
      "앞으로 이루고 싶은 가장 큰 꿈은 무엇인가요?",
      "10년 후의 나는 어떤 모습일까요?",
      "미래의 나에게 전하고 싶은 메시지가 있다면?",
      "인생에서 꼭 해보고 싶은 일이 있나요?",
    ],
    answers: [],
  },
]

// 1. Starfield 컴포넌트 추가 (파일 상단에 함께 정의)
function Starfield({ explode }: { explode: boolean }) {
  const [stars, setStars] = useState<any[]>([]);
  const [exploding, setExploding] = useState(false);
  const starCount = 45;
  useEffect(() => {
    // 별 생성
    const arr = Array.from({ length: starCount }).map(() => {
      const angle = Math.random() * 2 * Math.PI;
      return {
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: Math.pow(Math.random(), 2) * 1.8 + 0.4,
        color: [
          '#4fc3ff', '#ff5a5a', '#ffe066', '#fffbe6',
          'rgba(255, 255, 255, 0.95)', 'rgba(255, 215, 100, 0.92)',
          'rgba(220, 220, 220, 0.85)', 'rgba(180, 200, 255, 0.85)',
          'rgba(140, 120, 255, 0.85)', 'rgba(255, 180, 220, 0.85)'
        ][Math.floor(Math.random() * 10)],
        angle,
        speed: Math.random() * 0.2 + 0.05,
        distance: Math.random() * 30 + 10,
        twinkle: 0.7 + 0.3 * Math.random(),
      };
    });
    setStars(arr);
  }, []);
  useEffect(() => {
    if (explode) {
      setExploding(true);
      setTimeout(() => setExploding(false), 1200);
    }
  }, [explode]);
  return (
    <div className="absolute inset-0 pointer-events-none z-5">
      <style>{`
        @keyframes luxury-star-twinkle {
          0% { opacity: 0.3; filter: blur(2px) drop-shadow(0 0 6px gold); }
          25% { opacity: 0.8; filter: blur(1px) drop-shadow(0 0 12px #fffbe6); }
          50% { opacity: 0.6; filter: blur(1.5px) drop-shadow(0 0 10px #ffd700); }
          75% { opacity: 0.9; filter: blur(0.8px) drop-shadow(0 0 14px #fffbe6); }
          100% { opacity: 0.3; filter: blur(2px) drop-shadow(0 0 6px gold); }
        }
      `}</style>
      {stars.map((star, i) => {
        // 폭발 애니메이션: 중심(50,50)에서 바깥으로 이동
        const explodeStyle = exploding
          ? {
              top: `calc(50% + ${(star.top - 50) * 2.2}%)`,
              left: `calc(50% + ${(star.left - 50) * 2.2}%)`,
              opacity: 0,
              transition: 'all 1.2s cubic-bezier(.4,2,.6,1)',
            }
          : {
              top: `${star.top}%`,
              left: `${star.left}%`,
              opacity: 1,
              transition: 'all 1.2s cubic-bezier(.4,2,.6,1)',
            };
        return (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              ...explodeStyle,
              width: `${star.size}rem`,
              height: `${star.size}rem`,
              background: `radial-gradient(circle at 60% 40%, ${star.color} 70%, transparent 100%)`,
              boxShadow: `0 0 ${star.size * 12 + 8}px ${star.size * 2 + 2}px ${star.color}, 0 0 60px 16px #fffbe6`,
              animation: `luxury-star-twinkle ${1.5 + star.size * 0.7}s infinite alternate`,
              filter: 'blur(1px)',
            }}
          />
        );
      })}
    </div>
  );
}

export default function AIAutobiographyGenerator() {
  // 시작화면 일러스트 이미지 경로
  const [isStarted, setIsStarted] = useState(false);
  const [showMenuPage, setShowMenuPage] = useState(false);
  const [showAIDiaryPage, setShowAIDiaryPage] = useState(false);
  const [userPassword, setUserPassword] = useState("");
  const startBgImg = "/storybook-moon.jpg";
  const [currentStage, setCurrentStage] = useState<string | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentAnswer, setCurrentAnswer] = useState("")
  const [sections, setSections] = useState<StorySection[]>(storyStages)
  const [progress, setProgress] = useState(0)
  const [showAutobiography, setShowAutobiography] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [isGeneratingImages, setIsGeneratingImages] = useState(false)
  const [imageGenerationProgress, setImageGenerationProgress] = useState(0)
  const [currentGeneratingImage, setCurrentGeneratingImage] = useState(0)
  const [generationStatus, setGenerationStatus] = useState("")
  const [showFullAutobiography, setShowFullAutobiography] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [showMyBlogs, setShowMyBlogs] = useState(false)
  const [showBlogSettings, setShowBlogSettings] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  // 블로그 저장 성공 애니메이션 상태 추가
  const [showBlogSuccessAnim, setShowBlogSuccessAnim] = useState(false);


  // 1. 상태 추가
  const [userName, setUserName] = useState("");
  const [userAge, setUserAge] = useState("");
  const [userGender, setUserGender] = useState("");
  const [imageStyle, setImageStyle] = useState("classic"); // classic, ghibli, elegant, childhood
  const [showStyleDropdown, setShowStyleDropdown] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null)

  // 1. 섹션별 선택 이미지 상태 추가
  const [selectedImages, setSelectedImages] = useState<{ [sectionId: string]: string }>({});

  // 1. 애니메이션 상태 추가
  const [isStarting, setIsStarting] = useState(false);


  // 1. 이미지 선택 상태 추가
  const [selectingImages, setSelectingImages] = useState<{sectionIndex:number, images:string[]}|null>(null);
  const [selectedImageIndexes, setSelectedImageIndexes] = useState<number[]>([]);

  const recognitionRef = useRef<SpeechRecognition | null>(null)

  // 음성 합성 함수
  const speakQuestion = (text: string) => {
    stopAllSounds(); // 질문 음성 시작 시 효과음 중지
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = "ko-KR"
      utterance.rate = 0.9
      utterance.pitch = 1.1
      speechSynthesis.speak(utterance)
      setIsPlaying(true)
      utterance.onend = () => setIsPlaying(false)
    }
  }

  // 음성 인식 초기화
  const initializeSpeechRecognition = () => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition

    if (SpeechRecognitionAPI) {
      const recognition = new SpeechRecognitionAPI()

      recognition.continuous = true // 연속 인식 활성화
      recognition.interimResults = true // 중간 결과 표시
      recognition.lang = "ko-KR"

      recognition.onstart = () => {
        setIsRecording(true)
        console.log("음성 인식이 시작되었습니다.")
      }

      recognition.onresult = (event) => {
        let finalTranscript = ""
        let interimTranscript = ""

        for (let i = 0; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }

        if (finalTranscript) {
          setCurrentAnswer((prev) => prev + finalTranscript)
        }
      }

      recognition.onerror = (event) => {
        console.error("음성 인식 오류:", event.error)
        setIsRecording(false)

        let errorMessage = ""
        switch (event.error) {
          case "no-speech":
            errorMessage = "음성이 감지되지 않았습니다. 마이크에 더 가까이서 말씀해 주세요."
            break
          case "audio-capture":
            errorMessage = "마이크에 접근할 수 없습니다. 마이크 권한을 확인해 주세요."
            break
          case "not-allowed":
            errorMessage = "마이크 사용 권한이 거부되었습니다. 브라우저 설정에서 마이크 권한을 허용해 주세요."
            break
          case "network":
            errorMessage = "네트워크 오류가 발생했습니다. 인터넷 연결을 확인해 주세요."
            break
          default:
            errorMessage = `음성 인식 오류: ${event.error}`
        }

        alert(errorMessage)
      }

      recognition.onend = () => {
        setIsRecording(false)
        console.log("음성 인식이 종료되었습니다.")
      }

      recognitionRef.current = recognition
    }
  }

  // 음성 인식 시작
  const startVoiceRecognition = () => {
    if (!recognitionRef.current) {
      initializeSpeechRecognition()
    }

    if (recognitionRef.current) {
      try {
        // 기존 인식이 실행 중이면 중지
        if (isRecording) {
          recognitionRef.current.stop()
          return
        }

        recognitionRef.current.start()

        // 10초 후 자동 중지 (no-speech 오류 방지)
        setTimeout(() => {
          if (isRecording && recognitionRef.current) {
            recognitionRef.current.stop()
          }
        }, 10000)
      } catch (error) {
        console.error("음성 인식 시작 실패:", error)
        alert("음성 인식을 시작할 수 없습니다. 다시 시도해 주세요.")
      }
    } else {
      alert("이 브라우저는 음성 인식을 지원하지 않습니다. Chrome 브라우저를 사용해 주세요.")
    }
  }

  // 음성 인식 중지 (기존 stopRecording 함수 교체)
  const stopVoiceRecognition = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop()
    }
  }

  // 자서전 생성 조건 확인 함수 추가
  const checkAllSectionsCompleted = (sections: StorySection[]) => {
    return sections.every(
      (section) =>
        section.answers.length === section.questions.length &&
        section.answers.every((answer) => answer && answer.trim()),
    )
  }

  // 효과음 재생 및 정지 관리
  const playingAudios: HTMLAudioElement[] = [];
  const stopAllSounds = () => {
    playingAudios.forEach(audio => {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch (e) {}
    });
    playingAudios.length = 0;
  };
  const playSound = (soundPath: string, volume: number = 0.7) => {
    stopAllSounds();
    try {
      const audio = new window.Audio(soundPath);
      audio.volume = volume;
      audio.play().catch(() => {}); // 에러 무시
      playingAudios.push(audio);
      audio.onended = () => {
        const idx = playingAudios.indexOf(audio);
        if (idx !== -1) playingAudios.splice(idx, 1);
      };
    } catch (e) {
      // ignore
    }
  };

  // 섹션별 나이 계산 함수 (전역에서 사용)
  function getSectionAge(sectionId: string, userBirth: string | number) {
    let age: number = 30;
    if (typeof userBirth === 'number') {
      age = userBirth;
    } else if (typeof userBirth === 'string' && /^[0-9]+$/.test(userBirth)) {
      if (userBirth.length === 8) {
        // YYYYMMDD 형식
        const birthYear = parseInt(userBirth.slice(0, 4));
        if (!isNaN(birthYear)) {
          const now = new Date().getFullYear();
          age = now - birthYear;
        }
      } else {
        // 숫자(나이)로 들어온 경우
        const parsedAge = parseInt(userBirth);
        if (!isNaN(parsedAge)) age = parsedAge;
      }
    }
    switch (sectionId) {
      case "childhood": return 7;
      case "school": return 17;
      case "work": return 30;
      case "love": return 25;
      case "present": return age;
      case "future": return age + 10;
      default: return age;
    }
  }

  // 영어 변환 유틸리티 함수 추가
  function toEnglishGender(gender: string) {
    if (gender === "남성") return "male";
    if (gender === "여성") return "female";
    if (gender === "기타") return "other";
    return "person";
  }
  function toEnglishAge(age: string | number) {
    if (typeof age === "string" && age.match(/^[0-9]+$/)) return `${age} years old`;
    if (typeof age === "number") return `${age} years old`;
    return age;
  }

  // 자서전 생성 - 스토리 기반 프롬프트 개선
  const generateAutobiography = async (sections: StorySection[]) => {
    stopAllSounds();
    playSound('/sfx/full-autobiography-start.mp3', 0.35);
    setIsGeneratingImages(true)
    setImageGenerationProgress(0)
    setCurrentGeneratingImage(0)
    setGenerationStatus("이미지 생성을 시작합니다...")

    // 스타일별 프롬프트 확장
    const stylePrompts = {
      ghibli: "ghibli style, soft pastel, dreamy, magical, anime, beautiful, cinematic, Studio Ghibli inspired,",
      elegant: "elegant illustration, fine art, gold accents, luxury, soft light, ornate, sophisticated,",
      childhood: "children's book, cute, playful, bright, watercolor, simple, innocent, colorful,",
      watercolor: "watercolor, soft, dreamy, delicate, flowing, artistic,",
      oil: "oil painting, rich texture, vibrant, classic, artistic,",
      korean: "Korean traditional painting, ink, hanbok, oriental, cultural,",
      sketch: "sketch, pencil, hand-drawn, simple, artistic,",
    };
    
    // 섹션별 분위기 설정
    const moodSettings = {
      childhood: "warm, nostalgic, innocent, playful, dreamy",
      school: "youthful, energetic, hopeful, learning, friendship",
      work: "professional, determined, growth, achievement, responsibility",
      love: "romantic, tender, emotional, intimate, beautiful",
      present: "content, peaceful, grateful, mindful, balanced",
      future: "aspirational, visionary, optimistic, dreamy, inspiring"
    };

    const stylePrompt = stylePrompts[imageStyle as keyof typeof stylePrompts] || stylePrompts.ghibli;

    // 섹션별 나이 계산 함수 (전역에서 사용)
    function getSectionAge(sectionId: string, userBirth: string) {
      // userBirth는 YYYYMMDD 형식
      let birthYear = 2000;
      if (userBirth && userBirth.length >= 4) {
        const parsed = parseInt(userBirth.slice(0, 4));
        if (!isNaN(parsed)) birthYear = parsed;
      }
      const now = 2025;
      const age = now - birthYear;
      switch (sectionId) {
        case "childhood": return 7;
        case "school": return 17;
        case "work": return 30;
        case "love": return 25;
        case "present": return age;
        case "future": return age + 10;
        default: return age;
      }
    }

    // 모든 답변마다 스토리 기반 이미지 프롬프트 생성
    const imagePrompts: { display: string, ai: string }[] = [];
    let promptIndex = 0;
    sections.forEach((section, sectionIdx) => {
      section.answers.forEach((answer, idx) => {
        if (answer && answer.trim()) {
          const sectionNames: { [key: string]: string } = {
            childhood: "어린시절",
            school: "학창시절",
            work: "사회생활",
            love: "연애시절",
            present: "현재",
            future: "미래",
          };
          const sectionKorean = sectionNames[section.id] || section.id;
          const mood = moodSettings[section.id as keyof typeof moodSettings] || "warm, emotional";
          const nouns = extractKoreanNouns(answer);
          const keywords = Array.isArray(nouns) && nouns.length > 0 ? nouns[0] : "";
          // 어린시절이면 Age에 시대적 배경(10년대) 적용
          let promptName = userName;
          let promptAge = getSectionAge(section.id, userAge);
          if (section.id === "childhood") {
            const now = new Date().getFullYear();
            const inputAge = parseInt(userAge || "30");
            const birthYear = now - inputAge;
            const childhoodYear = birthYear + 6;
            // 10년대 구하기 (예: 1981 → 1980년대)
            const decade = Math.floor(childhoodYear / 10) * 10;
            promptAge = `${decade}년대`;
          }
          const sceneDescription = `${sectionKorean}의 ${idx + 1}번째 추억: ${answer}`;
          const styleForThis = idx === 0 ? `${stylePrompts.korean} ${stylePrompt}` : stylePrompt;
          const growthKeywords = "growing up, consistent appearance, same person, age-appropriate, continuity, 성장하는 모습, 일관성, 연속성";
          // 영어 변환
          const promptGender = toEnglishGender(userGender);
          const promptAgeEng = toEnglishAge(String(promptAge));
          // 영어 프롬프트 생성
          const englishPrompt = `A ${promptAgeEng} ${promptGender} named ${promptName}. Scene: ${answer}. Style: ${styleForThis}. Mood: ${mood}. Keywords: ${keywords}, ${growthKeywords}. Requirements: Generate exactly ONE image (not 4-panel), NO cropping, NO visible text, NO Japanese/Chinese/American cultural elements, only Korean-inspired or culturally neutral elements, focus on the emotional story and scene, warm, nostalgic, high quality, detailed artwork.`;
          // 실제 AI 호출에는 englishPrompt 사용, 표시용 프롬프트는 기존 prompt 사용
          imagePrompts.push({
            display: `Create a single illustration based on this story:\n\nName: ${promptName}\nGender: ${userGender}\nAge: ${String(promptAge)}\nScene: ${sceneDescription}\nMood: ${mood}\nStyle: ${styleForThis}\nKeywords: ${keywords}, ${growthKeywords}\n\nRequirements:\n- Generate exactly ONE image (not 4-panel)\n- NO cropping of the image\n- NO visible text, letters, or writing in any language\n- NO Japanese cultural elements, clothing, or style\n- NO Chinese cultural elements, clothing, or style\n- NO American cultural elements or style\n- Use only Korean-inspired or culturally neutral elements\n- Focus on the emotional story and scene\n- Create a warm, nostalgic atmosphere\n- High quality, detailed artwork`,
            ai: englishPrompt
          });
          promptIndex++;
        }
      });
    });

    // fetch에 타임아웃 적용 함수
    function fetchWithTimeout(resource: RequestInfo, options: RequestInit = {}, timeout = 30000) {
      return Promise.race([
        fetch(resource, options),
        new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), timeout))
      ]);
    }
    // 병렬로 이미지 생성 (타임아웃 적용)
    let completed = 0;
    const total = imagePrompts.length;
    const generatedImages: string[] = [];
    for (let i = 0; i < imagePrompts.length; i++) {
      const promptObj = imagePrompts[i];
      const aiPrompt = typeof promptObj === 'string' ? promptObj : promptObj.ai;
      try {
        const res = await fetchWithTimeout("/api/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            prompt: aiPrompt, 
            style: imageStyle,
            userName,
            userAge,
            userGender
          }),
        }, 30000);
        let url = `/placeholder.svg?height=400&width=400&text=Memory+${i + 1}`;
        if (res instanceof Response && res.ok) {
          const data = await res.json();
          url = data?.imageUrl || url;
        }
        generatedImages.push(url);
      } catch {
        generatedImages.push(`/placeholder.svg?height=400&width=400&text=Memory+${i + 1}`);
      }
      completed++;
      setImageGenerationProgress(Math.round((completed / total) * 100));
      setCurrentGeneratingImage(completed);
    }

    setImageGenerationProgress(100)
    setGenerationStatus("모든 이미지 생성이 완료되었습니다!")
    setGeneratedImages(generatedImages)
    setIsGeneratingImages(false)
    setShowAutobiography(true);
    setCurrentStage(null);
    setCurrentQuestionIndex(0);
    setCurrentAnswer("");
    playSound('/sfx/full-autobiography-complete.mp3', 0.45);
  }

  // 2. 이미지 생성 함수 수정 - 스토리 기반 프롬프트 개선
  const generateSectionImages = async (
    sectionId: string,
    answers: string[],
    userName: string,
    userAge: string,
    userGender: string,
    imageStyle: string
  ) => {
    stopAllSounds();
    playSound('/sfx/image-generation-start.mp3', 0.3);
    
    const sectionNames: { [key: string]: string } = {
      childhood: "어린시절",
      school: "학창시절",
      work: "사회생활",
      love: "연애시절",
      present: "현재",
      future: "미래",
    };
    const sectionKorean = sectionNames[sectionId] || sectionId;
    
    // 섹션별 분위기 설정
    const moodSettings = {
      childhood: "warm, nostalgic, innocent, playful, dreamy",
      school: "youthful, energetic, hopeful, learning, friendship",
      work: "professional, determined, growth, achievement, responsibility",
      love: "romantic, tender, emotional, intimate, beautiful",
      present: "content, peaceful, grateful, mindful, balanced",
      future: "aspirational, visionary, optimistic, dreamy, inspiring"
    };
    
    // 스타일별 프롬프트 확장
    const stylePrompts = {
      ghibli: "ghibli style, soft pastel, dreamy, magical, anime, beautiful, cinematic, Studio Ghibli inspired,",
      elegant: "elegant illustration, fine art, gold accents, luxury, soft light, ornate, sophisticated,",
      childhood: "children's book, cute, playful, bright, watercolor, simple, innocent, colorful,",
      watercolor: "watercolor, soft, dreamy, delicate, flowing, artistic,",
      oil: "oil painting, rich texture, vibrant, classic, artistic,",
      korean: "Korean traditional painting, ink, hanbok, oriental, cultural,",
      sketch: "sketch, pencil, hand-drawn, simple, artistic,",
    };
    
    const stylePrompt = stylePrompts[imageStyle as keyof typeof stylePrompts] || stylePrompts.ghibli;
    const mood = moodSettings[sectionId as keyof typeof moodSettings] || "warm, emotional";
    
    // 답변별로 스토리 기반 프롬프트 생성
    const prompts = Array.from({ length: 6 }).map((_, index) => {
      const answer = answers[index % answers.length] || "";
      const nouns = extractKoreanNouns(answer as string);
      const keywords = Array.isArray(nouns) && nouns.length > 0 ? nouns[0] : "";
      const sectionAge = getSectionAge(sectionId, userAge);
      const sceneDescription = `${sectionKorean}의 ${index + 1}번째 추억: ${answer}`;
      // 4컷 중 첫 번째(0번)만 한국 전통 스타일, 나머지는 현대적 스타일
      const styleForThis = index === 0 ? `${stylePrompts.korean} ${stylePrompt}` : stylePrompt;
      const growthKeywords = "growing up, consistent appearance, same person, age-appropriate, continuity, 성장하는 모습, 일관성, 연속성";
      const prompt = `Create a single illustration based on this story:\n\nName: ${userName}\nGender: ${userGender}\nAge: ${sectionAge}\nScene: ${sceneDescription}\nMood: ${mood}\nStyle: ${styleForThis}\nKeywords: ${keywords}, ${growthKeywords}\n\nRequirements:\n- Generate exactly ONE image (not 4-panel)\n- NO cropping of the image\n- NO visible text, letters, or writing in any language\n- NO Japanese cultural elements, clothing, or style\n- NO Chinese cultural elements, clothing, or style\n- NO American cultural elements or style\n- Use only Korean-inspired or culturally neutral elements\n- Focus on the emotional story and scene\n- Create a warm, nostalgic atmosphere\n- High quality, detailed artwork`;
      return prompt;
    });
    
    // fetch에 타임아웃 적용 함수
    function fetchWithTimeout(resource: RequestInfo, options: RequestInit = {}, timeout = 30000) {
      return Promise.race([
        fetch(resource, options),
        new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), timeout))
      ]);
    }
    // 병렬로 이미지 생성 (타임아웃 적용)
    let completed = 0;
    const total = prompts.length;
    const images: string[] = [];
    for (let i = 0; i < prompts.length; i++) {
      const prompt = prompts[i];
      try {
        const res = await fetchWithTimeout("/api/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            prompt, 
            style: imageStyle, 
            section: sectionId,
            userName,
            userAge,
            userGender
          }),
        }, 30000);
        let url = `/placeholder.svg?height=300&width=300&text=${encodeURIComponent(imageStyle + ' ' + sectionId + ' ' + (i+1))}`;
        if (res instanceof Response && res.ok) {
          const data = await res.json();
          url = data?.imageUrl || url;
        }
        images.push(url);
      } catch {
        images.push(`/placeholder.svg?height=300&width=300&text=${encodeURIComponent(imageStyle + ' ' + sectionId + ' ' + (i+1))}`);
      }
      completed++;
      setImageGenerationProgress(Math.round((completed / total) * 100));
      setCurrentGeneratingImage(completed);
    }
    return images;
  }

  // 다음 질문으로 이동
  const nextQuestion = async () => {
    if (!currentStage) return

    const stageIndex = sections.findIndex((s) => s.id === currentStage)
    const currentSection = sections[stageIndex]

    // 현재 답변 저장
    const updatedSections = [...sections]
    updatedSections[stageIndex].answers[currentQuestionIndex] = currentAnswer

    if (currentQuestionIndex < currentSection.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setCurrentAnswer("")
      // 다음 질문 음성으로 읽기
      setTimeout(() => {
        speakQuestion(currentSection.questions[currentQuestionIndex + 1])
      }, 500)
    } else {
      // 현재 단계 완료 - 해당 섹션의 4컷 이미지 생성
      setIsGeneratingImages(true)
      setGenerationStatus(`${currentSection.title} 이미지를 생성하고 있습니다...`)

      // 답변이 있는 경우에만 이미지 생성
      const filteredAnswers = updatedSections[stageIndex].answers.filter(a => a && a.trim());
      const sectionImages = await generateSectionImages(
        currentStage,
        updatedSections[stageIndex].answers,
        userName,
        userAge,
        userGender,
        imageStyle
      )

      // 섹션별 이미지를 저장 (기존 generatedImages 배열 대신 섹션별로 관리)
      const updatedSectionsWithImages = [...updatedSections]
      updatedSectionsWithImages[stageIndex].illustration = JSON.stringify(sectionImages)

      // 이미지 생성 완료 효과음
      playSound('/sfx/image-generation-complete.mp3', 0.4);
      // 섹션이 끝나면 모든 효과음 정지
      stopAllSounds();

      // 이미지 선택 UI로 이동 (4개 생성 후 선택)
      setSelectingImages({sectionIndex: stageIndex, images: sectionImages});
      setSelectedImageIndexes([]);
      setIsGeneratingImages(false);
      setCurrentStage(null);
      setCurrentQuestionIndex(0);
      setCurrentAnswer("");
      // setShowAutobiography(true); // 기존 자동 전환 제거
    }

    setSections(updatedSections)
    updateProgress()
  }

  // 전체 자서전 생성 함수 추가
  const generateFullAutobiography = async () => {
    if (!checkAllSectionsCompleted(sections)) {
      alert("모든 단계를 완료해야 전체 자서전을 생성할 수 있습니다.")
      return
    }

    // 블로그 완성 시작 효과음
    playSound('/sfx/blog-completion-start.mp3', 0.4);

    setIsGeneratingImages(true)
    // ... 기존 이미지 생성 로직
    await generateAutobiography(sections)
    
    // 블로그 완성 완료 효과음
    playSound('/sfx/blog-completion-complete.mp3', 0.45);
  }

  // 진행률 업데이트
  const updateProgress = () => {
    const totalQuestions = sections.reduce((sum, section) => sum + section.questions.length, 0)
    const answeredQuestions = sections.reduce((sum, section) => sum + section.answers.filter((a) => a).length, 0)
    setProgress((answeredQuestions / totalQuestions) * 100)
  }

  // 단계 선택
  const selectStage = (stageId: string) => {
    stopAllSounds(); // 섹션 전환 시 효과음 중지
    setCurrentStage(stageId)
    setCurrentQuestionIndex(0)
    setCurrentAnswer("")

    const section = sections.find((s) => s.id === stageId)
    if (section) {
      setTimeout(() => {
        speakQuestion(section.questions[0])
      }, 500)
    }
  }

  // 시작하기
  const handleStart = () => {
    stopAllSounds();
    try {
      const audio = new window.Audio('/sfx/epic-intro.mp3');
      audio.volume = 0.35;
      audio.play();
      playingAudios.push(audio);
      audio.onended = () => {
        const idx = playingAudios.indexOf(audio);
        if (idx !== -1) playingAudios.splice(idx, 1);
      };
    } catch (e) {
      // ignore
    }
    setIsStarting(true);
    setTimeout(() => {
      setIsStarted(true);
      setShowMenuPage(true); // 시작 후 메뉴페이지로 이동
      setIsStarting(false);
    }, 1500);
  };

  useEffect(() => {
    initializeSpeechRecognition()
  }, [])

  // 사용자 상태 초기화
  useEffect(() => {
    const checkUser = async () => {
      try {
        // Supabase가 제대로 설정되었는지 확인
        if (!supabase || !supabase.auth) {
          console.error("Supabase가 설정되지 않았습니다.")
          return
        }

        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          // Supabase가 제대로 설정되었는지 확인
          if (supabase.from) {
            try {
              // 사용자 정보를 데이터베이스에서 가져오기
              const { data: userData, error } = await supabase
                .from("users")
                .select("*")
                .eq("google_id", session.user.id)
                .single()
              
              if (!error && userData) {
                setCurrentUser({
                  id: userData.id,
                  email: userData.email,
                  name: userData.name,
                  avatar_url: userData.avatar_url,
                })
              } else {
                console.error("사용자 데이터 조회 오류:", error)
              }
            } catch (dbError) {
              console.error("데이터베이스 조회 오류:", dbError)
            }
          } else {
            // 데이터베이스가 없어도 기본 사용자 정보는 설정
            setCurrentUser({
              id: session.user.id,
              email: session.user.email,
              name: session.user.user_metadata?.full_name || session.user.email,
              avatar_url: session.user.user_metadata?.avatar_url,
            })
          }
        }
      } catch (error) {
        console.error("사용자 상태 확인 오류:", error)
      }
    }

    checkUser()
  }, [])

  // 추가: 스타일 목록
  const illustrationStyles = [
    { key: 'watercolor', label: 'Watercolor' },
    { key: 'oil', label: 'Oil Painting' },
    { key: 'korean', label: 'Korean Traditional' },
    { key: 'sketch', label: 'Sketch' },
    { key: 'ghibli', label: 'Ghibli' },
  ];

  // 1. 애니메이션 상태 추가
  // const [isStarting, setIsStarting] = useState(false);

  // 1페이지 자서전 생성 함수
  const [showOnePage, setShowOnePage] = useState(false);
  const [onePageStory, setOnePageStory] = useState("");

  function generateOnePageAutobiography() {
    // 사용자 정보
    const name = userName || "이름 미입력";
    const age = userAge || "나이 미입력";
    const gender = userGender || "성별 미입력";
    // 시대적 배경 추정 및 주요 이벤트
    let era = "현대";
    let birthYear = null;
    let eraEvents = "";
    if (age && !isNaN(Number(age))) {
      birthYear = new Date().getFullYear() - Number(age);
      if (birthYear < 1970) {
        era = "1950~60년대";
        eraEvents = "한국전쟁 이후 재건, 경제개발 5개년 계획, 흑백TV, 비틀즈, 아폴로 11호 달 착륙";
      } else if (birthYear < 1990) {
        era = "1970~80년대";
        eraEvents = "서울올림픽, 컬러TV, 민주화운동, 마이클잭슨, 소련 붕괴, 컴퓨터 보급 시작";
      } else if (birthYear < 2010) {
        era = "1990~2000년대";
        eraEvents = "IMF 외환위기, 월드컵 4강, 인터넷/PC방, 휴대폰 대중화, IT혁명, 스마트폰 등장";
      } else {
        era = "2010년대 이후";
        eraEvents = "스마트폰/소셜미디어 일상화, 코로나19 팬데믹, AI/자율주행, 한류 세계화, 메타버스";
      }
    }
    // 질문-답변 스토리
    let story = `『${name}님의 자서전』\n`;
    story += `(${era}, ${gender}, 만 ${age}세 기준)\n`;
    if (birthYear) {
      story += `출생연도: ${birthYear}년\n`;
      story += `주요 시대적 사건: ${eraEvents}\n`;
    }
    story += `\n이 자서전은 AI가 ${name}님의 인생을 시대적 배경과 함께 아름답게 엮어 한 편의 이야기로 만들어 드립니다.\n\n`;
    sections.forEach(section => {
      section.questions.forEach((q, i) => {
        const a = section.answers[i];
        if (a && a.trim()) {
          story += `- ${q}\n  → ${a}\n`;
        }
      });
    });
    // 감성적 마무리
    story += `\n${name}님의 삶은 시대의 흐름 속에서 빛나는 한 편의 이야기입니다. 과거의 추억, 현재의 감정, 미래의 꿈이 어우러져, AI와 함께 써 내려간 이 자서전이 앞으로의 여정에 따뜻한 힘이 되길 바랍니다.`;
    setOnePageStory(story);
    setShowOnePage(true);
  }

  // 로그인 화면
  if (showLogin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-black relative overflow-hidden">
        <Card className="w-full max-w-lg text-center border-2 border-yellow-700 shadow-2xl bg-gradient-to-br from-[#4b2e0e]/90 to-[#2d1a05]/95 relative z-10">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-yellow-200 mb-2">로그인</CardTitle>
            <CardDescription className="text-yellow-100">
              구글 계정으로 로그인하여 블로그 기능을 이용하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GoogleAuth 
              onAuthChange={(user) => {
                setCurrentUser(user);
                setShowLogin(false);
              }}
            />
            <Button
              onClick={() => setShowLogin(false)}
              variant="outline"
              className="mt-4 w-full bg-[#3a240a]/50 border-yellow-600 text-yellow-100 hover:bg-[#3a240a]"
            >
              뒤로가기
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 시작 화면에서 로그인 확인
  if (!isStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-black relative overflow-hidden">
        {/* 별빛 반짝임 효과 */}
        <Starfield explode={isStarting} />
        {/* 중앙 책 표지 이미지 */}
        <img
          src="/storybook-moon.jpg"
          alt="책 표지"
          className="absolute left-1/2 top-1/2 z-10 rounded-2xl shadow-2xl border-4 border-yellow-100 object-cover opacity-80"
          style={{
            width: 'min(400px, 80vw)',
            height: 'auto',
            maxHeight: '60vh',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
          }}
        />
        <Card className="w-full max-w-lg text-center border-2 border-yellow-700 shadow-2xl bg-gradient-to-br from-[#4b2e0e]/90 to-[#2d1a05]/95 relative z-20">
          <CardHeader className="pb-4">
            <div className="flex justify-center mb-4">
              <img src="/lifecast-logo.png" alt="Lifecast Logo" className="w-48 h-24 object-cover rounded-lg shadow-lg border-4 border-yellow-200 bg-white" />
            </div>
            <div className="flex flex-col items-center justify-center mb-8">
              <CardTitle className="text-6xl font-extrabold text-white drop-shadow-lg font-handletter tracking-widest text-center mb-2" style={{fontFamily:'Nanum Pen Script, cursive',letterSpacing:'0.1em',textShadow:'0 2px 16px #fffbe6, 0 1px 0 #bfa76a'}}>
                라이프캐스트
              </CardTitle>
              <CardDescription className="text-yellow-100 mt-2 font-handletter text-xl text-center" style={{textShadow:'0 1px 8px #fffbe6'}}>
                나만의 인생 이야기를 AI와 함께 손글씨처럼 따뜻하게 기록해보세요.<br/>
                당신의 추억을 저장하셔요.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mb-4">
              {currentUser ? (
                <div className="flex flex-col gap-2">
                  <div className="text-center text-yellow-100 text-sm">
                    {currentUser.name}님 환영합니다! ✨
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowMyBlogs(true)}
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-[#3a240a]/50 border-yellow-600 text-yellow-100 hover:bg-[#3a240a]"
                    >
                      내 블로그
                    </Button>
                    <Button
                      onClick={() => setShowBlogSettings(true)}
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-[#3a240a]/50 border-yellow-600 text-yellow-100 hover:bg-[#3a240a]"
                    >
                      블로그 설정
                    </Button>
                  </div>
                </div>
              ) :
                <></>
              }
            </div>
            <div className="space-y-2 mb-4">
              <input type="text" placeholder="이름" value={userName} onChange={e=>{ setUserName(e.target.value); if (typeof window !== 'undefined') localStorage.setItem('userName', e.target.value); }} autoComplete="off" suppressHydrationWarning className="w-full rounded px-3 py-2 bg-[#3a240a] text-yellow-100 border border-yellow-700 placeholder:text-yellow-300 font-serif" />
              <input type="password" placeholder="비밀번호" value={userPassword} onChange={e=>setUserPassword(e.target.value)} autoComplete="off" suppressHydrationWarning className="w-full rounded px-3 py-2 bg-[#3a240a] text-yellow-100 border border-yellow-700 placeholder:text-yellow-300 font-serif" />
            </div>
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-2 text-md text-yellow-200 font-serif justify-center">
                <span className="inline-block w-4 h-4 bg-yellow-300 rounded-full shadow-md animate-pulse" />
                음성으로 질문하고 답변을 받아요
              </div>
            </div>
            <Button
              onClick={handleStart}
              className="w-full bg-gradient-to-r from-yellow-600 to-yellow-400 hover:from-yellow-700 hover:to-yellow-500 text-brown-900 font-bold py-3 rounded-full shadow-lg text-lg tracking-widest font-serif border-2 border-yellow-700"
              style={{boxShadow:'0 2px 16px #fffbe6'}}
              disabled={!userName || !userPassword}
            >
              시작하기
            </Button>
            <div className="mt-8 text-center text-xs text-yellow-200 font-mono opacity-80">
              <div className="font-bold tracking-wide">**팀_하이라이트**</div>
              <div>***이주혜, 박강원, 류미란, 이수영***</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 2단계: 메뉴 페이지
  if (showMenuPage) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-black relative overflow-hidden">
        {/* 별빛 반짝임 효과 */}
        <Starfield explode={isStarting} />
        {/* 중앙 책 표지 이미지 */}
        <img
          src="/storybook-moon.jpg"
          alt="책 표지"
          className="absolute left-1/2 top-1/2 z-10 rounded-2xl shadow-2xl border-4 border-yellow-100 object-cover opacity-80"
          style={{
            width: 'min(400px, 80vw)',
            height: 'auto',
            maxHeight: '60vh',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
          }}
        />
        <Card className="w-full max-w-lg text-center border-2 border-yellow-700 shadow-2xl bg-gradient-to-br from-[#4b2e0e]/90 to-[#2d1a05]/95 relative z-20">
          <CardHeader className="pb-4">
            <div className="flex justify-center mb-4">
              <img src="/lifecast-logo.png" alt="Lifecast Logo" className="w-48 h-24 object-cover rounded-lg shadow-lg border-4 border-yellow-200 bg-white" />
            </div>
            <div className="flex flex-col items-center justify-center mb-8">
              <CardTitle className="text-6xl font-extrabold text-white drop-shadow-lg font-handletter tracking-widest text-center mb-2" style={{fontFamily:'Nanum Pen Script, cursive',letterSpacing:'0.1em',textShadow:'0 2px 16px #fffbe6, 0 1px 0 #bfa76a'}}>
                메뉴
              </CardTitle>
              <CardDescription className="text-yellow-100 mt-2 font-handletter text-xl text-center" style={{textShadow:'0 1px 8px #fffbe6'}}>
                원하는 기능을 선택하세요
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {/* 사용자 정보 입력란 복원 */}
            <div className="space-y-3 mb-6">
              <input
                type="text"
                placeholder="이름"
                value={userName}
                onChange={e => { setUserName(e.target.value); if (typeof window !== 'undefined') localStorage.setItem('userName', e.target.value); }}
                autoComplete="off"
                suppressHydrationWarning
                className="w-full rounded px-3 py-2 bg-[#3a240a] text-yellow-100 border border-yellow-700 placeholder:text-yellow-300 font-serif"
              />
              <input
                type="text"
                placeholder="생년월일(YYYYMMDD)"
                value={userAge}
                onChange={e => setUserAge(e.target.value)}
                autoComplete="off"
                suppressHydrationWarning
                className="w-full rounded px-3 py-2 bg-[#3a240a] text-yellow-100 border border-yellow-700 placeholder:text-yellow-300 font-serif"
              />
              <select
                value={userGender}
                onChange={e => setUserGender(e.target.value)}
                className="w-full rounded px-3 py-2 bg-[#3a240a] text-yellow-100 border border-yellow-700 font-serif"
              >
                <option value="">성별 선택</option>
                <option value="남성">남성</option>
                <option value="여성">여성</option>
                <option value="기타">기타</option>
              </select>
              <div className="relative">
                <button
                  type="button"
                  className="w-full flex justify-between items-center rounded px-3 py-2 bg-[#3a240a] text-yellow-100 border border-yellow-700 font-serif focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  onClick={() => setShowStyleDropdown((v:any) => !v)}
                  aria-haspopup="listbox"
                  aria-expanded={showStyleDropdown ? 'true' : 'false'}
                >
                  <span>{
                    ({
                      ghibli: '지브리풍',
                      elegant: '우아한 일러스트',
                      childhood: '동심/동화풍',
                      watercolor: '수채화',
                      oil: '유화',
                      korean: '한국 전통',
                      sketch: '스케치',
                    } as any)[imageStyle] || '스타일 선택'
                  }</span>
                  <svg className={`w-4 h-4 ml-2 transition-transform ${showStyleDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </button>
                {showStyleDropdown && (
                  <ul
                    className="absolute z-30 mt-1 w-full bg-[#3a240a] border border-yellow-700 rounded shadow-lg max-h-60 overflow-auto animate-fadeIn"
                    tabIndex={-1}
                    role="listbox"
                    aria-activedescendant={`style-${imageStyle}`}
                  >
                    {[
                      { key: 'ghibli', label: '지브리풍' },
                      { key: 'elegant', label: '우아한 일러스트' },
                      { key: 'childhood', label: '동심/동화풍' },
                      { key: 'watercolor', label: '수채화' },
                      { key: 'oil', label: '유화' },
                      { key: 'korean', label: '한국 전통' },
                      { key: 'sketch', label: '스케치' },
                    ].map(style => (
                      <li
                        key={style.key}
                        id={`style-${style.key}`}
                        role="option"
                        aria-selected={imageStyle === style.key}
                        className={`px-4 py-2 cursor-pointer hover:bg-yellow-700 hover:text-white ${imageStyle === style.key ? 'bg-yellow-800 text-yellow-100 font-bold' : 'text-yellow-100'}`}
                        onClick={() => {
                          setImageStyle(style.key);
                          setShowStyleDropdown(false);
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            setImageStyle(style.key);
                            setShowStyleDropdown(false);
                          }
                        }}
                        tabIndex={0}
                      >
                        {style.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            {/* 기능 선택 버튼 */}
            <div className="space-y-4 mb-4">
              <Button
                onClick={() => { setShowMenuPage(false); setIsStarted(true); setCurrentStage(null); }}
                className="w-full bg-gradient-to-r from-yellow-600 to-yellow-400 hover:from-yellow-700 hover:to-yellow-500 text-brown-900 font-bold py-3 rounded-full shadow-lg text-lg tracking-widest font-serif border-2 border-yellow-700"
                style={{boxShadow:'0 2px 16px #fffbe6'}}
              >
                나만의 자서전 만들기
              </Button>
              <Button
                onClick={() => { setShowMenuPage(false); setShowAIDiaryPage(true); }}
                className="w-full bg-gradient-to-r from-amber-400 to-yellow-200 hover:from-amber-500 hover:to-yellow-300 text-brown-900 font-bold py-3 rounded-full shadow-lg text-lg tracking-widest font-serif border-2 border-amber-400"
                style={{boxShadow:'0 2px 16px #fffbe6'}}
              >
                AI일기
              </Button>
            </div>
          </CardContent>
        </Card>
        {/* 하단 중앙 뒤로가기 버튼 */}
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-30">
          <Button
            onClick={() => { setShowMenuPage(true); setIsStarted(false); }}
            variant="outline"
            className="w-48 py-3 bg-[#3a240a]/50 border-yellow-600 text-yellow-100 hover:bg-[#3a240a] text-lg font-bold rounded-full shadow-lg border-2 border-yellow-700"
          >
            ← 메뉴로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  // 메뉴 페이지 렌더링
  // if (showMenuPage && !isStarted) { ... } (이 블록 전체 삭제)

  // 블로그 설정 화면
  if (showBlogSettings) {
    if (!currentUser) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-800">블로그 설정</h1>
              <Button
                onClick={() => setShowBlogSettings(false)}
                variant="outline"
                className="border-gray-300"
              >
                뒤로가기
              </Button>
            </div>
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">로그인이 필요합니다</h3>
              <p className="text-gray-500 mb-6">블로그 기능을 이용하려면 먼저 로그인해주세요.</p>
              <Button
                onClick={() => setShowLogin(true)}
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
              >
                구글 로그인
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">블로그 설정</h1>
            <Button
              onClick={() => setShowBlogSettings(false)}
              variant="outline"
              className="border-gray-300"
            >
              뒤로가기
            </Button>
          </div>
          <BlogSettings
            sections={sections}
            images={generatedImages}
            onSave={(blogData) => {
              setShowBlogSettings(false)
              setShowMyBlogs(true)
            }}
          />
        </div>
      </div>
    )
  }

  // 내 블로그 목록 화면
  if (showMyBlogs) {
    // user가 없으면 localStorage에서 이름을 anonymousName으로 넘김
    let anonymousName = "";
    if (typeof window !== "undefined" && !currentUser) {
      anonymousName = localStorage.getItem("userName") || "";
    }
    return (
      <MyBlogs
        user={currentUser}
        anonymousName={anonymousName}
        onCreateNew={() => setShowBlogSettings(true)}
      />
    );
  }

  // 이미지 생성 중 로딩 화면 표시
  if (isGeneratingImages) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg text-center border-2 border-pink-200 shadow-xl">
          <CardHeader>
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center mb-4 animate-pulse">
              <Sparkles className="w-10 h-10 text-white animate-spin" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              이미지 생성 중
            </CardTitle>
            <CardDescription className="text-gray-600">
              AI가 당신의 이야기를 아름다운 그림으로 그리고 있어요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>진행률</span>
                <span>{Math.round(imageGenerationProgress)}%</span>
              </div>
              <Progress value={imageGenerationProgress} className="h-3" />
            </div>

            <div className="bg-gradient-to-r from-pink-100 to-purple-100 p-4 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  {currentGeneratingImage}
                </div>
                <span className="font-semibold text-gray-800">/ 6</span>
              </div>
              <p className="text-sm text-gray-700">이미지를 생성하고 있습니다...</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((num) => (
                <div
                  key={num}
                  className={cn(
                    "aspect-square rounded-lg border-2 flex items-center justify-center transition-all duration-500",
                    currentGeneratingImage >= num
                      ? "border-green-300 bg-green-50"
                      : currentGeneratingImage === num - 1
                        ? "border-pink-300 bg-pink-50 animate-pulse"
                        : "border-gray-200 bg-gray-50",
                  )}
                >
                  {currentGeneratingImage > num ? (
                    <div className="text-green-500">
                      <Heart className="w-8 h-8" />
                    </div>
                  ) : currentGeneratingImage === num ? (
                    <div className="text-pink-500 animate-spin">
                      <Sparkles className="w-8 h-8" />
                    </div>
                  ) : (
                    <div className="text-gray-400">
                      <div className="w-8 h-8 border-2 border-dashed border-gray-300 rounded"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="text-center space-y-2">
              <div className="flex justify-center gap-1">
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-rose-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
              <p className="text-sm text-gray-500">잠시만 기다려주세요. 아름다운 그림을 만들고 있어요 ✨</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 이미지 선택 UI 표시
  if (selectingImages) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-xl w-full">
          <h2 className="text-2xl font-bold text-center mb-6 text-amber-800">6개 이미지 중 4개를 선택하세요</h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {selectingImages.images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                className={`relative border-4 rounded-lg overflow-hidden transition-all duration-200 focus:outline-none ${selectedImageIndexes.includes(idx) ? 'border-amber-500 ring-2 ring-amber-400' : 'border-amber-200'}`}
                onClick={() => {
                  if (selectedImageIndexes.includes(idx)) {
                    setSelectedImageIndexes(selectedImageIndexes.filter(i => i !== idx));
                  } else if (selectedImageIndexes.length < 4) {
                    setSelectedImageIndexes([...selectedImageIndexes, idx]);
                    playSound('/sfx/image-select.mp3', 0.25);
                  }
                }}
                disabled={selectedImageIndexes.length === 4 && !selectedImageIndexes.includes(idx)}
              >
                <img src={img} alt={`생성 이미지 ${idx+1}`} className="w-full h-48 object-cover" />
                {selectedImageIndexes.includes(idx) && (
                  <div className="absolute inset-0 bg-amber-400 bg-opacity-40 flex items-center justify-center text-3xl text-white font-bold">✔</div>
                )}
              </button>
            ))}
          </div>
          <button
            className={`w-full py-3 rounded-lg font-bold text-lg ${selectedImageIndexes.length === 4 ? 'bg-amber-500 text-white' : 'bg-amber-200 text-amber-500 cursor-not-allowed'}`}
            disabled={selectedImageIndexes.length !== 4}
            onClick={() => {
              playSound('/sfx/selection-complete.mp3', 0.4);
              const {sectionIndex, images} = selectingImages;
              const updatedSections = [...sections];
              const selectedImages = selectedImageIndexes.map(i => images[i]);
              updatedSections[sectionIndex].illustration = JSON.stringify(selectedImages);
              setSections(updatedSections);
              setSelectingImages(null);
              setShowAutobiography(true);
            }}
          >
            선택 완료
          </button>
        </div>
      </div>
    );
  }

  // AI일기 상세페이지 연결 조건을 상단에 배치
  if (showAIDiaryPage) {
    return <AIDiary onBack={() => setShowAIDiaryPage(false)} />;
  }

  return showFullAutobiography ? (
    <AutobiographyDisplay sections={sections} images={Object.values(selectedImages)} onBack={() => setShowFullAutobiography(false)} imageStyle={imageStyle} />
  ) : showAutobiography ? (
    <BlogDisplay
      sections={sections}
      onBack={() => setShowAutobiography(false)}
      onViewFullAutobiography={() => {
        if (checkAllSectionsCompleted(sections)) {
          generateAutobiography(sections)
        }
      }}
      selectedImages={selectedImages}
      setSelectedImages={setSelectedImages}
      imageStyle={imageStyle}
      onShowMyBlogs={() => {
        playSound('/sfx/blog-completion-complete.mp3', 0.7);
        setShowAutobiography(false);
        setShowBlogSuccessAnim(true);
        setTimeout(() => {
          setShowMyBlogs(true);
          setShowBlogSuccessAnim(false);
        }, 1200);
      }}
    />
  ) : (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 flex items-center justify-between">
          <Button
            variant="outline"
            className="border-yellow-400 bg-white text-yellow-900 hover:bg-yellow-50"
            onClick={() => { setShowMenuPage(true); setIsStarted(false); }}
          >
            ← 뒤로 가기
          </Button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2 flex-1 text-center">
            나만의 자서전 만들기
          </h1>
          <span className="w-24" /> {/* 오른쪽 정렬용 빈 공간 */}
        </div>

        <div className="text-center mb-8">
          <Progress value={progress} className="w-full max-w-md mx-auto h-2" />
          <p className="text-sm text-gray-600 mt-2">{Math.round(progress)}% 완성</p>
        </div>

        {!currentStage ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sections.map((section) => {
              const completedQuestions = section.answers.filter((a) => a).length
              const totalQuestions = section.questions.length
              const isCompleted = completedQuestions === totalQuestions

              return (
                <Card
                  key={section.id}
                  className={cn(
                    "w-1/2 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 p-2 text-base",
                    section.color,
                    isCompleted && "ring-2 ring-green-400",
                  )}
                  onClick={() => selectStage(section.id)}
                >
                  <CardHeader className="text-center p-2">
                    <div className="mx-auto w-8 h-8 bg-white rounded-full flex items-center justify-center mb-1 shadow-md">
                      {section.icon}
                    </div>
                    <CardTitle className="text-base font-bold">{section.title}</CardTitle>
                    <CardDescription>
                      {completedQuestions}/{totalQuestions} 질문 완료
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-center">
                      {isCompleted ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          완료됨 ✨
                        </Badge>
                      ) : (
                        <Badge variant="outline">시작하기</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <Card className="border-2 border-pink-200 shadow-xl">
              <CardHeader className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {sections.find((s) => s.id === currentStage)?.icon}
                  <CardTitle className="text-xl">{sections.find((s) => s.id === currentStage)?.title}</CardTitle>
                </div>
                <CardDescription>
                  질문 {currentQuestionIndex + 1} / {sections.find((s) => s.id === currentStage)?.questions.length}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gradient-to-r from-pink-100 to-purple-100 p-4 rounded-lg">
                  <p className="text-lg font-medium text-gray-800">
                    {sections.find((s) => s.id === currentStage)?.questions[currentQuestionIndex]}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-center gap-4">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() =>
                        speakQuestion(
                          sections.find((s) => s.id === currentStage)?.questions[currentQuestionIndex] || "",
                        )
                      }
                      disabled={isPlaying}
                      className="border-pink-300 hover:bg-pink-50"
                    >
                      {isPlaying ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
                      질문 듣기
                    </Button>

                    <Button
                      variant={isRecording ? "destructive" : "default"}
                      size="lg"
                      onClick={isRecording ? stopVoiceRecognition : startVoiceRecognition}
                      className={
                        isRecording
                          ? ""
                          : "bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                      }
                    >
                      {isRecording ? <MicOff className="w-5 h-5 mr-2" /> : <Mic className="w-5 h-5 mr-2" />}
                      {isRecording ? "녹음 중지" : "음성 답변"}
                    </Button>
                  </div>

                  {isRecording && (
                    <div className="text-center">
                      <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        음성을 듣고 있습니다... 마이크에 가까이서 말씀해 주세요
                      </div>
                    </div>
                  )}

                  {!isRecording && (
                    <div className="text-center text-sm text-gray-500">
                      💡 음성 답변 버튼을 누르고 마이크 권한을 허용한 후 답변해 주세요
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">답변 (직접 입력 또는 음성으로)</label>
                  <Textarea
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder="여기에 답변을 입력하거나 음성으로 답변해주세요..."
                    className="min-h-[120px] border-pink-200 focus:border-pink-400"
                  />
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStage(null)} className="border-gray-300">
                    단계 선택으로
                  </Button>
                  <Button
                    onClick={nextQuestion}
                    disabled={!currentAnswer.trim()}
                    className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                  >
                    다음 질문
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {checkAllSectionsCompleted(sections) && (
          <div className="mt-8 text-center">
            <Button
              onClick={generateFullAutobiography}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-3 rounded-full text-lg font-semibold"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              완전한 자서전 생성하기
            </Button>
          </div>
        )}

        <div className="fixed bottom-4 right-4 flex gap-2">
          {currentUser && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full bg-white shadow-lg border-pink-200 hover:bg-pink-50"
                onClick={() => setShowMyBlogs(true)}
                title="내 블로그"
              >
                <BookOpen className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full bg-white shadow-lg border-pink-200 hover:bg-pink-50"
                onClick={() => setShowBlogSettings(true)}
                title="블로그 설정"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </>
          )}
          <Button
            variant="outline"
            size="icon"
            className="rounded-full bg-white shadow-lg border-pink-200 hover:bg-pink-50"
            title="편집"
          >
            <Edit3 className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full bg-white shadow-lg border-pink-200 hover:bg-pink-50"
            title="다운로드"
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>
      {showOnePage && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-8 relative">
            <button onClick={()=>setShowOnePage(false)} className="absolute top-4 right-4 text-2xl">×</button>
            <h2 className="text-2xl font-bold mb-4 text-yellow-900">AI 1페이지 자서전</h2>
            <pre className="whitespace-pre-wrap text-gray-800 text-lg font-serif">{onePageStory}</pre>
          </div>
        </div>
      )}
    </div>
  )
}

interface AutobiographyDisplayProps {
  sections: StorySection[]
  images: string[]
  onBack: () => void
  imageStyle: string
}

const AutobiographyDisplay: React.FC<AutobiographyDisplayProps> = ({ sections, images, onBack, imageStyle }) => {
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

  const getBackgroundImage = (sectionId: string) => {
    const backgrounds = {
      childhood: "/images/frame-childhood.png",
      school: "/images/frame-school.png",
      work: "/images/frame-work.jpeg",
      love: "/images/frame-love.jpeg",
      present: "/images/frame-present.jpeg",
      future: "/images/frame-future.jpeg",
    }
    return backgrounds[sectionId as keyof typeof backgrounds] || "/images/frame-elegant.png"
  }

  const completedSections = sections.filter((section) => section.answers.some((answer) => answer && answer.trim()))

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <div className="bg-white shadow-sm border-b border-amber-200">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              나의 인생 이야기
            </h1>
            <p className="text-gray-600 mt-1">AI가 들려주는 특별한 자서전</p>
          </div>
          <Button onClick={onBack} variant="outline" className="border-amber-300 hover:bg-amber-50 bg-transparent">
            <ArrowLeft className="w-4 h-4 mr-2" />
            돌아가기
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {completedSections.map((section, sectionIndex) => (
          <article key={section.id} className="mb-16">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-lg border border-amber-200">
                <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full flex items-center justify-center text-white">
                  {section.icon}
                </div>
                <h2 className="text-2xl font-bold text-amber-800">{section.title}</h2>
              </div>
            </div>

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
                {section.questions.map((question, qIndex) => {
                  const answer = section.answers[qIndex]
                  if (!answer || !answer.trim()) return null
                  // 섹션별 이미지(illustration)는 JSON string으로 저장됨
                  let sectionImages: string[] = [];
                  if (section.illustration) {
                    try { sectionImages = JSON.parse(section.illustration) } catch {}
                  }
                  // 4컷만 표시
                  const imageUrl = sectionImages.slice(0,4)[qIndex] || null;
                  return (
                    <div key={qIndex} className="mb-12 last:mb-0">
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
                      {imageUrl && (
                        <div className="flex justify-center mb-2">
                          <img
                            src={imageUrl}
                            alt={`${section.title} ${imageStyle || "Manga"} panel ${qIndex + 1}`}
                            className="w-full h-full object-cover"
                            style={{ aspectRatio: "1 / 1", minHeight: 0, minWidth: 0 }}
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {section.id === "love" && images.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                <h3 className="text-xl font-bold text-center mb-6 text-amber-800">추억의 순간들</h3>
                <div className="grid grid-cols-2 gap-4">
                  {images.slice(0,4).map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden border-4 border-amber-200 shadow-lg">
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`Memory ${index + 1}`}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
        ))}

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
            {completedSections.map((section) => (
              <Badge key={section.id} className="bg-amber-200 text-amber-800 border-amber-300">
                {section.title}
              </Badge>
            ))}
          </div>

          <div className="text-sm text-amber-600">
            <p>✨ AI 자서전 생성기로 만든 나만의 특별한 이야기 ✨</p>
            <p className="mt-1">{new Date().toLocaleDateString("ko-KR")} 작성</p>
          </div>
        </div>

        <div className="flex justify-center gap-4 mt-8">
          <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
            <Download className="w-4 h-4 mr-2" />
            PDF 다운로드
          </Button>
          <Button variant="outline" className="border-amber-300 hover:bg-amber-50 bg-transparent">
            <Share2 className="w-4 h-4 mr-2" />
            공유하기
          </Button>
        </div>
      </div>
    </div>
  )
}


