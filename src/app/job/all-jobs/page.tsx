"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { CATEGORIES } from "@/lib/helper"

import {
  Briefcase,
  Search,
  Filter,
  SortAsc,
  MapPin,
  Star,
  TrendingUp,
} from "lucide-react"

import JobCard, { UpdatedJob } from "@/components/JobCard"
import axios from "axios"


interface JobsResponse {
  jobs: UpdatedJob[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}



const EXPERIENCE_LEVELS = ["All Levels", "Entry Level", "Intermediate", "Expert"]

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "budget-high", label: "Highest Budget" },
  { value: "budget-low", label: "Lowest Budget" },
  { value: "proposals-high", label: "Most Proposals" },
  { value: "proposals-low", label: "Fewest Proposals" },
]

export default function AllJobsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [jobs, setJobs] = useState<UpdatedJob[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "")
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "All Categories")
  const [budgetFilter, setBudgetFilter] = useState(searchParams.get("budget") || "all")
  const [experienceFilter, setExperienceFilter] = useState(searchParams.get("experience") || "All Levels")
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "newest")
  const [currentPage, setCurrentPage] = useState(Number.parseInt(searchParams.get("page") || "1"))

  useEffect(() => {
    fetchJobs()
  }, [searchTerm, selectedCategory, budgetFilter, experienceFilter, sortBy, currentPage])

  useEffect(() => {
    // Update URL params
    const params = new URLSearchParams()
    if (searchTerm) params.set("search", searchTerm)
    if (selectedCategory !== "All Categories") params.set("category", selectedCategory)
    if (budgetFilter !== "all") params.set("budget", budgetFilter)
    if (experienceFilter !== "All Levels") params.set("experience", experienceFilter)
    if (sortBy !== "newest") params.set("sort", sortBy)
    if (currentPage > 1) params.set("page", currentPage.toString())

    const newUrl = params.toString() ? `?${params.toString()}` : ""
    window.history.replaceState({}, "", `/jobs${newUrl}`)
  }, [searchTerm, selectedCategory, budgetFilter, experienceFilter, sortBy, currentPage])

  const fetchJobs = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pagination.limit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(selectedCategory !== "All Categories" && { category: selectedCategory }),
        ...(budgetFilter !== "all" && { budget: budgetFilter }),
        ...(experienceFilter !== "All Levels" && { experience: experienceFilter }),
        ...(sortBy && { sort: sortBy }),
      })

      const response = await axios(`/api/jobs/browse?${params}`)
      if (response) {
        const data: JobsResponse = await response.data
        setJobs(data.jobs)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error("Error fetching jobs:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleFilterChange = (type: string, value: string) => {
    setCurrentPage(1)
    switch (type) {
      case "category":
        setSelectedCategory(value)
        break
      case "budget":
        setBudgetFilter(value)
        break
      case "experience":
        setExperienceFilter(value)
        break
      case "sort":
        setSortBy(value)
        break
    }
  }


  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-900">FreelanceHub</span>
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <nav className="hidden md:flex items-center space-x-6">
                <Link href="/jobs" className="text-green-600 font-medium">
                  Browse Jobs
                </Link>
                <Link href="/freelancers" className="text-slate-600 hover:text-green-600 transition-colors">
                  Find Freelancers
                </Link>
                <Link href="/how-it-works" className="text-slate-600 hover:text-green-600 transition-colors">
                  How it Works
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-3">
              {session ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-slate-600">Welcome, {session.user?.name}</span>
                  <Link href={session.user?.role === "client" ? "/client/dashboard" : "/freelancer/dashboard"}>
                    <Button variant="outline">Dashboard</Button>
                  </Link>
                </div>
              ) : (
                <>
                  <Link href="/auth/signin">
                    <Button variant="outline">Sign In</Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button className="bg-green-600 hover:bg-green-700">Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold mb-4">Find Your Next Project</h1>
            <p className="text-xl text-green-100 mb-6">
              Discover thousands of opportunities from clients around the world
            </p>
            <div className="flex items-center space-x-4 text-green-100">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>{pagination.total} active jobs</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5" />
                <span>Top-rated clients</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>Remote & worldwide</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Filter className="w-5 h-5" />
                  <span>Filters</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Search Jobs</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      placeholder="Keywords, skills, or job title"
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Category</label>
                  <Select value={selectedCategory} onValueChange={(value) => handleFilterChange("category", value)}>
                    <SelectTrigger>
                      <SelectValue />
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

                {/* Budget Range */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Budget Range</label>
                  <Select value={budgetFilter} onValueChange={(value) => handleFilterChange("budget", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Budgets</SelectItem>
                      <SelectItem value="under-500">Under $500</SelectItem>
                      <SelectItem value="500-1000">$500 - $1,000</SelectItem>
                      <SelectItem value="1000-5000">$1,000 - $5,000</SelectItem>
                      <SelectItem value="5000-10000">$5,000 - $10,000</SelectItem>
                      <SelectItem value="over-10000">Over $10,000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Experience Level */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Experience Level</label>
                  <Select value={experienceFilter} onValueChange={(value) => handleFilterChange("experience", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPERIENCE_LEVELS.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Sort By</label>
                  <Select value={sortBy} onValueChange={(value) => handleFilterChange("sort", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SORT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Clear Filters */}
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => {
                    setSearchTerm("")
                    setSelectedCategory("All Categories")
                    setBudgetFilter("all")
                    setExperienceFilter("All Levels")
                    setSortBy("newest")
                    setCurrentPage(1)
                  }}
                >
                  Clear All Filters
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Jobs List */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {isLoading ? "Loading..." : `${pagination.total} Jobs Found`}
                </h2>
                <p className="text-slate-600">
                  {pagination.total > 0 && (
                    <>
                      Showing {(pagination.page - 1) * pagination.limit + 1} -{" "}
                      {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
                    </>
                  )}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <SortAsc className="w-4 h-4 text-slate-400" />
                <Select value={sortBy} onValueChange={(value) => handleFilterChange("sort", value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Jobs Grid */}
            <div className="space-y-4">
              {isLoading ? (
                // Loading Skeletons
                Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="border-slate-200">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                          </div>
                          <Skeleton className="h-8 w-20" />
                        </div>
                        <Skeleton className="h-16 w-full" />
                        <div className="flex space-x-2">
                          <Skeleton className="h-6 w-16" />
                          <Skeleton className="h-6 w-20" />
                          <Skeleton className="h-6 w-18" />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex space-x-4">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-20" />
                          </div>
                          <div className="flex space-x-2">
                            <Skeleton className="h-8 w-16" />
                            <Skeleton className="h-8 w-16" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : jobs.length === 0 ? (
                // No Results
                <Card>
                  <CardContent className="text-center py-12">
                    <Briefcase className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No jobs found</h3>
                    <p className="text-slate-600 mb-4">
                      Try adjusting your search criteria or check back later for new opportunities.
                    </p>
                    <Button
                      onClick={() => {
                        setSearchTerm("")
                        setSelectedCategory("All Categories")
                        setBudgetFilter("all")
                        setExperienceFilter("All Levels")
                      }}
                    >
                      Clear Filters
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                // Jobs List
                jobs.map((job) => <JobCard key={job.id} job={job} session={session} />)
              )}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>

                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  const page = i + 1
                  const isCurrentPage = page === currentPage

                  return (
                    <Button
                      key={page}
                      variant={isCurrentPage ? "default" : "outline"}
                      onClick={() => setCurrentPage(page)}
                      className={isCurrentPage ? "bg-green-600 hover:bg-green-700" : ""}
                    >
                      {page}
                    </Button>
                  )
                })}

                {pagination.pages > 5 && currentPage < pagination.pages - 2 && (
                  <>
                    <span className="text-slate-400">...</span>
                    <Button variant="outline" onClick={() => setCurrentPage(pagination.pages)}>
                      {pagination.pages}
                    </Button>
                  </>
                )}

                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}
                  disabled={currentPage === pagination.pages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

