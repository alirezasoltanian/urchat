import GoogleAuthButton from "@/components/google-auth-button";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

async function page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (session) {
    redirect("/settings/account");
  } else if (!session) {
    return (
      <div className="relative">
        {/* <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "flex absolute left-4 top-4 items-center gap-2 text-foreground"
          )}
        >
          <ArrowLeft className="size-4" />
          Back to Chat
        </Link> */}
        <GoogleAuthButton />
      </div>
    );
  }
}

export default page;
