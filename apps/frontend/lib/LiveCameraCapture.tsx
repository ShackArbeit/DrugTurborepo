'use client'
import {useEffect,useState,useRef} from 'react'
import { Button } from '@/components/ui/button'


type CaptureProps = {
    onCaptured: (file: File) => void;
    facingMode?: 'user' | 'environment';
    quality?: number;
}

export default function LiveCameraCapture({
       onCaptured,
       facingMode='user',
       quality = 0.92, 
}:CaptureProps){
      const videoRef=useRef<HTMLVideoElement>(null);
      const streamRef=useRef<MediaStream|null>(null)
      const [preview,setPreview]=useState<string|null>(null)
      useEffect(()=>{
            (async()=>{
                   try{
                          const stream=await navigator.mediaDevices.getUserMedia({
                               video:{facingMode},
                               audio:false
                          })
                          streamRef.current=stream
                          if(videoRef.current){
                              videoRef.current.srcObject=stream
                          }else{
                               console.log('無法為零')
                          }
                   }catch(err){
                        // alert('無法啟用相機，請確認瀏覽器權限與使用 HTTPS/localhost。');
                        console.error('錯誤訊息如下:',err)
                   }
            })();
            return ()=>{
                  if(streamRef.current){
                        streamRef.current.getTracks().forEach((t)=>t.stop())
                  }
                  if(preview){
                        URL.revokeObjectURL(preview)
                  }
            }
      },[facingMode])

      const capture=async()=>{
            const v = videoRef.current!
            if(v.videoWidth===0 || v.videoHeight===0){
                  alert('相機尚未就緒，請稍候再試一次。');
                  return 
            }else{
                  const canvas = document.createElement("canvas");
                  canvas.width= v.videoWidth;
                  canvas.height=v.videoHeight;
                  const ctx =canvas.getContext('2d')!;
                  ctx.drawImage(v,0,0,canvas.width,canvas.height)
                  const blob: Blob = await new Promise((res) =>
                       canvas.toBlob((b) => res(b!), 'image/jpeg', quality)
                  );
                  const file= new File([blob],`capture_${Date.now()}.jpg`,{type:'image/jpeg'})
                  onCaptured(file)
                  const url=URL.createObjectURL(file)
                  setPreview(old => {
                    if (old) URL.revokeObjectURL(old);
                    return url; // ✅ 回傳新的
});
            }
      }
      return (
            <div className='space-y-2'>
                 <video ref={videoRef} autoPlay playsInline className="w-full rounded-xl bg-black/20"/>
                 <div className='flex gap-2'>
                        <Button type="button" onClick={capture} className="rounded-xl">
                           擷取照片
                        </Button>
                 </div>
                 {
                    preview?(
                         <img
                               src={preview}
                               alt="captured"
                               className="mt-2 w-full rounded-xl border bg-black/5 object-contain"                        />
                    ):(null)
                 }
            </div>
      )
}