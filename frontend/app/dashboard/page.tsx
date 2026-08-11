"use client";

import { useSession } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/server/client"; 

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const { data: users, isLoading: usersLoading } = trpc.user.me.useQuery();


  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Dashboard</h1>
      <div>{users ? `${users.name} is signed in` : "No user found"}</div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Welcome Back!</CardTitle>
            <CardDescription>Your current session details.</CardDescription>
          </CardHeader>
          <CardContent>
            {isPending ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            ) : (
              <div className="space-y-2">
                <p><strong>Name:</strong> {session?.user?.name}</p>
                <p><strong>Email:</strong> {session?.user?.email}</p>
                <p><strong>Role:</strong> {(session?.user as any)?.role || "User"}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reading Module Card */}
        <Card className="hover:shadow-md transition-shadow border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>📖 Reading Test</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground font-bold">
                60 Min
              </span>
            </CardTitle>
            <CardDescription>
              Take a full 3-passage IELTS Academic Reading test (40 questions).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <a
              href="/reading"
              className="inline-flex items-center justify-center w-full h-10 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Start Reading Test →
            </a>
          </CardContent>
        </Card>

        {/* Writing Module Card */}
        <Card className="hover:shadow-md transition-shadow border-border">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>✍️ Writing Test</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground font-bold">
                60 Min
              </span>
            </CardTitle>
            <CardDescription>
              Task 1 (Report/Letter) & Task 2 (Essay) with AI band scoring.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <a
              href="/writing"
              className="inline-flex items-center justify-center w-full h-10 rounded-xl bg-muted text-foreground font-semibold text-sm hover:bg-muted/80 transition-colors"
            >
              Start Writing Test →
            </a>
          </CardContent>
        </Card>

        {/* Speaking Module Card */}
        <Card className="hover:shadow-md transition-shadow border-border">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>🎙️ Speaking Test</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground font-bold">
                11-14 Min
              </span>
            </CardTitle>
            <CardDescription>
              Live voice interview with AI Examiner (Parts 1, 2, & 3).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <a
              href="/speaking/test"
              className="inline-flex items-center justify-center w-full h-10 rounded-xl bg-muted text-foreground font-semibold text-sm hover:bg-muted/80 transition-colors"
            >
              Start Speaking Test →
            </a>
          </CardContent>
        </Card>

        {/* Listening Module Card */}
        <Card className="hover:shadow-md transition-shadow border-border">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>🎧 Listening Test</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground font-bold">
                30 Min
              </span>
            </CardTitle>
            <CardDescription>
              Listen to 4 sections and answer 40 questions with AI scoring.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <a
              href="/listening"
              className="inline-flex items-center justify-center w-full h-10 rounded-xl bg-muted text-foreground font-semibold text-sm hover:bg-muted/80 transition-colors"
            >
              Start Listening Test →
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
