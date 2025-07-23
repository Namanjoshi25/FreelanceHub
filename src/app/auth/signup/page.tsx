"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Briefcase } from "lucide-react";
import Link from "next/link";
import axios from 'axios'

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    // You'd call your /api/register here, then sign in
    await axios.post("/api/auth/register",{email,password})
    await signIn("credentials", {
      email,
      password,
      callbackUrl: "/onboarding",
    });
  };

  return (
    <div className="min-h-screen  flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md flex flex-col items-center space-y-2">
       <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
        <h1 className="text-2xl font-bold text-center text-green-700 mb-4">Sign up to see more</h1>
        <p className="text-center text-sm  text-gray-500 mb-6">Create your account to get started</p>

        <div className="space-y-4">
          <input
            className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-green-400/40"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-green-400/40"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={handleSignup}
            className="w-full py-2 bg-green-600 text-white font-semibold rounded-sm hover:bg-green-700 transition"
          >
            Sign Up
          </button>

          <div className="text-center text-sm text-gray-500">or</div>

          <button
            onClick={() => signIn("google",{callbackUrl:"/onboarding"})}
            className="w-full  py-2 border border-gray-300 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-100 transition"
          >
            <img src="/google-tile.svg" alt="Google" className="w-5 h-5  " />
            <span className="font-medium">Continue with Google</span>
          </button>

          <div className="text-center text-sm mt-4">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-green-700 font-semibold hover:underline">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
