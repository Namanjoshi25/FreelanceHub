"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, Plus, Users, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@radix-ui/react-label"
import { SKILL_SUGGESTIONS,CATEGORIES } from "@/lib/helper"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UploadButton } from "@/utils/uploadthing"
import axios from "axios"



interface ProfileData {
    description:string
    skills: string[]
    githubUrl :string
    portfolio : string
    experience : 0,
    proofLinks : string[]
    domain:string
}

export default function CompleteProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const userType = session?.user.role
    const [currentSkill, setCurrentSkill] = useState("")
     const [showSkillSuggestions, setShowSkillSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [profileData , setProfileData] = useState<ProfileData>({
    description:'',
    skills: [],
    githubUrl :"",
    portfolio : "",
    experience : 0,
    proofLinks:[],
    domain:""

  })


  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
    if(session?.user.profileCompleted)    router.push(`/user/dashboard/${session?.user?.id}`)
  }, [status, router])

   const addSkill = (skill: string) => {
      const trimmedSkill = skill.trim()
      if (trimmedSkill && !profileData.skills.includes(trimmedSkill)) {
        setProfileData((prev) => ({
          ...prev,
          skills: [...prev.skills, trimmedSkill],
        }))
      }
      setCurrentSkill("")
      setShowSkillSuggestions(false)
    }
  
    const removeSkill = (skillToRemove: string) => {
      setProfileData((prev) => ({
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
        (skill) => skill.toLowerCase().includes(currentSkill.toLowerCase()) && !profileData.skills.includes(skill),
      ).slice(0, 5)
       const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
   
  }


  const handleCompleteProfile = async () => {
    if (!session?.user?.email || !userType) return

    setIsLoading(true)
    try {
      console.log(profileData);
     const response = await axios.post("/api/user/profile", {
        profileData: {
          ...profileData,
          userId: session.user.id,
  
        },
      })

      if (response) {
        // Redirect to appropriate dashboard
     /*    if (userType === "client") {
          router.push("/client/dashboard")
        } else {
          router.push("/freelancer/dashboard")
        } */
      } 
    } catch (error) {
      console.error("Profile completion error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 flex items-center  justify-center p-4">
      <Card className="w-full max-w-md border-slate-200">
        <CardHeader className="text-center">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4
               bg-green-100
            `}
          >
             (
              <Briefcase className="w-8 h-8 text-green-600" />
            )
          </div>
          <CardTitle className="text-slate-900">Complete Your Profile</CardTitle>
          <CardDescription>
            Welcome {session?.user?.name}! Let's set up your {userType} account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-sm text-slate-600">
              You're signing up as a <strong>{userType}</strong>
            </p>
            <p className="text-sm text-slate-500">
           
                 You'll be able to browse projects and send proposals.
            </p>
          </div>
          {/* Profile description*/}
          <div className=" space-y-2"> 
            <Label htmlFor="skills"> Profile Description</Label>
                <Textarea
                
            className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-green-400/40"
            placeholder="Your description"
            value={profileData.description}
            onChange={(e) => setProfileData( {...profileData,description : e.target.value})} 
          />

          </div>
        

          {/* skills */}
           <div className="space-y-2">
                  <Label htmlFor="skills">Add Skills *</Label>
                  <div className="relative">
                    <Input
                      id="skills"
                      placeholder="Type a skill and press Enter"
                      value={currentSkill}
                      onChange={(e) => handleSkillInputChange(e.target.value)}
                      onKeyPress={handleSkillKeyPress}
          
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

                  
                {profileData.skills.length > 0 && (
                  <div className="space-y-4">
                    <Label>Selected Skills</Label>
                    <div className="flex flex-wrap gap-4">
                      {profileData.skills.map((skill) => (
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

                <div className="space-y-4 mt-2">
                  <Label>Popular Skills</Label>
                  <div className="flex flex-wrap gap-2 " >
                    {SKILL_SUGGESTIONS.slice(0, 8)
                      .filter((skill) => !profileData.skills.includes(skill))
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

        
                </div>

 {/* githhub url */}
                <div className=" space-y-2">
                  <Label htmlFor="githubUrl" >Github Link</Label>
                  <Input
                                        id="githubUrl"
                                        type="url"
                                        placeholder="e.g. www.github.com/username"
                                        value={profileData.githubUrl}
                                        onChange={(e) => handleInputChange('githubUrl', e.target.value)}
                                        
                                      />
                </div>
                 {/*  portfolio url*/}
                 <div className=" space-y-2">
                  <Label htmlFor="githubUrl" >Portfolio Link</Label>
                  <Input
                                        id="portfolio"
                                        type="url"
                                        placeholder="e.g. www.johndoeportfolio.com"
                                        value={profileData.portfolio}
                                        onChange={(e) => handleInputChange('portfolio', e.target.value)}
                                        
                                      />
                </div>
                 {/*  experience*/}
                 <div className=" space-y-2">
                  <Label htmlFor="experience" >Experience </Label>
                  <Input
                                        id="experience"
                                        type="number"
                                        placeholder="e.g. x years"
                                        value={profileData.experience}
                                        onChange={(e) => handleInputChange('experience', e.target.value)}
                                        
                                      />
                </div>
                 {/*  Domain*/}
                        <div className="space-y-2">
                  <Label htmlFor="category">Field *</Label>
                  <Select value={profileData.domain} onValueChange={(value) => handleInputChange("domain", value)}>
                    <SelectTrigger >
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
                </div>
                {/* Proof of work */}
               <UploadButton
        endpoint="imageUploader"
        onClientUploadComplete={(res) => {
       
          
          for(const file of res) {
           
            setProfileData((prev) => ({
              ...prev,
              proofLinks: [...prev.proofLinks, file.serverData.fileUrl],
            }))
            console.log(profileData);
           
        }}
        }
      />
          

                 
          
          <Button
            onClick={handleCompleteProfile}
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700"
            size="lg"
          >
            {isLoading ? "Setting up..." : "Complete Setup"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
