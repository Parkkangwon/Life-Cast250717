"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Calendar, CheckCircle, Clock, Target, TrendingUp } from "lucide-react"

interface ScheduleStatsProps {
  schedules: any[]
}

export default function ScheduleStats({ schedules }: ScheduleStatsProps) {
  const totalSchedules = schedules.length
  const completedSchedules = schedules.filter(s => s.completed).length
  const completionRate = totalSchedules > 0 ? (completedSchedules / totalSchedules) * 100 : 0
  
  const today = new Date().toISOString().split('T')[0]
  const todaySchedules = schedules.filter(s => s.date === today)
  const todayCompleted = todaySchedules.filter(s => s.completed).length
  
  const highPrioritySchedules = schedules.filter(s => s.priority === 'high' && !s.completed)
  const upcomingSchedules = schedules.filter(s => !s.completed && s.date >= today).slice(0, 5)

  const categoryStats = schedules.reduce((acc, schedule) => {
    acc[schedule.category] = (acc[schedule.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 전체 완료율 */}
      <Card className="border-green-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-800">전체 완료율</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{completionRate.toFixed(1)}%</div>
          <Progress value={completionRate} className="mt-2" />
          <p className="text-xs text-gray-500 mt-1">
            {completedSchedules}/{totalSchedules} 완료
          </p>
        </CardContent>
      </Card>

      {/* 오늘의 스케줄 */}
      <Card className="border-blue-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-800">오늘의 스케줄</CardTitle>
          <Calendar className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{todaySchedules.length}</div>
          <p className="text-xs text-gray-500 mt-1">
            {todayCompleted}개 완료
          </p>
        </CardContent>
      </Card>

      {/* 높은 우선순위 */}
      <Card className="border-red-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-red-800">높은 우선순위</CardTitle>
          <Target className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{highPrioritySchedules.length}</div>
          <p className="text-xs text-gray-500 mt-1">
            대기 중
          </p>
        </CardContent>
      </Card>

      {/* 진행률 트렌드 */}
      <Card className="border-purple-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-800">진행률 트렌드</CardTitle>
          <TrendingUp className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">
            {completionRate > 70 ? '우수' : completionRate > 40 ? '보통' : '개선 필요'}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {completionRate > 70 ? '훌륭한 진행률!' : completionRate > 40 ? '꾸준히 진행 중' : '더 많은 노력이 필요해요'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
} 