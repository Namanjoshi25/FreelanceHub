import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { id: string } }){
   try {
                       const userId = params.id;
      if(!userId) return NextResponse.json({error:"Userid not found"},{status:400})



      const jobs = await prisma.job.findMany({
      where: {
        clientId: userId,
      },
      orderBy: {
        createdAt: 'asc', // 🟢 Sort in ascending order
      },
    });
     return NextResponse.json(jobs)
   } catch (error) {
    console.log("Error while fetching clients jobs" , error);
    return NextResponse.json({error:"Error while fetching clients jobs"},{status:500})
   }

}