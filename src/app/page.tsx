import { redirect } from "next/navigation";

/** The console has no marketing surface; the dashboard is the entry point. */
export default function Home() {
  redirect("/dashboard");
}
