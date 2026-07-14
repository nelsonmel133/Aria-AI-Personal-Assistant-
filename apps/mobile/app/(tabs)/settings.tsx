import { useState, useEffect } from "react";
import {
  View, Text, TouchableOpacity, Switch,
  ScrollView, StyleSheet, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { useTheme, type ThemeName } from "@/lib/theme";
import tokens from "@aria/tokens";
import { initials } from "@aria/ui";

const THEMES: { id: ThemeName; label: string }[] = [
  { id: "dusk", label: "Dusk" },
  { id: "dawn", label: "Dawn" },
  { id: "mono", label: "Mono" },
  { id: "reef", label: "Reef" },
];

export default function SettingsScreen() {
  const { client, user, logout } = useAuth();
  const { colors, theme, setTheme } = useTheme();
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const s = styles(colors);

  const { data: prefs } = useQuery({
    queryKey: ["preferences"],
    queryFn: () => client.preferences.get(),
  });

  useEffect(() => {
    if (prefs) setVoiceEnabled(prefs.voice_enabled ?? true);
  }, [prefs]);

  const saveMut = useMutation({
    mutationFn: () =>
      client.preferences.update({ theme: theme as any, voice_enabled: voiceEnabled }),
  });

  return (
    <SafeAreaView style={s.container}>
      <ScrollView>
        <View style={s.header}>
          <Text style={s.headerTitle}>Settings</Text>
        </View>

        {/* Account */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>ACCOUNT</Text>
          <View style={s.card}>
            <View style={s.avatarRow}>
              <View style={s.avatar}>
                <Text style={s.avatarText}>{user ? initials(user.display_name) : "?"}</Text>
              </View>
              <View>
                <Text style={s.userName}>{user?.display_name}</Text>
                <Text style={s.userEmail}>{user?.email}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Theme */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>APPEARANCE</Text>
          <View style={s.themeGrid}>
            {THEMES.map((t) => {
              const tc = tokens.themes[t.id];
              const active = theme === t.id;
              return (
                <TouchableOpacity
                  key={t.id}
                  onPress={() => setTheme(t.id)}
                  style={[s.themeCard, { backgroundColor: tc.bg, borderColor: active ? colors.accent : tc.border }]}
                >
                  <View style={{ gap: 4, marginBottom: 8 }}>
                    <View style={{ height: 4, borderRadius: 2, backgroundColor: tc.surface }} />
                    <View style={{ height: 4, borderRadius: 2, backgroundColor: tc.accent, width: "70%" }} />
                    <View style={{ height: 4, borderRadius: 2, backgroundColor: tc.surface, width: "50%" }} />
                  </View>
                  <Text style={{ color: tc.textPrimary, fontSize: 12, fontWeight: "600" }}>{t.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Voice */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>VOICE</Text>
          <View style={[s.card, s.row]}>
            <View>
              <Text style={s.rowLabel}>Voice input & output</Text>
              <Text style={s.rowSub}>Mic and speech synthesis</Text>
            </View>
            <Switch
              value={voiceEnabled}
              onValueChange={setVoiceEnabled}
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor={colors.bg}
            />
          </View>
        </View>

        {/* Actions */}
        <View style={s.section}>
          <TouchableOpacity
            onPress={() => saveMut.mutate()}
            style={s.saveBtn}
          >
            <Text style={s.saveBtnText}>
              {saveMut.isPending ? "Saving…" : "Save changes"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              Alert.alert("Sign out", "Are you sure?", [
                { text: "Cancel", style: "cancel" },
                { text: "Sign out", style: "destructive", onPress: logout },
              ])
            }
            style={s.logoutBtn}
          >
            <Text style={s.logoutText}>Sign out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = (c: ReturnType<typeof import("@/lib/theme").useTheme>["colors"]) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    header: { paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: c.border },
    headerTitle: { fontSize: 20, fontFamily: "Fraunces-Regular", color: c.textPrimary },
    section: { padding: 16, gap: 8 },
    sectionLabel: { fontSize: 10, fontFamily: "IBMPlexMono-Regular", color: c.textMuted, letterSpacing: 1.5, marginBottom: 4 },
    card: { backgroundColor: c.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: c.border },
    row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    rowLabel: { fontSize: 14, color: c.textPrimary },
    rowSub: { fontSize: 12, color: c.textMuted, marginTop: 2 },
    avatarRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: c.surfaceRaised, alignItems: "center", justifyContent: "center" },
    avatarText: { color: c.accent, fontWeight: "700", fontSize: 15 },
    userName: { fontSize: 15, fontWeight: "600", color: c.textPrimary },
    userEmail: { fontSize: 13, color: c.textMuted, marginTop: 2 },
    themeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    themeCard: { width: "47%", borderRadius: 12, padding: 12, borderWidth: 2 },
    saveBtn: { backgroundColor: c.accent, borderRadius: 12, padding: 14, alignItems: "center" },
    saveBtnText: { color: c.bg, fontWeight: "600", fontSize: 15 },
    logoutBtn: { padding: 14, alignItems: "center" },
    logoutText: { color: c.danger, fontSize: 15 },
  });
