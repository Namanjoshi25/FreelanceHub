import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { createUploadthing, type FileRouter } from "uploadthing/next";


const f = createUploadthing();

/* const auth = async() => {
  let session = await getServerSession(authOptions);
  if(!session?.user.id) throw Error("unauthorized")
    let userId = session.user.id
    return  {userId }
}; 
 */

export const ourFileRouter = {
  imageUploader: f({
    image: {
    
      maxFileSize: "4MB",
      maxFileCount: 3,
    },
  })

/*     .middleware(()=>auth()) */
  
    .onUploadComplete(async ({ metadata, file }) => {
    
  

 
      return {  fileUrl: file.ufsUrl, fileKey: file.key };
    })
   
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
