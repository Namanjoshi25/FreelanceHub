"use client"

import { useState, useEffect } from "react"
import { signOut, useSession } from "next-auth/react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Briefcase, Users, Eye, MessageSquare, Calendar, DollarSign } from "lucide-react"

interface Job {
  id: string
  title: string
  description: string
  budgetMin: number | null
  budgetMax: number | null
  skills: string[]
  status: string
  createdAt: string
  _count: {
    proposals: number
  }
}

export default function ClientDashboard() {
  const { data: session, status } = useSession()
  const {clientId} = useParams()
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (session?.user?.role == "developer") {
      router.push("/developer/dashboard")
    }
  }, [status, session, router])

  useEffect(() => {

    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
     
      const response = await fetch(`/api/jobs/client/my-jobs/${clientId}`)
      if (response.ok) {
        const data = await response.json()
        setJobs(data)
      }
    } catch (error) {
      console.error("Error fetching jobs:", error)
    } finally {
      setIsLoading(false)
    }
  }
  const handleLogout = ()=>{
    signOut()
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

 
  const activeJobs = jobs.filter((job) => job.status === "open")
/*   const totalProposals = jobs.reduce((sum, job) => sum + job?.proposals, 0) */

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
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Client Dashboard
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600">Welcome, {session?.user?.name}</span>
             
                <Button onClick={handleLogout} className="bg-green-600 hover:bg-green-700">
               
                  Logout
                </Button>
         
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Active Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{activeJobs.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Jobs</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{jobs.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Proposals</CardTitle>
              <MessageSquare className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
          {/*     <div className="text-2xl font-bold text-slate-900">{totalProposals}</div> */}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Avg. Proposals</CardTitle>
              <Users className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
           {/*    <div className="text-2xl font-bold text-slate-900">
                {jobs.length > 0 ? Math.round(totalProposals / jobs.length) : 0}
              </div> */}
            </CardContent>
          </Card>
        </div>

        {/* Jobs Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-slate-900">Your Jobs</CardTitle>
                <CardDescription>Manage your posted jobs and proposals</CardDescription>
              </div>
              <Link href="/client/jobs/post-job">
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Post Job
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {jobs.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No jobs posted yet</h3>
                <p className="text-slate-600 mb-4">Start by posting your first job to find talented freelancers.</p>
                <Link href="/client/post-job">
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Post Your First Job
                  </Button>
                </Link>
              </div>
            ) : (
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All Jobs ({jobs.length})</TabsTrigger>
                  <TabsTrigger value="active">Active ({activeJobs.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="space-y-4">
                  {jobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </TabsContent>
                <TabsContent value="active" className="space-y-4">
                  {activeJobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function JobCard({ job }: { job: Job }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-100 text-green-800"
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800"
      case "COMPLETED":
        return "bg-gray-100 text-gray-800"
      case "CANCELLED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatBudget = (min: number | null, max: number | null) => {
    if (!min && !max) return "Budget not specified"
    if (min && max) return `$${min} - $${max}`
    if (min) return `From $${min}`
    if (max) return `Up to $${max}`
    return "Budget not specified"
  }

  return (
    <Card className="border-slate-200 hover:border-green-200 transition-colors">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-semibold text-slate-900">{job.title}</h3>
              <Badge className={getStatusColor(job.status)}>{job.status.replace("_", " ")}</Badge>
            </div>
            <p className="text-slate-600 mb-3 line-clamp-2">{job.description}</p>
            <div className="flex items-center space-x-4 text-sm text-slate-500">
              <div className="flex items-center space-x-1">
                <DollarSign className="w-4 h-4" />
                <span>{formatBudget(job.budgetMin, job.budgetMax)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageSquare className="w-4 h-4" />
               {/*  <span>{job._count.proposals} proposals</span> */}
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <Link href={`/client/jobs/${job.id}`}>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-1" />
                View
              </Button>
            </Link>
          </div>
        </div>
        {job.skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {job.skills.map((skill, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
