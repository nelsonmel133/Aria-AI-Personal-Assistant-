import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { formatRelative } from "@aria/ui";
import type { Task } from "@aria/api-client";

const PRIORITY_BAR: Record<Task["priority"], string> = {
  urgent: "#E07A6B",
  high: "#E8C77A",
  normal: "#7AA7E8",
  low: "#2A2E39",
};

export default function TasksScreen() {
  const { client } = useAuth();
  const { colors } = useTheme();
  const qc = useQueryClient();
  const [newTitle, setNewTitle] = useState("");
  const s = styles(colors);

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks", "open"],
    queryFn: () => client.tasks.list("open"),
  });

  const createMut = useMutation({
    mutationFn: (title: string) => client.tasks.create({ title }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      setNewTitle("");
    },
  });

  const doneMut = useMutation({
    mutationFn: (id: string) => client.tasks.update(id, { status: "done" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Tasks</Text>
        <Text style={s.headerSub}>{tasks.length} open</Text>
      </View>

      <View style={s.newRow}>
        <TextInput
          style={s.newInput}
          value={newTitle}
          onChangeText={setNewTitle}
          placeholder="Add a task…"
          placeholderTextColor={colors.textMuted}
          returnKeyType="done"
          onSubmitEditing={() => newTitle.trim() && createMut.mutate(newTitle.trim())}
        />
        <TouchableOpacity
          onPress={() => newTitle.trim() && createMut.mutate(newTitle.trim())}
          style={s.addBtn}
        >
          <Text style={s.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(t) => t.id}
        contentContainerStyle={{ padding: 16, gap: 8 }}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", color: colors.textMuted, marginTop: 60, fontSize: 14 }}>
            No open tasks
          </Text>
        }
        renderItem={({ item }) => (
          <View style={s.taskRow}>
            <View style={[s.priorityBar, { backgroundColor: PRIORITY_BAR[item.priority] }]} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={s.taskTitle}>{item.title}</Text>
              {item.due_at && (
                <Text style={s.taskDue}>due {formatRelative(item.due_at)}</Text>
              )}
            </View>
            <TouchableOpacity
              onPress={async () => {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                doneMut.mutate(item.id);
              }}
              style={s.doneBtn}
            >
              <Text style={s.doneBtnText}>✓</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = (c: ReturnType<typeof import("@/lib/theme").useTheme>["colors"]) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    header: { paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: c.border },
    headerTitle: { fontSize: 20, fontFamily: "Fraunces-Regular", color: c.textPrimary },
    headerSub: { fontSize: 11, fontFamily: "IBMPlexMono-Regular", color: c.textMuted, marginTop: 2 },
    newRow: { flexDirection: "row", gap: 8, padding: 16, borderBottomWidth: 1, borderBottomColor: c.border },
    newInput: { flex: 1, height: 40, backgroundColor: c.surfaceRaised, borderRadius: 10, paddingHorizontal: 12, fontSize: 14, color: c.textPrimary },
    addBtn: { width: 40, height: 40, borderRadius: 10, backgroundColor: c.accent, alignItems: "center", justifyContent: "center" },
    addBtnText: { color: c.bg, fontSize: 22, lineHeight: 26 },
    taskRow: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: c.surface, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: c.border },
    priorityBar: { width: 3, height: 36, borderRadius: 2 },
    taskTitle: { fontSize: 14, color: c.textPrimary },
    taskDue: { fontSize: 11, fontFamily: "IBMPlexMono-Regular", color: c.textMuted },
    doneBtn: { width: 28, height: 28, borderRadius: 8, borderWidth: 1.5, borderColor: c.border, alignItems: "center", justifyContent: "center" },
    doneBtnText: { color: c.textMuted, fontSize: 13 },
  });
