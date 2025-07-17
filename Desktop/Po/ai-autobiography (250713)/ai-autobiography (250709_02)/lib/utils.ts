import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 간단한 한글 명사 추출기 (정규식 기반)
export function extractKoreanNouns(text: string): string[] {
  // 1. 한글 단어 추출 (2글자 이상)
  const words = text.match(/[가-힣]{2,}/g) || [];
  // 2. 흔한 조사/어미/동사/형용사/접속사 등으로 끝나는 단어 제거
  const postpositions = [
    "에", "에서", "으로", "하고", "등이", "가", "는", "은", "를", "을", "도", "와", "과", "의", "이", "에게", "한테", "까지", "부터", "보다", "처럼", "만큼", "밖에", "마저", "조차", "등",
    // 동사/형용사 어미
    "하다", "했다", "하며", "하고", "하는", "했어요", "놀았어요", "한다", "했다가", "했다면", "했으며", "했으나", "했지만", "했으므로", "했으니", "했으니까", "했으니깐",
    // 접속사/불필요 단어
    "그리고", "그러나", "하지만", "그래서", "또한", "그러므로", "때문에", "하지만", "혹은", "또는", "즉", "따라서", "그러면", "그런데"
  ];
  // 3. 2글자 이상, postpositions로 끝나지 않는 단어만 필터링, 중복 제거, 최대 5개
  const filtered = words.filter(w => !postpositions.some(josa => w.endsWith(josa)) && w.length > 1);
  return Array.from(new Set(filtered)).slice(0, 5);
}
