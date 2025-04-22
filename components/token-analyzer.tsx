"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { FileText, Copy, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function TokenAnalyzer() {
  const { toast } = useToast()
  const [text, setText] = useState("")
  const [model, setModel] = useState("gpt-4o")
  const [tokenCount, setTokenCount] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const analyzeTokens = async () => {
    if (!text.trim()) {
      toast({
        title: "No text provided",
        description: "Please enter some text to analyze",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/count-tokens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, model }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to count tokens")
      }

      setTokenCount(data.tokenCount)
      toast({
        title: "Token count complete",
        description: `Your text contains ${data.tokenCount} tokens for ${model}`,
      })
    } catch (err) {
      console.error("Error counting tokens:", err)
      setError(err.message || "An error occurred while counting tokens")
      toast({
        title: "Error",
        description: err.message || "An error occurred while counting tokens",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "Text copied to clipboard",
    })
  }

  const clearText = () => {
    setText("")
    setTokenCount(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="mr-2" /> Token Analyzer
        </CardTitle>
        <CardDescription>Count the number of tokens in your text for different OpenAI models</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="model-select">Select Model</Label>
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger id="model-select">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt-4o">GPT-4o</SelectItem>
              <SelectItem value="gpt-4o-mini">GPT-4o mini</SelectItem>
              <SelectItem value="gpt-4.1">GPT-4.1</SelectItem>
              <SelectItem value="gpt-4.1-mini">GPT-4.1 mini</SelectItem>
              <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="text-input">Enter Text</Label>
            <div className="text-sm text-muted-foreground">{tokenCount !== null && `${tokenCount} tokens`}</div>
          </div>
          <Textarea
            id="text-input"
            placeholder="Paste or type your text here to count tokens..."
            className="min-h-[200px]"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        {error && <div className="text-sm text-red-500 p-2 bg-red-50 rounded-md">{error}</div>}

        <div className="flex flex-col space-y-2">
          <div className="text-sm text-muted-foreground">
            <p>
              Token counting is performed securely on the server. Your text is not stored or used for any other purpose.
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={clearText}>
            Clear
          </Button>
          <Button variant="outline" size="sm" onClick={copyToClipboard}>
            <Copy className="h-4 w-4 mr-1" /> Copy
          </Button>
        </div>
        <Button onClick={analyzeTokens} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Counting...
            </>
          ) : (
            "Count Tokens"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
