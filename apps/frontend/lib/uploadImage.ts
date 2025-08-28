export async function uploadImage(file:File):Promise<string>{
      const fd = new FormData();
      fd.append('file',file)
      const response = await fetch('/api/upload',{method:'POST',body:fd})
      if(!response.ok){
            const t = await response.text();
            throw new Error(`上傳失敗：${t || response.status}`);
      }
      const json = await response.json();
      return json.url as string
}

