"use client";

import { Briefcase } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";
import SignOutButton from "./sign-out-btn";
import { useSession } from "@/lib/auth/auth-client";

function getInitial(session: any) {
  const name = session?.user?.name?.trim();
  const email = session?.user?.email?.trim();
  const source = name || email || "U";
  return source.slice(0, 1).toUpperCase();
}

export default function Navbar() {
  const { data: session } = useSession();
  const isSignedIn = !!session?.user;

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="container mx-auto flex h-16 items-center px-4 justify-between">
        <Link
          href={isSignedIn ? "/dashboard" : "/"}
          className="flex items-center gap-2 text-xl font-semibold text-primary"
        >
          <Briefcase />
          Task Manager
        </Link>

        <div className="flex items-center gap-2">
          {isSignedIn ? (
            <>
              <Link href="/dashboard">
                <Button
                  variant="ghost"
                  className="text-gray-700 hover:text-red-600 cursor-pointer"
                >
                  Dashboard
                </Button>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                    aria-label="Account menu"
                  >
                    <Avatar className="h-8 w-8 cursor-pointer">
                      <AvatarFallback className="bg-red-600 text-white">
                        {getInitial(session)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-56 cursor-pointer" align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {session?.user?.name ?? "User"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session?.user?.email ?? ""}
                      </p>
                    </div>
                  </DropdownMenuLabel>

                  <SignOutButton />
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/sign-in">
                <Button
                  variant="ghost"
                  className="text-gray-700 hover:text-red-600 cursor-pointer"
                >
                  Log In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button className="bg-red-500 hover:bg-primary/90 cursor-pointer">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
