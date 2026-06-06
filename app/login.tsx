import { useAuth } from "@/src/context/AuthContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ── Cottagecore palette ──────────────────────────────────────────────────────
const CREAM       = '#fdf6ee';
const PARCHMENT   = '#f5ead8';
const ROSE        = '#d4849b';
const BLUSH       = '#e8a0b0';
const ROSE_MIST   = '#f2c5ce';
const BARK        = '#6b5040';
const MUSHROOM    = '#9e8a78';
const LINEN       = '#e8ddd0';
const SAGE        = '#9aaa8a';
const ERR         = '#b05060';
const ERR_BG      = '#fceef0';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    setError(null);
    const { error: err } = await signIn(email.trim(), password);
    if (err) {
      setError(err);
      setLoading(false);
    } else {
      router.replace("/");
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Decorative petal strip */}
          <View style={styles.petalStrip}>
            {['🌸', '🌿', '🌼', '🌿', '🌸'].map((e, i) => (
              <Text key={i} style={styles.petalEmoji}>{e}</Text>
            ))}
          </View>

          {/* Logo / Brand */}
          <View style={styles.brandContainer}>
            <View style={styles.logoCircle}>
              <MaterialCommunityIcons
                name="book-open-variant"
                size={38}
                color="#fff"
              />
            </View>
            <Text style={styles.appName}>mika</Text>
            <Text style={styles.tagline}>your cozy media diary ✦</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Welcome back 🌷</Text>
            <Text style={styles.cardSubtitle}>sign in to your little corner</Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputRow}>
                <MaterialCommunityIcons
                  name="email-outline"
                  size={17}
                  color={MUSHROOM}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor={LINEN}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputRow}>
                <MaterialCommunityIcons
                  name="lock-outline"
                  size={17}
                  color={MUSHROOM}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="••••••••"
                  placeholderTextColor={LINEN}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword((v) => !v)}
                  style={styles.eyeBtn}
                >
                  <MaterialCommunityIcons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={17}
                    color={MUSHROOM}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <MaterialCommunityIcons
                  name="alert-circle-outline"
                  size={15}
                  color={ERR}
                />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[styles.primaryBtn, loading && { opacity: 0.65 }]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryBtnText}>Sign In ✦</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => router.push("/register")}>
              <Text style={styles.footerLink}> Create one 🌿</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: CREAM },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 26,
    paddingVertical: 32,
  },
  petalStrip: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  petalEmoji: { fontSize: 20 },
  brandContainer: { alignItems: "center", marginBottom: 28 },
  logoCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: ROSE,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
    borderWidth: 3,
    borderColor: ROSE_MIST,
    shadowColor: ROSE,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  appName: {
    fontSize: 34,
    fontWeight: "800",
    color: BARK,
    letterSpacing: 3,
    fontStyle: 'italic',
  },
  tagline: { fontSize: 13, color: MUSHROOM, marginTop: 5, letterSpacing: 0.5 },
  card: {
    backgroundColor: '#fffaf5',
    borderRadius: 24,
    padding: 26,
    borderWidth: 1.5,
    borderColor: LINEN,
    shadowColor: BARK,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: BARK,
    marginBottom: 4,
  },
  cardSubtitle: { fontSize: 13, color: MUSHROOM, marginBottom: 22 },
  fieldGroup: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: "700", color: SAGE, marginBottom: 8, letterSpacing: 0.8, textTransform: 'uppercase' },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: LINEN,
    borderRadius: 14,
    backgroundColor: CREAM,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 13 : 9,
  },
  inputIcon: { marginRight: 9 },
  input: { flex: 1, fontSize: 14, color: BARK },
  eyeBtn: { padding: 4 },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: ERR_BG,
    borderWidth: 1.5,
    borderColor: '#f0c4cb',
    borderRadius: 12,
    padding: 10,
    marginBottom: 14,
  },
  errorText: { flex: 1, fontSize: 13, color: ERR },
  primaryBtn: {
    backgroundColor: ROSE,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 6,
    shadowColor: ROSE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 15, letterSpacing: 0.5 },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 26 },
  footerText: { fontSize: 14, color: MUSHROOM },
  footerLink: { fontSize: 14, color: ROSE, fontWeight: "700" },
});
