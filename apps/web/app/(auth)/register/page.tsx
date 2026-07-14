"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { ApiError } from "@aria/api-client";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async () => {
    setError("");
    if (!form.name || !form.email || !form.password) {
      setError("All fields are required");
      return;
    }
    setLoading(true);
    try {
      await register(form.email, form.password, form.name);
      router.push("/chat");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 flex flex-col gap-4">
      <h2 className="font-display text-lg text-text-primary">Create account</h2>

      <Input label="Name" placeholder="Your name" value={form.name} onChange={set("name")} />
      <Input label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} autoComplete="email" />
      <Input
        label="Password"
        type="password"
        placeholder="Choose a password"
        value={form.password}
        onChange={set("password")}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        autoComplete="new-password"
        error={error}
      />

      <Button onClick={submit} loading={loading} className="w-full">
        Create account
      </Button>

      <p className="text-sm text-text-muted text-center">
        Already have an account?{" "}
        <Link href="/login" className="text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </Card>
  );
}
