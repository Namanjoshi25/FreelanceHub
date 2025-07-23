import { Calendar, Clock, DollarSign, Eye, Link, MessageSquare, Send, User } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

import { Project } from "@prisma/client";

export default function ProjectCard({ project }: { project: Project }) {



  return (
    <Card className="border-slate-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-semibold text-slate-900">
                <Link href={`/freelancer/jobs/${project.job.id}`} className="hover:text-green-600">
                  {project.job.title}
                </Link>
              </h3>
              <Badge className={getStatusColor(project.status)}>
                <div className="flex items-center space-x-1">
                
                  <span>{project.status}</span>
                </div>
              </Badge>
            </div>
            <p className="text-slate-600 mb-3 line-clamp-2">{project.coverLetter}</p>
            <div className="flex items-center space-x-4 text-sm text-slate-500">
              <div className="flex items-center space-x-1">
                <DollarSign className="w-4 h-4" />
                <span>${project.proposedRate}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{project.deliveryTime} days</span>
              </div>
              <div className="flex items-center space-x-1">
                <User className="w-4 h-4" />
                <span>{project.job.client.name}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>Sent {new Date(project.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <Link href={`/freelancer/jobs/${project.job.id}`}>
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
