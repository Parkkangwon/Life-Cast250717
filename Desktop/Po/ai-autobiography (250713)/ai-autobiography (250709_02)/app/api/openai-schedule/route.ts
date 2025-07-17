import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { title, description, category, priority } = await request.json()

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API 키가 설정되지 않았습니다.' },
        { status: 500 }
      )
    }

    // 카테고리별 프롬프트 설정
    const categoryPrompts = {
      work: "업무 효율성과 생산성을 높이는 방법을 제안해드립니다.",
      personal: "개인적인 목표 달성과 자기계발을 위한 제안을 드립니다.",
      health: "건강 관리와 웰빙을 위한 실용적인 조언을 제공합니다.",
      learning: "효과적인 학습과 지식 습득을 위한 팁을 제안합니다.",
      social: "사회적 관계와 네트워킹을 위한 제안을 드립니다."
    }

    const categoryPrompt = categoryPrompts[category as keyof typeof categoryPrompts] || ""

    const systemPrompt = `당신은 전문적인 스케줄 관리 AI 어시스턴트입니다. 
사용자의 스케줄 정보를 바탕으로 실용적이고 구체적인 제안을 제공해주세요.

${categoryPrompt}

다음 형식으로 3-5개의 구체적인 제안을 제공해주세요:
- 각 제안은 1-2문장으로 간결하게 작성
- 실행 가능하고 구체적인 조언
- 한국어로 자연스럽게 작성
- 번호나 글머리 기호 없이 순서대로 나열

예시:
"미리 준비물을 체크리스트로 정리해두세요"
"시간을 30분 단위로 나누어 효율적으로 관리하세요"
"중요한 일은 오전 시간대에 배치하는 것을 권장합니다"`

    const userPrompt = `스케줄 정보:
- 제목: ${title}
- 설명: ${description || '설명 없음'}
- 카테고리: ${category}
- 우선순위: ${priority}

이 스케줄에 대한 구체적인 제안을 해주세요.`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error('OpenAI API 요청 실패')
    }

    const data = await response.json()
    const suggestions = data.choices[0]?.message?.content
      ?.split('\n')
      ?.filter((line: string) => line.trim())
      ?.map((line: string) => line.replace(/^[-•*]\s*/, '').trim())
      ?.filter((line: string) => line.length > 0) || []

    return NextResponse.json({
      suggestions: suggestions.slice(0, 5) // 최대 5개 제안
    })

  } catch (error) {
    console.error('AI 스케줄 제안 생성 오류:', error)
    return NextResponse.json(
      { error: 'AI 제안 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
} 