import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";




export async function POST(req : Request){
    try {
        const {email , password} =  await req.json();
        if(!email || !password)  return NextResponse.json({message: "All the fields are required"},{status:400})

        const existing = await prisma.user.findUnique(
            {
                where : {email }
            }
        )
        if(existing ) return NextResponse.json({message : "User already exits"},{status : 400})

            const hashed = await  bcrypt.hash(password ,10);

            await prisma.user.create({
                data:{
                    name :"",
                    role:'null',
                    email,
                    password :hashed,
                 
                }
            })

            return NextResponse.json({message:"User created successfully" , success:true})
        
    } catch (error) {
        console.log("Error in signup" , error);
        NextResponse.json({ message:"Failed to signup"},{status :500})
    }
}