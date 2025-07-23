import { Calendar, CheckCircle, Clock, DollarSign, Eye, MessageSquare, XCircle } from "lucide-react"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Avatar,AvatarFallback } from "./ui/avatar"

import { Card, CardContent } from "./ui/card"
import Link from "next/link"

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

export default  function EnhancedProposalCard({
  proposal,
  jobBudget,
  onAccept,
  onReject,
  isUpdating,
  rank,
  showProjectActions = false,
  showRejectionReason = false,
}: {
  proposal: Proposal
  jobBudget: number | null
  onAccept?: () => void
  onReject?: () => void
  isUpdating?: boolean
  rank?: number
  showProjectActions?: boolean
  showRejectionReason?: boolean
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return "bg-green-100 text-green-800 border-green-200"
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
    }
  }

  const getBudgetComparison = () => {
   

    const proposedRate = proposal.proposedRate
    const budget = jobBudget || 0

    if (proposedRate < budget) {
      return { status: "below", text: "Below budget range", color: "text-green-600" }
    } else if (proposedRate > budget) {
      return { status: "above", text: "Above budget range", color: "text-red-600" }
    } else {
      return { status: "within", text: "Within budget range", color: "text-green-600" }
    }
  }

  const budgetComparison = getBudgetComparison()

  console.log(proposal);
  return (

    <Card className="border-slate-200 hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          {/* Rank Badge */}
          {rank && (
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-sm font-semibold text-slate-600">
                #{rank}
              </div>
            </div>
          )}

          {/* Freelancer Avatar */}
          <Avatar className="w-16 h-16 flex-shrink-0">
            <AvatarFallback className="bg-green-100 text-green-700 text-lg font-semibold">
              {proposal.developer.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase() || "FL"}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-1">
                  <h4 className="font-semibold text-lg text-slate-900 truncate">{proposal.developer.name}</h4>
                  <Badge className={`${getStatusColor(proposal.status)} font-medium`}>{proposal.status}</Badge>
                </div>
                <p className="text-sm text-slate-500 mb-2">{proposal.developer.email}</p>

                {/* Freelancer Stats */}
             {/*    <div className="flex items-center space-x-4 text-sm text-slate-600">
                  <div className="flex items-center space-x-1">
                    <span className="font-medium">⭐ 4.8</span>
                    <span>(24 reviews)</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="font-medium">✅ 18 jobs completed</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="font-medium">📍 New York, USA</span>
                  </div>
                </div>*/}
              </div> 
            </div>

            {/* Cover Letter */}
            <div className="mb-4 h-full">
              <h5 className="font-medium text-slate-900 mb-2">Cover Letter</h5>
              <div className="bg-slate-50 rounded-lg p-4 overflow-hidden border">
                <p className="text-slate-700 leading-relaxed">{proposal.proposalText}</p>
              </div>
            </div>

            {/* Proposal Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-white border rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-1">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-slate-600">Proposed Rate</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-bold text-slate-900">${proposal.proposedRate}</span>
                  {budgetComparison && (
                    <span className={`text-xs ${budgetComparison.color} font-medium`}>{budgetComparison.text}</span>
                  )}
                </div>
              </div>

              <div className="bg-white border rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-1">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-slate-600">Delivery Time</span>
                </div>
                <span className="text-xl font-bold text-slate-900">{proposal.deliveryTime} days</span>
              </div>

              <div className="bg-white border rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-1">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-slate-600">Submitted</span>
                </div>
                <span className="text-sm font-semibold text-slate-900">
                  {new Date(proposal.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            {/* Skills */}
            <div className="mb-4">
              <h5 className="font-medium text-slate-900 mb-2">Skills</h5>
              <div className="flex flex-wrap gap-2">
                {proposal.developer.developerProfile.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              {proposal.status === "pending" && onAccept && onReject && (
                <>
                  <Button
                    onClick={onAccept}
                    disabled={isUpdating}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {isUpdating ? "Processing..." : "Accept Proposal"}
                  </Button>
                  <Button
                    onClick={onReject}
                    disabled={isUpdating}
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </>
              )}

              {showProjectActions && (
                <>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Start Project
                  </Button>
                  <Button variant="outline">
                    <Eye className="w-4 h-4 mr-2" />
                    View Contract
                  </Button>
                </>
              )}

              <Button variant="outline" size="sm">
                <MessageSquare className="w-4 h-4 mr-2" />
                Message
              </Button>

              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
               <Link href={`/user/profile/${proposal.developer.id}`}>View Profile</Link> 
              </Button>

              {showRejectionReason && (
                <div className="w-full mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">
                    <strong>Rejection Reason:</strong> Thank you for your proposal, but we've decided to go with another
                    freelancer.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}