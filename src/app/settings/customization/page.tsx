"use client";
import React from "react";
import ChatCustomization from "../_components/customization-content";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { CustomizationContentSkeleton } from "../_components/customization-content-skeleton";

function page() {
  const { data: customizeChatData, isPending } = useQuery(
    trpc.user.userCustomizeChat.queryOptions()
  );
  if (isPending) {
    return <CustomizationContentSkeleton />;
  }
  return <ChatCustomization customizeChatData={customizeChatData} />;
}

export default page;
