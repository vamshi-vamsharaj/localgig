"use client"
import { Briefcase, Ghost } from "lucide-react"
import Link from "next/link";
import { Button } from "./ui/button";
import { getSession } from "@/lib/auth/auth";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { signOut } from "better-auth/api";
import { useSession } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";
import SignOutButton from "./sign-out-btn";
export default function Navbar() {
    const { data: session } = useSession();
    return (
        <nav className="border-b border-gray-200 bg-white">
            <div className="container mx-auto px-4 flex  max-w-[1520px] items-center h-16 justify-between">

                <Link href="/" className="flex gap-2 text-xl items-center lg:ml-[40px] font-semibold text-primary">
                    <Briefcase />
                    LocalGig
                </Link>
                <div className="flex items-center gap-4 ">
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
                        {session?.user ? (<>
                            <DropdownMenu>
                                <DropdownMenuTrigger>
                                    <Button variant="ghost">
                                        <Avatar>
                                            <AvatarFallback className="bg-primary text-white">
                                                {session.user.name[0].toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuLabel>
                                        <div>
                                            <p>{session.user.name}</p>
                                            <p>{session.user.email}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>) :
                            (<>
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
                                </Link></>)}
                    </>

                </div>
            </div>
        </nav >);
}
