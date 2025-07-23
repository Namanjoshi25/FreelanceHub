import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req:NextRequest,{params} : {params :{jobId:string}}){
    try {
        const {jobId }= params;
      
        const {description,title,budget,skills,category} = await req.json()
        console.log(description,title,budget,skills,category);
       const newBudget = parseInt(budget)
        if(!jobId ) return NextResponse.json({error:"Job not found"},{status:400})

          const updatedJob =  await prisma.job.update({
                where:{
                    id:jobId
                },data:{
                    description,
                    title,
                    skills,
                    category,
                    budget:newBudget
                }
            })
            return NextResponse.json(updatedJob)

        
    } catch (error) {
        console.log("Error while updating the job details",error);
        return NextResponse.json({error:"Error while updating job "},{status:500})
    }
}