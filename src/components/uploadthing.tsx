"use client"

import { UploadDropzone } from "@/utils/uploadthing"
import { ourFileRouter} from "@/app/api/uploadthing/core"


interface FileUploadProps{
    onChange :(url?:string)=>void
    endpoint :keyof typeof ourFileRouter
}

function FileUpload({onChange , endpoint} : FileUploadProps) {
  return (
    <UploadDropzone
    endpoint={endpoint}
    onClientUploadComplete={(res)=>onChange(res?.[0].url)}
    onUploadError={(error :Error)=>{
  

    }}
    />

  )
}

export default FileUpload