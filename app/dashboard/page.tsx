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
      </div>
    </div>
  );
}
