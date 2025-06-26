import React from "react";
import { ByokSection } from "../_components/byok-section";
import { ModelProvider } from "@/lib/model-store/provider";

function page() {
  return (
    <div className="py-8 px-6">
      <ModelProvider>
        <ByokSection />
      </ModelProvider>
    </div>
  );
}

export default page;
