import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest , {params } : {params  : {proposalId : string}}){
    try {
         const { proposalId } = params;
     if(!proposalId) {
         return NextResponse.json({ error: "Proposal ID is required" }, { status: 400 });
     }
     const body =  await req.json();
     const {status , jobId  } = body
     //Checking if the job exits
     const job = await prisma.job.findUnique({
            where:{id : jobId}
        })
        if(!job) {
            return NextResponse.json({ error: "Job not found" }, { status: 404 });
        }

     if(status === "ACCEPTED"){
        
        // Update all other proposals for this job to REJECTED
        await prisma.proposal.updateMany({
            where: {
                jobId: jobId,
                id: {
                    not: proposalId
                }
            },
            data: {
                status: "rejected"
            }
        });
        // Update the accepted proposal
        const updatedProposal = await prisma.proposal.update({
            where:{
                jobId : jobId,
                id:proposalId
            },
            data:{
                status: "accepted"
            }
        })
        return NextResponse.json(updatedProposal, { status: 200 });
     }else{
        await prisma.proposal.update({
            where:{
                jobId : jobId,
                id: proposalId
            },
                data : {
                    status : "rejected"
                }
            
        })
        return NextResponse.json({ message: "Proposal rejected successfully" }, { status: 200 });

     }
        
    } catch (error) {
        console.log("Error in PATCH proposal action:", error);
        return NextResponse.json({ error: "Failed to update proposal action" }, { status: 500 });
    }
}