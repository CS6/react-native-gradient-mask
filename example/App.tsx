/**
 * GradientMaskView Test App
 *
 * Purpose: Test GradientMaskView + FlashList + real MessageItem components
 * Uses real CharacterMessage / UserMessage components with mock data
 *
 * Two modes:
 * - Half height mode (50%): Gradient starts from middle
 * - Full height mode (95%): Gradient covers almost entire screen
 *
 * Performance optimization test:
 * - Android now uses ColorMatrix to adjust alpha instead of rebuilding bitmap
 * - This significantly improves maskOpacity animation performance
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  StatusBar,
  Platform,
  Image,
  ImageBackground,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  processColor,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { FontAwesome6 } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';

import {
  AnimatedGradientMaskView,
  GradientMaskView,
} from 'react-native-gradient-mask';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  cancelAnimation,
  runOnJS,
} from 'react-native-reanimated';

// ============================================
// Colors
// ============================================

const Colors = {
  white: '#FFFFFF',
  characterTalk: {
    userBubble: 'rgba(99, 102, 241, 0.9)',
  },
};

// ============================================
// Types
// ============================================

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isPending?: boolean;
  duration?: number;
  originalImageUrl?: string;
}

// ============================================
// PlayerState
// ============================================

enum PlayerState {
  Waiting = 'waiting',
  Loading = 'loading',
  Playing = 'playing',
  Paused = 'paused',
}

// Mock background image URL
const MOCK_BACKGROUND_URL = 'https://picsum.photos/800/1600';
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================
// Mock Data: Chat messages
// ============================================

const generateMockMessages = (): ChatMessage[] => {
  const messages: ChatMessage[] = [];
  for (let i = 0; i < 10; i++) {
    const isUser = i % 2 === 0;
    messages.push({
      id: `msg-${i}`,
      role: isUser ? 'user' : 'assistant',
      content: isUser
        ? `This is user message #${Math.floor(i / 2) + 1}. The weather is nice today, I want to go for a walk.`
        : `This is assistant reply #${Math.floor(i / 2) + 1}. I also think the weather is great! How about we go for a walk in the park? We can bring some snacks and find a nice spot for a picnic.`,
      isPending: false,
      duration: isUser ? undefined : 3000,
    } as ChatMessage);
  }
  return messages;
};

const MOCK_MESSAGES = generateMockMessages();

// ============================================
// Message Styles
// ============================================

const messageStyles = StyleSheet.create({
  messageContainer: {
    marginVertical: 4,
  },
  playVoiceButtonContainer: {
    position: 'absolute',
    top: -10,
    zIndex: 10,
  },
  userMessage: {
    position: 'relative',
    alignItems: 'flex-end',
  },
  characterMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: 250,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  userBubble: {
    backgroundColor: Colors.characterTalk.userBubble,
    borderRadius: 20,
    borderTopRightRadius: 4,
    overflow: 'hidden',
  },
  characterBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 20,
    borderTopLeftRadius: 4,
    overflow: 'hidden',
  },
  messageText: {
    fontSize: 13,
    lineHeight: 13 * 1.4,
  },
  userText: {
    color: Colors.white,
  },
  pendingMessage: {
    opacity: 0.8,
  },
});

// ============================================
// PlayVoiceButton Component
// ============================================

interface PlayVoiceButtonProps {
  chatId: string;
  messageId: string;
  duration?: number;
  playerState: PlayerState;
  isPlaying: boolean;
  onPlay: () => void;
}

const PlayVoiceButton: React.FC<PlayVoiceButtonProps> = React.memo(
  ({ duration, onPlay }) => {
    const durationText = duration ? `${Math.round(duration / 1000)}s` : '';

    return (
      <Pressable style={playVoiceStyles.container} onPress={onPlay}>
        <FontAwesome6 name="play" size={10} color="rgba(255,255,255,0.8)" />
        {durationText ? <Text style={playVoiceStyles.text}>{durationText}</Text> : null}
      </Pressable>
    );
  }
);

PlayVoiceButton.displayName = 'PlayVoiceButton';

const playVoiceStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  text: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
  },
});

// ============================================
// CharacterMessage Component
// ============================================

interface CharacterMessageProps {
  item: ChatMessage;
}

const CharacterMessage: React.FC<CharacterMessageProps> = React.memo(({ item }) => {
  const isAndroid = Platform.OS === 'android';

  // Mock callbacks
  const handlePlay = useCallback(() => {}, []);
  const handleLongPress = useCallback(() => {}, []);

  const characterBubbleContent = (
    <Pressable
      onPress={(e) => e.stopPropagation()}
      delayLongPress={900}
      onLongPress={handleLongPress}
    >
      <Text style={messageStyles.messageText}>{item.content}</Text>
    </Pressable>
  );

  return (
    <View style={[messageStyles.messageContainer, messageStyles.characterMessage]}>
      {/* PlayVoiceButton */}
      <View style={messageStyles.playVoiceButtonContainer}>
        <GestureDetector gesture={Gesture.Tap().maxDuration(250)}>
          <View>
            <PlayVoiceButton
              chatId="mock-chat"
              messageId={item.id!}
              duration={item.duration}
              playerState={PlayerState.Waiting}
              isPlaying={false}
              onPlay={handlePlay}
            />
          </View>
        </GestureDetector>
      </View>

      {/* Message Bubble */}
      <GestureDetector gesture={Gesture.Tap().maxDuration(250)}>
        {isAndroid ? (
          <View
            style={[
              messageStyles.messageBubble,
              messageStyles.characterBubble,
              item.isPending && messageStyles.pendingMessage,
            ]}
          >
            {characterBubbleContent}
          </View>
        ) : (
          <BlurView
            intensity={20}
            tint="light"
            style={[
              messageStyles.messageBubble,
              messageStyles.characterBubble,
              item.isPending && messageStyles.pendingMessage,
            ]}
          >
            {characterBubbleContent}
          </BlurView>
        )}
      </GestureDetector>
    </View>
  );
});

CharacterMessage.displayName = 'CharacterMessage';

// ============================================
// UserMessage Component
// ============================================

interface UserMessageProps {
  item: ChatMessage;
}

const UserMessage: React.FC<UserMessageProps> = React.memo(({ item }) => {
  const handleLongPress = useCallback(() => {}, []);

  return (
    <View style={[messageStyles.messageContainer, messageStyles.userMessage]}>
      <GestureDetector gesture={Gesture.Tap().maxDuration(250)}>
        {item.originalImageUrl ? (
          <Image
            source={{ uri: item.originalImageUrl }}
            style={{ width: 100, height: 100, borderRadius: 12 }}
          />
        ) : (
          <Pressable
            onPress={(e) => e.stopPropagation()}
            delayLongPress={900}
            style={[
              messageStyles.messageBubble,
              messageStyles.userBubble,
              item.isPending && messageStyles.pendingMessage,
            ]}
            onLongPress={handleLongPress}
          >
            <Text style={[messageStyles.messageText, messageStyles.userText]} selectable>
              {item.content}
            </Text>
          </Pressable>
        )}
      </GestureDetector>
    </View>
  );
});

UserMessage.displayName = 'UserMessage';

// ============================================
// MessageItem Component
// ============================================

interface MessageItemProps {
  item: ChatMessage;
}

const MessageItem: React.FC<MessageItemProps> = React.memo(({ item }) => {
  if (item.role === 'user') {
    return <UserMessage item={item} />;
  }
  return <CharacterMessage item={item} />;
});

MessageItem.displayName = 'MessageItem';

// ============================================
// Mask Gradient Configuration
// ============================================

type MaskMode = 'half' | 'full';

// Half height mask colors
const HALF_MASK_COLORS = [
  'rgba(0,0,0,0)',
  'rgba(0,0,0,0)',
  'rgba(0,0,0,0.2)',
  'rgba(0,0,0,0.6)',
  'rgba(0,0,0,0.9)',
  'rgba(0,0,0,1)',
];
const HALF_MASK_LOCATIONS = [0, 0.42, 0.45, 0.48, 0.5, 1];

// Full height mask colors
const FULL_MASK_COLORS = [
  'rgba(0,0,0,0)',
  'rgba(0,0,0,0)',
  'rgba(0,0,0,0.1)',
  'rgba(0,0,0,0.3)',
  'rgba(0,0,0,0.6)',
  'rgba(0,0,0,0.85)',
  'rgba(0,0,0,1)',
];
const FULL_MASK_LOCATIONS = [0, 0.02, 0.05, 0.15, 0.4, 0.7, 1];

// ============================================
// Scroll Detection Constants
// ============================================

const PADDING_BOTTOM = 30;
const BOTTOM_EPS_SHOW = 2; // Threshold for showing mask
const BOTTOM_EPS_HIDE = 6; // Threshold for hiding mask

// ============================================
// Main Screen
// ============================================

// Helper function to create new messages
const createNewMessage = (index: number, isUser: boolean): ChatMessage => ({
  id: `new-msg-${Date.now()}-${index}`,
  role: isUser ? 'user' : 'assistant',
  content: isUser
    ? `[Auto-added] User message #${index}: This is a test message to verify dynamic message adding performance.`
    : `[Auto-added] Assistant reply #${index}: Got your message! This is an auto-generated reply to test how the screen performs when the message count increases.`,
  isPending: false,
  duration: isUser ? undefined : 2500,
});

export default function CharacterChatScreenV3DTest() {
  const [maskMode, setMaskMode] = useState<MaskMode>('half');
  const [autoSwitch, setAutoSwitch] = useState(true); // Enable auto switch
  const [autoAddMessages, setAutoAddMessages] = useState(false); // Auto add messages
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);
  const messageCountRef = useRef(100); // Track message count
  const [isStressTest, setIsStressTest] = useState(false); // Stress test mode

  // Mask opacity animation control (using Reanimated SharedValue)
  const maskOpacity = useSharedValue(0);

  // UI opacity animation control (using Reanimated SharedValue to avoid React re-renders)
  const uiOpacity = useSharedValue(1);
  const isUIHiddenRef = useRef(false);

  // Bottom detection state management
  const [isAtBottom, setIsAtBottom] = useState(false);
  const isAtBottomRef = useRef(false); // Track previous state to avoid duplicate animations

  // Calculate mask colors
  const maskColors = useMemo(() => {
    const colors = maskMode === 'full' ? FULL_MASK_COLORS : HALF_MASK_COLORS;
    return colors.map((c) => processColor(c) as number | null);
  }, [maskMode]);

  const maskLocations = useMemo(() => {
    return maskMode === 'full' ? FULL_MASK_LOCATIONS : HALF_MASK_LOCATIONS;
  }, [maskMode]);

  // UI opacity animated style (avoids React re-renders)
  const uiAnimatedStyle = useAnimatedStyle(() => ({
    opacity: uiOpacity.value,
  }));

  // Add a pair of messages every 10 seconds
  useEffect(() => {
    if (!autoAddMessages) return;

    const interval = setInterval(() => {
      setMessages((prev) => {
        const newIndex = messageCountRef.current;
        messageCountRef.current += 2;

        // Add a pair of messages to the end of the list
        const userMsg = createNewMessage(newIndex, true);
        const assistantMsg = createNewMessage(newIndex + 1, false);

        return [...prev, userMsg, assistantMsg];
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [autoAddMessages]);

  // Stress test: rapidly toggle maskOpacity to test ColorMatrix optimization
  // This tests the performance improvement where Android no longer rebuilds bitmap on opacity change
  useEffect(() => {
    if (!isStressTest) return;

    const interval = setInterval(() => {
      // Toggle between 0 and 1 rapidly (every 100ms = 10 times per second)
      maskOpacity.value = withTiming(maskOpacity.value > 0.5 ? 0 : 1, {
        duration: 100,
        easing: Easing.linear,
      });
    }, 150);

    return () => {
      clearInterval(interval);
      // Reset to 0 when stopping stress test
      maskOpacity.value = withTiming(0, { duration: 300 });
    };
  }, [isStressTest, maskOpacity]);

  const toggleStressTest = useCallback(() => {
    setIsStressTest((prev) => !prev);
  }, []);

  const toggleAutoAddMessages = useCallback(() => {
    setAutoAddMessages((prev) => !prev);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: ChatMessage }) => <MessageItem item={item} />,
    []
  );

  const keyExtractor = useCallback((item: ChatMessage) => item.id!, []);

  const getItemType = useCallback((item: ChatMessage) => item.role, []);

  const toggleMaskMode = useCallback(() => {
    setMaskMode((prev) => (prev === 'half' ? 'full' : 'half'));
  }, []);

  const toggleAutoSwitch = useCallback(() => {
    setAutoSwitch((prev) => !prev);
  }, []);

  // Handle background tap to hide UI
  const handleBackgroundTap = useCallback(() => {
    // Dismiss keyboard if visible
    if (Keyboard.isVisible()) {
      Keyboard.dismiss();
      return;
    }
    // Toggle UI visibility (using SharedValue to avoid React re-renders)
    isUIHiddenRef.current = !isUIHiddenRef.current;
    if (isUIHiddenRef.current) {
      // Hide UI: uiOpacity -> 0
      uiOpacity.value = withTiming(0, { duration: 300 });
    } else {
      // Show UI: uiOpacity -> 1
      uiOpacity.value = withTiming(1, { duration: 300 });
    }
  }, [uiOpacity]);

  // Tap gesture detection
  const tapGesture = Gesture.Tap()
    .maxDuration(250)
    .maxDeltaX(4)
    .maxDeltaY(4)
    .onEnd((_, success) => {
      if (success) runOnJS(handleBackgroundTap)();
    });

  // Scroll event handler - detect bottom and control mask animation
  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!autoSwitch) return;

      const { contentOffset, layoutMeasurement, contentSize } = e.nativeEvent;
      const distanceFromBottom =
        contentSize.height - contentOffset.y - layoutMeasurement.height;

      // Determine if at bottom (using hysteresis logic to avoid jitter)
      const nextIsAtBottom =
        distanceFromBottom <= PADDING_BOTTOM + BOTTOM_EPS_SHOW
          ? true
          : distanceFromBottom > PADDING_BOTTOM + BOTTOM_EPS_HIDE
            ? false
            : isAtBottomRef.current; // Keep previous state

      // Clear mask immediately when leaving bottom beyond threshold
      if (
        distanceFromBottom > PADDING_BOTTOM + BOTTOM_EPS_HIDE + 4 &&
        maskOpacity.value > 0
      ) {
        cancelAnimation(maskOpacity);
        maskOpacity.value = 0;
        isAtBottomRef.current = false;
        setIsAtBottom(false);
        return;
      }

      // Only trigger animation when state actually changes
      if (nextIsAtBottom !== isAtBottomRef.current) {
        isAtBottomRef.current = nextIsAtBottom;
        setIsAtBottom(nextIsAtBottom);

        // Cancel previous animation
        cancelAnimation(maskOpacity);

        if (nextIsAtBottom) {
          // State changed from "not at bottom" to "at bottom": show mask
          maskOpacity.value = withTiming(1, {
            duration: 600,
            easing: Easing.in(Easing.quad),
          });
        } else {
          // State changed from "at bottom" to "not at bottom": hide mask
          maskOpacity.value = withTiming(0, {
            duration: 400,
            easing: Easing.out(Easing.quad),
          });
        }
      }
    },
    [autoSwitch, maskOpacity]
  );

  const modeLabel = maskMode === 'half' ? 'Half (50%)' : 'Full (95%)';

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Background Image */}
      <ImageBackground
        source={{ uri: MOCK_BACKGROUND_URL }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Header */}
        <SafeAreaView edges={['top']} style={styles.header}>
          <View style={styles.backButton} />
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>GradientMaskView Test</Text>
            <Text style={styles.headerSubtitle}>
              GradientMaskView + FlashList + Background Image
            </Text>
          </View>
          <View style={styles.headerSpacer} />
        </SafeAreaView>

        {/* Mode Toggle */}
        <View style={styles.modeToggleContainer}>
          <View style={styles.toggleRow}>
            <Pressable style={styles.modeToggleButton} onPress={toggleMaskMode}>
              <FontAwesome6
                name={maskMode === 'half' ? 'expand' : 'compress'}
                size={14}
                color={Colors.white}
              />
              <Text style={styles.modeToggleText}>Mask: {modeLabel}</Text>
            </Pressable>
            <Pressable
              style={[styles.autoSwitchButton, autoSwitch && styles.autoSwitchButtonActive]}
              onPress={toggleAutoSwitch}
            >
              <FontAwesome6
                name="wand-magic-sparkles"
                size={12}
                color={autoSwitch ? Colors.white : 'rgba(255,255,255,0.5)'}
              />
              <Text style={[styles.autoSwitchText, autoSwitch && styles.autoSwitchTextActive]}>
                Auto
              </Text>
            </Pressable>
          </View>
          {/* Auto add messages control */}
          <View style={styles.toggleRow}>
            <Pressable
              style={[styles.autoAddButton, autoAddMessages && styles.autoAddButtonActive]}
              onPress={toggleAutoAddMessages}
            >
              <FontAwesome6
                name="plus"
                size={12}
                color={autoAddMessages ? Colors.white : 'rgba(255,255,255,0.5)'}
              />
              <Text style={[styles.autoAddText, autoAddMessages && styles.autoAddTextActive]}>
                +2 msgs/10s
              </Text>
            </Pressable>
            <View style={styles.messageCountBadge}>
              <Text style={styles.messageCountText}>Messages: {messages.length}</Text>
            </View>
          </View>
          {/* Stress test button - tests ColorMatrix optimization on Android */}
          <View style={styles.toggleRow}>
            <Pressable
              style={[styles.stressTestButton, isStressTest && styles.stressTestButtonActive]}
              onPress={toggleStressTest}
            >
              <FontAwesome6
                name="bolt"
                size={12}
                color={isStressTest ? Colors.white : 'rgba(255,255,255,0.5)'}
              />
              <Text style={[styles.stressTestText, isStressTest && styles.stressTestTextActive]}>
                {isStressTest ? 'Stop Stress Test' : 'Opacity Stress Test'}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <FontAwesome6 name="circle-info" size={12} color={Colors.white} />
          <Text style={styles.infoBannerText}>
            Using AnimatedGradientMaskView with maskOpacity animation (600ms show, 400ms hide)
          </Text>
        </View>

        {/* Chat Area with AnimatedGradientMaskView */}
        <GestureDetector gesture={tapGesture}>
          <View style={styles.chatContainer}>
            <Animated.View style={[styles.chatInnerContainer, uiAnimatedStyle]}>
              <AnimatedGradientMaskView
                colors={maskColors}
                locations={maskLocations}
                direction="top"
                maskOpacity={maskOpacity}
                style={{ flex: 1 }}
              >
                <FlashList
                  data={messages}
                  renderItem={renderItem}
                  keyExtractor={keyExtractor}
                  getItemType={getItemType}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.listContent}
                  onScroll={handleScroll}
                  scrollEventThrottle={16}
                  bounces={false}
                  overScrollMode="never"
                />
              </AnimatedGradientMaskView>
            </Animated.View>
          </View>
        </GestureDetector>

        {/* Footer Info */}
        <SafeAreaView edges={['bottom']} style={styles.footer}>
          <Text style={styles.footerText}>
            Fast scroll FPS test - Using AnimatedGradientMaskView animation
          </Text>
        </SafeAreaView>
      </ImageBackground>
    </GestureHandlerRootView>
  );
}

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundImage: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  headerSubtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  headerSpacer: {
    width: 40,
  },
  // Mode toggle
  modeToggleContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  modeToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  modeToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  autoSwitchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  autoSwitchButtonActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.6)',
  },
  autoSwitchText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  autoSwitchTextActive: {
    color: Colors.white,
  },
  autoAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
    marginTop: 8,
  },
  autoAddButtonActive: {
    backgroundColor: 'rgba(34, 197, 94, 0.6)',
  },
  autoAddText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  autoAddTextActive: {
    color: Colors.white,
  },
  stressTestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
    marginTop: 8,
  },
  stressTestButtonActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.7)',
  },
  stressTestText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  stressTestTextActive: {
    color: Colors.white,
  },
  messageCountBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  messageCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
  },
  // Info banner
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(99, 102, 241, 0.5)',
    gap: 8,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 11,
    color: Colors.white,
  },
  // Chat
  chatContainer: {
    flex: 1,
  },
  chatInnerContainer: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  // Footer
  footer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  footerText: {
    fontSize: 13,
    color: Colors.white,
    textAlign: 'center',
  },
});
