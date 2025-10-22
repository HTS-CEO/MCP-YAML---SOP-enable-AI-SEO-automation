import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="text-center space-y-6 max-w-2xl">
        <h1 className="text-4xl font-bold text-foreground">SEO Automation Dashboard</h1>
        <p className="text-lg text-muted-foreground">
          Turn client uploads into SEO-optimized blog posts and monitor their performance automatically.
        </p>

        <div className="flex gap-4 justify-center">
          <Link href="/login">
            <Button variant="default">Sign In</Button>
          </Link>
          <Link href="/signup">
            <Button variant="outline">Sign Up</Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
