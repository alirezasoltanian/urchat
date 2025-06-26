"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getCookie, setCookie } from "@/lib/cookies";
import { cn, createModelId } from "@/lib/utils";
import { useChatStore } from "@/store/chat-store";
import {
  Brain,
  ChevronDown,
  Eye,
  FileText,
  Globe,
  ImageIcon,
  Settings,
  Zap,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
const models = [
  {
    id: "gpt-4.1",
    name: "GPT-4.1",
    provider: "OpenAI",
    providerId: "openai",
    enabled: true,
    toolCallType: "native",
    capabilities: ["vision", "image-generation", "search"],
  },
  {
    id: "gpt-4o-mini",
    name: "GPT 4o mini",
    provider: "OpenAI",
    providerId: "openai",
    enabled: true,
    toolCallType: "native",
    capabilities: ["vision", "image-generation", "search"],
  },

  {
    id: "claude-sonnet-4",
    name: "Claude 4 Sonnet",
    provider: "Anthropic",
    providerId: "anthropic",
    enabled: true,
    capabilities: ["vision", "pdfs", "search"],
    toolCallType: "native",
  },
  {
    id: "gemini-2.0-flash-001",
    name: "Google Gemini-2 flash",
    provider: "Google",
    providerId: "google",
    description: "",
    enabled: true,
    toolCallType: "manual",
    toolCallModel: "gemini-2.0-flash",
    capabilities: ["fast", "vision", "search", "pdfs"],
  },

  {
    id: "grok-3-beta",
    name: "Grok 3",
    provider: "xAI",
    providerId: "x-ai",
    enabled: true,
    toolCallType: "native",
  },
];

interface ModelCapability {
  id: string;
  name: string;
  icon: React.ReactNode;
}

const capabilities: ModelCapability[] = [
  { id: "fast", name: "Fast", icon: <Zap className="size-4" /> },
  { id: "vision", name: "Vision", icon: <Eye className="size-4" /> },
  { id: "search", name: "Search", icon: <Globe className="size-4" /> },
  { id: "pdfs", name: "PDFs", icon: <FileText className="size-4" /> },
  { id: "reasoning", name: "Reasoning", icon: <Brain className="size-4" /> },
  {
    id: "effort-control",
    name: "Effort Control",
    icon: <Settings className="size-4" />,
  },
  {
    id: "image-generation",
    name: "Image Generation",
    icon: <ImageIcon className="size-4" />,
  },
];

export default function ModelCombobox() {
  const [open, setOpen] = useState(false);

  const getCapabilityIcon = (capabilityId: string) => {
    const capability = capabilities.find((cap) => cap.id === capabilityId);
    return capability?.icon;
  };

  const { selectedChatModel, setSelectedChatModel } = useChatStore();
  console.log("modelsmodels", models);
  useEffect(() => {
    const savedModel = getCookie("selected-model");
    if (savedModel !== null) {
      setSelectedChatModel(savedModel);
    } else {
      setCookie("selected-model", models[0].providerId + ":" + models[0].id);
    }
  }, []);

  return (
    <div className="  text-foreground ">
      <div className="max-w-md mx-auto space-y-4">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between border-4 border-white/50 backdrop-blur-md"
            >
              <div className=" items-center gap-2 hidden md:flex">
                <span className="text-muted-foreground">
                  {models.find(
                    (item) => item.id === selectedChatModel.trim().split(":")[1]
                  )?.name ?? models[0].name}
                </span>
              </div>
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-full p-0 bg-popover border-border"
            align="start"
          >
            <Command className="bg-popover">
              <CommandInput
                placeholder="Search models..."
                className="border-0"
              />
              <CommandList className="max-h-96">
                <CommandEmpty>No models found.</CommandEmpty>
                <CommandGroup>
                  {/* Upgrade Banner */}
                  {/* <div className="p-3 mb-2">
                    <Card className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-500/50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-white mb-1">
                              Unlock all models + higher limits
                            </h3>
                            <div className="flex items-baseline gap-1">
                              <span className="text-2xl font-bold text-pink-400">
                                $8
                              </span>
                              <span className="text-sm text-muted-foreground">
                                /month
                              </span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                          >
                            Upgrade now
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div> */}

                  {/* Models List */}
                  {models.map((model) => (
                    <CommandItem
                      key={model.id}
                      onSelect={(currentValue) => {
                        if (model.enabled) {
                          const modelData = createModelId(model);
                          setSelectedChatModel(modelData);
                          console.log("modelData", model, modelData);
                          setCookie("selected-model", modelData);

                          setOpen(false);
                        }
                      }}
                      className={cn(
                        "flex items-center justify-between p-3 cursor-pointer hover:bg-primary/10",
                        !model.enabled && "opacity-50 cursor-not-allowed",
                        selectedChatModel ===
                          `${model.providerId}:${model.id}` &&
                          "hover:bg-primary/20! bg-primary!"
                      )}
                      disabled={!model.enabled}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          <Image
                            src={`/images/logos/${model.providerId}.svg`}
                            alt={model.provider}
                            width={18}
                            height={18}
                            className="rounded-full border bg-white"
                          />
                        </div>
                        <div className="flex flex-col">
                          <span
                            className={cn(
                              "font-medium",
                              !model.enabled && "text-muted-foreground"
                            )}
                          >
                            {model.name}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {model?.capabilities &&
                          model?.capabilities.map((capId) => (
                            <div key={capId} className="text-muted-foreground">
                              {getCapabilityIcon(capId)}
                            </div>
                          ))}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
              {/* <div className="border-t border-border p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-between text-muted-foreground"
                  onClick={() => setShowCapabilities(!showCapabilities)}
                >
                  <div className="flex items-center gap-2">
                    <Filter className="size-4" />
                    Show all
                  </div>
                </Button>
              </div> */}
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
