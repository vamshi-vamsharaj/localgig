"use client"
import { Briefcase, Ghost } from "lucide-react"
import Link from "next/link";
import { Button } from "./ui/button";
export default function Navbar() {
    return (
        <nav className="border-b border-gray-200 bg-white">
            <div className="container mx-auto px-4 flex items-center h-16 justify-between">

                <Link href="/" className="flex gap-2 text-xl items-center font-semibold text-primary">
                    <Briefcase />
                    LocalGig
                </Link>
                <div className="flex items-center gap-4">
                    <Link href="/jobs">
                        <Button
                            variant="ghost"
                            className="text-gray-700 hover:text-black"
                        >
                            Explore Jobs
                        </Button>
                    </Link>
                    <Link href="/jobs/create">
                        <Button
                            variant="ghost"
                            className="text-gray-700 hover:text-black"
                        >
                            Post a Job
                        </Button>
                    </Link>
                    <Link href="/dashboard">
                        <Button
                            variant="ghost"
                            className="text-gray-700 hover:text-black"
                        >
                            Dashboard
                        </Button>
                    </Link>


                    <>
                        <Link href="/sign-in">
                            <Button
                                variant="ghost"
                                className="text-gray-700 hover:text-black"
                            >
                                Log In
                            </Button>
                        </Link>
                        <Link href="/sign-up">
                            <Button className="bg-primary hover:bg-primary/90">
                                Sign Up
                            </Button>
                        </Link>
                    </>

                </div>
            </div>
        </nav >);
}
