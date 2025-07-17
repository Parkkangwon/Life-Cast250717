"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Heart,
  ArrowLeft,
  Download,
  Share2,
  Quote,
  BookOpen,
  Calendar,
  User,
  Eye,
  MessageCircle,
  ThumbsUp,
  Sparkles,
  Save,
} from "lucide-react"
import { useState, useMemo } from "react"
import TypingText from "./TypingText";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import BlogSettings from "./blog/blog-settings";

interface StorySection {
  id: string
  title: string
  icon: React.ReactNode
  color: string
  questions: string[]
  answers: string[]
  illustration?: string
}

interface BlogDisplayProps {
  sections: StorySection[]
  onBack: () => void
  onViewFullAutobiography?: () => void
  selectedImages: { [sectionId: string]: string }
  setSelectedImages: React.Dispatch<React.SetStateAction<{ [sectionId: string]: string }>>
  imageStyle?: string;
}

const createBlogPost = (section: StorySection) => {
  // Placeholder implementation for createBlogPost
  return section.questions
    .map((question, index) => ({
      question,
      answer: section.answers[index],
    }))
    .filter(({ answer }) => answer && answer.trim())
}

// 업로드된 배경 이미지들
const uploadedBackgrounds = [
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%EC%A2%85%EC%9D%B4%20%EB%B0%B0%EA%B2%BD%EC%9D%B4%EB%AF%B8%EC%A7%80%205-qOFdWVXhgdS9tEUva9DohKgch4WlsZ.png", // 골드 그라데이션
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%EC%A2%85%EC%9D%B4%20%EB%B0%B0%EA%B2%BD%EC%9D%B4%EB%AF%B8%EC%A7%80%204-s5q3oUrPN0wDLyKv0OZQRV3q9XRZ2f.png", // 골드 장식 프레임
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%EC%A2%85%EC%9D%B4%20%EB%B0%B0%EA%B2%BD%EC%9D%B4%EB%AF%B8%EC%A7%80%202.png-9R3P7nYgeBf96BFdqtrYXXWzWvokxM.jpeg", // 골드 프레임 (검은 배경)
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%EC%A2%85%EC%9D%B4%20%EB%B0%B0%EA%B2%BD%EC%9D%B4%EB%AF%B8%EC%A7%80%201.png-bV0lsSy9bGUDu5z5JwSrSjT76beEUi.jpeg", // 핑크 꽃 프레임
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%EC%A2%85%EC%9D%B4%20%EB%B0%B0%EA%B2%BD%EC%9D%B4%EB%AF%B8%EC%A7%80%203-NkGBn8Q8un7Qj110eKkkRKwX3uD3SO.png", // 그리스 패턴 프레임
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%EB%82%98%EB%AC%B4%20%EB%AC%B4%EB%A3%8C%EC%9D%B4%EB%AF%B8%EC%A7%80%206.jpg-N3xhSXEFmyoMxVxcuLr2720ta70vxp.jpeg", // 밝은 나무 텍스처
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%EB%82%98%EB%AC%B4%20%ED%85%8D%EC%8A%A4%EC%B3%90%204.jpg-fvq5jORByjeAdGrvKOmgi3yR5IdVvC.jpeg", // 밝은 나무 텍스처 2
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%EB%82%98%EB%AC%B4%20%EC%A7%88%EA%B0%90%201.jpg-nNzd9sNKrYSF693Q8aE4kVmKBJxCLw.jpeg", // 중간 톤 나무 텍스처
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%EB%82%98%EB%AC%B4%20%EC%A7%88%EA%B0%90%203.jpg-oEwQrITvnhLfkiQRPq2oBxvJs9mmfB.jpeg", // 어두운 나무 텍스처
]

// 섹션별 적절한 배경 이미지 랜덤 선택
const getRandomBackgroundForSection = (sectionId: string) => {
  const sectionBackgrounds = {
    childhood: [uploadedBackgrounds[3], uploadedBackgrounds[5], uploadedBackgrounds[6]], // 핑크 꽃, 밝은 나무
    school: [uploadedBackgrounds[1], uploadedBackgrounds[4], uploadedBackgrounds[7]], // 골드 프레임, 그리스 패턴
    work: [uploadedBackgrounds[2], uploadedBackgrounds[8], uploadedBackgrounds[0]], // 검은 배경, 어두운 나무, 골드
    love: [uploadedBackgrounds[3], uploadedBackgrounds[1], uploadedBackgrounds[0]], // 핑크 꽃, 골드 프레임
    present: [uploadedBackgrounds[5], uploadedBackgrounds[6], uploadedBackgrounds[1]], // 밝은 나무, 골드 프레임
    future: [uploadedBackgrounds[0], uploadedBackgrounds[4], uploadedBackgrounds[2]], // 골드 그라데이션, 그리스 패턴
  }

  const backgrounds = sectionBackgrounds[sectionId as keyof typeof sectionBackgrounds] || uploadedBackgrounds
  return backgrounds[Math.floor(Math.random() * backgrounds.length)]
}

// 질문과 답변을 자연스럽게 연결하는 함수
const createNaturalAutobiographySentence = (question: string, answer: string, sectionId: string) => {
  if (!answer) return ""

  // 질문에서 키워드 추출
  const questionKeywords = {
    "가장 좋아했던": "특히 좋아했던 것은",
    "기억에 남는": "가장 기억에 남는 것은",
    꿈꿨던: "그때 꿈꿨던 것은",
    무서웠던: "가장 무서웠던 경험은",
    용감했던: "용감했던 순간은",
    "가장 열심히": "가장 열심히 했던 것은",
    보람찼던: "가장 보람을 느꼈던 순간은",
    로맨틱했던: "가장 로맨틱했던 순간은",
    "중요하게 생각하는": "가장 중요하게 생각하는",
    감사한: "가장 감사하게 생각하는",
    "이루고 싶은": "이루고 싶은",
  }

  // 섹션별 연결어
  const connectors = {
    childhood: ["그 시절", "어린 마음에", "순수했던 그때", "유년기에"],
    school: ["학창시절", "그 당시", "청춘의 한 페이지에서", "교실에서"],
    work: ["직장생활을 하며", "사회인이 되어", "커리어를 쌓으며", "일을 통해"],
    love: ["사랑을 하며", "연애를 통해", "마음을 나누며", "사랑이라는 감정으로"],
    present: ["현재를 살아가며", "지금 이 순간", "오늘을 살며", "현재의 나는"],
    future: ["미래를 그리며", "앞으로의 계획으로", "꿈을 향해", "미래의 나는"],
  }

  // 마무리 문장
  const endings: { [key in keyof typeof connectors]: string[] } = {
    childhood: [
      "그 모든 것이 지금의 나를 만든 소중한 밑거름이 되었다.",
      "순수했던 그 시절이 내 마음 속 보물이 되었다.",
      "어린 시절의 그 경험들이 나를 성장시켜주었다.",
    ],
    school: [
      "그 경험들이 인생의 나침반이 되어주었다.",
      "학창시절의 추억들이 평생의 자산이 되었다.",
      "그때의 배움이 지금도 나를 이끌어준다.",
    ],
    work: [
      "이 모든 경험이 나를 더욱 성숙하게 만들어주었다.",
      "직장생활을 통해 진정한 성장을 이룰 수 있었다.",
      "일을 통해 삶의 의미를 찾을 수 있었다.",
    ],
    love: [
      "그 모든 순간들이 내 마음 속 가장 아름다운 보석이 되었다.",
      "사랑을 통해 더 깊이 있는 사람이 될 수 있었다.",
      "연애의 경험들이 나를 더욱 따뜻하게 만들어주었다.",
    ],
    present: [
      "이 모든 것들이 지금 이 순간을 더욱 의미 있게 만들어준다.",
      "현재의 소중함을 깨달으며 감사한 마음으로 살아간다.",
      "지금 이 순간이 미래를 만들어가는 소중한 시간이다.",
    ],
    future: [
      "이 꿈들이 현실이 되기를 간절히 바란다.",
      "미래를 향한 희망이 내 삶의 원동력이 되고 있다.",
      "앞으로의 여정이 더욱 기대된다.",
    ],
  };

  // sectionEndings -> endings로 변경, 타입 오류 방지
  const sectionConnectors = connectors[sectionId as keyof typeof connectors] || connectors.childhood;
  const sectionEndings = endings[sectionId as keyof typeof endings] || endings.childhood;

  const randomConnector = sectionConnectors[Math.floor(Math.random() * sectionConnectors.length)]
  const randomEnding = sectionEndings[Math.floor(Math.random() * sectionEndings.length)]

  // 자연스러운 문장 생성
  return `${randomConnector} ${answer.replace(/\.$/, "")}였다. ${randomEnding}`;
}

// 1. 연대별 한국사 이슈/이벤트 데이터 (주신 데이터 반영)
const yearEvents: { [decade: string]: string[] } = {
  "1900": [
    "1910년 한일병합 조약 체결 – 한국이 일본의 식민지로 강제 편입됨",
    "1919년 3·1 운동 – 전국적인 독립 만세 시위로 폭력 탄압을 겪음",
    "1919년 대한민국 임시정부 수립 (상하이) – 해외 독립운동 진영 조직됨",
    "1931년 만주사변 – 일본의 중국 침략과 조선의 항일운동 확산",
    "일제의 문화통치 – 1919년 이후 ‘문화통치’로 일단 억압 완화",
    "위안부 강제 징용 – 여성 수천 명 강제 동원되어 ‘정신대’ 논란 시작",
    "농촌 근대화 인프라 구축 – 철도, 학교 등 근대화 촉진",
    "1941~45년 한국인 징병·징용 확대 – 산업·전쟁 노동 착취",
    "1945년 해방과 분단 – 8월 일본 항복 후 미·소 분할 점령 시작",
    "1945년 군정(美·蘇 군정) – 남한 미군정, 북한 소련군정으로 분할 통치"
  ],
  "1940": [
    "1948년 대한민국 정부 수립 (5월 10일 총선, 8월 15일 정부 출범)",
    "1948년 여순사건 및 제주 4·3사건 – 좌익 진압 과정의 민간 피해",
    "1950–53 한국전쟁 – 국가 절반 폐허, 수백만 희생",
    "1950~60년대 계엄·과도정부의 반복 – 반공 정국 속 민권 억압",
    "1953년 정전협정 체결 – 온전한 평화 아닌 휴전 상태 확립",
    "1956년 박정희 군사 쿠데타 시도 – 이후 정치권력 장악 방향 시작",
    "1958년 경제부흥 정책 실시 – 농지개혁 후 산업화 발판",
    "1960년 4·19 혁명 – 이승만 정권 폭력 퇴진, 민주주의 확대",
    "1960년 장면-윤보선 내각 출범 – ‘민정’ 시대 시작",
    "1960년 5·16 군사정변 – 박정희 중심 군부 쿠데타 발생"
  ],
  "1960": [
    "1961년 박정희 정권 출범 – 새마을운동, 경제개발계획 시행",
    "1972년 10월 유신 선언 – 장기집권 위한 헌법개정, 민주주의 억압",
    "1979년 10·26사태—박정희 피살 – KCIA 김재규가 암살",
    "1979년 계엄 확대 및 시위 진압 – 신군부 등장 기반 조성",
    "1980년 5·18 광주민주화운동 – 군의 발포와 진압, 수백명 희생",
    "1970–80년대 경제호황 ‘한강의 기적’ 본격화",
    "1980년 신군부 정권 수립 (전두환 등) – 권위주의 체제 시작",
    "1976년 판문점 도끼 만행사건 – 군사 긴장 고조",
    "1978년 한중 수교 비밀 추진 – 외교 변화의 시초",
    "1975년 퇴계원 조선소 노동자 파업 – 노동권 향상 움직임"
  ],
  "1980": [
    "1987년 6월 민주항쟁 – 직선제 개헌 이끌며 민주화 정착",
    "1988년 서울올림픽 개최 – 세계에 한국을 알린 ‘성공한 개최’",
    "1992년 최초 야당 정권 탄생 – 김영삼 대통령 취임",
    "1997년 IMF 금융위기 – 구제금융 요청, 개혁 가속",
    "1998년 외환위기 극복과 구조조정 – 재벌·금융 개혁 본격화",
    "1999년 디지털 인프라 확충(초고속인터넷) – 문화강국 기반 마련",
    "2000년 노·김 정상회담 – 남북화해 분위기 조성",
    "1995년 성수대교 붕괴 사건 – 안전관리 문제 환기",
    "1994년 김영삼 대통령 금융실명제 실시 – 투명성 강화",
    "1998년 K-pop 해외 확산 시작 – H.O.T 등 선봉"
  ],
  "2000": [
    "2002년 한·일 월드컵 – 4강 진출, 축구 열풍",
    "2010년 천안함·연평도 사건 – 남북 긴장 고조",
    "2016–17년 박근혜 탄핵 – 촛불혁명으로 권위주의 종식",
    "2018년 평창 동계올림픽 – 남북 단일팀 협력 주목",
    "2020년 코로나 팬데믹 대응 – IT 인프라 활용 모범 사례",
    "2022년 K-문학 노벨상 수상(한강 작가)",
    "2023년 서울 핼러윈 압사 사고 – 159명 사망, 안전문제 부각",
    "2024년 여야 리더 피습/강경 대응 – 정치 갈등 증폭",
    "2024년 개고기 금지 법안 통과 – 문화·동물권 변화",
    "2024년 계엄령 선포 시도와 임시 대통령 체제 논란 – “군부독재 회귀” 비판"
  ]
};

// getSectionYear 함수 개선
function getSectionYear(sectionId: string, userAge: string) {
  const now = new Date().getFullYear();
  const age = parseInt(userAge || "30");
  const birthYear = now - age;
  switch (sectionId) {
    case "childhood": // 0~7세
      return `${birthYear}~${birthYear + 7}`;
    case "school": // 8~19세
      return `${birthYear + 8}~${birthYear + 19}`;
    case "work": // 20~60대
      return `${birthYear + 20}~${birthYear + 60}`;
    case "love": // 20~40대
      return `${birthYear + 20}~${birthYear + 40}`;
    case "present": // 현재
      return `${now}`;
    case "future": // 미래
      return `${now + 1}~${birthYear + 99}`;
    default:
      return `${birthYear + 15}`;
  }
}
// getYearEventText에서 year가 범위(문자열)일 때도 처리
function getYearEventText(yearRange: string) {
  // yearRange가 "YYYY" 또는 "YYYY~YYYY" 형태
  let year = parseInt(yearRange.split("~")[0]);
  const decade = Math.floor(year / 20) * 20; // 20년 단위로 매핑
  const events = yearEvents[String(decade)] || [];
  if (events.length === 0) return "";
  // 2개 이상 랜덤 선택
  const shuffled = [...events].sort(() => 0.5 - Math.random());
  const picks = shuffled.slice(0, 2);
  return `${yearRange}년을 전후로 한국에서는 '${picks.join("', '")}' 등의 사건이 있었습니다.`;
}

// 섹션별 좋아요/댓글 상태 관리용 타입
interface LikeCommentState {
  [sectionId: string]: {
    likes: number;
    liked: boolean;
    comments: string[];
    showComment: boolean;
    commentInput: string;
  };
}

export default function BlogDisplay({ sections, onBack, onViewFullAutobiography, selectedImages, setSelectedImages, imageStyle, onShowMyBlogs }: BlogDisplayProps & { onShowMyBlogs?: () => void }) {
  // 섹션별 좋아요/댓글 상태
  const [likeComment, setLikeComment] = useState<LikeCommentState>(() => {
    const state: LikeCommentState = {};
    sections.forEach((section) => {
      state[section.id] = {
        likes: 0,
        liked: false,
        comments: [],
        showComment: false,
        commentInput: "",
      };
    });
    return state;
  });
  // 공유 안내 메시지
  const [shareMsg, setShareMsg] = useState<string>("");
  const [showSaveBlog, setShowSaveBlog] = useState(false);

  // 완료된 섹션만 필터링
  const completedSections = sections.filter((section) => section.answers.some((answer) => answer && answer.trim()))

  // 블로그 전체 배경 이미지를 한 번만 랜덤 선정
  const blogBackgroundImage = useMemo(() => getRandomBackgroundForSection(completedSections[0]?.id || "childhood"), [completedSections]);

  // 답변을 자서전 형태로 확장하는 함수 (질문-답변을 자연스럽게 이어붙여 한 문단으로)
  const expandSectionToParagraph = (section: StorySection) => {
    return section.questions
      .map((q, i) => section.answers[i] && expandAnswerToAutobiography(q, section.answers[i], section.id))
      .filter(Boolean)
      .join(' ');
  };

  // 각 시절별 배경 이미지를 랜덤으로 선택 (이제 사용하지 않음)
  // const getBackgroundImage = (sectionId: string) => blogBackgroundImage;

  // 섹션별 색상 테마
  const getSectionTheme = (sectionId: string) => {
    const themes = {
      childhood: {
        gradient: "from-pink-500 to-rose-500",
        bg: "from-pink-50 to-rose-50",
        text: "text-pink-700",
        border: "border-pink-200",
      },
      school: {
        gradient: "from-purple-500 to-indigo-500",
        bg: "from-purple-50 to-indigo-50",
        text: "text-purple-700",
        border: "border-purple-200",
      },
      work: {
        gradient: "from-blue-500 to-cyan-500",
        bg: "from-blue-50 to-cyan-50",
        text: "text-blue-700",
        border: "border-blue-200",
      },
      love: {
        gradient: "from-rose-500 to-pink-500",
        bg: "from-rose-50 to-pink-50",
        text: "text-rose-700",
        border: "border-rose-200",
      },
      present: {
        gradient: "from-green-500 to-emerald-500",
        bg: "from-green-50 to-emerald-50",
        text: "text-green-700",
        border: "border-green-200",
      },
      future: {
        gradient: "from-indigo-500 to-purple-500",
        bg: "from-indigo-50 to-purple-50",
        text: "text-indigo-700",
        border: "border-indigo-200",
      },
    }
    return themes[sectionId as keyof typeof themes] || themes.childhood
  }

  const allSectionsCompleted = sections.every(
    (section) =>
      section.answers.length === section.questions.length && section.answers.every((answer) => answer && answer.trim()),
  )

  // 답변을 자서전 형태로 확장하는 함수
  const expandAnswerToAutobiography = (question: string, answer: string, sectionId: string) => {
    if (!answer) return ""

    const autobiographyTemplates = {
      childhood: {
        templates: [
          `어린 시절을 되돌아보면, ${answer} 그 순간들은 마치 보석처럼 내 마음 속에 간직되어 있다. 순수했던 그 시절의 기억들이 지금의 나를 만든 소중한 토대가 되었다.`,
          `유년기의 기억 속에서, ${answer} 이러한 경험들은 내가 세상을 바라보는 시각을 형성하는 데 큰 영향을 미쳤다. 어린아이의 눈으로 바라본 세상은 언제나 신비롭고 아름다웠다.`,
          `어린 시절의 나에게, ${answer} 그때의 순수한 마음과 끝없는 호기심이 지금도 내 안에 살아 숨쉬고 있다.`,
        ],
      },
      school: {
        templates: [
          `학창시절을 회상하면, ${answer} 그 시절의 경험들은 내가 사회의 일원으로 성장하는 데 중요한 밑거름이 되었다. 친구들과 함께 나눈 웃음과 눈물이 지금도 생생하다.`,
          `교실에서 보낸 그 소중한 시간들, ${answer} 선생님들의 가르침과 친구들과의 우정이 내 인생의 나침반이 되어주었다.`,
          `청춘의 한 페이지에서, ${answer} 그 모든 순간들이 지금의 나를 만든 소중한 추억이 되었다.`,
        ],
      },
      work: {
        templates: [
          `직장생활을 시작하며, ${answer} 이러한 경험들은 나를 한 단계 더 성숙한 어른으로 만들어주었다. 책임감과 성취감을 동시에 느낄 수 있었던 소중한 시간이었다.`,
          `사회인으로서의 첫걸음에서, ${answer} 동료들과 함께 이루어낸 성과들이 내게 큰 자신감을 주었다.`,
          `커리어를 쌓아가며, ${answer} 이 모든 경험들이 내 인생의 중요한 전환점이 되었다.`,
        ],
      },
      love: {
        templates: [
          `사랑이라는 감정을 알게 되면서, ${answer} 그 순간들은 내 마음에 영원히 새겨진 아름다운 기억이 되었다. 사랑을 통해 나는 더 깊이 있는 사람이 될 수 있었다.`,
          `연애를 통해 배운 것들, ${answer} 이러한 경험들이 내게 진정한 사랑의 의미를 가르쳐주었다.`,
          `마음을 나눈 그 특별한 시간들, ${answer} 사랑의 기쁨과 아픔 모두가 나를 더욱 성숙하게 만들어주었다.`,
        ],
      },
      present: {
        templates: [
          `현재를 살아가며, ${answer} 지금 이 순간의 소중함을 깨닫게 된다. 과거의 모든 경험들이 현재의 나를 만들어냈다.`,
          `오늘을 살아가면서, ${answer} 이러한 깨달음들이 내 삶에 새로운 의미를 부여해준다.`,
          `현재의 나는, ${answer} 이 모든 것들이 미래를 향한 희망의 원동력이 되고 있다.`,
        ],
      },
      future: {
        templates: [
          `미래를 그려보며, ${answer} 이러한 꿈들이 내 삶을 더욱 풍요롭게 만들어줄 것이라 믿는다. 앞으로의 여정이 기대된다.`,
          `앞으로의 계획을 세우며, ${answer} 이 모든 목표들이 실현되는 그날을 상상하면 가슴이 설렌다.`,
          `미래의 나에게, ${answer} 이러한 희망들이 현실이 되기를 간절히 바란다.`,
        ],
      },
    }

    const templates = autobiographyTemplates[sectionId as keyof typeof autobiographyTemplates]?.templates || []
    const randomTemplate = templates[Math.floor(Math.random() * templates.length)]

    return randomTemplate || `${answer} 이러한 경험들이 내 인생의 소중한 한 페이지를 장식하고 있다.`
  }

  // PDF 다운로드 함수 (섹션별 1페이지, 이미지+텍스트 포함)
  const downloadBlog = async () => {
    const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    function waitForImagesToLoad(container: HTMLElement): Promise<void> {
      const images = Array.from(container.querySelectorAll('img'));
      return Promise.all(
        images.map(img => {
          return new Promise<void>(resolve => {
            // 강제로 src를 재할당하여 캐시된 이미지도 load 이벤트 발생
            const src = img.src;
            img.onload = () => resolve();
            img.onerror = () => resolve();
            if (!img.complete || img.naturalWidth === 0) {
              img.src = '';
              img.src = src;
            } else {
              // 이미 로드된 경우에도 load 이벤트 강제 발생
              setTimeout(() => resolve(), 0);
            }
          });
        })
      ).then(() => undefined);
    }

    for (let i = 0; i < completedSections.length; i++) {
      const section = completedSections[i];
      const domId = `pdf-section-page-${i}`;
      const sectionEl = document.getElementById(domId);
      if (!sectionEl) continue;
      // 이미지가 모두 로드될 때까지 대기
      await waitForImagesToLoad(sectionEl);
      // 캡처
      // @ts-ignore: 'scale' is a valid html2canvas option but not in the type
      const canvas = await html2canvas(sectionEl, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const imgProps = { width: canvas.width, height: canvas.height };
      const ratio = Math.min(pageWidth / imgProps.width, pageHeight / imgProps.height);
      const pdfWidth = imgProps.width * ratio;
      const pdfHeight = imgProps.height * ratio;
      if (i !== 0) pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    }
    pdf.save("나의_AI_자서전.pdf");
  };

  // 이미지 삭제 애니메이션 상태
  const [deletingImage, setDeletingImage] = useState<{ [sectionId: string]: string | null }>({});

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-lavender-50 to-rose-50" id="blog-content">
      {/* 블로그 헤더 */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <Button onClick={onBack} variant="outline" className="border-gray-300 hover:bg-gray-50 bg-transparent">
              <ArrowLeft className="w-4 h-4 mr-2" />
              돌아가기
            </Button>
            <div className="flex gap-2">
              {allSectionsCompleted && onViewFullAutobiography && (
                <Button
                  onClick={onViewFullAutobiography}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  완전한 자서전 보기
                </Button>
              )}
              <Button
                onClick={downloadBlog}
                variant="outline"
                className="border-gray-300 hover:bg-gray-50 bg-transparent"
              >
                <Download className="w-4 h-4 mr-2" />
                블로그 다운로드
              </Button>
              {/* 블로그 게시판 저장 버튼 */}
              <Button
                onClick={() => setShowSaveBlog(true)}
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                블로그 게시판에 저장
              </Button>
            </div>
          </div>
          {/* BlogSettings 모달/화면 */}
          {showSaveBlog && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full relative">
                <Button size="sm" variant="ghost" className="absolute top-2 right-2" onClick={() => setShowSaveBlog(false)}>
                  닫기
                </Button>
                <BlogSettings
                  sections={sections}
                  images={Object.values(selectedImages)}
                  onSave={() => {
                    setShowSaveBlog(false);
                    if (onShowMyBlogs) onShowMyBlogs();
                    // 상세페이지로 바로 이동하는 로직이 있다면 제거
                  }}
                />
              </div>
            </div>
          )}

          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">나의 이야기 블로그</h1>
            <p className="text-gray-600">AI와 함께 써내려가는 인생의 순간들</p>
            <div className="flex items-center justify-center gap-4 mt-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>작성자</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date().toLocaleDateString("ko-KR")}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{completedSections.length}개 포스트</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 블로그 포스트들 */}
        <div className="space-y-12">
          {completedSections.map((section, index) => {
            const theme = getSectionTheme(section.id)
            const blogPosts = createBlogPost(section)

            // 텍스트를 useMemo로 고정 (200자 이상, 뉴스/이슈/이벤트 포함)
            const fixedText = useMemo(() => {
              // 기존 스토리
              const base = expandSectionToParagraph(section);
              // 사용자 정보 추출(나이)
              const userAge = (typeof window !== "undefined" && localStorage.getItem("userAge")) || "30";
              const year = getSectionYear(section.id, userAge);
              const eventText = getYearEventText(year);
              // 200자 이상으로 보장
              let result = `${base}\n\n${eventText}`;
              if (result.length < 200) {
                result = result + "\n" + "그 시절의 다양한 사건과 변화 속에서 나만의 특별한 이야기가 만들어졌습니다. 사회와 문화, 기술이 빠르게 변하던 시기, 나의 경험도 그 흐름 속에 녹아 있었습니다.";
              }
              return result;
            }, [section]);

            return (
              <article key={section.id} className="group">
                {/* 실제 화면용 카드 */}
                <Card
                  className={`overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border-2 ${theme.border}`}
                >
                  {/* 포스트 헤더 */}
                  <div className={`bg-gradient-to-r ${theme.gradient} text-white p-6`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                        {section.icon}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">{section.title}</h2>
                        <p className="text-white text-opacity-90">
                          {new Date().toLocaleDateString("ko-KR")} • {blogPosts.length}개의 이야기
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 포스트 내용 */}
                  <CardContent className="p-0">
                    <div
                      className="relative min-h-[700px]"
                      style={{
                        backgroundImage: "linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.88) 50%, rgba(255,255,255,0.92) 100%), url(" + blogBackgroundImage + "),",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                        backgroundAttachment: "fixed",
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent opacity-60"></div>
                      <div className="relative z-10 p-8">
                        {/* 2컷 이미지 출력 */}
                        <div className="mb-8">
                          <h4 className="text-lg font-semibold text-center mb-4 text-gray-800">
                            {section.title}의 2컷 이미지
                          </h4>
                          <div className="bg-white bg-opacity-95 rounded-xl p-6 shadow-lg border-2 border-pink-200 max-w-2xl mx-auto">
                            <div className="grid grid-cols-2 gap-4">
                              {(() => {
                                let sectionImages: string[] = [];
                                try {
                                  sectionImages = section.illustration ? JSON.parse(section.illustration) : [];
                                } catch {
                                  sectionImages = [];
                                }
                                // 사용자 정보 localStorage에서 가져오기
                                const userName = (typeof window !== "undefined" && localStorage.getItem("userName")) || "이름";
                                const userAge = (typeof window !== "undefined" && localStorage.getItem("userAge")) || "30";
                                const userGender = (typeof window !== "undefined" && localStorage.getItem("userGender")) || "남성";
                                // 프롬프트 생성 함수
                                const getImagePrompt = (name: string, age: string, gender: string, answer: string) =>
                                  `${name}, ${age}세, ${gender}의 인물. ${answer}. 현대적인 복장과 배경, 밝고 생동감 있는 분위기. 인물은 정면을 바라보고 있음. 이미지가 크롭되지 않게 전체가 보이도록.`;
                                // 2컷만 출력
                                return [0, 1].map((idx) => (
                                  <div key={idx} className="relative group">
                                    <div className="aspect-square rounded-lg overflow-hidden border-4 border-white shadow-lg bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
                                      <img
                                        src={
                                          sectionImages[idx] ||
                                          "/placeholder.svg?height=200&width=200&text=" + encodeURIComponent((imageStyle || "Manga") + ' ' + (section.title || "Memory") + ' ' + (idx + 1))
                                        }
                                        alt={section.title + " " + (imageStyle || "Manga") + " panel " + (idx + 1)}
                                        className="w-full h-full object-cover"
                                        style={{ aspectRatio: "1 / 1", minHeight: 0, minWidth: 0 }}
                                      />
                                    </div>
                                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg border-2 border-white">
                                      {idx + 1}
                                    </div>
                                    {/* 이미지 생성 프롬프트 표시 */}
                                    {/* 이미지 아래 프롬프트 표시 제거 */}
                                  </div>
                                ));
                              })()}
                            </div>
                            <div className="text-center mt-4">
                              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-100 to-purple-100 px-4 py-2 rounded-full">
                                <Sparkles className="w-4 h-4 text-pink-500" />
                                <span className="text-sm font-medium text-pink-700">AI가 생성한 2컷 이미지</span>
                              </div>
                            </div>
                            {/* 이미지 아래에 전체 텍스트 출력 */}
                            <div className="mt-8">
                              <div className="text-lg text-gray-800 leading-relaxed whitespace-pre-line">{fixedText}</div>
                            </div>
                          </div>
                        </div>

                        {/* 소설형 스토리 */}
                        {/* 기존 소설형 스토리(텍스트) 단독 블록은 삭제 */}
                      </div>
                    </div>
                  </CardContent>

                  {/* 포스트 푸터 */}
                  <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* 좋아요 버튼 */}
                        <Button
                          variant={likeComment[section.id]?.liked ? "default" : "ghost"}
                          size="sm"
                          className={likeComment[section.id]?.liked ? "text-red-500" : "text-gray-600 hover:text-red-500"}
                          onClick={() => {
                            setLikeComment((prev) => ({
                              ...prev,
                              [section.id]: {
                                ...prev[section.id],
                                likes: prev[section.id].liked ? prev[section.id].likes - 1 : prev[section.id].likes + 1,
                                liked: !prev[section.id].liked,
                              },
                            }));
                          }}
                        >
                          <ThumbsUp className="w-4 h-4 mr-1" />
                          좋아요 {likeComment[section.id]?.likes}
                        </Button>
                        {/* 댓글 버튼 */}
                        <Button
                          variant={likeComment[section.id]?.showComment ? "default" : "ghost"}
                          size="sm"
                          className={likeComment[section.id]?.showComment ? "text-blue-500" : "text-gray-600 hover:text-blue-500"}
                          onClick={() => {
                            setLikeComment((prev) => ({
                              ...prev,
                              [section.id]: {
                                ...prev[section.id],
                                showComment: !prev[section.id].showComment,
                              },
                            }));
                          }}
                        >
                          <MessageCircle className="w-4 h-4 mr-1" />
                          댓글 {likeComment[section.id]?.comments.length}
                        </Button>
                        {/* 공유 버튼 */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-600 hover:text-green-500"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(window.location.href + `#${section.id}`);
                              setShareMsg(`'${section.title}' 섹션 링크가 복사되었습니다!`);
                              setTimeout(() => setShareMsg(""), 2000);
                            } catch {
                              setShareMsg("클립보드 복사에 실패했습니다.");
                              setTimeout(() => setShareMsg(""), 2000);
                            }
                          }}
                        >
                          <Share2 className="w-4 h-4 mr-1" />
                          공유
                        </Button>
                      </div>
                      <Badge className={`bg-gradient-to-r ${theme.gradient} text-white border-0`}>
                        {section.title}
                      </Badge>
                    </div>
                    {/* 댓글 입력/목록 UI */}
                    {likeComment[section.id]?.showComment && (
                      <div className="mt-4">
                        <div className="flex gap-2 mb-2">
                          <input
                            type="text"
                            className="flex-1 border rounded px-3 py-2 text-sm"
                            placeholder="댓글을 입력하세요"
                            value={likeComment[section.id]?.commentInput}
                            onChange={e => setLikeComment(prev => ({
                              ...prev,
                              [section.id]: {
                                ...prev[section.id],
                                commentInput: e.target.value,
                              },
                            }))}
                            onKeyDown={e => {
                              if (e.key === "Enter" && likeComment[section.id]?.commentInput.trim()) {
                                setLikeComment(prev => ({
                                  ...prev,
                                  [section.id]: {
                                    ...prev[section.id],
                                    comments: [...prev[section.id].comments, prev[section.id].commentInput],
                                    commentInput: "",
                                  },
                                }));
                              }
                            }}
                          />
                          <Button
                            size="sm"
                            onClick={() => {
                              if (likeComment[section.id]?.commentInput.trim()) {
                                setLikeComment(prev => ({
                                  ...prev,
                                  [section.id]: {
                                    ...prev[section.id],
                                    comments: [...prev[section.id].comments, prev[section.id].commentInput],
                                    commentInput: "",
                                  },
                                }));
                              }
                            }}
                          >
                            등록
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {likeComment[section.id]?.comments.map((c, i) => (
                            <div key={i} className="bg-gray-100 rounded px-3 py-2 text-sm text-gray-700">
                              {c}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* 공유 안내 메시지 */}
                    {shareMsg && (
                      <div className="mt-2 text-green-600 text-sm text-center">{shareMsg}</div>
                    )}
                  </div>
                </Card>
                {/* PDF용 hidden DOM (섹션별 1페이지) */}
                <div
                  id={`pdf-section-page-${index}`}
                  style={{ position: "absolute", left: "-9999px", top: 0, width: "794px", height: "1123px", background: "white", zIndex: -1, overflow: "hidden", display: "block" }}
                >
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      height: "100%",
                      padding: 32,
                      boxSizing: "border-box",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-start",
                      backgroundImage: "url(" + blogBackgroundImage + ")",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                    }}
                  >
                    {/* 반투명 흰색 오버레이 */}
                    <div style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      background: "rgba(255,255,255,0.85)",
                      zIndex: 1,
                    }} />
                    {/* 실제 내용 */}
                    <div style={{ position: "relative", zIndex: 2, height: "100%", display: "flex", flexDirection: "column" }}>
                      <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16 }}>{section.title}</h2>
                      <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
                        {(() => {
                          let sectionImages: string[] = [];
                          try {
                            sectionImages = section.illustration ? JSON.parse(section.illustration) : [];
                          } catch {
                            sectionImages = [];
                          }
                          // 사용자 정보 localStorage에서 가져오기
                          const userName = (typeof window !== "undefined" && localStorage.getItem("userName")) || "이름";
                          const userAge = (typeof window !== "undefined" && localStorage.getItem("userAge")) || "30";
                          const userGender = (typeof window !== "undefined" && localStorage.getItem("userGender")) || "남성";
                          // 프롬프트 생성 함수
                          const getImagePrompt = (name: string, age: string, gender: string, answer: string) =>
                            `${name}, ${age}세, ${gender}의 인물. ${answer}. 현대적인 복장과 배경, 밝고 생동감 있는 분위기. 인물은 정면을 바라보고 있음. 이미지가 크롭되지 않게 전체가 보이도록.`;
                          return [0, 1].map((idx) => (
                            <div key={idx} style={{ flex: 1, borderRadius: 12, overflow: "hidden", border: "2px solid #eee", background: "#faf7f7", minHeight: 180, minWidth: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <img
                                src={sectionImages[idx] || "/placeholder.svg?height=200&width=200&text=" + encodeURIComponent((imageStyle || "Manga") + ' ' + (section.title || "Memory") + ' ' + (idx + 1))}
                                alt={section.title + " " + (imageStyle || "Manga") + " panel " + (idx + 1)}
                                style={{ width: "100%", height: "auto", objectFit: "cover", aspectRatio: "1/1", minHeight: 0, minWidth: 0 }}
                              />
                            </div>
                          ));
                        })()}
                      </div>
                      <div style={{ fontSize: 18, color: "#333", whiteSpace: "pre-line", marginTop: 16, flex: 1 }}>{fixedText}</div>
                    </div>
                  </div>
                </div>
                {/* 포스트 구분선 */}
                {index < completedSections.length - 1 && (
                  <div className="flex items-center justify-center my-8">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      <div className="w-16 h-0.5 bg-gradient-to-r from-gray-300 to-gray-400"></div>
                      <Heart className="w-4 h-4 text-gray-400" />
                      <div className="w-16 h-0.5 bg-gradient-to-r from-gray-400 to-gray-300"></div>
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    </div>
                  </div>
                )}
              </article>
            )
          })}
        </div>

        {/* 블로그 사이드바 정보 */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">블로그 통계</h3>
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{completedSections.length}</div>
                <div className="text-sm text-gray-600">작성된 포스트</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {completedSections.reduce(
                    (sum, section) => sum + section.answers.filter((a) => a && a.trim()).length,
                    0,
                  )}
                </div>
                <div className="text-sm text-gray-600">답변한 질문</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round((completedSections.length / sections.length) * 100)}%
                </div>
                <div className="text-sm text-gray-600">완성도</div>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 액션 */}
        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {allSectionsCompleted ? "모든 이야기가 완성되었습니다!" : "더 많은 이야기를 들려주세요"}
            </h3>
            <p className="text-gray-600 mb-6">
              {allSectionsCompleted
                ? "이제 완전한 자서전을 생성하여 PDF로 다운로드할 수 있습니다."
                : `${sections.length - completedSections.length}개의 시절이 더 기다리고 있어요.`}
            </p>
            <div className="flex justify-center gap-4">
              {!allSectionsCompleted && (
                <Button
                  onClick={onBack}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                >
                  계속 작성하기
                </Button>
              )}
              <Button variant="outline" className="border-gray-300 hover:bg-gray-50 bg-transparent">
                <Download className="w-4 h-4 mr-2" />
                블로그 다운로드
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}