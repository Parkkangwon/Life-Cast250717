"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, AlertCircle, CheckCircle, XCircle, Plus, ArrowLeft, Loader2, Sparkles, CalendarDays, Target, Zap, BookOpen, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

interface Schedule {
  id: string
  title: string
  description: string
  date: string
  time: string
  priority: 'low' | 'medium' | 'high'
  category: 'work' | 'personal' | 'health' | 'learning' | 'social'
  completed: boolean
  aiSuggestions: string[]
  userId?: string
  createdAt: string
}

// 공통 transition 스타일 변수 선언
const transitionScale = "transition-all duration-300 hover:scale-105";
const transitionShadow = "transition-all duration-300 hover:shadow-xl";
const transitionRing = "transition-all duration-300 focus:ring-2 focus:ring-green-300";

// 1. Starfield 컴포넌트 파일 하단으로 이동
function Starfield() {
  const [stars, setStars] = React.useState<any[]>([]);
  const starCount = 45;
  React.useEffect(() => {
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
  return (
    <div className="absolute inset-0 pointer-events-none z-0">
      <style>{`
        @keyframes luxury-star-twinkle {
          0% { opacity: 0.3; filter: blur(2px) drop-shadow(0 0 6px gold); }
          25% { opacity: 0.8; filter: blur(1px) drop-shadow(0 0 12px #fffbe6); }
          50% { opacity: 0.6; filter: blur(1.5px) drop-shadow(0 0 10px #ffd700); }
          75% { opacity: 0.9; filter: blur(0.8px) drop-shadow(0 0 14px #fffbe6); }
          100% { opacity: 0.3; filter: blur(2px) drop-shadow(0 0 6px gold); }
        }
      `}</style>
      {stars.map((star, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            top: `${star.top}%`,
            left: `${star.left}%`,
            width: `${star.size}rem`,
            height: `${star.size}rem`,
            background: `radial-gradient(circle at 60% 40%, ${star.color} 70%, transparent 100%)`,
            boxShadow: `0 0 ${star.size * 12 + 8}px ${star.size * 2 + 2}px ${star.color}, 0 0 60px 16px #fffbe6`,
            animation: `luxury-star-twinkle ${1.5 + star.size * 0.7}s infinite alternate`,
            filter: 'blur(1px)',
            opacity: 1,
            transition: 'all 1.2s cubic-bezier(.4,2,.6,1)',
          }}
        />
      ))}
    </div>
  );
}

export default function AISchedulerPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [newSchedule, setNewSchedule] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    priority: 'medium' as const,
    category: 'work' as const
  })
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const { toast } = useToast()

  // 사용자 정보 로드
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)
    }
    checkUser()
  }, [])

  // 로컬 스토리지에서 스케줄 로드
  useEffect(() => {
    const savedSchedules = localStorage.getItem('aiSchedules')
    if (savedSchedules) {
      setSchedules(JSON.parse(savedSchedules))
    }
  }, [])

  // 스케줄 저장
  const saveSchedules = (newSchedules: Schedule[]) => {
    setSchedules(newSchedules)
    localStorage.setItem('aiSchedules', JSON.stringify(newSchedules))
  }

  // AI 스케줄 제안 생성
  const generateAISuggestions = async () => {
    if (!newSchedule.title.trim()) {
      toast({
        title: "제목을 입력해주세요",
        description: "AI 제안을 받으려면 스케줄 제목을 먼저 입력해주세요.",
        variant: "destructive"
      })
      return
    }

    setAiLoading(true)
    try {
      const response = await fetch('/api/openai-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newSchedule.title,
          description: newSchedule.description,
          category: newSchedule.category,
          priority: newSchedule.priority
        })
      })

      if (!response.ok) throw new Error('AI 제안 생성 실패')
      
      const data = await response.json()
      setAiSuggestions(data.suggestions || [])
      
      toast({
        title: "AI 제안 생성 완료",
        description: "스마트한 스케줄 제안을 받았습니다!",
      })
    } catch (error) {
      toast({
        title: "AI 제안 생성 실패",
        description: "잠시 후 다시 시도해주세요.",
        variant: "destructive"
      })
    } finally {
      setAiLoading(false)
    }
  }

  // 스케줄 추가
  const addSchedule = () => {
    if (!newSchedule.title.trim() || !newSchedule.date.trim()) {
      toast({
        title: "필수 정보를 입력해주세요",
        description: "제목과 날짜는 필수입니다.",
        variant: "destructive"
      })
      return
    }

    const schedule: Schedule = {
      id: Date.now().toString(),
      ...newSchedule,
      completed: false,
      aiSuggestions: aiSuggestions,
      userId: currentUser?.id,
      createdAt: new Date().toISOString()
    }

    const updatedSchedules = [schedule, ...schedules]
    saveSchedules(updatedSchedules)
    
    setNewSchedule({
      title: '',
      description: '',
      date: '',
      time: '',
      priority: 'medium',
      category: 'work'
    })
    setAiSuggestions([])
    setShowAddForm(false)
    
    toast({
      title: "스케줄 추가 완료",
      description: "새로운 스케줄이 추가되었습니다!",
    })
  }

  // 스케줄 완료/미완료 토글
  const toggleSchedule = (id: string) => {
    const updatedSchedules = schedules.map(schedule =>
      schedule.id === id ? { ...schedule, completed: !schedule.completed } : schedule
    )
    saveSchedules(updatedSchedules)
  }

  // 스케줄 삭제
  const deleteSchedule = (id: string) => {
    const updatedSchedules = schedules.filter(schedule => schedule.id !== id)
    saveSchedules(updatedSchedules)
    
    toast({
      title: "스케줄 삭제 완료",
      description: "스케줄이 삭제되었습니다.",
    })
  }

  // 우선순위별 색상
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-700 border-green-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  // 카테고리별 아이콘
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'work': return <Target className="w-4 h-4" />
      case 'personal': return <CalendarDays className="w-4 h-4" />
      case 'health': return <Zap className="w-4 h-4" />
      case 'learning': return <BookOpen className="w-4 h-4" />
      case 'social': return <Users className="w-4 h-4" />
      default: return <Calendar className="w-4 h-4" />
    }
  }

  // 날짜별 그룹핑
  const groupedSchedules = schedules.reduce((groups, schedule) => {
    const date = schedule.date
    if (!groups[date]) groups[date] = []
    groups[date].push(schedule)
    return groups
  }, {} as Record<string, Schedule[]>)

  const sortedDates = Object.keys(groupedSchedules).sort()

  return (
    <div className="min-h-screen relative overflow-hidden">
      <Starfield />
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 z-0 animate-pulse"></div>
      <div className="relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-6">
            <Link href="/">
              <Button variant="outline" className={`border-green-300 hover:bg-green-50 ${transitionScale}`}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                돌아가기
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-green-800">AI 스케줄러</h1>
            <Button 
              onClick={() => setShowAddForm(true)}
              className={`bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 ${transitionScale}`}
            >
              <Plus className="w-4 h-4 mr-2" />
              새 스케줄
            </Button>
          </div>

          {/* 새 스케줄 추가 폼 */}
          {showAddForm && (
            <Card className="mb-6 border-2 border-green-200 shadow-lg transition-all duration-300 hover:shadow-xl">
              <CardHeader>
                <CardTitle className="text-green-800">새 스케줄 추가</CardTitle>
                <CardDescription>AI가 도와주는 스마트한 스케줄 관리</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">제목 *</label>
                    <Input
                      value={newSchedule.title}
                      onChange={(e) => setNewSchedule({...newSchedule, title: e.target.value})}
                      placeholder="스케줄 제목을 입력하세요"
                      className={transitionRing}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">카테고리</label>
                    <Select value={newSchedule.category} onValueChange={(value) => setNewSchedule({...newSchedule, category: value as any})}>
                      <SelectTrigger className={transitionRing}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="work">업무</SelectItem>
                        <SelectItem value="personal">개인</SelectItem>
                        <SelectItem value="health">건강</SelectItem>
                        <SelectItem value="learning">학습</SelectItem>
                        <SelectItem value="social">사회활동</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">날짜 *</label>
                    <Input
                      type="date"
                      value={newSchedule.date}
                      onChange={(e) => setNewSchedule({...newSchedule, date: e.target.value})}
                      className={transitionRing}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">시간</label>
                    <Input
                      type="time"
                      value={newSchedule.time}
                      onChange={(e) => setNewSchedule({...newSchedule, time: e.target.value})}
                      className={transitionRing}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">우선순위</label>
                    <Select value={newSchedule.priority} onValueChange={(value) => setNewSchedule({...newSchedule, priority: value as any})}>
                      <SelectTrigger className={transitionRing}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">낮음</SelectItem>
                        <SelectItem value="medium">보통</SelectItem>
                        <SelectItem value="high">높음</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">설명</label>
                  <Textarea
                    value={newSchedule.description}
                    onChange={(e) => setNewSchedule({...newSchedule, description: e.target.value})}
                    placeholder="스케줄에 대한 자세한 설명을 입력하세요"
                    className={transitionRing}
                    rows={3}
                  />
                </div>

                {/* AI 제안 버튼 */}
                <div className="flex items-center gap-2">
                  <Button
                    onClick={generateAISuggestions}
                    disabled={aiLoading || !newSchedule.title.trim()}
                    variant="outline"
                    className="border-green-300 hover:bg-green-50 transition-all duration-300 hover:scale-105"
                  >
                    {aiLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4 mr-2" />
                    )}
                    AI 제안 받기
                  </Button>
                  {aiSuggestions.length > 0 && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 transition-all duration-300 hover:scale-105">
                      {aiSuggestions.length}개 제안
                    </Badge>
                  )}
                </div>

                {/* AI 제안 표시 */}
                {aiSuggestions.length > 0 && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200 transition-all duration-300 hover:shadow-md">
                    <h4 className="font-medium text-green-800 mb-2">AI 제안</h4>
                    <div className="space-y-2">
                      {aiSuggestions.map((suggestion, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-green-700 transition-all duration-300 hover:scale-105">
                          <Sparkles className="w-4 h-4 text-green-500" />
                          {suggestion}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 액션 버튼들 */}
                <div className="flex gap-2">
                  <Button onClick={addSchedule} className="bg-green-500 hover:bg-green-600 transition-all duration-300 hover:scale-105">
                    스케줄 추가
                  </Button>
                  <Button 
                    onClick={() => {
                      setShowAddForm(false)
                      setNewSchedule({
                        title: '',
                        description: '',
                        date: '',
                        time: '',
                        priority: 'medium',
                        category: 'work'
                      })
                      setAiSuggestions([])
                    }}
                    variant="outline"
                    className="transition-all duration-300 hover:scale-105"
                  >
                    취소
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 스케줄 목록 */}
          <div className="space-y-6">
            {sortedDates.length === 0 ? (
              <Card className="text-center py-12 transition-all duration-300 hover:shadow-md">
                <CardContent>
                  <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4 transition-all duration-300 hover:scale-105" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">스케줄이 없습니다</h3>
                  <p className="text-gray-500 mb-4">새로운 스케줄을 추가해보세요!</p>
                  <Button onClick={() => setShowAddForm(true)} className="bg-green-500 hover:bg-green-600 transition-all duration-300 hover:scale-105">
                    <Plus className="w-4 h-4 mr-2" />
                    첫 스케줄 추가
                  </Button>
                </CardContent>
              </Card>
            ) : (
              sortedDates.map(date => (
                <div key={date}>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">{date}</h3>
                  <div className="space-y-3">
                    {groupedSchedules[date].map(schedule => (
                      <Card 
                        key={schedule.id} 
                        className={`border-2 transition-all duration-300 hover:shadow-md ${
                          schedule.completed 
                            ? 'border-green-200 bg-green-50' 
                            : 'border-gray-200'
                        }`}
                      >
                        <CardContent className="p-4 transition-all duration-300 hover:scale-105">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <button
                                  onClick={() => toggleSchedule(schedule.id)}
                                  className="flex items-center gap-2 hover:bg-gray-100 rounded p-1 transition-colors"
                                >
                                  {schedule.completed ? (
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                  ) : (
                                    <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                                  )}
                                  <span className={`font-medium ${schedule.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                                    {schedule.title}
                                  </span>
                                </button>
                              </div>
                              
                              {schedule.description && (
                                <p className={`text-sm text-gray-600 mb-2 ${schedule.completed ? 'line-through' : ''}`}>
                                  {schedule.description}
                                </p>
                              )}
                              
                              <div className="flex items-center gap-2 flex-wrap">
                                {schedule.time && (
                                  <Badge variant="outline" className="text-xs transition-all duration-300 hover:scale-105">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {schedule.time}
                                  </Badge>
                                )}
                                <Badge className={`text-xs transition-all duration-300 hover:scale-105 ${getPriorityColor(schedule.priority)}`}>
                                  {getCategoryIcon(schedule.category)}
                                  <span className="ml-1">
                                    {schedule.category === 'work' ? '업무' :
                                     schedule.category === 'personal' ? '개인' :
                                     schedule.category === 'health' ? '건강' :
                                     schedule.category === 'learning' ? '학습' : '사회활동'}
                                  </span>
                                </Badge>
                                <Badge className={`text-xs transition-all duration-300 hover:scale-105 ${getPriorityColor(schedule.priority)}`}>
                                  {schedule.priority === 'high' ? '높음' :
                                   schedule.priority === 'medium' ? '보통' : '낮음'}
                                </Badge>
                              </div>

                              {/* AI 제안 표시 */}
                              {schedule.aiSuggestions && schedule.aiSuggestions.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-gray-200 transition-all duration-300 hover:scale-105">
                                  <div className="flex items-center gap-1 mb-2">
                                    <Sparkles className="w-4 h-4 text-green-500" />
                                    <span className="text-xs font-medium text-green-700">AI 제안</span>
                                  </div>
                                  <div className="space-y-1">
                                    {schedule.aiSuggestions.slice(0, 2).map((suggestion, index) => (
                                      <div key={index} className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded transition-all duration-300 hover:scale-105">
                                        {suggestion}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            <Button
                              onClick={() => deleteSchedule(schedule.id)}
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 transition-all duration-300 hover:scale-105"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 