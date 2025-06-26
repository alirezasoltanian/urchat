"use client";

import type React from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import ThemePresetSelect from "@/components/editor/theme-preset-select";
import { toast } from "@/components/toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { customizeChat, type CustomizeChat } from "@/lib/validations/user";
import { trpc } from "@/utils/trpc";
import { useMutation } from "@tanstack/react-query";

const defaultTraits = [
  "friendly",
  "witty",
  "concise",
  "curious",
  "empathetic",
  "creative",
  "patient",
];

export default function ChatCustomization({
  customizeChatData,
}: {
  customizeChatData: CustomizeChat;
}) {
  const [currentTrait, setCurrentTrait] = useState("");
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);

  const form = useForm<CustomizeChat>({
    resolver: zodResolver(customizeChat),
    defaultValues: {
      name: customizeChatData?.name ?? "",
      occupation: customizeChatData?.occupation ?? "",
      traits: customizeChatData?.traits ?? [],
      additionalInfo: customizeChatData?.additionalInfo ?? "",
    },
  });

  const watchedName = form.watch("name");
  const watchedOccupation = form.watch("occupation");
  const watchedAdditionalInfo = form.watch("additionalInfo");

  const addTrait = (trait: string) => {
    if (
      trait.trim() &&
      !selectedTraits.includes(trait.trim()) &&
      selectedTraits.length < 50
    ) {
      const newTraits = [...selectedTraits, trait.trim()];
      setSelectedTraits(newTraits);
      form.setValue("traits", newTraits);
      setCurrentTrait("");
    }
  };

  const removeTrait = (traitToRemove: string) => {
    const newTraits = selectedTraits.filter((trait) => trait !== traitToRemove);
    setSelectedTraits(newTraits);
    form.setValue("traits", newTraits);
  };

  const handleTraitKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      addTrait(currentTrait);
    }
  };
  const customizeChatUserMutation = useMutation({
    ...trpc.user.update.mutationOptions(),
    onSuccess: () => {
      toast({ type: "success", description: "update successfully" });
    },
    onError: () => {
      toast({ type: "error", description: "Something wrong" });
    },
  });

  const onSubmit = (data: CustomizeChat) => {
    form.reset({ ...data, traits: selectedTraits });

    customizeChatUserMutation.mutate({
      customizeChat: { ...data, traits: selectedTraits },
    });
  };

  const loadLegacyData = () => {
    form.reset({ name: "", occupation: "", additionalInfo: "", traits: [] });

    customizeChatUserMutation.mutate({
      customizeChat: {},
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground md:p-6 py-6">
      <div className=" mx-auto ">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Customize Urchat</h1>
          <ThemePresetSelect />
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-lg font-medium">
                    What should Urchat call you?
                  </FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        placeholder="Enter your name"
                        className="bg-input border-border text-foreground placeholder:text-muted-foreground pr-16"
                        maxLength={50}
                        {...field}
                      />
                    </FormControl>
                    <div
                      className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm ${
                        (watchedName?.length || 0) >= 50
                          ? "text-destructive"
                          : "text-muted-foreground"
                      }`}
                    >
                      {watchedName?.length || 0}/50
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="occupation"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-lg font-medium">
                    What do you do?
                  </FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        placeholder="Engineer, student, etc."
                        className="bg-input border-border text-foreground placeholder:text-muted-foreground pr-16"
                        maxLength={100}
                        {...field}
                      />
                    </FormControl>
                    <div
                      className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm ${
                        (watchedOccupation?.length || 0) >= 100
                          ? "text-destructive"
                          : "text-muted-foreground"
                      }`}
                    >
                      {watchedOccupation?.length || 0}/100
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-3">
              <label className="text-lg font-medium block">
                What traits should Urchat have?{" "}
                <span className="text-sm font-normal text-gray-400">
                  (up to 50, max 100 chars each)
                </span>
                <span
                  className={`ml-2 text-sm ${
                    selectedTraits.length >= 50
                      ? "text-destructive"
                      : "text-muted-foreground"
                  }`}
                >
                  ({selectedTraits.length}/50)
                </span>
              </label>

              <div className="relative">
                <Input
                  placeholder="Type a trait and press Enter or Tab..."
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground pr-16"
                  value={currentTrait}
                  onChange={(e) => setCurrentTrait(e.target.value)}
                  onKeyDown={handleTraitKeyDown}
                  maxLength={100}
                />
                <div
                  className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm ${
                    selectedTraits.length >= 100
                      ? "text-destructive"
                      : "text-muted-foreground"
                  }`}
                >
                  {selectedTraits.length}/100
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {defaultTraits
                  .filter((trait) => !selectedTraits.includes(trait)) // only show unselected traits
                  .map((trait) => (
                    <Badge
                      key={trait}
                      variant="secondary"
                      className="bg-secondary text-secondary-foreground hover:bg-secondary/80 cursor-pointer"
                      onClick={() => addTrait(trait)}
                    >
                      {trait}
                      <Plus className="w-3 h-3 ml-1" />
                    </Badge>
                  ))}
              </div>
              {selectedTraits.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedTraits.map((trait) => (
                    <Badge
                      key={trait}
                      variant="default"
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {trait}
                      <button
                        type="button"
                        onClick={() => removeTrait(trait)}
                        className="ml-1 hover:bg-primary/80 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <FormField
              control={form.control}
              name="additionalInfo"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-lg font-medium">
                    Anything else Urchat should know about you?
                  </FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Textarea
                        placeholder="Interests, values, or preferences to keep in mind"
                        className="bg-input border-border text-foreground placeholder:text-muted-foreground min-h-32 resize-none pr-20"
                        maxLength={3000}
                        {...field}
                      />
                    </FormControl>
                    <div
                      className={`absolute right-3 bottom-3 text-sm ${
                        (watchedAdditionalInfo?.length || 0) >= 3000
                          ? "text-destructive"
                          : "text-muted-foreground"
                      }`}
                    >
                      {watchedAdditionalInfo?.length || 0}/3000
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-between ">
              <Button
                type="button"
                variant="outline"
                disabled={customizeChatUserMutation.isPending}
                onClick={loadLegacyData}
                className="bg-secondary border-border text-secondary-foreground hover:bg-secondary/80"
              >
                Load Legacy Data
              </Button>
              <Button
                type="submit"
                disabled={customizeChatUserMutation.isPending}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Save Preferences
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
