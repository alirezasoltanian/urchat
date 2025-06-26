"use client";
import React from "react";

import { Button } from "./ui/button";
import { authClient } from "@/lib/auth-client";
import Image from "next/image";

function GoogleAuthButton() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8 text-center">
        {/* Welcome Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">
            Welcome to <span className="text-primary">Urchat</span>
          </h1>
        </div>

        {/* Sign In Button */}
        <div className="space-y-6">
          <Button
            onClick={async () => {
              await authClient.signIn.social({
                provider: "google",
              });
            }}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg font-medium"
            size="lg"
          >
            <div className="flex items-center justify-center gap-3">
              <Image
                alt="google"
                width={32}
                height={32}
                src="/images/logos/google.svg"
              />
              Continue with Google
            </div>
          </Button>
        </div>

        {/* Legal Text */}
        <div className="text-sm text-muted-foreground">
          By continuing, you agree to our{" "}
          <button className="text-foreground hover:text-primary underline underline-offset-4 transition-colors">
            Terms of Service
          </button>{" "}
          and{" "}
          <button className="text-foreground hover:text-primary underline underline-offset-4 transition-colors">
            Privacy Policy
          </button>
        </div>
      </div>
    </div>
  );
}

export default GoogleAuthButton;
