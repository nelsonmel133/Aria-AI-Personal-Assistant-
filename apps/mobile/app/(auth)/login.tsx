import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { ApiError } from "@aria/api-client";

export default function LoginScreen() {
  const { login } = useAuth();
  const { colors } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const s = styles(colors);

  const submit = async () => {
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={s.inner}
      >
        {/* Brand */}
        <View style={s.brand}>
          <View style={s.logo}>
            <Text style={s.logoText}>A</Text>
          </View>
          <Text style={s.title}>Aria</Text>
          <Text style={s.subtitle}>Your calm, capable assistant</Text>
        </View>

        {/* Form */}
        <View style={s.form}>
          <TextInput
            style={s.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor={colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <TextInput
            style={s.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            autoComplete="current-password"
            returnKeyType="done"
            onSubmitEditing={submit}
          />
          {error ? <Text style={s.error}>{error}</Text> : null}

          <TouchableOpacity
            onPress={submit}
            disabled={loading}
            style={[s.btn, loading && { opacity: 0.6 }]}
          >
            <Text style={s.btnText}>{loading ? "Signing in…" : "Sign in"}</Text>
          </TouchableOpacity>

          <Link href="/(auth)/register" asChild>
            <TouchableOpacity style={s.linkBtn}>
              <Text style={s.linkText}>No account? Create one</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = (c: ReturnType<typeof import("@/lib/theme").useTheme>["colors"]) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    inner: { flex: 1, justifyContent: "center", padding: 24 },
    brand: { alignItems: "center", marginBottom: 48 },
    logo: { width: 56, height: 56, borderRadius: 16, backgroundColor: c.accent, alignItems: "center", justifyContent: "center", marginBottom: 12 },
    logoText: { color: c.bg, fontSize: 24, fontFamily: "Fraunces-Regular" },
    title: { fontSize: 28, fontFamily: "Fraunces-Regular", color: c.textPrimary },
    subtitle: { fontSize: 14, color: c.textMuted, marginTop: 4 },
    form: { gap: 12 },
    input: { backgroundColor: c.surfaceRaised, borderRadius: 12, padding: 14, fontSize: 15, color: c.textPrimary, borderWidth: 1, borderColor: c.border },
    error: { color: c.danger, fontSize: 13 },
    btn: { backgroundColor: c.accent, borderRadius: 12, padding: 15, alignItems: "center", marginTop: 4 },
    btnText: { color: c.bg, fontWeight: "700", fontSize: 16 },
    linkBtn: { alignItems: "center", paddingVertical: 8 },
    linkText: { color: c.textMuted, fontSize: 14 },
  });
