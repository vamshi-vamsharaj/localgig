"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Signin() {
    return (
        <div className="flex min-h-screen items-start justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4 pt-24">
            <Card className="w-full max-w-md border border-gray-200 bg-white shadow-xl rounded-2xl">

                <CardHeader className="space-y-2 text-center">
                    <CardTitle className="text-3xl font-bold text-gray-900">
                        Log In
                    </CardTitle>
                    <CardDescription className="text-gray-600 text-sm">
                        Sign in to continue to your LocalGig dashboard.
                    </CardDescription>
                </CardHeader>

                <form className="space-y-6">
                    <CardContent className="space-y-4">

                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                className="h-11"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                className="h-11"
                            />
                        </div>

                    </CardContent>

                    <CardFooter className="flex flex-col space-y-4">
                        <Button
                            type="submit"
                            className="w-full h-11 text-base font-medium rounded-lg bg-primary hover:bg-primary/90"
                        >
                            Sign In
                        </Button>

                        <p className="text-center text-sm text-gray-600">
                            Don’t have an account?{" "}
                            <Link
                                href="/sign-up"
                                className="font-medium text-primary hover:underline"
                            >
                                Sign Up
                            </Link>
                        </p>
                    </CardFooter>
                </form>

            </Card>
        </div>
    );
}