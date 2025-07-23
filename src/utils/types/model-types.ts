export  interface Proposal {
  id: string
  proposalText: string
  proposedBudget: number
  deliveryTime: number
  status: string
  createdAt: string
  jobId : string
  job: {
    title: string
    client: {
      name: string
      email : string
      id: string
    }
  }
}

export interface Job {
  id: string
  title: string
  description: string
  budget:number 
  skills: string[]
  status: string
  createdAt: string
  client: {
    id: string
    name: string
  }
  _count: {
    proposals: number
  }
}

