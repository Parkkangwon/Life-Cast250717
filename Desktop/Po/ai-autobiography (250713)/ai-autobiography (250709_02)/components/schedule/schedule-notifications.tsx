"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, Clock, AlertCircle, CheckCircle, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Schedule {
  id: string
  title: string
  description: string
  date: string
  time: string
  priority: 'low' | 'medium' | 'high'
  category: string
  completed: boolean
}

interface ScheduleNotificationsProps {
  schedules: Schedule[]
}

export default function ScheduleNotifications({ schedules }: ScheduleNotificationsProps) {
  const [notifications, setNotifications] = useState<Schedule[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const { toast } = useToast()

  // 알림이 필요한 스케줄 확인
  useEffect(() => {
    const checkNotifications = () => {
      const now = new Date()
      const today = now.toISOString().split('T')[0]
      const currentTime = now.toTimeString().slice(0, 5)

      const upcomingSchedules = schedules.filter(schedule => {
        if (schedule.completed) return false
        if (schedule.date !== today) return false
        
        // 시간이 설정된 경우 30분 전 알림
        if (schedule.time) {
          const scheduleTime = new Date(`${schedule.date}T${schedule.time}`)
          const notificationTime = new Date(scheduleTime.getTime() - 30 * 60 * 1000)
          return now >= notificationTime && now <= scheduleTime
        }
        
        // 시간이 없는 경우 오늘 스케줄 알림
        return true
      })

      setNotifications(upcomingSchedules)

      // 브라우저 알림 권한 확인 및 요청
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission()
      }
    }

    checkNotifications()
    const interval = setInterval(checkNotifications, 60000) // 1분마다 확인

    return () => clearInterval(interval)
  }, [schedules])

  // 브라우저 알림 보내기
  const sendBrowserNotification = (schedule: Schedule) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification('스케줄 알림', {
        body: `${schedule.title} - ${schedule.time || '오늘'}`,
        icon: '/favicon.ico',
        tag: schedule.id
      })

      notification.onclick = () => {
        window.focus()
        notification.close()
      }
    }
  }

  // 알림 표시
  useEffect(() => {
    notifications.forEach(schedule => {
      sendBrowserNotification(schedule)
      toast({
        title: "스케줄 알림",
        description: `${schedule.title} - ${schedule.time || '오늘'}`,
        duration: 5000
      })
    })
  }, [notifications, toast])

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50">
      <Button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative bg-red-500 hover:bg-red-600"
      >
        <Bell className="w-4 h-4 mr-2" />
        알림 ({notifications.length})
        <Badge className="absolute -top-2 -right-2 bg-red-600 text-white text-xs">
          {notifications.length}
        </Badge>
      </Button>

      {showNotifications && (
        <Card className="mt-2 w-80 border-red-200 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-red-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              스케줄 알림
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {notifications.map(schedule => (
              <div key={schedule.id} className="flex items-center justify-between p-2 bg-red-50 rounded border border-red-200">
                <div className="flex-1">
                  <div className="font-medium text-sm text-red-800">{schedule.title}</div>
                  {schedule.time && (
                    <div className="text-xs text-red-600 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {schedule.time}
                    </div>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setNotifications(prev => prev.filter(n => n.id !== schedule.id))
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
            <Button
              onClick={() => setShowNotifications(false)}
              variant="outline"
              size="sm"
              className="w-full mt-2 border-red-300 text-red-700 hover:bg-red-50"
            >
              닫기
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 