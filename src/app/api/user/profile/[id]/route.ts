import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    if(!id){
        return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }
    const profile = await prisma.user.findUnique({
        where:{ id: id },
        include:{
            developerProfile:true
        }
    })
    return NextResponse.json(profile || { error: "Profile not found" }, { status: profile ? 200 : 404 });
}catch(error){
    console.log(error);
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
}
}