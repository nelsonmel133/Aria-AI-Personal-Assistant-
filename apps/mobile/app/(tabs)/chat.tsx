import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Speech from "expo-speech";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";

type ChatMsg = { id: string; role: "user" | "assistant"; content: string; streaming?: boolean };

export default function ChatScreen() {
  const { client } = useAuth();
  const { colors } = useTheme();
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const listRef = useRef<FlatList>(null);

  const s = styles(colors);

  const send = async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setInput("");

    const userMsg: ChatMsg = { id: crypto.randomUUID(), role: "user", content: text };
    const assistantMsg: ChatMsg = { id: crypto.randomUUID(), role: "assistant", content: "", streaming: true };
    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setIsStreaming(true);

    let fullText = "";
    let assignedId = conversationId;

    try {
      for await (const chunk of client.conversations.send(text, conversationId)) {
        if (!assignedId) {
          assignedId = chunk.conversation_id;
          setConversationId(chunk.conversation_id);
        }
        fullText += chunk.delta;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id ? { ...m, content: fullText } : m
          )
        );
      }
      // TTS for assistant reply
      Speech.speak(fullText, { rate: 0.95, pitch: 1.0 });
    } finally {
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantMsg.id ? { ...m, streaming: false } : m))
      );
      setIsStreaming(false);
    }
  };

  useEffect(() => {
    if (messages.length > 0)
      listRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const renderItem = ({ item }: { item: ChatMsg }) => {
    const isUser = item.role === "user";
    return (
      <View style={[s.messageRow, isUser && s.messageRowUser]}>
        <Text style={s.roleLabel}>{isUser ? "you" : "aria"}</Text>
        <View style={[s.messageLine, isUser ? s.lineUser : s.lineAria]}>
          <Text style={s.messageText}>{item.content}</Text>
          {item.streaming && <ActivityIndicator size="small" color={colors.accent} style={{ marginLeft: 6 }} />}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={s.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <View style={s.header}>
          <Text style={s.headerTitle}>Chat</Text>
          {isStreaming && <ActivityIndicator size="small" color={colors.accent} />}
        </View>

        <FlatList
          ref={listRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={(m) => m.id}
          contentContainerStyle={s.messageList}
          ListEmptyComponent={
            <Text style={s.emptyText}>Ask Aria anything…</Text>
          }
        />

        <View style={s.inputBar}>
          <TextInput
            style={s.input}
            value={input}
            onChangeText={setInput}
            placeholder="Message…"
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={2000}
            returnKeyType="default"
          />
          <TouchableOpacity
            onPress={send}
            disabled={!input.trim() || isStreaming}
            style={[s.sendBtn, (!input.trim() || isStreaming) && s.sendBtnDisabled]}
          >
            <Text style={s.sendBtnText}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = (c: ReturnType<typeof import("@/lib/theme").useTheme>["colors"]) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    headerTitle: { fontSize: 20, fontFamily: "Fraunces-Regular", color: c.textPrimary },
    messageList: { padding: 20, gap: 20 },
    messageRow: { gap: 4 },
    messageRowUser: { alignItems: "flex-end" },
    roleLabel: { fontSize: 11, fontFamily: "IBMPlexMono-Regular", color: c.textMuted },
    messageLine: { borderLeftWidth: 2, paddingLeft: 10, flexDirection: "row", alignItems: "flex-end", flexWrap: "wrap" },
    lineAria: { borderLeftColor: c.accent },
    lineUser: { borderLeftColor: c.border },
    messageText: { fontSize: 14, color: c.textPrimary, lineHeight: 22, flexShrink: 1 },
    emptyText: { textAlign: "center", color: c.textMuted, fontSize: 14, marginTop: 80 },
    inputBar: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: 8,
      padding: 12,
      borderTopWidth: 1,
      borderTopColor: c.border,
      backgroundColor: c.surface,
    },
    input: {
      flex: 1,
      minHeight: 40,
      maxHeight: 120,
      backgroundColor: c.surfaceRaised,
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 10,
      fontSize: 14,
      color: c.textPrimary,
    },
    sendBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: c.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    sendBtnDisabled: { opacity: 0.35 },
    sendBtnText: { color: c.bg, fontSize: 18, fontWeight: "600" },
  });
