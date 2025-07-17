import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function AIMemoPage({
  memoText, setMemoText, memoImages, setMemoImages, memos, setMemos,
  isRecordingMemo, startMemoVoiceRecognition, saveMemo, handleMemoImageChange,
  editingMemoIdx, editMemoText, setEditMemoText, editMemoImages, setEditMemoImages, handleEditMemoImageChange, saveEditMemo, cancelEditMemo, startEditMemo,
  deleteMemo, copyMemo, shareMemo, aiMemoAction, aiLoadingIdx, aiSummary, aiAnalysis, aiErrorIdx, onClose
}: any) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-2xl">×</button>
        <h2 className="text-2xl font-bold mb-4 text-blue-900">AI 메모</h2>
        <Textarea value={memoText} onChange={e => setMemoText(e.target.value)} placeholder="메모를 입력하세요" className="mb-3 min-h-[100px]" />
        <div className="flex gap-2 mb-3">
          <Button onClick={startMemoVoiceRecognition} variant="outline">
            {isRecordingMemo ? "녹음 중..." : "음성 메모"}
          </Button>
          <label className="inline-block cursor-pointer">
            <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded border border-blue-200 hover:bg-blue-200">사진 추가</span>
            <input type="file" accept="image/*" multiple onChange={handleMemoImageChange} className="hidden" />
          </label>
          <Button onClick={() => { saveMemo(); onClose(); }} className="bg-blue-500 text-white">저장</Button>
        </div>
        <div className="flex gap-2 flex-wrap mb-2">
          {memoImages.map((file: any, idx: number) => (
            <img key={idx} src={file instanceof File ? URL.createObjectURL(file) : file} alt="미리보기" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid #ddd' }} />
          ))}
        </div>
        {/* 저장된 메모 리스트 */}
        <div className="mt-6">
          <h3 className="text-lg font-bold mb-2 text-blue-800">저장된 메모</h3>
          {memos.length === 0 ? (
            <div className="text-gray-400 text-sm">저장된 메모가 없습니다.</div>
          ) : (
            <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {memos.map((memo: any, idx: number) => (
                <li key={idx} className="border rounded-lg p-3 flex flex-col gap-2 bg-blue-50 relative">
                  {editingMemoIdx === idx ? (
                    <>
                      <Textarea value={editMemoText} onChange={e=>setEditMemoText(e.target.value)} className="mb-2" />
                      <input type="file" accept="image/*" multiple onChange={handleEditMemoImageChange} />
                      <div className="flex gap-1 flex-wrap mb-2">
                        {editMemoImages.map((img: any, i: number) => (
                          <img key={i} src={img instanceof File ? URL.createObjectURL(img) : img} alt="첨부" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6, border: '1px solid #bbb' }} />
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={()=>saveEditMemo(idx)} className="bg-blue-500 text-white">저장</Button>
                        <Button size="sm" variant="outline" onClick={cancelEditMemo}>취소</Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex-1">
                        <div className="text-gray-800 mb-1 whitespace-pre-line text-sm">{memo.text}</div>
                        <div className="flex gap-1 flex-wrap mb-1">
                          {memo.images && memo.images.map((img: any, i: number) => (
                            <img key={i} src={img} alt="첨부" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6, border: '1px solid #bbb' }} />
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-1 flex-wrap mb-1">
                        <Button size="sm" variant="outline" onClick={()=>startEditMemo(idx)}>편집</Button>
                        <Button size="sm" variant="outline" onClick={()=>copyMemo(idx)}>복사</Button>
                        <Button size="sm" variant="outline" onClick={()=>shareMemo(idx)}>공유</Button>
                        <Button size="sm" variant="outline" onClick={()=>aiMemoAction(idx,'summary')}>AI 요약</Button>
                        <Button size="sm" variant="outline" onClick={()=>aiMemoAction(idx,'analyze')}>AI 분석</Button>
                        <Button size="icon" variant="ghost" onClick={()=>deleteMemo(idx)} title="삭제">×</Button>
                      </div>
                      {aiLoadingIdx===idx && <div className="text-xs text-blue-500">AI 처리 중...</div>}
                      {aiSummary[idx] && <div className="text-xs text-blue-700 mt-1">요약: {aiSummary[idx]}</div>}
                      {aiAnalysis[idx] && <div className="text-xs text-blue-700 mt-1">분석: {aiAnalysis[idx]}</div>}
                      {aiErrorIdx[idx] && <div className="text-xs text-red-500 mt-1">{aiErrorIdx[idx]}</div>}
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
} 