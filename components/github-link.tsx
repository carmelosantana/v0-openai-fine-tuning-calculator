import Link from "next/link"
import { Github } from "lucide-react"
import { Button } from "@/components/ui/button"

export function GitHubLink() {
  return (
    <div className="absolute top-4 right-4 z-10">
      <Link
        href="https://github.com/carmelosantana/v0-openai-fine-tuning-calculator"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button variant="outline" size="icon" className="rounded-full">
          <Github className="h-5 w-5" />
          <span className="sr-only">GitHub</span>
        </Button>
      </Link>
    </div>
  )
}
