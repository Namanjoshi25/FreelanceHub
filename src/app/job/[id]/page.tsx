"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Briefcase, ArrowLeft, DollarSign, Clock, Send, AlertCircle, CheckCircle, FileText } from "lucide-react"
import axios from "axios"


interface Job {
  id: string
  title: string
  description: string
  budget: number | null
  skills: string[]
  client: {
    id: string
    name: string
    image: string | null
  }
}

export default function ApplyJobPage() {
  const { data: session, status } = useSession()
  const params = useParams()
  const router = useRouter()
  const jobId = params.id as string

  const [job, setJob] = useState<Job | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    coverLetter: "",
    proposedRate: "",
    deliveryTime: "",

  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } 
  }, [status, session, router])

  useEffect(() => {
    if (jobId && session?.user?.role === "developer") {
      fetchJob()
    }
  }, [jobId, session])

  const fetchJob = async () => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`)
      if (response.ok) {
        const data = await response.json()
        setJob(data)

        // Check if user has already applied
        const userProposal = data.proposals?.find((p: any) => p.developer.email === session?.user?.email)
        if (userProposal) {
          router.push(`/job/all-jobs`)
        }
      } else if (response.status === 404) {
        router.push("/job/all-jobs")
      }
    } catch (error) {
      console.error("Error fetching job:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.coverLetter.trim()) {
      newErrors.coverLetter = "Cover letter is required"
    } else if (formData.coverLetter.length < 100) {
      newErrors.coverLetter = "Cover letter should be at least 100 characters"
    }

    if (!formData.proposedRate) {
      newErrors.proposedRate = "Proposed rate is required"
    } else if (Number.parseInt(formData.proposedRate) < 5) {
      newErrors.proposedRate = "Minimum rate is $5"
    }

    if (!formData.deliveryTime) {
      newErrors.deliveryTime = "Delivery time is required"
    } else if (Number.parseInt(formData.deliveryTime) < 1) {
      newErrors.deliveryTime = "Minimum delivery time is 1 day"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)
    
    try {
        
      const response = await axios.post("/api/user/proposals/send-proposal", formData,{
        headers :{
            "userId": session?.user?.id,
            "jobId": jobId,
        },
  
      })

      if (response) {
    
      } else {
        const data = await response
        setErrors({ general: data || "Failed to submit proposal" })
      }
    } catch (error) {
      setErrors({ general: "An error occurred. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatBudget = (min: number | null, max: number | null) => {
    if (!min && !max) return "Budget not specified"
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`
    if (min) return `From $${min.toLocaleString()}`
    if (max) return `Up to $${max.toLocaleString()}`
    return "Budget not specified"
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
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
            <p className="text-slate-600 mb-4">The job you're looking for doesn't exist or has been removed.</p>
            <Link href="/jobs">
              <Button>Browse All Jobs</Button>
            </Link>
          </CardContent>
        </Card>
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
              <Link href={`/jobs/${jobId}`} className="flex items-center space-x-2 text-slate-600 hover:text-green-600">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Job</span>
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
              Apply for Job
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Submit Your Proposal</h1>
          <p className="text-slate-600">Write a compelling proposal to stand out from other freelancers</p>
        </div>

        {errors.general && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                <span>{errors.general}</span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cover Letter */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  <span>Cover Letter</span>
                </CardTitle>
                <CardDescription>Explain why you're the perfect fit for this project</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="coverLetter">Your Proposal *</Label>
                  <Textarea
                    id="coverLetter"
                    placeholder="Dear Client,

I am excited to submit my proposal for your project. With [X years] of experience in [relevant skills], I am confident I can deliver exceptional results.

Here's how I would approach your project:
1. [Step 1]
2. [Step 2]
3. [Step 3]

I have successfully completed similar projects, including [specific examples]. You can view my portfolio at [link].

I'm available to start immediately and can deliver within your timeline. I'd love to discuss your project further.

Best regards,
[Your name]"
                    value={formData.coverLetter}
                    onChange={(e) => handleInputChange("coverLetter", e.target.value)}
                    className={`min-h-64 ${errors.coverLetter ? "border-red-300" : ""}`}
                  />
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>{formData.coverLetter.length} characters</span>
                    <span>Minimum 100 characters</span>
                  </div>
                  {errors.coverLetter && <p className="text-sm text-red-600">{errors.coverLetter}</p>}
                </div>
              </CardContent>
            </Card>

            {/* Pricing & Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <span>Pricing & Timeline</span>
                </CardTitle>
                <CardDescription>Set your rate and delivery timeline</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="proposedRate">Your Rate (USD) *</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        id="proposedRate"
                        type="number"
                        min="5"
                        placeholder="1000"
                        value={formData.proposedRate}
                        onChange={(e) => handleInputChange("proposedRate", e.target.value)}
                        className={`pl-10 ${errors.proposedRate ? "border-red-300" : ""}`}
                      />
                    </div>
                    <p className="text-sm text-slate-500">
                      Client's budget: {job.budget}
                    </p>
                    {errors.proposedRate && <p className="text-sm text-red-600">{errors.proposedRate}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deliveryTime">Delivery Time (Days) *</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        id="deliveryTime"
                        type="number"
                        min="1"
                        placeholder="14"
                        value={formData.deliveryTime}
                        onChange={(e) => handleInputChange("deliveryTime", e.target.value)}
                        className={`pl-10 ${errors.deliveryTime ? "border-red-300" : ""}`}
                      />
                    </div>
                    <p className="text-sm text-slate-500">How many days to complete this project?</p>
                    {errors.deliveryTime && <p className="text-sm text-red-600">{errors.deliveryTime}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-between">
              <Link href={`/jobs/${jobId}`}>
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Proposal
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Job Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Job Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">{job.title}</h3>
                  <p className="text-slate-600 text-sm line-clamp-3">{job.description}</p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Budget</span>
                    <span className="font-semibold">{job.budget}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Skills</span>
                    <span className="font-semibold">{job.skills.length}</span>
                  </div>
                </div>

                {job.skills.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <Label className="text-sm font-medium text-slate-700 mb-2 block">Required Skills</Label>
                      <div className="flex flex-wrap gap-1">
                        {job.skills.slice(0, 6).map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {job.skills.length > 6 && (
                          <Badge variant="outline" className="text-xs text-slate-500">
                            +{job.skills.length - 6}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Client Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Client Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={job.client.image || ""} />
                    <AvatarFallback>
                      {job.client.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase() || "CL"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-slate-900">{job.client.name}</h4>
                    <p className="text-sm text-slate-500">Client</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Proposal Tips</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-600">
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Address the client by name and reference specific project details</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Highlight relevant experience and include portfolio examples</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Explain your approach and methodology clearly</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Ask thoughtful questions about the project</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Be competitive but fair with your pricing</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
