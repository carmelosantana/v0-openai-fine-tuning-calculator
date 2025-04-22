import { Info } from "lucide-react"

export function Footer() {
  // Format today's date
  const today = new Date()
  const formattedDate = today.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <footer className="py-4 px-6">
      <div className="group relative inline-flex items-center">
        <div className="flex items-center text-muted-foreground overflow-hidden">
          <Info className="h-4 w-4 flex-shrink-0" />
          <span className="text-xs text-muted-foreground max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100 group-hover:ml-2 group-hover:pr-2 transition-all duration-300 ease-in-out whitespace-nowrap">
            Last updated: {formattedDate}
          </span>
        </div>
        <div className="absolute inset-0 bg-muted opacity-0 group-hover:opacity-100 rounded-full transition-all duration-300 ease-in-out -z-10"></div>
      </div>
    </footer>
  )
}
