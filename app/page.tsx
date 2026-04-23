'use client'
import { Demo } from "@/components/demo"
import { trpc } from "@/server/client"

export default function Page() {
  const me = trpc.user.me.useQuery()
  return (
    <>
    <div className="text-3xl font-bold underline">
      Hello world!
      {JSON.stringify(me.data)}
    </div>
    <Demo />
    </>
  )
}
