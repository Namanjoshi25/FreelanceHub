"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {  Users } from "lucide-react"
import axios from "axios"

export default function CompleteProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(false)
  const [companyName, setCompanyName] = useState("");


  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
    if(session?.user.profileCompleted)    router.push(`/client/dashboard/${session?.user?.id}`)
  }, [status, router])

  const handleCompleteProfile = async () => {
    if (!session?.user?.email) return
    let userId = session.user.id

    setIsLoading(true)
    try {
      const response = await axios.post("/api/client/setup-profile",{companyName,userId})

      if (response) {
        // Redirect to appropriate dashboard
       session.user.profileCompleted = true
          router.push(`/client/dashboard/${userId}`)
       
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-slate-200">
        <CardHeader className="text-center">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 `}
          >
            
              <Users className="w-8 h-8 text-blue-600" />
          
          </div>
          <CardTitle className="text-slate-900">Complete Your Profile</CardTitle>
          <CardDescription>
            Welcome {session?.user?.name}! Let's set up your {session?.user?.role} account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-4">
            <p className="text-sm text-slate-600">
              You're signing up 
            </p>
              <input
            className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-green-400/40"
            placeholder="Company name"
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)} 
          />
          
          </div>
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
