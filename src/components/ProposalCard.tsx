import { AlertCircle, Calendar, CheckCircle, Clock, DollarSign, Eye, MessageSquare, Send, User } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Proposal } from "@/utils/types/model-types";
import Link from "next/link";

export default function ProposalCard({ proposal }: { proposal: Proposal }) {
  console.log(proposal.job.title);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return <CheckCircle className="w-4 h-4" />
      case "REJECTED":
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  return (
    <Card className="border-slate-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-semibold text-slate-900">
                <Link href={`/job/${proposal.jobId}`} className="hover:text-green-600">
                  {proposal.job.title}
                </Link>
              </h3>
              <Badge className={getStatusColor(proposal.status)}>
                <div className="flex items-center space-x-1">
                  {getStatusIcon(proposal.status)}
                  <span>{proposal.status}</span>
                </div>
              </Badge>
            </div>
            <p className="text-slate-600 mb-3 line-clamp-2">{proposal.proposalText}</p>
            <div className="flex items-center space-x-4 text-sm text-slate-500">
              <div className="flex items-center space-x-1">
                <DollarSign className="w-4 h-4" />
                <span>${proposal.proposedBudget}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{proposal.deliveryTime} days</span>
              </div>
              <div className="flex items-center space-x-1">
                <User className="w-4 h-4" />
                <span>{proposal.job.client.name}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>Sent {new Date(proposal.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <Link href={`/freelancer/jobs/${proposal.jobId}`}>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-1" />
                View Job
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
