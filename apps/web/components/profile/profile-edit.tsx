"use client";

import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Loader2, Save, User } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

const profileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters"),
  email: z.string().email("Invalid email address"),
  image: z.string(),
});

interface ProfileEditProps {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
}

export function ProfileEdit({ user }: ProfileEditProps) {
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      name: user.name,
      email: user.email,
      image: user.image || "",
    },
    validators: {
      onSubmit: profileSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await authClient.updateUser({
          name: value.name,
          image: value.image || null,
        });

        toast.success("Profile updated successfully");
        router.refresh();
      } catch (error) {
        console.error("Profile update error:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to update profile",
        );
      }
    },
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-amber-500" />
          <div>
            <CardTitle>Edit Profile</CardTitle>
            <CardDescription>
              Update your personal information and profile picture
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field name="name">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor="profile-edit-name">
                      Full Name
                    </FieldLabel>
                    <Input
                      id="profile-edit-name"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Enter your full name"
                      disabled={form.state.isSubmitting}
                    />
                    <FieldDescription>
                      This is your public display name
                    </FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="email">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor="profile-edit-email">
                      Email Address
                    </FieldLabel>
                    <Input
                      id="profile-edit-email"
                      type="email"
                      name={field.name}
                      value={field.state.value}
                      aria-invalid={isInvalid}
                      placeholder="your.email@example.com"
                      disabled={true}
                    />
                    <FieldDescription>
                      Email cannot be changed. Contact support if you need to
                      update it.
                    </FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="image">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor="profile-edit-image">
                      Profile Picture URL
                    </FieldLabel>
                    <Input
                      id="profile-edit-image"
                      type="url"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="https://example.com/avatar.jpg"
                      disabled={form.state.isSubmitting}
                    />
                    <FieldDescription>
                      Enter a URL to your profile picture
                    </FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>
          </FieldGroup>

          <div className="flex gap-3 pt-6">
            <Button type="submit" disabled={form.state.isSubmitting}>
              {form.state.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={form.state.isSubmitting}
            >
              Reset
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
