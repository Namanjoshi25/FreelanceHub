import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
            const { coverLetter,proposedRate,deliveryTime } = await req.json()
            const jobId = req.headers.get("jobId");
            
    if(!jobId || !coverLetter || !proposedRate || !deliveryTime) {
        return NextResponse.json({error:"All fields are required"}, {status: 400});
    }
    const userId = req.headers.get("userId");
    if (!userId) {  return NextResponse.json({ error: "User ID is required" }, { status: 400 }); }


    const existingProposal = await prisma.proposal.findFirst({
        where:{
            jobId,
            developerId:userId
        }
    })
    if(existingProposal) {
        return NextResponse.json({ error: "You have already submitted a proposal for this job" }, { status: 400 }); 
    }
    const proposal = await prisma.proposal.create({
        data: {
            jobId,
            developerId: userId,
             proposalText : coverLetter,
            proposedBudget : Number.parseInt(proposedRate),
            deliveryTime :Number.parseInt(deliveryTime)
        },
        include: {
            developer: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            },
            job: {
                select: {
                    title: true,
                    clientId: true
                }
            }
        }
    });
    return NextResponse.json(proposal, { status: 201 });
        
    } catch (error) {
        console.error("Error in send-proposal route:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
        
    }




}