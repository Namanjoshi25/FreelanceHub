import { prisma } from "@/lib/prisma";
import {  NextRequest, NextResponse } from "next/server";

export  async function GET( req : NextRequest,{ params }: { params: { userId: string } }) {
     console.log(params + "params");
    const userId = params.userId;
   

    try {
        if(!userId) return NextResponse.json({ error: "User ID is required" }, { status: 400 });

        const projects = await prisma.project.findMany({
            where: {
developerId: userId,
            }
        })
        if (!projects) {
            return NextResponse.json({ error: "No projects found for this user" }, { status: 404 });
        }
        return NextResponse.json(projects, { status: 200 });    
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}