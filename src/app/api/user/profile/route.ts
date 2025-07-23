
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  console.log(body);
  const {userId,description,skills,githubUrl,portfolio ,domain,proofLinks,experience} = body.profileData;



  try {
    if(!userId || !description  || !githubUrl || !portfolio || !domain  || !experience) {
      return NextResponse.json({error: "All fields are required"}, {status: 400});
    }

    const profile = await prisma.developerProfile.create({
      data: {
        userId,
        description,
        skills: skills,
        githubUrl,
        portfolio,
        domain,
        proofLinks: proofLinks,
        experience: parseInt(experience, 10), // Ensure experience is stored as a number
      }
    })
    if(!profile) {
      return NextResponse.json({error: "Failed to create profile"}, {status: 500});
    }
    return NextResponse.json({
      message: "Profile created successfully"}, {status: 201});



  } catch (error) {
    console.error("Error updating profile:", error);
    return new Response("Failed to create profile", { status: 500 });
  }
}