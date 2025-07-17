import { supabase } from '@/lib/supabase';

export default async function Notes() {
  // notes 테이블에서 모든 데이터 조회
  const { data: notes, error } = await supabase.from('notes').select();

  if (error) {
    return <div>노트 데이터를 불러오는 중 오류가 발생했습니다: {error.message}</div>;
  }

  return <pre>{JSON.stringify(notes, null, 2)}</pre>;
} 