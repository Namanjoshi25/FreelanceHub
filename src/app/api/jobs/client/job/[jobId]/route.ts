import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server"

export async function GET(req:NextRequest,{ params }: { params: { jobId: string } }){
 try {
    const jobId = params.jobId
    if(!jobId)     return NextResponse.json({error:"jobId is not defined"},{status:404})

        const job = await prisma.job.findUnique({
            where:{
                id:jobId
            }
        })
        if(!job) return NextResponse.json({error:"Job does not exits"},{status:400})
            return NextResponse.json(job)


    
 } catch (error) {
    console.log("Error while getting the job",error);
    return NextResponse.json({error:"Error while fetching the job"},{status:500})
 }
}