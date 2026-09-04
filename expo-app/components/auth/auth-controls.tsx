import { MaterialIcons } from '@expo/vector-icons';
import React, {
  createContext,
  useContext,
  useEffect,
  useId,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

type IconName = React.ComponentProps<typeof MaterialIcons>['name'];

const RED = '#D71920';
const BORDER = '#DDDDDD';
const MUTED = '#9AA0A6';

/** Basic `name@domain.tld` shape check — good enough to catch typos like a missing @ or dot. */
export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

type DropdownGroupValue = {
  openId: string | null;
  setOpenId: (id: string | null) => void;
};
const DropdownGroupContext = createContext<DropdownGroupValue | null>(null);

/** Wrap a set of AuthDropdowns so opening one automatically closes the others. */
export function DropdownGroup({ children }: { children: React.ReactNode }) {
  const [openId, setOpenId] = useState<string | null>(null);
  return (
    <DropdownGroupContext.Provider value={{ openId, setOpenId }}>
      {children}
    </DropdownGroupContext.Provider>
  );
}

/** Text field with a leading icon, animated focus/hover border, optional password toggle, and inline error text. */
export function AuthInput({
  icon,
  isPassword,
  style,
  onFocus,
  onBlur,
  errorText,
  ...rest
}: TextInputProps & {
  icon: IconName;
  isPassword?: boolean;
  errorText?: string;
}) {
  const focus = useSharedValue(0);
  const hover = useSharedValue(0);
  const [secure, setSecure] = useState(!!isPassword);

  const animatedStyle = useAnimatedStyle(() => ({
    borderColor: errorText
      ? RED
      : interpolateColor(
          Math.max(focus.value, hover.value * 0.5),
          [0, 0.5, 1],
          [BORDER, '#BBBBBB', RED],
        ),
    shadowOpacity: focus.value * 0.12,
    transform: [{ translateY: hover.value * -1 }],
  }));

  return (
    <View style={styles.fieldGroup}>
      <Pressable
        onHoverIn={() => {
          hover.value = withTiming(1, { duration: 150 });
        }}
        onHoverOut={() => {
          hover.value = withTiming(0, { duration: 150 });
        }}
      >
        <Animated.View style={[styles.wrapper, animatedStyle]}>
          <MaterialIcons
            name={icon}
            size={19}
            color={MUTED}
            style={styles.leadingIcon}
          />
          <TextInput
            style={[styles.input, style]}
            placeholderTextColor={MUTED}
            secureTextEntry={secure}
            onFocus={(e) => {
              focus.value = withTiming(1, { duration: 160 });
              onFocus?.(e);
            }}
            onBlur={(e) => {
              focus.value = withTiming(0, { duration: 160 });
              onBlur?.(e);
            }}
            {...rest}
          />
          {isPassword ? (
            <Pressable onPress={() => setSecure((s) => !s)} hitSlop={10}>
              <MaterialIcons
                name={secure ? 'visibility-off' : 'visibility'}
                size={19}
                color={MUTED}
              />
            </Pressable>
          ) : null}
        </Animated.View>
      </Pressable>
      {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}
    </View>
  );
}

/** Simple custom select with an animated open/close options panel. */
export function AuthDropdown({
  icon,
  placeholder,
  value,
  options,
  onSelect,
  disabled,
}: {
  icon: IconName;
  placeholder: string;
  value: string;
  options: string[];
  onSelect: (v: string) => void;
  disabled?: boolean;
}) {
  const id = useId();
  const group = useContext(DropdownGroupContext);
  const [localOpen, setLocalOpen] = useState(false);
  const open = group ? group.openId === id : localOpen;

  function setOpen(next: boolean) {
    if (group) group.setOpenId(next ? id : null);
    else setLocalOpen(next);
  }

  const rotate = useSharedValue(0);
  const focus = useSharedValue(0);
  const hover = useSharedValue(0);

  useEffect(() => {
    rotate.value = withTiming(open ? 1 : 0, { duration: 150 });
    focus.value = withTiming(open ? 1 : 0, { duration: 160 });
  }, [open, rotate, focus]);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value * 180}deg` }],
  }));

  const borderStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      Math.max(focus.value, hover.value * 0.5),
      [0, 0.5, 1],
      [BORDER, '#BBBBBB', RED],
    ),
    shadowOpacity: focus.value * 0.12,
    transform: [{ translateY: hover.value * -1 }],
  }));

  return (
    <View style={[styles.ddContainer, { zIndex: open ? 100 : 1 }]}>
      <Pressable
        disabled={disabled}
        onPress={() => setOpen(!open)}
        onHoverIn={() => {
          hover.value = withTiming(1, { duration: 150 });
        }}
        onHoverOut={() => {
          hover.value = withTiming(0, { duration: 150 });
        }}
      >
        <Animated.View
          style={[
            styles.wrapper,
            disabled && styles.wrapperDisabled,
            borderStyle,
          ]}
        >
          <MaterialIcons
            name={icon}
            size={19}
            color={MUTED}
            style={styles.leadingIcon}
          />
          <Text
            style={[styles.ddText, !value && styles.ddPlaceholder]}
            numberOfLines={1}
          >
            {value || placeholder}
          </Text>
          {!disabled && (
            <Animated.View style={chevronStyle}>
              <MaterialIcons name="expand-more" size={20} color={MUTED} />
            </Animated.View>
          )}
        </Animated.View>
      </Pressable>

      {open && !disabled ? (
        <View style={styles.ddPanel}>
          {options.map((opt) => (
            <DropdownOption
              key={opt}
              label={opt}
              onPress={() => {
                onSelect(opt);
                setOpen(false);
              }}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

function DropdownOption({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <Pressable
      style={[styles.ddOption, hovered && styles.ddOptionHovered]}
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
    >
      <Text style={styles.ddOptionText}>{label}</Text>
    </Pressable>
  );
}

/** Checkbox with a spring-animated check mark. */
export function AuthCheckbox({
  checked,
  onToggle,
  children,
}: {
  checked: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  const scale = useSharedValue(checked ? 1 : 0);
  const hover = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(checked ? 1 : 0, { damping: 14, stiffness: 220 });
  }, [checked, scale]);

  const markStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: scale.value,
  }));

  const boxStyle = useAnimatedStyle(() => ({
    borderColor: checked
      ? RED
      : interpolateColor(hover.value, [0, 1], ['#AAAAAA', RED]),
    transform: [{ scale: 1 + hover.value * 0.08 }],
  }));

  return (
    <Pressable
      style={styles.checkRow}
      onPress={onToggle}
      onHoverIn={() => {
        hover.value = withTiming(1, { duration: 150 });
      }}
      onHoverOut={() => {
        hover.value = withTiming(0, { duration: 150 });
      }}
    >
      <Animated.View
        style={[styles.checkbox, checked && styles.checkboxChecked, boxStyle]}
      >
        <Animated.View style={markStyle}>
          <MaterialIcons name="check" size={13} color="#FFFFFF" />
        </Animated.View>
      </Animated.View>
      <View style={styles.checkLabel}>{children}</View>
    </Pressable>
  );
}

/** Primary/secondary button with press-scale feedback and web hover elevation. */
export function AuthButton({
  label,
  onPress,
  variant = 'primary',
  loading,
  disabled,
  trailingIcon,
}: {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
  disabled?: boolean;
  trailingIcon?: IconName;
}) {
  const scale = useSharedValue(1);
  const hover = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: hover.value * -2 }],
    shadowOpacity: variant === 'primary' ? 0.18 + hover.value * 0.12 : 0,
  }));

  const isPrimary = variant === 'primary';
  const isOutline = variant === 'outline';

  return (
    <Pressable
      onPressIn={() => {
        scale.value = withTiming(0.97, { duration: 90 });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 160 });
      }}
      onHoverIn={() => {
        hover.value = withTiming(1, { duration: 150 });
      }}
      onHoverOut={() => {
        hover.value = withTiming(0, { duration: 150 });
      }}
      onPress={onPress}
      disabled={disabled || loading}
    >
      <Animated.View
        style={[
          styles.btn,
          isPrimary && styles.btnPrimary,
          variant === 'secondary' && styles.btnSecondary,
          isOutline && styles.btnOutline,
          animatedStyle,
          (disabled || loading) && { opacity: 0.65 },
        ]}
      >
        {loading ? (
          <ActivityIndicator color={isPrimary ? '#FFFFFF' : RED} />
        ) : (
          <View style={styles.btnContent}>
            <Text style={[styles.btnText, !isPrimary && styles.btnTextDark]}>
              {label}
            </Text>
            {trailingIcon ? (
              <MaterialIcons
                name={trailingIcon}
                size={18}
                color={isPrimary ? '#FFFFFF' : '#222'}
              />
            ) : null}
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

/** Wraps a child so it fades/slides in after `delay`ms — used to cascade field entrances. */
export function StaggerItem({
  delay = 0,
  children,
  style,
}: {
  delay?: number;
  children: React.ReactNode;
  style?: any;
}) {
  const enter = useSharedValue(0);

  useEffect(() => {
    enter.value = withDelay(delay, withTiming(1, { duration: 320 }));
  }, [delay, enter]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [{ translateY: (1 - enter.value) * 16 }],
  }));

  return (
    <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
  );
}

/** Text link that underlines and shifts to the brand red on hover/press. */
export function HoverLink({
  children,
  onPress,
  style,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  style?: any;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
    >
      <Text style={[style, hovered && styles.hoverLinkActive]}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fieldGroup: {
    marginBottom: 15,
  },
  errorText: {
    color: RED,
    fontSize: 12.5,
    marginTop: 5,
    marginLeft: 4,
  },
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: BORDER,
    paddingHorizontal: 16,
    shadowColor: RED,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 6,
    shadowOpacity: 0,
    ...(Platform.OS === 'web'
      ? ({
          transitionProperty: 'border-color',
          transitionDuration: '150ms',
        } as any)
      : null),
  },
  wrapperDisabled: {
    backgroundColor: '#F2F2F2',
  },
  leadingIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15.5,
    color: '#1A1A1A',
    height: '100%',
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : null),
  },
  ddContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  ddText: {
    flex: 1,
    fontSize: 15.5,
    color: '#1A1A1A',
  },
  ddPlaceholder: {
    color: MUTED,
  },
  ddPanel: {
    position: 'absolute',
    top: 58,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
    maxHeight: 220,
  },
  ddOption: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  ddOptionHovered: {
    backgroundColor: '#FBEAEA',
  },
  ddOptionText: {
    fontSize: 15,
    color: '#333',
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 19,
    height: 19,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#AAA',
    marginRight: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: RED,
    borderColor: RED,
  },
  checkLabel: {
    flexShrink: 1,
  },
  btn: {
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: RED,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  btnPrimary: {
    backgroundColor: RED,
  },
  btnSecondary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: BORDER,
  },
  btnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: RED,
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 16.5,
    fontWeight: '700',
  },
  btnTextDark: {
    color: '#222222',
  },
  hoverLinkActive: {
    color: RED,
    textDecorationLine: 'underline',
  },
});
