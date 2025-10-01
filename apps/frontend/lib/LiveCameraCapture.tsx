'use client' 

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button' 
import { useTranslations } from 'next-intl';


// ---- 元件 Props 型別 ----
type CaptureProps = {
  onCaptured: (file: File) => void       // 擷取成功後把 File 回傳給父層
  facingMode?: 'user' | 'environment'      // 指定前鏡頭或後鏡頭（行動裝置）
  quality?: number                         // JPEG 壓縮品質（0~1）
}

// ---- 主要元件 ----
export default function LiveCameraCapture({
  onCaptured,                             
  facingMode = 'user',                    
  quality = 0.92,                          
}: CaptureProps) {

  const t = useTranslations('Common')
  // 參考到 <video> DOM，用來掛上 MediaStream
  const videoRef = useRef<HTMLVideoElement>(null)

  // 保存目前使用中的 MediaStream（方便停止用）
  const streamRef = useRef<MediaStream | null>(null)

  // 預覽圖片（由 File 建立的 Object URL）
  const [preview, setPreview] = useState<string | null>(null)

  // 另存一份目前的 preview URL（避免閉包拿到舊值；卸載時釋放）
  const previewRef = useRef<string | null>(null)

  // 是否正在「顯示相機」（決定是否渲染 <video>；也觸發 effect 啟動相機）
  const [isRunning, setIsRunning] = useState(false)

  // 影片的 metadata 是否載入完成（拿得到 videoWidth/Height 才能擷取）
  const [isReady, setIsReady] = useState(false)

  // ---- 手動「開始顯示相機」：只把 isRunning 設為 true，讓 <video> 先渲染出來 ----
  // 讓 <video> 進 DOM，ref 才不會是 null
  function startCamera() {
     setIsRunning(true)                        
  }

  // ---- 手動「停止相機」：停止 tracks、清掉 srcObject、重置狀態 ----
  function stopCamera() {
    if (streamRef.current) {               
      streamRef.current.getTracks().forEach(t => t.stop()) // 停止所有 track
      streamRef.current = null              // 清掉參考
    }
    if (videoRef.current) {                  
       videoRef.current.srcObject = null     
    }
    setIsReady(false)                          // 重置就緒狀態
    setIsRunning(false)                        // UI 回到「未啟用」
  }

  // ---- 監聽 isRunning / facingMode：真正「向瀏覽器要相機」、把串流掛到 <video> ----
  useEffect(() => {
    // 只有 isRunning=true 時才要啟動相機；false 時不做事
    if (!isRunning) return

    // 若在權限彈窗期間元件被卸載/停止，避免後續掛串流
    let cancelled = false;

    (async () => {
      try {
        const v = videoRef.current
        if (!v) {                         
          console.warn('videoRef 依然為 null（理論上不該發生），中止這次嘗試')
          return
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },            
          audio: false,                    
        })
        if (cancelled) {                  
          stream.getTracks().forEach(t => t.stop())
          return
        }
        streamRef.current = stream
        const onLoaded = () => setIsReady(true)
        v.addEventListener('loadedmetadata', onLoaded, { once: true })
        v.srcObject = stream
        try { await v.play() } catch {}

      } catch (err) {
        alert('無法啟用相機，請確認瀏覽器權限與使用 HTTPS/localhost。')
        console.error('啟用相機錯誤：', err)
        setIsRunning(false)   
      }
    })()
    // ---- 清理函式：isRunning / facingMode 改變或元件卸載時都會呼叫 ----
    return () => {
      cancelled = true                        // 標記取消，避免掛到過期串流
      setIsReady(false)                      // 重置就緒狀態
      if (streamRef.current) {                // 停止並清除串流
        streamRef.current.getTracks().forEach(t => t.stop())
        streamRef.current = null
      }
      if (videoRef.current) {                // 清掉 srcObject
        videoRef.current.srcObject = null
      }
    }
  }, [isRunning, facingMode])  // isRunning=true→啟動相機；facingMode 變更→重啟

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
        streamRef.current = null
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current) 
        previewRef.current = null
      }
    }
  }, [])    

  const capture = async () => {
      const v = videoRef.current           
      if (!v) return                         
      if (!isReady || v.videoWidth === 0 || v.videoHeight === 0) {
        alert('相機尚未就緒，請稍候再試一次。')
        return
     }

    const canvas = document.createElement('canvas')
    canvas.width = v.videoWidth
    canvas.height = v.videoHeight

    const ctx = canvas.getContext('2d')!
    ctx.drawImage(v, 0, 0, canvas.width, canvas.height)

    const blob: Blob = await new Promise((res, rej) => {
      canvas.toBlob(
        b => (b ? res(b) : rej(new Error('轉換失敗，Blob 為 null'))),
        'image/jpeg',
        quality
      )
    })
    // 封裝為 File（方便上傳/保存）
    const file = new File([blob], `capture_${Date.now()}.jpg`, {
      type: 'image/jpeg',
      lastModified: Date.now(),
    })

    //  回傳給父層做後續處理（上傳、存檔…）
    onCaptured(file)

    // 6) 建立預覽 URL；釋放舊的以免記憶體洩漏
    const nextUrl = URL.createObjectURL(file)
    setPreview(old => {
      if (old) URL.revokeObjectURL(old)      // 釋放上一張
      return nextUrl                         // 替換為最新預覽
    })
    previewRef.current = nextUrl              // 保留一份最新 URL 供卸載時釋放
  }
   return (
    <div className="space-y-2">
      {isRunning ? (
        <video
          ref={videoRef}                   
          playsInline                          
          className="w-full rounded-xl bg-black/20"
        />
      ) : (
        <div className="flex h-48 w-full items-center justify-center rounded-xl border bg-black/5 text-sm text-muted-foreground">
             {t('CameraNotYet')}
        </div>
      )}
      <div className="flex gap-2">
        {!isRunning && (
          <Button type="button" onClick={startCamera} className="rounded-xl">
                {t('ActivateCamera')}
          </Button>
        )}
        {isRunning && (
          <>
            <Button
              type="button"
              onClick={capture}
              disabled={!isReady}   
              className="rounded-xl"
            >
              {isReady ? t('CapturePhoto') : t('StartingCamera')} 
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={stopCamera}
              className="rounded-xl"
            >
               {t('StopCamera')}
            </Button>
          </>
        )}
      </div>
      {preview ? (
        <img
          src={preview}
          alt="captured"
          className="mt-2 w-full rounded-xl border bg-black/5 object-contain"
        />
      ) : null}
    </div>
  )
}