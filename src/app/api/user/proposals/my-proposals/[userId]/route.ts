import { prisma } from "@/lib/prisma";
import {  NextRequest, NextResponse } from "next/server";

export  async function GET(req : NextRequest, { params }: { params: { userId: string } }) {
    const userId = params.userId;

    try {
        if(!userId) return NextResponse.json({ error: "User ID is required" }, { status: 400 });

       const proposals = await prisma.proposal.findMany({
  where: {
    developerId: userId,
  },
  include: {
    job: {
      select: {
        id: true,
        title: true,
        client: {
          select: {
            id: true,
            email: true,
            name: true,
            clientProfile: {
              select: {
                company: true,
              },
            },
          },
        },
      },
    },
  },
});

        if (!proposals) {
            return NextResponse.json({ error: "No proposals found for this user" }, { status: 404 });
        }
        return NextResponse.json(proposals, { status: 200 });    
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}