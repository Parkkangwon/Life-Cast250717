"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { BookOpen, Globe, Lock, Eye, Calendar, ExternalLink, Trash2, Plus } from "lucide-react"

interface MyBlogsProps {
  user: any
  onCreateNew: () => void
  anonymousName?: string // 추가: 익명 사용자 이름
}

export default function MyBlogs({ user, onCreateNew, anonymousName }: MyBlogsProps) {
  const [blogs, setBlogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user || anonymousName) {
      fetchMyBlogs()
    }
  }, [user, anonymousName])

  const fetchMyBlogs = async () => {
    try {
      let data, error;
      if (user) {
        ({ data, error } = await supabase
          .from("autobiographies")
          .select(`*, blog_views(count)`)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
        );
      } else if (anonymousName) {
        ({ data, error } = await supabase
          .from("autobiographies")
          .select(`*, blog_views(count)`)
          .eq("author_name", anonymousName)
          .order("created_at", { ascending: false })
        );
      } else {
        setBlogs([]);
        setLoading(false);
        return;
      }

      if (error) {
        console.error("블로그 목록 조회 오류:", error)
        setBlogs([])
        return
      }
      setBlogs(data || [])
    } catch (error) {
      console.error("블로그 목록 조회 오류:", error)
      setBlogs([])
    } finally {
      setLoading(false)
    }
  }

  const deleteBlog = async (blogId: string) => {
    if (!confirm("정말로 이 블로그를 삭제하시겠습니까?")) return

    try {
      const { error } = await supabase.from("autobiographies").delete().eq("id", blogId)

      if (error) {
        console.error("블로그 삭제 오류:", error)
        alert("블로그 삭제에 실패했습니다.")
        return
      }

      setBlogs(blogs.filter((blog) => blog.id !== blogId))
      alert("블로그가 삭제되었습니다.")
    } catch (error) {
      console.error("블로그 삭제 오류:", error)
      alert("블로그 삭제에 실패했습니다.")
    }
  }

  const togglePublic = async (blogId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase.from("autobiographies").update({ is_public: !currentStatus }).eq("id", blogId)

      if (error) {
        console.error("공개 설정 변경 오류:", error)
        alert("설정 변경에 실패했습니다.")
        return
      }

      setBlogs(blogs.map((blog) => (blog.id === blogId ? { ...blog, is_public: !currentStatus } : blog)))
    } catch (error) {
      console.error("공개 설정 변경 오류:", error)
      alert("설정 변경에 실패했습니다.")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">내 블로그</h1>
          <p className="text-gray-600 mt-1">작성한 자서전 블로그를 관리하세요</p>
        </div>
        <Button
          onClick={onCreateNew}
          className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
        >
          <Plus className="w-4 h-4 mr-2" />새 자서전 작성
        </Button>
      </div>

      {/* 블로그 목록 */}
      {blogs.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">아직 작성한 블로그가 없습니다</h3>
            <p className="text-gray-500 mb-6">첫 번째 자서전을 작성해보세요!</p>
            <Button
              onClick={onCreateNew}
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              자서전 작성 시작하기
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {blogs.map((blog) => (
            <Card key={blog.id} className="border-2 border-gray-200 hover:border-pink-300 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-xl">{blog.title}</CardTitle>
                      <Badge variant={blog.is_public ? "default" : "secondary"}>
                        {blog.is_public ? (
                          <>
                            <Globe className="w-3 h-3 mr-1" />
                            공개
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3 mr-1" />
                            비공개
                          </>
                        )}
                      </Badge>
                    </div>
                    <CardDescription className="text-base">{blog.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* 통계 */}
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(blog.created_at).toLocaleDateString("ko-KR")}
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {blog.blog_views?.length || 0}회 조회
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {blog.sections?.filter((s: any) => s.answers?.some((a: string) => a && a.trim())).length || 0}개
                      섹션
                    </div>
                  </div>

                  {/* 액션 버튼들 */}
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => window.open(`/blog/${blog.slug}`, "_blank")}
                      size="sm"
                      variant="outline"
                      className="border-blue-300 text-blue-700 hover:bg-blue-50"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      보기
                    </Button>
                    <Button
                      onClick={() => togglePublic(blog.id, blog.is_public)}
                      size="sm"
                      variant="outline"
                      className={
                        blog.is_public
                          ? "border-orange-300 text-orange-700 hover:bg-orange-50"
                          : "border-green-300 text-green-700 hover:bg-green-50"
                      }
                    >
                      {blog.is_public ? (
                        <>
                          <Lock className="w-3 h-3 mr-1" />
                          비공개로
                        </>
                      ) : (
                        <>
                          <Globe className="w-3 h-3 mr-1" />
                          공개하기
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => deleteBlog(blog.id)}
                      size="sm"
                      variant="outline"
                      className="border-red-300 text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      삭제
                    </Button>
                  </div>

                  {/* 블로그 URL */}
                  {blog.is_public && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-600 mb-1">공개 URL:</div>
                      <code className="text-sm text-blue-600">
                        {window.location.origin}/blog/{blog.slug}
                      </code>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
