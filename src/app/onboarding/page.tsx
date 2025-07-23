'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function OnboardingPage() {
  const { data: session,update} = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
   let role = session?.user.role;
    let userId = session?.user.id
    let profileCompleted = session?.user.profileCompleted

  

  const handleRoleSelect = async (role: 'client' | 'developer') => {
    setLoading(true);
    try {
  await axios.post('/api/user/set-role', { role });
       await update()
              router.push(`/setup-profile/${role}`);
    } catch (err) {
      console.error(err);
      alert('Failed to set role. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(()=>{
   
    if(profileCompleted){

    
      if(role ==='client') { router.push(`/client/dashboard/${userId}`)}
       else router.push(`/user/dashboard/${userId}`)

    }

  },[role, userId, profileCompleted])


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-green-700 mb-4">Welcome to DevHire 👋</h1>
        <p className="text-center text-gray-600 mb-6">Let's get you started. What best describes you?</p>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => handleRoleSelect('client')}
            disabled={loading}
            className="py-2 px-4 border border-green-600 rounded-lg hover:bg-green-600 hover:text-white transition"
          >
            I’m a Client (I want to hire)
          </button>
          <button
            onClick={() => handleRoleSelect('developer')}
            disabled={loading}
            className="py-2 px-4 border border-green-600 rounded-lg hover:bg-green-600 hover:text-white transition"
          >
            I’m a Developer (I want to work)
          </button>
        </div>
      </div>
    </div>
  );
}
