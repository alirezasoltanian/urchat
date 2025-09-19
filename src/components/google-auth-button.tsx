"use client";
import React, { useState } from "react";

import { Button } from "./ui/button";
import { authClient } from "@/lib/auth-client";
import Image from "next/image";
import { ChartColumnBig, LineChart, User, FileText } from "lucide-react";
import { motion } from "motion/react";

function GoogleAuthButton() {
  const [isLoading, setIsLoading] = useState(false);
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8 text-center">
        {/* Welcome Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">
            <p>دستیار هوشمند مدیریت فروشگاه</p>
            <span className="text-primary">دیجی اینسایت</span>
          </h1>
        </div>

        {/* Sign In Button */}
        <div className="space-y-6 relative py-20">
          {/* Scattered decorative icons */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.9, rotate: -20 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotate: -12 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none absolute -top-12 -left-4 text-muted-foreground/60"
          >
            <ChartColumnBig className="size-16" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.9, rotate: 18 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotate: 10 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none absolute -top-60 left-1/2 -translate-x-1/2 text-muted-foreground/60"
          >
            <LineChart className="size-16" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.92, rotate: -8 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotate: -4 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none absolute -top-2 -right-6 text-muted-foreground/60"
          >
            <FileText className="size-16" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 26, scale: 0.9, rotate: 14 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotate: 6 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none absolute top-32 right-1/2 translate-x-10 translate-y-8 text-muted-foreground/60"
          >
            <User className="size-16" />
          </motion.div>

          <Button
            onClick={async () => {
              setIsLoading(true);
              await authClient.signIn.social({
                provider: "google",
              });
              setIsLoading(false);
            }}
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg font-medium"
            size="lg"
          >
            <div className="flex items-center justify-center gap-3">
              ورود با گوگل
              <Image
                alt="google"
                width={32}
                height={32}
                src="/images/logos/google.svg"
              />
            </div>
          </Button>
        </div>

        {/* Legal Text */}
        {/* <div className="text-sm text-muted-foreground">
          By continuing, you agree to our{" "}
          <button className="text-foreground hover:text-primary underline underline-offset-4 transition-colors">
            Terms of Service
          </button>{" "}
          and{" "}
          <button className="text-foreground hover:text-primary underline underline-offset-4 transition-colors">
            Privacy Policy
          </button>
        </div> */}
      </div>
    </div>
  );
}

export default GoogleAuthButton;
