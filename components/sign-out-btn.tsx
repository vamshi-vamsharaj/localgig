"use client";

import { signOut } from "@/lib/auth/auth-client";
import { DropdownMenuItem } from "./ui/dropdown-menu";
import { useRouter } from "next/navigation";

import * as React from "react";

interface SignOutButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asMenuItem?: boolean;
}

export default function SignOutButton({ asMenuItem = false, className, ...props }: SignOutButtonProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    const result = await signOut();

    if (result.data) {
      router.push("/sign-in");
    } else {
      alert("Error signing out");
    }
  };

  if (asMenuItem) {
    return (
      <DropdownMenuItem onSelect={handleSignOut} className={className}>
        Log Out
      </DropdownMenuItem>
    );
  }

  return (
    <button
      type="button"
      className={className}
      onClick={handleSignOut}
      {...props}
    >
      Log Out
    </button>
  );
}