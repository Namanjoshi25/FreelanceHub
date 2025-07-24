"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Proposal } from "@/utils/types/model-types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ProposalCard from "@/components/ProposalCard"

import {
  Briefcase,

  User,

  MessageSquare,

  Send,
  TrendingUp,
  CheckCircle,

} from "lucide-react"
import axios from "axios"
import { Project } from "@prisma/client"
import ProjectCard from "@/components/ProjectCard"



export default function FreelancerDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [budgetFilter, setBudgetFilter] = useState("all")
 

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, session, router])

  useEffect(() => {
    if (session?.user?.role === "developer") {
      fetchProjects()
      fetchProposals()
    }
  }, [session])




  const fetchProjects = async () => {
    try {
      const response = await axios.get(`/api/user/projects/my-projects/${session?.user?.id}`)
      if (response) {
        const data = await response.data
        setProjects(data.jobs || [])
      }
    } catch (error) {
      console.error("Error fetching jobs:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchProposals = async () => {
    try {
      const response = await axios.get(`/api/user/proposals/my-proposals/${session?.user?.id}`)
      if (response) {
        const data = await response.data
        setProposals(data)
      }
    } catch (error) {
      console.error("Error fetching proposals:", error)
    }
  }

/*   const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.skills.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory =
      selectedCategory === "All Categories" || job.title.toLowerCase().includes(selectedCategory.toLowerCase())

    const matchesBudget =
      budgetFilter === "all" ||
      (budgetFilter === "under-500" && (job.budget || 0) < 500) ||
      (budgetFilter === "500-2000" &&
        (job.budget|| 0) >= 500 &&
        (job.budget || 0) <= 2000) ||
      (budgetFilter === "over-2000" && (job.budget || 0) > 2000)

    return matchesSearch && matchesCategory && matchesBudget
  })
 */


  const getProposalStatusColor = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return "bg-green-100 text-green-800"
      case "REJECTED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const pendingProposals = proposals.filter((p) => p.status === "pending").length
  const acceptedProposals = proposals.filter((p) => p.status === "accepted").length
  const totalEarnings = proposals.filter((p) => p.status === "accepted").reduce((sum, p) => sum + p.proposedBudget, 0)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-900">FreelanceHub</span>
              </Link>
              <Link href={"/job/all-jobs"}>All jobs</Link>

              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Freelancer Dashboard
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600">Welcome, {session?.user?.name}</span>
             
                <Link href="/freelancer/profile/edit">
                  <Button className="bg-green-600 hover:bg-green-700">
                    <User className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </Link>
            
            </div>
          </div>
        </div>
      </header>

   

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Active Proposals</CardTitle>
              <MessageSquare className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{pendingProposals}</div>
              <p className="text-xs text-slate-500">Awaiting response</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Accepted Projects</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{acceptedProposals}</div>
              <p className="text-xs text-slate-500">Active projects</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Proposals</CardTitle>
              <Send className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{proposals.length}</div>
              <p className="text-xs text-slate-500">All time</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Potential Earnings</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">${totalEarnings.toLocaleString()}</div>
              <p className="text-xs text-slate-500">From accepted projects</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="my-projects" className="w-full">
          <TabsList className="mb-6">
     
            <TabsTrigger value="my-proposals">My Proposals ({proposals.length})</TabsTrigger>
            <TabsTrigger value="my-projects">My Projects ({projects.length})</TabsTrigger>
          </TabsList>


          <TabsContent value="my-proposals" className="space-y-4">
            {proposals.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Send className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No proposals yet</h3>
                  <p className="text-slate-600 mb-4">
                    Start browsing jobs and submit your first proposal to get started.
                  </p>
                  <Button > Browse Jobs</Button>
                </CardContent>
              </Card>
            ) : (
              proposals.map((proposal) => <ProposalCard key={proposal.id} proposal={proposal} />)
            )}
          </TabsContent>
          <TabsContent value="my-projects" className="space-y-4">
            {projects.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Send className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No projects yet</h3>
                  <p className="text-slate-600 mb-4">
                    Start browsing jobs and get your first project.
                  </p>
                  <Button >Browse Jobs</Button>
                </CardContent>
              </Card>
            ) : (
              projects.map((project) => <ProjectCard key={project.id} project={project} />)
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}


