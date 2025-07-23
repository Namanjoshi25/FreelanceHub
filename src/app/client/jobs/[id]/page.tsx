"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import axios from "axios"
import {
  Briefcase,
  ArrowLeft,
  DollarSign,
  Calendar,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  AlertCircle,
} from "lucide-react"
import EnhancedProposalCard from "@/components/EnhancedProposalCard"

interface Proposal {
  id: string
  proposalText: string
  proposedRate: number
  deliveryTime: number
  status: string
  createdAt: string
  developer: {
    id: string
    name: string
    email: string
    developerProfile: {
      skills : string[]
    }
 
  }
}

interface Job {
  id: string
  title: string
  description: string
  budget: number | null
  skills: string[]
  status: string
  createdAt: string
  client: {
    id: string
    name: string
    email: string
  }
  proposals: Proposal[]
}


export default function ClientJobDetailsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const jobId = params.id as string

  const [job, setJob] = useState<Job | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } 
  }, [status, session, router])

  useEffect(() => {
    if (jobId && session?.user?.role === "client") {
      fetchJob()
    }
  }, [jobId, session])

  const fetchJob = async () => {
    try {
       
      const response = await axios.get(`/api/jobs/${jobId}`)
      if (response) {
        const data = await response.data 
        setJob(data)
      } 
    } catch (error) {
      console.error("Error fetching job:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleProposalAction = async (proposalId: string, action: "accept" | "reject") => {
    setIsUpdating(true)
    try {
      const response = await axios.patch(`/api/client/proposals/action/${proposalId}`, 
    {
          status: action === "accept" ? "ACCEPTED" : "REJECTED",
          jobId : jobId
        }
      )

      if (response) {
        await fetchJob() // Refresh job data
        setSelectedProposal(null)
     
      }
    } catch (error) {
      console.error("Error updating proposal:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN":
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

 

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading job details...</p>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">Job Not Found</h3>
            <p className="text-slate-600 mb-4">
              The job you're looking for doesn't exist or you don't have access to it.
            </p>
            <Link href="/client/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const pendingProposals = job.proposals.filter((p) => p.status === "pending")
  const acceptedProposals = job.proposals.filter((p) => p.status === "accepted")
  const rejectedProposals = job.proposals.filter((p) => p.status === "rejected")

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/client/dashboard"
                className="flex items-center space-x-2 text-slate-600 hover:text-green-600"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-900">FreelanceHub</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className={getStatusColor(job.status)}>{job.status.replace("_", " ")}</Badge>
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Edit Job
              </Button>
              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 bg-transparent">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Details */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-2xl text-slate-900 mb-2">{job.title}</CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-slate-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageSquare className="w-4 h-4" />
                        <span>{job.proposals.length} proposals</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-4 h-4" />
                        <span>{job.budget}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Project Description</h3>
                  <p className="text-slate-600 whitespace-pre-wrap">{job.description}</p>
                </div>

                {job.skills.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">Required Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Enhanced Proposals Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Proposals ({job.proposals.length})</CardTitle>
                    <CardDescription>Review and manage proposals from freelancers</CardDescription>
                  </div>
                 
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="pending" className="w-full">
                  <TabsList className="mb-6">
                    <TabsTrigger value="pending" className="relative">
                      Pending
                      {pendingProposals.length > 0 && (
                        <Badge className="ml-2 bg-yellow-500 text-white text-xs px-2 py-0.5">
                          {pendingProposals.length}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="accepted" className="relative">
                      Accepted
                      {acceptedProposals.length > 0 && (
                        <Badge className="ml-2 bg-green-500 text-white text-xs px-2 py-0.5">
                          {acceptedProposals.length}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="rejected" className="relative">
                      Rejected
                      {rejectedProposals.length > 0 && (
                        <Badge className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5">
                          {rejectedProposals.length}
                        </Badge>
                      )}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="pending" className="space-y-4">
                    {pendingProposals.length === 0 ? (
                      <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                        <MessageSquare className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-slate-900 mb-2">No pending proposals</h3>
                        <p className="text-slate-600 mb-4">
                          New proposals from freelancers will appear here for your review.
                        </p>
                       
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {pendingProposals.map((proposal, index) => (
                          <EnhancedProposalCard
                            key={proposal.id}
                            proposal={proposal}
                            jobBudget={job.budget}
                            onAccept={() => handleProposalAction(proposal.id, "accept")}
                            onReject={() => setSelectedProposal(proposal)}
                            isUpdating={isUpdating}
                            rank={index + 1}
                          />
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="accepted" className="space-y-4">
                    {acceptedProposals.length === 0 ? (
                      <div className="text-center py-12 bg-green-50 rounded-lg border-2 border-dashed border-green-200">
                        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-slate-900 mb-2">No accepted proposals</h3>
                        <p className="text-slate-600">
                          Proposals you accept will appear here with project management tools.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {acceptedProposals.map((proposal) => (
                          <EnhancedProposalCard
                            key={proposal.id}
                            proposal={proposal}
                            jobBudget={job.budget}
                            showProjectActions={true}
                          />
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="rejected" className="space-y-4">
                    {rejectedProposals.length === 0 ? (
                      <div className="text-center py-12 bg-red-50 rounded-lg border-2 border-dashed border-red-200">
                        <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-slate-900 mb-2">No rejected proposals</h3>
                        <p className="text-slate-600">Proposals you decline will appear here for your records.</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {rejectedProposals.map((proposal) => (
                          <EnhancedProposalCard
                            key={proposal.id}
                            proposal={proposal}
                            jobBudget={job.budget}
                            showRejectionReason={true}
                          />
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Job Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Job Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Total Proposals</span>
                  <span className="font-semibold">{job.proposals.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Pending Review</span>
                  <span className="font-semibold text-yellow-600">{pendingProposals.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Accepted</span>
                  <span className="font-semibold text-green-600">{acceptedProposals.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Rejected</span>
                  <span className="font-semibold text-red-600">{rejectedProposals.length}</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-transparent" variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Job Details
                </Button>
                <Button className="w-full bg-transparent" variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview as Freelancer
                </Button>
                <Button className="w-full bg-transparent" variant="outline" disabled={job.status !== "open"}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Close to New Proposals
                </Button>
                <Separator />
                <Button className="w-full text-red-600 hover:text-red-700 bg-transparent" variant="outline">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Job
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Rejection Dialog */}
      <Dialog open={!!selectedProposal} onOpenChange={() => setSelectedProposal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Proposal</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this proposal? You can optionally provide feedback to the freelancer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Feedback (Optional)</label>
              <Textarea
                placeholder="Let the freelancer know why their proposal wasn't selected..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="min-h-20"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setSelectedProposal(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => selectedProposal && handleProposalAction(selectedProposal.id, "reject")}
                disabled={isUpdating}
                className="bg-red-600 hover:bg-red-700"
              >
                {isUpdating ? "Rejecting..." : "Reject Proposal"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

