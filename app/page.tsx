"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Calculator, Info, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import { useSearchParams, useRouter } from "next/navigation"
import TokenAnalyzer from "@/components/token-analyzer"

export default function FineTuningCalculator() {
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Model pricing data
  const models = {
    "gpt-4.1": {
      input: 3.0,
      cachedInput: 0.75,
      output: 12.0,
      training: 25.0,
      name: "GPT-4.1",
      description: "High performance for complex tasks",
    },
    "gpt-4.1-mini": {
      input: 0.8,
      cachedInput: 0.2,
      output: 3.2,
      training: 5.0,
      name: "GPT-4.1 mini",
      description: "Balanced performance and cost",
    },
    "gpt-4o": {
      input: 3.75,
      cachedInput: 1.875,
      output: 15.0,
      training: 25.0,
      name: "GPT-4o",
      description: "Latest model with multimodal capabilities",
    },
    "gpt-4o-mini": {
      input: 0.3,
      cachedInput: 0.15,
      output: 1.2,
      training: 3.0,
      name: "GPT-4o mini",
      description: "Cost-effective with good performance",
    },
  }

  // State
  const [selectedModel, setSelectedModel] = useState("gpt-4o-mini")
  const [inputTokens, setInputTokens] = useState(100000)
  const [outputTokens, setOutputTokens] = useState(20000)
  const [epochs, setEpochs] = useState(3)
  const [useCachedInput, setUseCachedInput] = useState(false)
  const [batchApi, setBatchApi] = useState(false)
  const [totalCost, setTotalCost] = useState(0)
  const [trainingCost, setTrainingCost] = useState(0)
  const [inferenceInputCost, setInferenceInputCost] = useState(0)
  const [inferenceOutputCost, setInferenceOutputCost] = useState(0)
  const [activeTab, setActiveTab] = useState("calculator")

  // Load state from URL parameters if present
  useEffect(() => {
    if (searchParams) {
      const model = searchParams.get("model")
      const input = searchParams.get("input")
      const output = searchParams.get("output")
      const ep = searchParams.get("epochs")
      const cached = searchParams.get("cached")
      const batch = searchParams.get("batch")
      const tab = searchParams.get("tab")

      if (model && models[model]) setSelectedModel(model)
      if (input) setInputTokens(Number.parseInt(input))
      if (output) setOutputTokens(Number.parseInt(output))
      if (ep) setEpochs(Number.parseInt(ep))
      if (cached) setUseCachedInput(cached === "true")
      if (batch) setBatchApi(batch === "true")
      if (tab) setActiveTab(tab)
    }
  }, [searchParams])

  // Calculate costs
  useEffect(() => {
    const model = models[selectedModel]

    // Training cost
    const training = (model.training / 1000000) * inputTokens * epochs
    setTrainingCost(training)

    // Inference costs
    const inputRate = useCachedInput ? model.cachedInput : model.input
    const inputCost = (inputRate / 1000000) * inputTokens
    const outputCost = (model.output / 1000000) * outputTokens

    // Apply batch API discount if selected
    const batchDiscount = batchApi ? 0.5 : 1
    const finalInputCost = inputCost * batchDiscount
    const finalOutputCost = outputCost * batchDiscount

    setInferenceInputCost(finalInputCost)
    setInferenceOutputCost(finalOutputCost)

    // Total cost
    setTotalCost(training + finalInputCost + finalOutputCost)
  }, [selectedModel, inputTokens, outputTokens, epochs, useCachedInput, batchApi])

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  // Generate share link
  const generateShareLink = () => {
    const baseUrl = window.location.origin + window.location.pathname
    const params = new URLSearchParams()

    params.set("model", selectedModel)
    params.set("input", inputTokens.toString())
    params.set("output", outputTokens.toString())
    params.set("epochs", epochs.toString())
    params.set("cached", useCachedInput.toString())
    params.set("batch", batchApi.toString())
    params.set("tab", activeTab)

    return `${baseUrl}?${params.toString()}`
  }

  // Copy share link to clipboard
  const copyShareLink = () => {
    const link = generateShareLink()
    navigator.clipboard.writeText(link)
    toast({
      title: "Link copied!",
      description: "Share link has been copied to clipboard",
    })
  }

  // Handle token count from analyzer
  const handleTokensFromAnalyzer = (tokenCount: number) => {
    setInputTokens(tokenCount)
    setActiveTab("calculator")
  }

  return (
    <div className="container mx-auto py-10 px-4 mb-4">
      <div className="flex flex-col items-center justify-center mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <Calculator className="mr-2" /> OpenAI Fine-Tuning Calculator
        </h1>
        <p className="text-muted-foreground text-center max-w-2xl">
          Estimate the cost of fine-tuning and using OpenAI models with this interactive calculator. Adjust parameters
          to see how they affect your total cost.
        </p>
      </div>

      <Tabs value={activeTab} className="max-w-4xl mx-auto" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="token-analyzer">Token Analyzer</TabsTrigger>
          <TabsTrigger value="about">About Fine-Tuning</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>Parameters</CardTitle>
                  <CardDescription>Adjust the parameters to calculate your fine-tuning costs</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={copyShareLink} className="flex items-center gap-1">
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="model">Select Model</Label>
                    <Select value={selectedModel} onValueChange={setSelectedModel}>
                      <SelectTrigger id="model">
                        <SelectValue placeholder="Select a model" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(models).map(([key, model]) => (
                          <SelectItem key={key} value={key}>
                            <div>
                              <span className="font-medium">{model.name}</span>
                              <span className="text-xs text-muted-foreground ml-2">- {model.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <Label htmlFor="input-tokens">Input Tokens</Label>
                      <div className="flex items-center">
                        <Input
                          type="number"
                          value={inputTokens}
                          onChange={(e) => setInputTokens(Number.parseInt(e.target.value) || 0)}
                          className="w-24 mr-2"
                        />
                        <span className="text-sm text-muted-foreground">tokens</span>
                      </div>
                    </div>
                    <Slider
                      id="input-tokens"
                      min={10000}
                      max={1000000}
                      step={10000}
                      value={[inputTokens]}
                      onValueChange={(value) => setInputTokens(value[0])}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>10K</span>
                      <span>500K</span>
                      <span>1M</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <Label htmlFor="output-tokens">Output Tokens</Label>
                      <div className="flex items-center">
                        <Input
                          type="number"
                          value={outputTokens}
                          onChange={(e) => setOutputTokens(Number.parseInt(e.target.value) || 0)}
                          className="w-24 mr-2"
                        />
                        <span className="text-sm text-muted-foreground">tokens</span>
                      </div>
                    </div>
                    <Slider
                      id="output-tokens"
                      min={1000}
                      max={500000}
                      step={1000}
                      value={[outputTokens]}
                      onValueChange={(value) => setOutputTokens(value[0])}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>1K</span>
                      <span>250K</span>
                      <span>500K</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <Label htmlFor="epochs">Training Epochs</Label>
                      <div className="flex items-center">
                        <Input
                          type="number"
                          value={epochs}
                          onChange={(e) => setEpochs(Number.parseInt(e.target.value) || 1)}
                          className="w-24 mr-2"
                          min={1}
                          max={20}
                        />
                        <span className="text-sm text-muted-foreground">epochs</span>
                      </div>
                    </div>
                    <Slider
                      id="epochs"
                      min={1}
                      max={20}
                      step={1}
                      value={[epochs]}
                      onValueChange={(value) => setEpochs(value[0])}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>1</span>
                      <span>10</span>
                      <span>20</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex flex-col space-y-1">
                      <Label htmlFor="cached-input" className="flex items-center">
                        Use Cached Input
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" className="h-6 w-6 p-0 ml-1">
                                <Info className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">
                                Cached inputs cost less but are only available for repeated requests.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </Label>
                      <span className="text-xs text-muted-foreground">75% discount on input tokens</span>
                    </div>
                    <Switch id="cached-input" checked={useCachedInput} onCheckedChange={setUseCachedInput} />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex flex-col space-y-1">
                      <Label htmlFor="batch-api" className="flex items-center">
                        Use Batch API
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" className="h-6 w-6 p-0 ml-1">
                                <Info className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">
                                Batch API offers 50% discount on inputs and outputs for asynchronous processing.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </Label>
                      <span className="text-xs text-muted-foreground">50% discount on inference costs</span>
                    </div>
                    <Switch id="batch-api" checked={batchApi} onCheckedChange={setBatchApi} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="h-fit">
              <CardHeader className="pb-3">
                <CardTitle>Cost Estimate</CardTitle>
                <CardDescription>Based on current parameters</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold">{formatCurrency(totalCost)}</div>
                  <div className="text-sm text-muted-foreground mt-1">Total Estimated Cost</div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Training Cost</span>
                      <span className="font-medium">{formatCurrency(trainingCost)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {inputTokens.toLocaleString()} tokens × {epochs} epochs
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Inference Input Cost</span>
                      <span className="font-medium">{formatCurrency(inferenceInputCost)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {inputTokens.toLocaleString()} tokens {useCachedInput ? "(cached)" : ""}
                      {batchApi ? " with Batch API" : ""}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Inference Output Cost</span>
                      <span className="font-medium">{formatCurrency(inferenceOutputCost)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {outputTokens.toLocaleString()} tokens
                      {batchApi ? " with Batch API" : ""}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <div className="text-xs text-muted-foreground">
                  Prices based on OpenAI's published rates as of April 2025. Actual costs may vary.
                </div>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="token-analyzer">
          <TokenAnalyzer onSendToCalculator={handleTokensFromAnalyzer} />
        </TabsContent>

        <TabsContent value="about">
          <Card>
            <CardHeader>
              <CardTitle>About Fine-Tuning</CardTitle>
              <CardDescription>Understanding OpenAI's fine-tuning process</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">What is Fine-Tuning?</h3>
                <p>Fine-tuning lets you get more out of OpenAI models by providing:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Higher quality results than prompting</li>
                  <li>Ability to train on more examples than can fit in a prompt</li>
                  <li>Token savings due to shorter prompts</li>
                  <li>Lower latency requests</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">When to Use Fine-Tuning</h3>
                <p>Fine-tuning is most effective for:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Setting the style, tone, format, or other qualitative aspects</li>
                  <li>Improving reliability at producing a desired output</li>
                  <li>Correcting failures to follow complex prompts</li>
                  <li>Handling many edge cases in specific ways</li>
                  <li>Performing a new skill or task that's hard to articulate in a prompt</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Data Requirements</h3>
                <p>For effective fine-tuning:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Minimum of 10 examples required (50-100 recommended)</li>
                  <li>Data must be in JSONL format with specific structure</li>
                  <li>Examples should be representative of your use case</li>
                  <li>Quality of examples is more important than quantity</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Cost Considerations</h3>
                <p>Fine-tuning costs include:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>One-time training cost based on tokens and epochs</li>
                  <li>Ongoing usage costs for the fine-tuned model (higher than base models)</li>
                  <li>Additional costs for cached inputs and outputs</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={() => setActiveTab("calculator")} className="w-full">
                Return to Calculator
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
