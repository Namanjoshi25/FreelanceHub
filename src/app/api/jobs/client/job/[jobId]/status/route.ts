import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req:NextRequest,{params} :{params:{jobId:string}}){
    try {
   
        let {jobId} = params
        if(!jobId)  return NextResponse.json({error:"Job id not found"},{status:400})
          const job =   await prisma.job.findUnique({
        where:{
            id:jobId
        }
        })
        const res = await prisma.job.update({
            where:{
                id:jobId
            },
            data:{
                status: job?.status=="open" ? "closed" :"open"
            }
        })
        if(!res)return NextResponse.json({error:"Failed to update status of the job "},{status:400})
            return NextResponse.json({message:"Job updation successfiully"},{status:201})
        
    } catch (error) {
        console.log("Error while status updation the job",error);
        return NextResponse.json({error:"Error while status updation the job"},{status:500})
    }
}