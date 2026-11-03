import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function RootPage() {
  const session = await auth();
  const user = session?.user as any;

  if (!user) redirect("/login");
  if (user.userType === "interno") redirect("/administrativo");
  redirect("/dashboard");
}
