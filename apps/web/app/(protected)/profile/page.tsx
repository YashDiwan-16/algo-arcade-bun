import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ProfileView } from "@/components/profile/profile-view";

export const metadata = {
  title: "Profile | Game Aggregator",
  description: "Manage your profile and account settings",
};

export default async function ProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <ProfileView
      user={{
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        role: session.user.role ?? undefined,
        emailVerified: session.user.emailVerified,
        createdAt: session.user.createdAt,
        banned: session.user.banned ?? undefined,
      }}
    />
  );
}
