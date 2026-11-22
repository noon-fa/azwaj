import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type PressableProps,
  type TextInputProps,
  type ViewProps,
} from "react-native";
import { theme } from "@/theme";

export function Page({
  children,
  scroll = false,
  ...props
}: ViewProps & { scroll?: boolean }) {
  if (scroll) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View {...props} style={[styles.page, props.style]}>
            {children}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View {...props} style={[styles.page, props.style]}>
        {children}
      </View>
    </SafeAreaView>
  );
}

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <View style={styles.brand}>
      <View style={styles.brandMark}>
        <Text style={styles.brandMarkText}>A</Text>
      </View>
      <View>
        <Text style={styles.brandName}>AZWAJ</Text>
        {!compact && <Text style={styles.brandCaption}>A considered path</Text>}
      </View>
    </View>
  );
}

export function Heading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <View style={styles.heading}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
  );
}

export function Card({ children, style, ...props }: ViewProps) {
  return (
    <View {...props} style={[styles.card, style]}>
      {children}
    </View>
  );
}

export function Button({
  children,
  variant = "primary",
  loading = false,
  disabled,
  style,
  ...props
}: PressableProps & {
  children: string;
  variant?: "primary" | "secondary" | "text";
  loading?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      {...props}
      style={({ pressed }) => [
        styles.button,
        variant === "primary" && styles.buttonPrimary,
        variant === "secondary" && styles.buttonSecondary,
        variant === "text" && styles.buttonText,
        (disabled || loading) && styles.buttonDisabled,
        pressed && !disabled && !loading && styles.buttonPressed,
        typeof style === "function" ? style({ pressed }) : style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" ? theme.color.white : theme.color.primary}
        />
      ) : (
        <Text
          style={[
            styles.buttonLabel,
            variant === "primary" && styles.buttonLabelPrimary,
            variant === "text" && styles.buttonLabelText,
          ]}
        >
          {children}
        </Text>
      )}
    </Pressable>
  );
}

export function TextField({
  label,
  error,
  hint,
  ...props
}: TextInputProps & { label: string; error?: string; hint?: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={theme.color.muted}
        selectionColor={theme.color.primary}
        style={[styles.input, error && styles.inputError]}
        {...props}
      />
      {error ? (
        <Text accessibilityRole="alert" style={styles.errorText}>
          {error}
        </Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

export function Notice({
  children,
  tone = "info",
}: {
  children: string;
  tone?: "info" | "error" | "success";
}) {
  return (
    <View
      accessibilityRole={tone === "error" ? "alert" : "text"}
      style={[
        styles.notice,
        tone === "error" && styles.noticeError,
        tone === "success" && styles.noticeSuccess,
      ]}
    >
      <Text style={styles.noticeText}>{children}</Text>
    </View>
  );
}

export function LoadingState({ label = "Please wait" }: { label?: string }) {
  return (
    <View style={styles.loading}>
      <ActivityIndicator color={theme.color.primary} />
      <Text style={styles.loadingLabel}>{label}</Text>
    </View>
  );
}

export function LinkButton({
  children,
  ...props
}: PressableProps & { children: string }) {
  return (
    <Pressable accessibilityRole="button" {...props} style={styles.linkButton}>
      <Text style={styles.linkLabel}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.color.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  page: {
    flex: 1,
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  brandMark: {
    width: 42,
    height: 42,
    borderRadius: theme.radius.control,
    backgroundColor: theme.color.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  brandMarkText: {
    color: theme.color.white,
    fontSize: 22,
    fontWeight: "700",
  },
  brandName: {
    color: theme.color.primary,
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 2,
  },
  brandCaption: {
    color: theme.color.muted,
    fontSize: 12,
    marginTop: 2,
  },
  heading: {
    gap: theme.spacing.sm,
  },
  eyebrow: {
    color: theme.color.primary,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  title: {
    color: theme.color.text,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  description: {
    color: theme.color.muted,
    fontSize: 16,
    lineHeight: 24,
  },
  card: {
    padding: theme.spacing.lg,
    borderRadius: theme.radius.card,
    backgroundColor: theme.color.surface,
    borderWidth: 1,
    borderColor: theme.color.border,
  },
  button: {
    minHeight: 54,
    borderRadius: theme.radius.control,
    paddingHorizontal: theme.spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPrimary: {
    backgroundColor: theme.color.primary,
  },
  buttonSecondary: {
    backgroundColor: theme.color.surface,
    borderWidth: 1,
    borderColor: theme.color.border,
  },
  buttonText: {
    minHeight: 42,
    paddingHorizontal: theme.spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonPressed: {
    opacity: 0.82,
  },
  buttonLabel: {
    color: theme.color.text,
    fontSize: 15,
    fontWeight: "700",
  },
  buttonLabelPrimary: {
    color: theme.color.white,
  },
  buttonLabelText: {
    color: theme.color.primary,
  },
  field: {
    gap: 7,
  },
  fieldLabel: {
    color: theme.color.text,
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: theme.color.border,
    borderRadius: theme.radius.control,
    backgroundColor: theme.color.surface,
    paddingHorizontal: 15,
    color: theme.color.text,
    fontSize: 16,
  },
  inputError: {
    borderColor: theme.color.error,
  },
  errorText: {
    color: theme.color.error,
    fontSize: 13,
  },
  hint: {
    color: theme.color.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  notice: {
    borderRadius: theme.radius.control,
    backgroundColor: theme.color.surfaceMuted,
    padding: theme.spacing.md,
  },
  noticeError: {
    backgroundColor: "#F8EDEC",
  },
  noticeSuccess: {
    backgroundColor: "#E8F1EB",
  },
  noticeText: {
    color: theme.color.text,
    lineHeight: 21,
    fontSize: 14,
  },
  loading: {
    flex: 1,
    minHeight: 180,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.md,
  },
  loadingLabel: {
    color: theme.color.muted,
  },
  linkButton: {
    alignSelf: "flex-start",
    paddingVertical: theme.spacing.sm,
  },
  linkLabel: {
    color: theme.color.primary,
    fontSize: 14,
    fontWeight: "700",
  },
});
