import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "12")
    const search = searchParams.get("search")
    const category = searchParams.get("category")
    const budget = searchParams.get("budget")
    const experience = searchParams.get("experience")
    const sort = searchParams.get("sort") || "newest"

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      status: "open",
    }

    // Search filter
    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          skills: {
            hasSome: search.split(" ").filter(Boolean),
          },
        },
      ]
    }

    // Category filter
    if (category && category !== "All Categories") {
      where.category = {
        contains: category,
        mode: "insensitive",
      }
    }

    // Budget filter
    if (budget && budget !== "all") {
      switch (budget) {
        case "under-500":
          where.OR = [{ budget: { lt: 500 } }]
          break
        case "500-1000":
          where.OR = [
            { AND: [{ budget: { gte: 500 } }] },
            { AND: [{ budget: { lte: 1000 } }] },
        
          ]
          break
        case "1000-5000":
          where.OR = [
            { AND: [{ budget: { gte: 1000} }] },
            { AND: [{ budget: { lte: 5000 } }] },
        
          ]
          break
        case "5000-10000":
          where.OR = [
            { AND: [{ budget: { gte: 5000} }] },
            { AND: [{ budget: { lte: 10000 } }] },
        
          ]
          break
        case "over-10000":
          where.OR = [{ budget: { gte: 10000 } }]
          break
      }
    }

    // Build orderBy clause
    let orderBy: any = { createdAt: "desc" } // default

    switch (sort) {
      case "newest":
        orderBy = { createdAt: "desc" }
        break
      case "oldest":
        orderBy = { createdAt: "asc" }
        break
      case "budget-high":
        orderBy = [{ budgetMax: "desc" }, { budgetMin: "desc" }]
        break
      case "budget-low":
        orderBy = [{ budgetMin: "asc" }, { budgetMax: "asc" }]
        break
      case "proposals-high":
        orderBy = { proposals: { _count: "desc" } }
        break
      case "proposals-low":
        orderBy = { proposals: { _count: "asc" } }
        break
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              name: true,
              
            },
          },
          _count: {
            select: {
              proposals: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.job.count({ where }),
    ])

    return NextResponse.json({
      jobs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching jobs:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
