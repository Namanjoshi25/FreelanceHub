"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Briefcase, ArrowLeft, DollarSign, Clock, FileText, Tag, X, Plus, AlertCircle, CheckCircle } from "lucide-react"
import { SKILL_SUGGESTIONS ,CATEGORIES} from "@/lib/helper"
interface FormData {
  title: string
  description: string
  budget: number
  skills: string[]
  category: string
}




export default function PostJobPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [currentSkill, setCurrentSkill] = useState("")
  const [showSkillSuggestions, setShowSkillSuggestions] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    budget: 0,
    skills: [],
    category: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (session?.user?.role !== "client" && session?.user?.role) {
      router.push("/developer/dashboard")
    }
  }, [status, session, router])

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const addSkill = (skill: string) => {
    const trimmedSkill = skill.trim()
    if (trimmedSkill && !formData.skills.includes(trimmedSkill)) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, trimmedSkill],
      }))
    }
    setCurrentSkill("")
    setShowSkillSuggestions(false)
  }

  const removeSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }))
  }

  const handleSkillInputChange = (value: string) => {
    setCurrentSkill(value)
    setShowSkillSuggestions(value.length > 0)
  }

  const handleSkillKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && currentSkill.trim()) {
      e.preventDefault()
      addSkill(currentSkill)
    }
  }

  const filteredSkillSuggestions = SKILL_SUGGESTIONS.filter(
    (skill) => skill.toLowerCase().includes(currentSkill.toLowerCase()) && !formData.skills.includes(skill),
  ).slice(0, 5)

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) newErrors.title = "Job title is required"
    if (!formData.description.trim()) newErrors.description = "Job description is required"
    if (!formData.category) newErrors.category = "Please select a category"

  

    if (formData.skills.length === 0) {
      newErrors.skills = "Please add at least one skill"
    }

    if (formData.description.length < 50) {
      newErrors.description = "Description should be at least 50 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/jobs/add-job", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId :session?.user.id,
          title: formData.title.trim(),
          description: formData.description.trim(),
          budget : formData.budget ,
          skills: formData.skills,
          category: formData.category,
        }),
      })

      if (response.status == 201) {
        const job = await response.json()
        router.push(`/client/dashboard/${session?.user.id}`)
      } else {
        const data = await response.json()
        setErrors({ general: data.error || "Failed to post job" })
      }
    } catch (error) {
      setErrors({ general: "An error occurred. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
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
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Post New Job
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Post a New Job</h1>
          <p className="text-slate-600">Tell us about your project and find the perfect freelancer</p>
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
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  <span>Basic Information</span>
                </CardTitle>
                <CardDescription>Start with the basics of your project</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g. Build a responsive e-commerce website"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className={errors.title ? "border-red-300" : ""}
                  />
                  {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                    <SelectTrigger className={errors.category ? "border-red-300" : ""}>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-sm text-red-600">{errors.category}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Project Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your project in detail. What do you want to accomplish? What are the key requirements?"
                    value={formData.description}
                    onChange={(e ) => handleInputChange("description", e.target?.value)}
                    className={`min-h-32 ${errors.description ? "border-red-300" : ""}`}
                  />
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>{formData.description.length} characters</span>
                    <span>Minimum 50 characters</span>
                  </div>
                  {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Tag className="w-5 h-5 text-green-600" />
                  <span>Required Skills</span>
                </CardTitle>
                <CardDescription>What skills are needed for this project?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="skills">Add Skills *</Label>
                  <div className="relative">
                    <Input
                      id="skills"
                      placeholder="Type a skill and press Enter"
                      value={currentSkill}
                      onChange={(e) => handleSkillInputChange(e.target.value)}
                      onKeyPress={handleSkillKeyPress}
                      className={errors.skills ? "border-red-300" : ""}
                    />
                    {showSkillSuggestions && filteredSkillSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-slate-200 rounded-md shadow-lg z-10 mt-1">
                        {filteredSkillSuggestions.map((skill) => (
                          <button
                            key={skill}
                            onClick={() => addSkill(skill)}
                            className="w-full text-left px-3 py-2 hover:bg-slate-50 first:rounded-t-md last:rounded-b-md"
                          >
                            {skill}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {errors.skills && <p className="text-sm text-red-600">{errors.skills}</p>}
                </div>

                {formData.skills.length > 0 && (
                  <div className="space-y-2">
                    <Label>Selected Skills</Label>
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="flex items-center space-x-1">
                          <span>{skill}</span>
                          <button onClick={() => removeSkill(skill)} className="ml-1 hover:text-red-600">
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Popular Skills</Label>
                  <div className="flex flex-wrap gap-2">
                    {SKILL_SUGGESTIONS.slice(0, 8)
                      .filter((skill) => !formData.skills.includes(skill))
                      .map((skill) => (
                        <button
                          key={skill}
                          onClick={() => addSkill(skill)}
                          className="text-sm px-3 py-1 bg-slate-100 hover:bg-green-100 hover:text-green-700 rounded-full transition-colors"
                        >
                          <Plus className="w-3 h-3 inline mr-1" />
                          {skill}
                        </button>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Budget */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <span>Budget</span>
                </CardTitle>
                <CardDescription>Set your project budget</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
               

       
                  <div className="space-y-2">
                    <Label htmlFor="budgetMin">Project Budget ($) *</Label>
                    <Input
                      id="budget"
                      type="number"
                      placeholder="e.g. 1000"
                      value={formData.budget}
                      onChange={(e) => handleInputChange("budget", e.target.value)}
                      className={errors.budgetMin ? "border-red-300" : ""}
                    />
                    {errors.budgetMin && <p className="text-sm text-red-600">{errors.budget}</p>}
                  </div>
             

          

               
              </CardContent>
            </Card>

            {/* Project Details */}
    
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Job Preview</CardTitle>
                <CardDescription>How your job will appear to freelancers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-slate-900">
                    {formData.title || "Your job title will appear here"}
                  </h3>
                  {formData.category && (
                    <Badge variant="secondary" className="mt-1">
                      {formData.category}
                    </Badge>
                  )}
                </div>

                {formData.description && <p className="text-sm text-slate-600 line-clamp-3">{formData.description}</p>}

                {formData.skills.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs">Required Skills</Label>
                    <div className="flex flex-wrap gap-1">
                      {formData.skills.slice(0, 5).map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {formData.skills.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{formData.skills.length - 5} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {(formData.budget) && (
                  <div className="flex items-center space-x-2 text-sm">
                    <p>Project Budget</p>
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className=" font-semibold">
                      {formData.budget}
                   
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Tips for Success</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-600">
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Write a clear, detailed description of your project</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Include specific skills and technologies needed</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Set a realistic budget for quality work</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Be responsive to freelancer questions</p>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700"
                size="lg"
              >
                {isLoading ? "Posting Job..." : "Post Job"}
              </Button>
              <Button variant="outline" className="w-full" onClick={() => router.push("/client/dashboard")}>
                Save as Draft
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
