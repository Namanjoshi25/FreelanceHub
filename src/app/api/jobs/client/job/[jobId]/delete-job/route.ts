import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req:NextRequest,{params} :{params:{jobId:string}}){
    try {
       /*  let clientId =await req.json() */
        let {jobId} = params
        if(!jobId )  return NextResponse.json({error:"Job id not found"},{status:400})
   /*      if(!clientId )  return NextResponse.json({error:"client not found"},{status:400}) */
          const res =   await prisma.job.delete({
        where:{
            id:jobId,
/*             clientId
 */        }
        })
        if(!res)return NextResponse.json({error:"Failed to delete the job "},{status:400})
            return NextResponse.json({message:"Job deleted successfiully"},{status:201})
        
    } catch (error) {
        console.log("Error while deleting the job",error);
        return NextResponse.json({error:"Error while deleting the job"},{status:500})
    }
}