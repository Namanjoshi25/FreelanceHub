import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req :NextRequest){
    try {
        const {clientId , description,title,budget,skills,category} = await req.json()
        if(!clientId || !description || !title || !budget ||!skills || !category) return NextResponse.json({error:"All fields are required" }, { status:400});
       let newBudget =  parseInt(budget)
        await prisma.job.create({
            data:{
                clientId ,
                description,
                title,
                budget : newBudget,
                category,
                skills,
            }
        })
        return NextResponse.json({message:"job posted successfully"},{status:201})

    } catch (error) {
        console.log("Error in posting a job" , error);
        return NextResponse.json({error:"Failed to create the job"},{status:500})
    }
}