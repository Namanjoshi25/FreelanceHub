// pages/api/user/set-role.ts

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export  async function POST(req: Request, res:NextResponse) {
  const session = await getServerSession();
  

  if (!session?.user?.email) {
    return  NextResponse.json({error: "Unauthorized"},{status:400})
  }

  const { role } = await  req.json()

  if (!["client", "developer"].includes(role)) {
    return  NextResponse.json({error: "Invalid Role"},{status:400})
  }

  try {
    await prisma.user.update({
      where: { email: session.user.email },
      data: { role },
    });

    return NextResponse.json({message: "role successfull"},{status:201})
  } catch (error) {
    console.error("Error setting role:", error);
 NextResponse.json({error: "Internal server error"},{status:500})  }
}
