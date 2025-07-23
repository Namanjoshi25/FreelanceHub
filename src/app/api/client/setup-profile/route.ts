import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req : NextRequest){
    try {
        let {companyName ,userId} = await req.json();
        if(!companyName || !userId) return NextResponse.json({error:"All fields are required"},{status:400})

            await prisma.clientProfile.create({
               
           
                data:{
                    company:companyName,
                    userId : userId
                }
            
                
            })
            return NextResponse.json({message:"Client Profile successfull"},{status:201})
        
    } catch (error) {
        console.log("Error in client profile setup",error);
    }
}