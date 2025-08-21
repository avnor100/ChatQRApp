// App.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";

/** Helper: tiny fetch wrapper that throws with text on non-2xx */
async function handle(res) {
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(t || `HTTP ${res.status}`);
  }
  const txt = await res.text();
  try {
    return JSON.parse(txt);
  } catch {
    return txt;
  }
}

export default function App() {
  // Start empty so you always paste the current Cloudflare URL (NO trailing slash)
 const [baseUrl, setBaseUrl] = useState("https://chat-backend-2-q3bu.onrender.com");

  // ✅ Clean URL used for ALL requests (trim + strip trailing slashes)
  const cleanBase = useMemo(
    () => (baseUrl || "").trim().replace(/\/+$/, ""),
    [baseUrl]
  );

  const [token, setToken] = useState("");
  const [health, setHealth] = useState("");
  const [loading, setLoading] = useState(false);

  // Debug/status line (always visible)
  const [status, setStatus] = useState("");

  // Groups/messages state
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [newGroupName, setNewGroupName] = useState("");
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  // Reload banner
  const [reloadedAt, setReloadedAt] = useState(Date.now());
  const [bannerVisible, setBannerVisible] = useState(true);
  const fade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    setBannerVisible(true);
    fade.setValue(1);
    const t = setTimeout(() => {
      Animated.timing(fade, { toValue: 0, duration: 600, useNativeDriver: true })
        .start(() => setBannerVisible(false));
    }, 2400);
    return () => clearTimeout(t);
  }, [reloadedAt, fade]);

  const canCall = useMemo(() => !!cleanBase && /^https?:\/\/.+/i.test(cleanBase), [cleanBase]);

  async function checkHealth() {
    if (!canCall) {
      setStatus("Set URL first (no trailing /)");
      return;
    }
    setStatus("Checking health…");
    try {
      const res = await fetch(`${cleanBase}`);
      const ok = await res.text();
      setHealth(ok.slice(0, 120));
      setStatus(`Health: ${ok.slice(0, 60)}`);
    } catch (e) {
      setHealth(String(e.message || e));
      setStatus(`Health error: ${String(e.message || e)}`);
    }
  }

  async function guestSignIn() {
    if (!canCall) {
      Alert.alert("Set URL first", "Paste the trycloudflare URL at the top (no trailing /).");
      setStatus("Missing URL");
      return;
    }
    setLoading(true);
    setStatus("Signing in (guest)...");
    try {
      const data = await handle(await fetch(`${cleanBase}/auth/guest`, { method: "POST" }));
      setToken(data?.token || "");
      setStatus("Signed in (guest).");
      Alert.alert("Signed in", "Guest token received.");
    } catch (e) {
      const msg = String(e.message || e);
      setStatus(`Guest sign-in failed: ${msg}`);
      Alert.alert("Guest sign-in failed", msg);
    } finally {
      setLoading(false);
    }
  }

  async function loadGroups() {
    if (!token) {
      Alert.alert("No token", "Tap Guest Sign In first.");
      setStatus("No token yet");
      return;
    }
    setLoading(true);
    setStatus("Loading groups…");
    try {
      const data = await handle(await fetch(`${cleanBase}/groups`, {
        headers: { Authorization: `Bearer ${token}` },
      }));
      setGroups(Array.isArray(data?.items) ? data.items : data);
      setStatus(`Loaded ${Array.isArray(data?.items) ? data.items.length : (data?.length || 0)} groups.`);
    } catch (e) {
      const msg = String(e.message || e);
      setStatus(`List groups failed: ${msg}`);
      Alert.alert("List groups failed", msg);
    } finally {
      setLoading(false);
    }
  }

  async function createGroup() {
    if (!token) {
      Alert.alert("No token", "Tap Guest Sign In first.");
      setStatus("No token yet");
      return;
    }
    if (!newGroupName.trim()) {
      Alert.alert("Name required", "Type a group name.");
      setStatus("Group name required");
      return;
    }
    setLoading(true);
    setStatus("Creating group…");
    try {
      const data = await handle(await fetch(`${cleanBase}/groups`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newGroupName.trim() }),
      }));
      setNewGroupName("");
      await loadGroups();
      setSelectedGroup(data);
      setStatus("Group created.");
    } catch (e) {
      const msg = String(e.message || e);
      setStatus(`Create group failed: ${msg}`);
      Alert.alert("Create group failed", msg);
    } finally {
      setLoading(false);
    }
  }

  async function openGroup(g) {
    setSelectedGroup(g);
    setMessages([]);
    await loadMessages(g.id);
  }

  async function loadMessages(groupId) {
    if (!token) return;
    setLoading(true);
    setStatus("Loading messages…");
    try {
      const data = await handle(await fetch(`${cleanBase}/groups/${groupId}/messages?limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      }));
      const items = Array.isArray(data?.items) ? data.items : data;
      setMessages(items);
      setStatus(`Loaded ${items?.length || 0} messages.`);
    } catch (e) {
      const msg = String(e.message || e);
      setStatus(`Load messages failed: ${msg}`);
      Alert.alert("Load messages failed", msg);
    } finally {
      setLoading(false);
    }
  }

  async function sendMsg() {
    if (!token) {
      Alert.alert("No token", "Tap Guest Sign In first.");
      setStatus("No token yet");
      return;
    }
    if (!selectedGroup) {
      Alert.alert("Pick a group", "Select or create a group first.");
      setStatus("No group selected");
      return;
    }
    if (!text.trim()) return;
    setLoading(true);
    setStatus("Sending message…");
    try {
      await handle(await fetch(`${cleanBase}/groups/${selectedGroup.id}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: text.trim() }),
      }));
      setText("");
      await loadMessages(selectedGroup.id);
      setStatus("Message sent.");
    } catch (e) {
      const msg = String(e.message || e);
      setStatus(`Send failed: ${msg}`);
      Alert.alert("Send failed", msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (cleanBase) checkHealth();
  }, [cleanBase]);

  return (
    <SafeAreaView style={s.container}>
      <KeyboardAvoidingView behavior={Platform.select({ ios: "padding", android: undefined })} style={{ flex: 1 }}>
        <Text style={s.h1}>ChatQR Debug UI</Text>

        {/* Reload banner */}
        {bannerVisible && (
          <Animated.View style={[s.banner, { opacity: fade }]}>
            <Text style={s.bannerText}>
              Reloaded at {new Date(reloadedAt).toLocaleTimeString()}
            </Text>
          </Animated.View>
        )}

        {/* Visible status + active URL */}
        <Text style={[s.small, { color: "#0a0", marginBottom: 4 }]} numberOfLines={2}>
          {status || "Idle"}
        </Text>
        <Text style={[s.small, { marginBottom: 8 }]} numberOfLines={1}>
          Using: {cleanBase || "(paste your trycloudflare URL)"}
        </Text>

        {/* URL row */}
        <TextInput
          style={s.input}
          placeholder="https://...trycloudflare.com (no trailing /)"
          autoCapitalize="none"
          autoCorrect={false}
          value={baseUrl}
          onChangeText={setBaseUrl}
        />
        <View style={s.row}>
          <Button title="Check" onPress={checkHealth} />
          <Text style={s.small} numberOfLines={1}> Health: {health || "-"}</Text>
        </View>

        {/* Auth */}
        <View style={s.row}>
          <Button title="Guest Sign In" onPress={guestSignIn} />
        </View>
        <Text style={s.small} selectable numberOfLines={2}>
          Token: {token ? token.slice(0, 36) + "…" : "(none)"}
        </Text>

        {/* Groups */}
        <View style={s.row}>
          <Button title="List Groups" onPress={loadGroups} />
        </View>
        <FlatList
          data={groups}
          keyExtractor={(g) => g.id}
          style={s.list}
          renderItem={({ item }) => (
            <View style={s.item}>
              <Text style={s.bold}>{item.name}</Text>
              <Button title="Open" onPress={() => openGroup(item)} />
            </View>
          )}
          ListEmptyComponent={<Text style={s.dim}>No groups yet.</Text>}
        />

        {/* Create group */}
        <View style={s.row}>
          <TextInput
            style={[s.input, { flex: 1 }]}
            placeholder="New group name"
            value={newGroupName}
            onChangeText={setNewGroupName}
          />
          <Button title="Create" onPress={createGroup} />
        </View>

        {/* Messages */}
        {selectedGroup && (
          <>
            <Text style={s.h2}>Group: {selectedGroup.name}</Text>
            <FlatList
              data={messages}
              keyExtractor={(m) => m.id}
              style={[s.list, { flex: 1 }]}
              renderItem={({ item }) => (
                <View style={s.msg}>
                  <Text style={s.bold}>{item.user?.displayName || item.userId}</Text>
                  <Text>{item.text}</Text>
                </View>
              )}
              ListEmptyComponent={<Text style={s.dim}>No messages yet.</Text>}
            />
            <View style={s.row}>
              <TextInput
                style={[s.input, { flex: 1 }]}
                placeholder="Type a message"
                value={text}
                onChangeText={setText}
              />
              <Button title="Send" onPress={sendMsg} />
            </View>
          </>
        )}

        {loading && (
          <View style={s.loading}>
            <ActivityIndicator />
            <Text style={s.dim}>Working…</Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: "#fff" },
  h1: { fontSize: 20, fontWeight: "700", marginBottom: 8 },
  h2: { fontSize: 16, fontWeight: "700", marginTop: 8 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 8, marginBottom: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  small: { fontSize: 12 },
  dim: { color: "#666" },
  list: { maxHeight: 180, marginBottom: 8 },
  item: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 6 },
  msg: { paddingVertical: 6, borderBottomColor: "#eee", borderBottomWidth: 1 },
  bold: { fontWeight: "700" },
  loading: { position: "absolute", right: 12, bottom: 16, flexDirection: "row", alignItems: "center", gap: 8 },

  banner: {
    alignSelf: "center",
    backgroundColor: "#e6ffe6",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 6,
  },
  bannerText: { fontSize: 10, color: "green" },
});
