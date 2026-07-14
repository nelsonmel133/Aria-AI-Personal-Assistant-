import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { ApiError } from "@aria/api-client";

export default function RegisterScreen() {
  const { register } = useAuth();
  const { colors } = useTheme();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const s = styles(colors);

  const set = (k: string) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    setError("");
    if (!form.name || !form.email || !form.password) {
      setError("All fields are required");
      return;
    }
    setLoading(true);
    try {
      await register(form.email, form.password, form.name);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.inner}>
          <View style={s.brand}>
            <View style={s.logo}>
              <Text style={s.logoText}>A</Text>
            </View>
            <Text style={s.title}>Create account</Text>
          </View>

          <View style={s.form}>
            <TextInput style={s.input} value={form.name} onChangeText={set("name")} placeholder="Name" placeholderTextColor={colors.textMuted} autoCapitalize="words" />
            <TextInput style={s.input} value={form.email} onChangeText={set("email")} placeholder="Email" placeholderTextColor={colors.textMuted} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
            <TextInput style={s.input} value={form.password} onChangeText={set("password")} placeholder="Password" placeholderTextColor={colors.textMuted} secureTextEntry returnKeyType="done" onSubmitEditing={submit} />
            {error ? <Text style={s.error}>{error}</Text> : null}

            <TouchableOpacity onPress={submit} disabled={loading} style={[s.btn, loading && { opacity: 0.6 }]}>
              <Text style={s.btnText}>{loading ? "Creating…" : "Create account"}</Text>
            </TouchableOpacity>

            <Link href="/(auth)/login" asChild>
              <TouchableOpacity style={s.linkBtn}>
                <Text style={s.linkText}>Already have an account? Sign in</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = (c: ReturnType<typeof import("@/lib/theme").useTheme>["colors"]) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    inner: { flexGrow: 1, justifyContent: "center", padding: 24 },
    brand: { alignItems: "center", marginBottom: 40 },
    logo: { width: 56, height: 56, borderRadius: 16, backgroundColor: c.accent, alignItems: "center", justifyContent: "center", marginBottom: 12 },
    logoText: { color: c.bg, fontSize: 24, fontFamily: "Fraunces-Regular" },
    title: { fontSize: 24, fontFamily: "Fraunces-Regular", color: c.textPrimary },
    form: { gap: 12 },
    input: { backgroundColor: c.surfaceRaised, borderRadius: 12, padding: 14, fontSize: 15, color: c.textPrimary, borderWidth: 1, borderColor: c.border },
    error: { color: c.danger, fontSize: 13 },
    btn: { backgroundColor: c.accent, borderRadius: 12, padding: 15, alignItems: "center", marginTop: 4 },
    btnText: { color: c.bg, fontWeight: "700", fontSize: 16 },
    linkBtn: { alignItems: "center", paddingVertical: 8 },
    linkText: { color: c.textMuted, fontSize: 14 },
  });
