import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Pause, Play, Mic, MicOff, BookOpen, Edit3, Download, Sparkles } from "lucide-react";

export default function AIAutobiographyPage(props: any) {
  // 실제 분리 시 app/page.tsx에서 자서전 질문/진행/뷰 렌더링 코드를 이곳으로 옮기고,
  // props로 상태/핸들러를 받아서 사용하도록 구현
  return (
    <div className="min-h-screen flex items-center justify-center text-2xl text-gray-400">
      AI 자서전 기능 분리 (구현 필요)
    </div>
  );
} 