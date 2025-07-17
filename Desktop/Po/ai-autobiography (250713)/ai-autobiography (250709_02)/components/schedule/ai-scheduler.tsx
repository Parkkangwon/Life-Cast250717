"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, AlertCircle, CheckCircle, XCircle, Plus, ArrowLeft, Loader2, Sparkles, CalendarDays, Target, Zap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

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
  repeat?: 'none' | 'daily' | 'weekly' | 'monthly'
  alarmSound?: 'default' | 'bell' | 'electronic'
  alarmOffset?: number // 분 단위(10, 30, 60, 1440 등)
}

interface AISchedulerProps {
  onBack: () => void
  currentUser: any
}

export default function AIScheduler({ onBack, currentUser }: AISchedulerProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [newSchedule, setNewSchedule] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    priority: 'medium' as const,
    category: 'work' as const,
    repeat: 'none' as const,
    alarmSound: 'default' as const,
    alarmOffset: 30,
  })
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])
  const [nlpInput, setNlpInput] = useState('');
  const [nlpLoading, setNlpLoading] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string>('');
  const [aiAnalysisLoading, setAiAnalysisLoading] = useState(false);
  const [aiAnalysisError, setAiAnalysisError] = useState('');
  const [aiRecommendLoading, setAiRecommendLoading] = useState(false);
  const [aiRecommendError, setAiRecommendError] = useState('');
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
  const { toast } = useToast()

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

  // AI 일정 요약/분석/최적화 (공통 함수로 분리)
  const analyzeSchedules = async (schedulesToAnalyze: Schedule[]) => {
    setAiAnalysisLoading(true);
    setAiAnalysisError('');
    setAiAnalysisResult('');
    try {
      const response = await fetch('/api/openai-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analyze: true, schedules: schedulesToAnalyze })
      });
      if (!response.ok) throw new Error('AI 분석 실패');
      const data = await response.json();
      setAiAnalysisResult(data.analysis || 'AI가 분석 결과를 반환하지 않았습니다.');
    } catch (e:any) {
      setAiAnalysisError(e.message || 'AI 분석 중 오류 발생');
    } finally {
      setAiAnalysisLoading(false);
    }
  };

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
      createdAt: new Date().toISOString(),
      repeat: newSchedule.repeat,
      alarmSound: newSchedule.alarmSound,
      alarmOffset: newSchedule.alarmOffset,
    }

    const updatedSchedules = [schedule, ...schedules]
    saveSchedules(updatedSchedules)
    setNewSchedule({
      title: '',
      description: '',
      date: '',
      time: '',
      priority: 'medium',
      category: 'work',
      repeat: 'none',
      alarmSound: 'default',
      alarmOffset: 30,
    })
    setAiSuggestions([])
    setShowAddForm(false)
    toast({
      title: "스케줄 추가 완료",
      description: "새로운 스케줄이 추가되었습니다!",
    })
    analyzeSchedules(updatedSchedules); // 추가 후 AI 분석 자동 갱신
  }

  // 스케줄 완료/미완료 토글
  const toggleSchedule = (id: string) => {
    const updatedSchedules = schedules.map(schedule =>
      schedule.id === id ? { ...schedule, completed: !schedule.completed } : schedule
    )
    saveSchedules(updatedSchedules)
    analyzeSchedules(updatedSchedules); // 토글 후 AI 분석 자동 갱신
  }

  // 스케줄 삭제
  const deleteSchedule = (id: string) => {
    const updatedSchedules = schedules.filter(schedule => schedule.id !== id)
    saveSchedules(updatedSchedules)
    
    toast({
      title: "스케줄 삭제 완료",
      description: "스케줄이 삭제되었습니다.",
    })
    analyzeSchedules(updatedSchedules); // 삭제 후 AI 분석 자동 갱신
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
      case 'learning': return <Sparkles className="w-4 h-4" />
      case 'social': return <Calendar className="w-4 h-4" />
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

  // 자연어 입력 → 일정 자동 등록
  const handleNlpSchedule = async () => {
    if (!nlpInput.trim()) {
      toast({ title: '자연어 일정을 입력하세요', description: '예: 내일 3시에 회의 잡아줘', variant: 'destructive' });
      return;
    }
    setNlpLoading(true);
    try {
      const response = await fetch('/api/openai-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nlp: true, text: nlpInput })
      });
      if (!response.ok) throw new Error('AI 일정 파싱 실패');
      const data = await response.json();
      if (!data.schedule) throw new Error('AI가 일정을 인식하지 못했습니다.');
      setNewSchedule({
        title: data.schedule.title || '',
        description: data.schedule.description || '',
        date: data.schedule.date || '',
        time: data.schedule.time || '',
        priority: data.schedule.priority || 'medium',
        category: data.schedule.category || 'work',
      });
      setShowAddForm(true);
      setNlpInput('');
      toast({ title: 'AI가 일정을 파악했습니다', description: '아래 폼에서 확인 후 추가하세요!' });
    } catch (e:any) {
      toast({ title: 'AI 일정 등록 실패', description: e.message || 'AI가 일정을 인식하지 못했습니다.', variant: 'destructive' });
    } finally {
      setNlpLoading(false);
    }
  };

  // AI 일정 요약/분석/최적화 (공통 함수로 분리)
  const handleAnalyzeSchedules = async () => {
    setAiAnalysisLoading(true);
    setAiAnalysisError('');
    setAiAnalysisResult('');
    try {
      const response = await fetch('/api/openai-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analyze: true, schedules })
      });
      if (!response.ok) throw new Error('AI 분석 실패');
      const data = await response.json();
      setAiAnalysisResult(data.analysis || 'AI가 분석 결과를 반환하지 않았습니다.');
    } catch (e:any) {
      setAiAnalysisError(e.message || 'AI 분석 중 오류 발생');
    } finally {
      setAiAnalysisLoading(false);
    }
  };

  // AI 일정 추천 (오늘/주간/월간)
  const handleRecommendSchedules = async (period: 'today'|'week'|'month') => {
    setAiRecommendLoading(true);
    setAiRecommendError('');
    setAiRecommendations([]);
    try {
      const response = await fetch('/api/openai-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recommend: period })
      });
      if (!response.ok) throw new Error('AI 추천 실패');
      const data = await response.json();
      setAiRecommendations(data.recommendations || []);
    } catch (e:any) {
      setAiRecommendError(e.message || 'AI 추천 중 오류 발생');
    } finally {
      setAiRecommendLoading(false);
    }
  };
  // 추천 일정 추가
  const addRecommendedSchedule = (rec: any) => {
    setNewSchedule({
      title: rec.title || '',
      description: rec.description || '',
      date: rec.date || '',
      time: rec.time || '',
      priority: rec.priority || 'medium',
      category: rec.category || 'work',
      repeat: rec.repeat || 'none',
      alarmSound: rec.alarmSound || 'default',
      alarmOffset: rec.alarmOffset || 30,
    });
    setShowAddForm(true);
    toast({ title: '추천 일정이 폼에 입력되었습니다', description: '확인 후 추가하세요!' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <Button onClick={onBack} variant="outline" className="border-green-300 hover:bg-green-50">
            <ArrowLeft className="w-4 h-4 mr-2" />
            돌아가기
          </Button>
          <h1 className="text-3xl font-bold text-green-800">AI 스케줄러</h1>
          <Button 
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            새 스케줄
          </Button>
        </div>

        {/* 자연어 일정 입력 */}
        <div className="mb-6 flex flex-col md:flex-row gap-2 items-center">
          <Input
            value={nlpInput}
            onChange={e => setNlpInput(e.target.value)}
            placeholder="자연어로 일정을 입력하세요 (예: 내일 3시에 회의 잡아줘)"
            className="flex-1 text-base"
            disabled={nlpLoading}
          />
          <Button onClick={handleNlpSchedule} disabled={nlpLoading || !nlpInput.trim()} className="bg-blue-500 text-white min-w-[120px]">
            {nlpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 mr-1" />} AI로 일정 등록
          </Button>
        </div>
        {/* AI 일정 요약/분석/최적화 */}
        <div className="mb-6 flex flex-col md:flex-row gap-2 items-center">
          <Button onClick={handleAnalyzeSchedules} disabled={aiAnalysisLoading || schedules.length === 0} className="bg-purple-600 text-white min-w-[180px]">
            {aiAnalysisLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 mr-1" />} AI 일정 요약/분석/최적화
          </Button>
          {aiAnalysisError && <span className="text-red-500 ml-2">{aiAnalysisError}</span>}
        </div>
        {aiAnalysisResult && (
          <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg text-purple-900 whitespace-pre-line shadow">
            <b>AI 분석 결과</b>
            <div className="mt-2">{aiAnalysisResult}</div>
          </div>
        )}

        {/* AI 일정 추천 */}
        <div className="mb-6 flex flex-col md:flex-row gap-2 items-center">
          <Select onValueChange={v => handleRecommendSchedules(v as any)}>
            <SelectTrigger className="min-w-[180px]">
              <SelectValue placeholder="AI 일정 추천 (오늘/주간/월간)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">오늘 일정 추천</SelectItem>
              <SelectItem value="week">이번주 일정 추천</SelectItem>
              <SelectItem value="month">이번달 일정 추천</SelectItem>
            </SelectContent>
          </Select>
          {aiRecommendLoading && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
          {aiRecommendError && <span className="text-red-500 ml-2">{aiRecommendError}</span>}
        </div>
        {aiRecommendations.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 shadow">
            <b>AI 추천 일정</b>
            <div className="mt-2 space-y-2">
              {aiRecommendations.map((rec, idx) => (
                <div key={idx} className="flex items-center gap-2 border-b border-blue-100 pb-2">
                  <div className="flex-1">
                    <div className="font-semibold">{rec.title}</div>
                    {rec.date && <span className="text-xs text-blue-700">{rec.date} {rec.time}</span>}
                    {rec.description && <div className="text-xs text-blue-700">{rec.description}</div>}
                  </div>
                  <Button size="sm" className="bg-blue-500 text-white" onClick={() => addRecommendedSchedule(rec)}>추가</Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 새 스케줄 추가 폼 */}
        {showAddForm && (
          <Card className="mb-6 border-2 border-green-200 shadow-lg">
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
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">카테고리</label>
                  <Select value={newSchedule.category} onValueChange={(value) => setNewSchedule({...newSchedule, category: value as any})}>
                    <SelectTrigger className="mt-1">
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
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">시간</label>
                  <Input
                    type="time"
                    value={newSchedule.time}
                    onChange={(e) => setNewSchedule({...newSchedule, time: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">우선순위</label>
                  <Select value={newSchedule.priority} onValueChange={(value) => setNewSchedule({...newSchedule, priority: value as any})}>
                    <SelectTrigger className="mt-1">
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
                  className="mt-1"
                  rows={3}
                />
              </div>

              {/* 반복 알림, 알림음, 알림 시점 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">반복</label>
                  <Select value={newSchedule.repeat} onValueChange={v => setNewSchedule({ ...newSchedule, repeat: v as any })}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">없음</SelectItem>
                      <SelectItem value="daily">매일</SelectItem>
                      <SelectItem value="weekly">매주</SelectItem>
                      <SelectItem value="monthly">매월</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">알림음</label>
                  <Select value={newSchedule.alarmSound} onValueChange={v => setNewSchedule({ ...newSchedule, alarmSound: v as any })}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">기본</SelectItem>
                      <SelectItem value="bell">벨</SelectItem>
                      <SelectItem value="electronic">전자음</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">알림 시점</label>
                  <Select value={String(newSchedule.alarmOffset)} onValueChange={v => setNewSchedule({ ...newSchedule, alarmOffset: Number(v) })}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10분 전</SelectItem>
                      <SelectItem value="30">30분 전</SelectItem>
                      <SelectItem value="60">1시간 전</SelectItem>
                      <SelectItem value="1440">1일 전</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* AI 제안 버튼 */}
              <div className="flex items-center gap-2">
                <Button
                  onClick={generateAISuggestions}
                  disabled={aiLoading || !newSchedule.title.trim()}
                  variant="outline"
                  className="border-green-300 hover:bg-green-50"
                >
                  {aiLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  AI 제안 받기
                </Button>
                {aiSuggestions.length > 0 && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    {aiSuggestions.length}개 제안
                  </Badge>
                )}
              </div>

              {/* AI 제안 표시 */}
              {aiSuggestions.length > 0 && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-800 mb-2">AI 제안</h4>
                  <div className="space-y-2">
                    {aiSuggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-green-700">
                        <Sparkles className="w-4 h-4 text-green-500" />
                        {suggestion}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 액션 버튼들 */}
              <div className="flex gap-2">
                <Button onClick={addSchedule} className="bg-green-500 hover:bg-green-600">
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
                      category: 'work',
                      repeat: 'none',
                      alarmSound: 'default',
                      alarmOffset: 30,
                    })
                    setAiSuggestions([])
                  }}
                  variant="outline"
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
            <Card className="text-center py-12">
              <CardContent>
                <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">스케줄이 없습니다</h3>
                <p className="text-gray-500 mb-4">새로운 스케줄을 추가해보세요!</p>
                <Button onClick={() => setShowAddForm(true)} className="bg-green-500 hover:bg-green-600">
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
                      className={`border-2 transition-all duration-200 hover:shadow-md ${
                        schedule.completed 
                          ? 'border-green-200 bg-green-50' 
                          : 'border-gray-200'
                      }`}
                    >
                      <CardContent className="p-4">
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
                                <Badge variant="outline" className="text-xs">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {schedule.time}
                                </Badge>
                              )}
                              <Badge className={`text-xs ${getPriorityColor(schedule.priority)}`}>
                                {getCategoryIcon(schedule.category)}
                                <span className="ml-1">
                                  {schedule.category === 'work' ? '업무' :
                                   schedule.category === 'personal' ? '개인' :
                                   schedule.category === 'health' ? '건강' :
                                   schedule.category === 'learning' ? '학습' : '사회활동'}
                                </span>
                              </Badge>
                              <Badge className={`text-xs ${getPriorityColor(schedule.priority)}`}>
                                {schedule.priority === 'high' ? '높음' :
                                 schedule.priority === 'medium' ? '보통' : '낮음'}
                              </Badge>
                            </div>

                            {/* AI 제안 표시 */}
                            {schedule.aiSuggestions && schedule.aiSuggestions.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <div className="flex items-center gap-1 mb-2">
                                  <Sparkles className="w-4 h-4 text-green-500" />
                                  <span className="text-xs font-medium text-green-700">AI 제안</span>
                                </div>
                                <div className="space-y-1">
                                  {schedule.aiSuggestions.slice(0, 2).map((suggestion, index) => (
                                    <div key={index} className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
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
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
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
  )
} 