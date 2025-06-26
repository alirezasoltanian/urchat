import React from "react";
import { SettingsHeader } from "./_components/settings-header";
import { UserProfile } from "./_components/user-profile";
import { SettingsNavigation } from "./_components/settings-navigation";

function layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background container overflow-x-hidden">
      <SettingsHeader />
      <div className="md:flex">
        <UserProfile />
        <div className="md:w-[calc(100%-400px)]">
          <SettingsNavigation />
          <div className="overflow-hidden">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default layout;
