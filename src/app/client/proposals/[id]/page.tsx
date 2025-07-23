"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Briefcase,
  Search,
  CheckCircle,
  XCircle,
  MessageSquare,
  Star,
  MoreVertical,
  Eye,
  MapPin,
  Award,
  TrendingUp,
} from "lucide-react"

interface Proposal {
  id: string
  coverLetter: string
  proposedRate: number
  deliveryTime: number
  status: string
  createdAt: string
  freelancer: {
    id: string
    name: string
    email: string
    image: string | null
    profile?: {
      title: string
      hourlyRate: number
      location: string
      rating: number
      completedJobs: number
      skills: string[]
      bio: string
    }
  }
  job: {
    id: string
    title: string
    budgetMin: number | null
    budgetMax: number | null
    status: string
  }
}

interface Job {
  id: string
  title: string
  status: string
}

export default function ClientProposalsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [proposals, setProposals] = useState<Proposal[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedProposals, setSelectedProposals] = useState<string[]>([])
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null)
  const [actionType, setActionType] = useState<"accept" | "reject" | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  // Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedJob, setSelectedJob] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("newest")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } 
  }, [status, session, router])

  useEffect(() => {
    if (session?.user?.role === "client") {
      fetchProposals()
      fetchJobs()
    }
  }, [session])

  const fetchProposals = async () => {
    try {
      const response = await fetch("/api/proposals/client")
      if (response.ok) {
        const data = await response.json()
        setProposals(data)
      }
    } catch (error) {
      console.error("Error fetching proposals:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchJobs = async () => {
    try {
      const response = await fetch("/api/jobs/my-jobs")
      if (response.ok) {
        const data = await response.json()
        setJobs(data.jobs)
      }
    } catch (error) {
      console.error("Error fetching jobs:", error)
    }
  }

  const handleProposalAction = async (proposalId: string, action: "accept" | "reject", reason?: string) => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/proposals/${proposalId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: action === "accept" ? "ACCEPTED" : "REJECTED",
          rejectionReason: reason,
        }),
      })

      if (response.ok) {
        await fetchProposals()
        setSelectedProposal(null)
        setActionType(null)
        setRejectionReason("")
        setSelectedProposals([])
      }
    } catch (error) {
      console.error("Error updating proposal:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleBulkAction = async (action: "accept" | "reject") => {
    setIsUpdating(true)
    try {
      await Promise.all(
        selectedProposals.map((proposalId) =>
          fetch(`/api/proposals/${proposalId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              status: action === "accept" ? "ACCEPTED" : "REJECTED",
            }),
          }),
        ),
      )
      await fetchProposals()
      setSelectedProposals([])
    } catch (error) {
      console.error("Error updating proposals:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const filteredProposals = proposals
    .filter((proposal) => {
      const matchesSearch =
        proposal.freelancer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proposal.job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proposal.coverLetter.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesJob = selectedJob === "all" || proposal.job.id === selectedJob
      const matchesStatus = selectedStatus === "all" || proposal.status === selectedStatus

      return matchesSearch && matchesJob && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case "rate-high":
          return b.proposedRate - a.proposedRate
        case "rate-low":
          return a.proposedRate - b.proposedRate
        case "delivery":
          return a.deliveryTime - b.deliveryTime
        default:
          return 0
      }
    })

  const pendingProposals = filteredProposals.filter((p) => p.status === "PENDING")
  const acceptedProposals = filteredProposals.filter((p) => p.status === "ACCEPTED")
  const rejectedProposals = filteredProposals.filter((p) => p.status === "REJECTED")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return "bg-green-100 text-green-800"
      case "REJECTED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  const formatBudget = (min: number | null, max: number | null) => {
    if (!min && !max) return "Budget not specified"
    if (min && max) return `$${min} - $${max}`
    if (min) return `From $${min}`
    if (max) return `Up to $${max}`
    return "Budget not specified"
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading proposals...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/client/dashboard" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-900">FreelanceHub</span>
              </Link>
            </div>
            <nav className="flex items-center space-x-6">
              <Link href="/client/dashboard" className="text-slate-600 hover:text-green-600">
                Dashboard
              </Link>
              <Link href="/client/post-job" className="text-slate-600 hover:text-green-600">
                Post Job
              </Link>
              <span className="text-green-600 font-medium">Proposals</span>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Manage Proposals</h1>
          <p className="text-slate-600">Review and manage proposals from freelancers</p>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search proposals, freelancers, or jobs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Select value={selectedJob} onValueChange={setSelectedJob}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by job" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Jobs</SelectItem>
                    {jobs.map((job) => (
                      <SelectItem key={job.id} value={job.id}>
                        {job.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="ACCEPTED">Accepted</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="rate-high">Rate: High to Low</SelectItem>
                    <SelectItem value="rate-low">Rate: Low to High</SelectItem>
                    <SelectItem value="delivery">Delivery Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedProposals.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-800">
                    {selectedProposals.length} proposal{selectedProposals.length > 1 ? "s" : ""} selected
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleBulkAction("accept")}
                      disabled={isUpdating}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Accept Selected
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkAction("reject")}
                      disabled={isUpdating}
                    >
                      Reject Selected
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setSelectedProposals([])}>
                      Clear Selection
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Proposals Tabs */}
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="pending">Pending ({pendingProposals.length})</TabsTrigger>
            <TabsTrigger value="accepted">Accepted ({acceptedProposals.length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rejectedProposals.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingProposals.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No pending proposals</h3>
                  <p className="text-slate-600">New proposals will appear here for your review.</p>
                </CardContent>
              </Card>
            ) : (
              pendingProposals.map((proposal) => (
                <ProposalCard
                  key={proposal.id}
                  proposal={proposal}
                  isSelected={selectedProposals.includes(proposal.id)}
                  onSelect={(selected) => {
                    if (selected) {
                      setSelectedProposals([...selectedProposals, proposal.id])
                    } else {
                      setSelectedProposals(selectedProposals.filter((id) => id !== proposal.id))
                    }
                  }}
                  onAccept={() => {
                    setSelectedProposal(proposal)
                    setActionType("accept")
                  }}
                  onReject={() => {
                    setSelectedProposal(proposal)
                    setActionType("reject")
                  }}
                  isUpdating={isUpdating}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="accepted" className="space-y-4">
            {acceptedProposals.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <CheckCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No accepted proposals</h3>
                  <p className="text-slate-600">Accepted proposals will appear here.</p>
                </CardContent>
              </Card>
            ) : (
              acceptedProposals.map((proposal) => <ProposalCard key={proposal.id} proposal={proposal} />)
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            {rejectedProposals.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <XCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No rejected proposals</h3>
                  <p className="text-slate-600">Rejected proposals will appear here.</p>
                </CardContent>
              </Card>
            ) : (
              rejectedProposals.map((proposal) => <ProposalCard key={proposal.id} proposal={proposal} />)
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Action Dialog */}
      <Dialog
        open={!!selectedProposal && !!actionType}
        onOpenChange={() => {
          setSelectedProposal(null)
          setActionType(null)
          setRejectionReason("")
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{actionType === "accept" ? "Accept Proposal" : "Reject Proposal"}</DialogTitle>
            <DialogDescription>
              {actionType === "accept"
                ? "Are you sure you want to accept this proposal? This will start the project."
                : "Are you sure you want to reject this proposal? You can provide feedback to help the freelancer improve."}
            </DialogDescription>
          </DialogHeader>

          {selectedProposal && (
            <div className="space-y-4">
              {/* Proposal Summary */}
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={selectedProposal.freelancer.image || ""} />
                    <AvatarFallback>
                      {selectedProposal.freelancer.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase() || "FL"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-slate-900">{selectedProposal.freelancer.name}</h4>
                    <p className="text-sm text-slate-600">{selectedProposal.job.title}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">Proposed Rate:</span>
                    <p className="font-semibold">${selectedProposal.proposedRate}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Delivery:</span>
                    <p className="font-semibold">{selectedProposal.deliveryTime} days</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Job Budget:</span>
                    <p className="font-semibold">
                      {formatBudget(selectedProposal.job.budgetMin, selectedProposal.job.budgetMax)}
                    </p>
                  </div>
                </div>
              </div>

              {actionType === "reject" && (
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Feedback (Optional)</label>
                  <Textarea
                    placeholder="Let the freelancer know why their proposal wasn't selected. This helps them improve future proposals."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="min-h-24"
                  />
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedProposal(null)
                    setActionType(null)
                    setRejectionReason("")
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() =>
                    selectedProposal && handleProposalAction(selectedProposal.id, actionType!, rejectionReason)
                  }
                  disabled={isUpdating}
                  className={
                    actionType === "accept" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                  }
                >
                  {isUpdating
                    ? actionType === "accept"
                      ? "Accepting..."
                      : "Rejecting..."
                    : actionType === "accept"
                      ? "Accept Proposal"
                      : "Reject Proposal"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ProposalCard({
  proposal,
  isSelected,
  onSelect,
  onAccept,
  onReject,
  isUpdating,
}: {
  proposal: Proposal
  isSelected?: boolean
  onSelect?: (selected: boolean) => void
  onAccept?: () => void
  onReject?: () => void
  isUpdating?: boolean
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return "bg-green-100 text-green-800"
      case "REJECTED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-yellow-100 text-yellow-800"
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
    <Card className={`border-slate-200 transition-all ${isSelected ? "ring-2 ring-blue-500 border-blue-300" : ""}`}>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          {/* Selection Checkbox */}
          {proposal.status === "PENDING" && onSelect && (
            <div className="pt-1">
              <Checkbox checked={isSelected} onCheckedChange={onSelect} />
            </div>
          )}

          {/* Freelancer Avatar */}
          <Avatar className="w-16 h-16">
            <AvatarImage src={proposal.freelancer.image || ""} />
            <AvatarFallback className="text-lg">
              {proposal.freelancer.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase() || "FL"}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="text-lg font-semibold text-slate-900">{proposal.freelancer.name}</h4>
                  {proposal.freelancer.profile?.rating && (
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-slate-600">{proposal.freelancer.profile.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-slate-600">{proposal.freelancer.profile?.title || "Freelancer"}</p>
                <Link
                  href={`/jobs/${proposal.job.id}`}
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  {proposal.job.title}
                </Link>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={getStatusColor(proposal.status)}>{proposal.status}</Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="w-4 h-4 mr-2" />
                      View Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Send Message
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Freelancer Stats */}
            {proposal.freelancer.profile && (
              <div className="flex items-center space-x-4 text-sm text-slate-500 mb-3">
                {proposal.freelancer.profile.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{proposal.freelancer.profile.location}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <Award className="w-4 h-4" />
                  <span>{proposal.freelancer.profile.completedJobs} jobs completed</span>
                </div>
                <div className="flex items-center space-x-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>${proposal.freelancer.profile.hourlyRate}/hr usual rate</span>
                </div>
              </div>
            )}

            {/* Cover Letter */}
            <div className="mb-4">
              <h5 className="font-medium text-slate-900 mb-2">Cover Letter</h5>
              <p className="text-slate-600 text-sm leading-relaxed">
                {proposal.coverLetter.length > 300
                  ? `${proposal.coverLetter.substring(0, 300)}...`
                  : proposal.coverLetter}
              </p>
            </div>

            {/* Skills */}
            {proposal.freelancer.profile?.skills && proposal.freelancer.profile.skills.length > 0 && (
              <div className="mb-4">
                <h5 className="font-medium text-slate-900 mb-2">Skills</h5>
                <div className="flex flex-wrap gap-2">
                  {proposal.freelancer.profile.skills.slice(0, 6).map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {proposal.freelancer.profile.skills.length > 6 && (
                    <Badge variant="secondary" className="text-xs">
                      +{proposal.freelancer.profile.skills.length - 6} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Proposal Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-3 bg-slate-50 rounded-lg">
              <div>
                <span className="text-xs text-slate-500 block">Proposed Rate</span>
                <span className="font-semibold text-slate-900">${proposal.proposedRate}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Delivery Time</span>
                <span className="font-semibold text-slate-900">{proposal.deliveryTime} days</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Job Budget</span>
                <span className="font-semibold text-slate-900">
                  {formatBudget(proposal.job.budgetMin, proposal.job.budgetMax)}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Submitted</span>
                <span className="font-semibold text-slate-900">
                  {new Date(proposal.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Actions */}
            {proposal.status === "PENDING" && onAccept && onReject && (
              <div className="flex flex-wrap gap-3">
                <Button onClick={onAccept} disabled={isUpdating} className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Accept Proposal
                </Button>
                <Button onClick={onReject} disabled={isUpdating} variant="outline">
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button variant="outline" size="sm">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Message
                </Button>
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  View Profile
                </Button>
              </div>
            )}

            {proposal.status === "ACCEPTED" && (
              <div className="flex gap-3">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Start Project
                </Button>
                <Button variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  View Contract
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
