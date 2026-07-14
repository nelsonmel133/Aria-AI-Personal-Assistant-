import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet, Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { formatRelative } from "@aria/ui";

export default function NotesScreen() {
  const { client } = useAuth();
  const { colors } = useTheme();
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState({ title: "", body: "" });
  const s = styles(colors);

  const { data: notes = [] } = useQuery({
    queryKey: ["notes"],
    queryFn: () => client.notes.list(),
  });

  const createMut = useMutation({
    mutationFn: () => client.notes.create({ title: draft.title, body: draft.body }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notes"] });
      setDraft({ title: "", body: "" });
      setModalOpen(false);
    },
  });

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Notes</Text>
        <TouchableOpacity onPress={() => setModalOpen(true)} style={s.newBtn}>
          <Text style={s.newBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notes}
        keyExtractor={(n) => n.id}
        numColumns={2}
        contentContainerStyle={{ padding: 12 }}
        columnWrapperStyle={{ gap: 12 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", color: colors.textMuted, marginTop: 60, fontSize: 14 }}>
            No notes yet
          </Text>
        }
        renderItem={({ item }) => (
          <View style={s.noteCard}>
            {item.title && <Text style={s.noteTitle}>{item.title}</Text>}
            <Text style={s.noteBody} numberOfLines={6}>{item.body}</Text>
            <Text style={s.noteDate}>{formatRelative(item.updated_at)}</Text>
          </View>
        )}
      />

      <Modal visible={modalOpen} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={[s.container, { padding: 20 }]}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
            <Text style={s.headerTitle}>New note</Text>
            <TouchableOpacity onPress={() => setModalOpen(false)}>
              <Text style={{ color: colors.textMuted, fontSize: 16 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={[s.modalInput, { marginBottom: 12 }]}
            value={draft.title}
            onChangeText={(t) => setDraft((d) => ({ ...d, title: t }))}
            placeholder="Title (optional)"
            placeholderTextColor={colors.textMuted}
          />
          <TextInput
            style={[s.modalInput, { flex: 1, textAlignVertical: "top" }]}
            value={draft.body}
            onChangeText={(t) => setDraft((d) => ({ ...d, body: t }))}
            placeholder="Start writing…"
            placeholderTextColor={colors.textMuted}
            multiline
            autoFocus
          />
          <TouchableOpacity
            onPress={() => createMut.mutate()}
            disabled={!draft.body.trim() || createMut.isPending}
            style={[s.saveBtn, !draft.body.trim() && { opacity: 0.4 }]}
          >
            <Text style={s.saveBtnText}>Save note</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = (c: ReturnType<typeof import("@/lib/theme").useTheme>["colors"]) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: c.border },
    headerTitle: { fontSize: 20, fontFamily: "Fraunces-Regular", color: c.textPrimary },
    newBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: c.accent, alignItems: "center", justifyContent: "center" },
    newBtnText: { color: c.bg, fontSize: 22, lineHeight: 26 },
    noteCard: { flex: 1, backgroundColor: c.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: c.border, gap: 6 },
    noteTitle: { fontSize: 13, fontWeight: "600", color: c.textPrimary },
    noteBody: { fontSize: 13, color: c.textMuted, lineHeight: 20 },
    noteDate: { fontSize: 10, fontFamily: "IBMPlexMono-Regular", color: c.textMuted, marginTop: 4 },
    modalInput: { backgroundColor: c.surfaceRaised, borderRadius: 12, padding: 14, fontSize: 14, color: c.textPrimary, borderWidth: 1, borderColor: c.border },
    saveBtn: { marginTop: 12, backgroundColor: c.accent, borderRadius: 12, padding: 14, alignItems: "center" },
    saveBtnText: { color: c.bg, fontWeight: "600", fontSize: 15 },
  });
