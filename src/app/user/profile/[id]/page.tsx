"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Briefcase,
  ArrowLeft,
  Globe,
  LinkIcon,
  DollarSign,
  Clock,
  Calendar,
  ExternalLink,
  Github,
  Mail,
  MessageSquare,
} from "lucide-react"
import axios from "axios"

interface FreelancerProfile {
  id: string
  createdAt: string
   name: string
  developerProfile: {
    id: string
      description: string | null
      domain : string | null
  skills: string[]
  githubUrl: string | null
  portfolio: string | null
  proofLinks: string[]
  experience: number | null
    image: string | null
    createdAt: string
  }
}

const EXPERIENCE_LABELS: Record<number, string> = {
  0: "Just starting out",
  1: "Some experience",
  2: "Intermediate",
  3: "Experienced",
  4: "Very experienced",
  5: "Expert",
}

const AVAILABILITY_LABELS: Record<string, string> = {
  FULL_TIME: "Full-time (40+ hours/week)",
  PART_TIME: "Part-time (20-40 hours/week)",
  CONTRACT: "Contract/Project-based",
  NOT_AVAILABLE: "Not available right now",
}

export default function FreelancerProfilePage() {
  const params = useParams()
  const profileId = params.id as string
  const [profile, setProfile] = useState<FreelancerProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (profileId) {
      fetchProfile()
    }
  }, [profileId])

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`/api/user/profile/${profileId}`)
      if (response) {
        const data = await response.data
        setProfile(data)
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <Briefcase className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">Profile Not Found</h3>
            <p className="text-slate-600 mb-4">The freelancer profile you're looking for doesn't exist.</p>
            <Link href="/freelancer/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }
  console.log(profile);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/freelancer/dashboard"
                className="flex items-center space-x-2 text-slate-600 hover:text-green-600"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-900">FreelanceHub</span>
              </div>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Freelancer Profile
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Profile */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start space-x-6">
                  <Avatar className="w-24 h-24">
                    {/* <AvatarImage src={profile.user.image || ""} /> */}
                    <AvatarFallback className="text-2xl">
                      {profile?.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase() || "FL"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">{profile?.name}</h1>
                        <div className="flex items-center space-x-4 text-slate-600 mb-3">
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-4 h-4" />
                            <span>${/* {profile.hourlyRate} */}/hour</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>
                              {EXPERIENCE_LABELS[profile.developerProfile.experience || 0]} ({profile.developerProfile.experience} years)
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800">
                          {AVAILABILITY_LABELS[ "FULL_TIME"]}
                        </Badge>
                      </div>
                      <div className="flex space-x-2">
                        <Button className="bg-green-600 hover:bg-green-700">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Contact
                        </Button>
                        <Button variant="outline">
                          <Mail className="w-4 h-4 mr-2" />
                          Hire
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* About */}
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">{profile.developerProfile.description}</p>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle>Skills & Expertise</CardTitle>
                <CardDescription>{profile.developerProfile.skills.length} skills</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.developerProfile.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Portfolio & Work Examples */}
            {(profile.developerProfile.portfolio || profile.developerProfile.proofLinks.length > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio & Work Examples</CardTitle>
                  <CardDescription>See examples of previous work</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile.developerProfile.portfolio && (
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Globe className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-900">Portfolio Website</h4>
                          <p className="text-sm text-slate-500">Personal portfolio and showcase</p>
                        </div>
                      </div>
                      <a
                        href={profile.developerProfile.portfolio}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 text-green-600 hover:text-green-700"
                      >
                        <span>Visit</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  )}

                  {profile.developerProfile.proofLinks.map((link, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <LinkIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-900">Work Example {index + 1}</h4>
                          <p className="text-sm text-slate-500 truncate max-w-xs">{link}</p>
                        </div>
                      </div>
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                      >
                        <span>View</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
           {/*  <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Hourly Rate</span>
                  <span className="font-semibold">${profile.hourlyRate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Experience</span>
                  <span className="font-semibold">{profile.experience} years</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Skills</span>
                  <span className="font-semibold">{profile.skills.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Availability</span>
                  <Badge variant="outline" className="text-xs">
                    {profile.availability?.replace("_", " ")}
                  </Badge>
                </div>
              </CardContent>
            </Card> */}

            {/* Contact & Links */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact & Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
                <Button className="w-full bg-transparent" variant="outline">
                  <Mail className="w-4 h-4 mr-2" />
                  Hire for Project
                </Button>

                <Separator />

                {profile.developerProfile.githubUrl && (
                  <a
                    href={profile.developerProfile.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-md transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <Github className="w-5 h-5 text-slate-600" />
                      <span className="text-slate-900">GitHub Profile</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                  </a>
                )}

                {profile.developerProfile.portfolio && (
                  <a
                    href={profile.developerProfile.portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-md transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <Globe className="w-5 h-5 text-slate-600" />
                      <span className="text-slate-900">Portfolio</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                  </a>
                )}
              </CardContent>
            </Card>

            {/* Similar Freelancers */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Similar Freelancers</CardTitle>
                <CardDescription>Other freelancers with similar skills</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-500 text-center py-4">
                  Similar freelancers will be shown here based on skills and experience.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
