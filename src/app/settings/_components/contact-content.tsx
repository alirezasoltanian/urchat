"use client";

import type React from "react";

import {
  Lightbulb,
  Bug,
  AlertCircle,
  MessageSquare,
  Shield,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface HelpOption {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: () => void;
}

const helpOptions: HelpOption[] = [
  {
    id: "feature-idea",
    icon: <Lightbulb className="w-6 h-6" />,
    title: "Have a cool feature idea?",
    description: "Vote on upcoming features or suggest your own",
    action: () => console.log("Navigate to feature requests"),
  },
  {
    id: "bug-report",
    icon: <Bug className="w-6 h-6" />,
    title: "Found a non-critical bug?",
    description: "UI glitches or formatting issues? Report them here :)",
    action: () => console.log("Navigate to bug report"),
  },
  {
    id: "account-billing",
    icon: <AlertCircle className="w-6 h-6" />,
    title: "Having account or billing issues?",
    description: "Email us for priority support - support@ping.gg",
    action: () => window.open("mailto:support@ping.gg", "_blank"),
  },
  {
    id: "community",
    icon: <MessageSquare className="w-6 h-6" />,
    title: "Want to join the community?",
    description:
      "Come hang out in our Discord! Chat with the team and other users",
    action: () => console.log("Navigate to Discord"),
  },
  {
    id: "privacy",
    icon: <Shield className="w-6 h-6" />,
    title: "Privacy Policy",
    description: "Read our privacy policy and data handling practices",
    action: () => console.log("Navigate to privacy policy"),
  },
];

export default function ContactContent() {
  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold mb-8">We're here to help!</h1>

        <div className="space-y-4">
          {helpOptions.map((option) => (
            <Card
              key={option.id}
              className="bg-card border-border hover:bg-accent/50 transition-colors cursor-pointer"
              onClick={option.action}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="text-primary flex-shrink-0 mt-1">
                    {option.icon}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-card-foreground">
                      {option.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
