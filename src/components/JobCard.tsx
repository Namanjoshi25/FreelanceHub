import { Job, Proposal } from "@prisma/client";
import { Card, CardContent } from "./ui/card";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { Calendar, DollarSign, Eye, MessageSquare, Send, User } from "lucide-react";
import { Button } from "./ui/button";

export interface UpdatedJob extends Job {

  updatedAt: string
  client: {
    id: string
    name: string
    email: string
    image: string | null
    createdAt: string
  }
  proposals: Proposal[]
  _count: {
    proposals: number
  }
}

export default function JobCard({ job, session }: { job: UpdatedJob; session: any }) {


  const getTimeAgo = (dateString: Date) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just posted"
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return `${Math.floor(diffInHours / 168)}w ago`
  }

  const canApply = session?.user?.userType === "FREELANCER"
  const isOwner = session?.user?.userType === "CLIENT" && session?.user?.email

  return (
    <Card className="border-slate-200 hover:border-green-200 transition-all duration-200 hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-semibold text-slate-900 hover:text-green-600">
                <Link href={`/jobs/${job.id}`}>{job.title}</Link>
              </h3>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {job.status}
              </Badge>
              <Badge variant="outline" className="text-xs text-slate-500">
                {getTimeAgo(job.createdAt)}
              </Badge>
            </div>
            <p className="text-slate-600 mb-4 line-clamp-3 leading-relaxed">{job.description}</p>

            <div className="flex items-center space-x-6 text-sm text-slate-500 mb-4">
              <div className="flex items-center space-x-1">
                <DollarSign className="w-4 h-4" />
                <span className="font-medium">{job.budget}</span>
              </div>
              <div className="flex items-center space-x-1">
                <User className="w-4 h-4" />
                <span>{job.client.name}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageSquare className="w-4 h-4" />
                <span>{job._count.proposals} proposals</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {job.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {job.skills.slice(0, 6).map((skill, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
            {job.skills.length > 6 && (
              <Badge variant="outline" className="text-xs text-slate-500">
                +{job.skills.length - 6} more
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-slate-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">{job.client.name}</p>
              <p className="text-xs text-slate-500">Client</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Link href={`/job/${job.id}`}>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-1" />
                View Details
              </Button>
            </Link>
            {canApply && (
              <Link href={`/jobs/${job.id}/apply`}>
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  <Send className="w-4 h-4 mr-1" />
                  Apply Now
                </Button>
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
