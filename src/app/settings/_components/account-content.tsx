"use client";
import { toast } from "@/components/toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DeleteDialog from "@/components/ui/deleteDialog";
import { trpc } from "@/utils/trpc";
import { useMutation } from "@tanstack/react-query";
import { Zap, Users, HeadphonesIcon } from "lucide-react";
import { redirect, useRouter } from "next/navigation";
import { useState } from "react";

export function AccountContent() {
  const [open, setOpen] = useState(false);
  async function deleteImageFunction() {
    try {
      // Add your delete account logic here
      return { data: "Account deleted successfully", error: null };
    } catch (error) {
      return { error: "Failed to delete account", data: null };
    }
  }
  const router = useRouter();
  const deleteUserMutation = useMutation({
    ...trpc.user.delete.mutationOptions(),
    onSuccess: () => {
      setOpen(false);
      toast({ type: "success", description: "delete Successfully" });
      router.refresh();
    },
    onError: () => {
      toast({ type: "error", description: "Something wrong" });
    },
  });
  function handleDeleteUser() {
    deleteUserMutation.mutate();
  }
  return (
    <div className="flex-1 md:p-6 py-6 pt-1">
      <div className="max-w-4xl space-y-8">
        {/* Upgrade Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Upgrade to Pro</h1>
            <div className="text-right">
              <div className="text-2xl font-bold">$8</div>
              <div className="text-sm text-muted-foreground">/month</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mb-6">
            <Card className="md:w-64 md:h-44 h-40 w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Zap className="size-5 text-primary" />
                  Access to All Models
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Get access to our full suite of models including Claude,
                  o3-mini-high, and more!
                </p>
              </CardContent>
            </Card>

            <Card className="md:w-64 md:h-44 h-40 w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="size-5 text-primary" />
                  Generous Limits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Receive <strong>1500 standard credits</strong> per month, plus{" "}
                  <strong>100 premium credits</strong>* per month.
                </p>
              </CardContent>
            </Card>

            <Card className="md:w-64 md:h-44 h-40 w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <HeadphonesIcon className="size-5 text-primary" />
                  Priority Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Get faster responses and dedicated assistance from the T3 team
                  whenever you need help!
                </p>
              </CardContent>
            </Card>
          </div>

          <Button className="w-full  mb-4">Upgrade Now</Button>

          <p className="text-xs text-muted-foreground">
            * Premium credits are used for GPT Image Gen, Claude Sonnet, and
            Grok 3. Additional Premium credits can be purchased separately.
          </p>
        </div>

        {/* Danger Zone */}
        <div>
          <h2 className="text-xl font-bold mb-4">Danger Zone</h2>
          <Card className="border-red-200 dark:border-red-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and all associated data.
                  </p>
                </div>
                <DeleteDialog
                  isPending={deleteUserMutation.isPending}
                  open={open}
                  onOpenChange={setOpen}
                  deleteAction={handleDeleteUser}
                  renderButton={() => (
                    <Button
                      disabled={deleteUserMutation.isPending}
                      variant="destructive"
                    >
                      Delete Account
                    </Button>
                  )}
                  deleteDescription={
                    "Are you sure you want to delete your account? This action cannot be undone. All your data, including chat history, settings, and personal information will be permanently deleted."
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
