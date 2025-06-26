import { redirect } from "next/navigation";

async function page() {
  redirect("/settings/account");
  return <div>page</div>;
}

export default page;
