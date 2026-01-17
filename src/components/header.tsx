'use client'

import { Sparkles, LogOut, UserCog, Clock } from 'lucide-react'
import { useAuth } from '@/context/auth-context'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from './ui/skeleton'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const UserNav = () => {
  const { user, logout, switchAccount, loading } = useAuth()

  if (loading) {
    return <Skeleton className="h-10 w-10 rounded-full" />
  }

  if (!user) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
          <Avatar>
            <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
            <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/history" className="cursor-pointer flex items-center">
            <Clock className="mr-2 h-4 w-4" />
            <span>View History</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={switchAccount} className="cursor-pointer">
          <UserCog className="mr-2 h-4 w-4" />
          <span>Switch Account</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={logout} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function Header() {
  const { user } = useAuth()

  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Sparkles className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold font-headline text-foreground">
            FairPrice AI
          </h1>
        </Link>

        <div className="flex items-center gap-4">
          {user && (
            <Button
              asChild
              variant="outline"
              className="flex items-center gap-2"
            >
              <Link href="/history">
                <Clock className="h-4 w-4" />
                History
              </Link>
            </Button>
          )}
          <UserNav />
        </div>
      </div>
    </header>
  )
}
