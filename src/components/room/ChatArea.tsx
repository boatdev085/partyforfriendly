"use client";

import { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { theme } from "@/styles/theme";
import VoiceWidget from "./VoiceWidget";

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  text: string;
  time: string;
  isSelf: boolean;
}

interface Props {
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  currentUserId: string;
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: ${theme.colors.bgCard};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  overflow: hidden;
`;

const Top = styled.div`
  padding: 12px 14px;
  border-bottom: 1px solid ${theme.colors.border};
`;

const MessagesArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: ${theme.colors.border};
    border-radius: 2px;
  }
`;

const SystemMsg = styled.div`
  text-align: center;
  font-size: 12px;
  color: ${theme.colors.textDim};
  padding: 4px 0;
`;

const BubbleRow = styled.div<{ $isSelf: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  flex-direction: ${({ $isSelf }) => ($isSelf ? "row-reverse" : "row")};
`;

const avatarColors = [
  "#7c6aff",
  "#00d4aa",
  "#f59e0b",
  "#ef4444",
  "#5865f2",
  "#22c55e",
];

const AvatarCircle = styled.div<{ $color: string }>`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
`;

const BubbleContent = styled.div<{ $isSelf: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${({ $isSelf }) => ($isSelf ? "flex-end" : "flex-start")};
  max-width: 70%;
`;

const MetaLine = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 3px;
`;

const BubbleUsername = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: ${theme.colors.textMuted};
`;

const BubbleTime = styled.span`
  font-size: 10px;
  color: ${theme.colors.textDim};
`;

const Bubble = styled.div<{ $isSelf: boolean }>`
  padding: 8px 12px;
  border-radius: ${theme.radii.md};
  background: ${({ $isSelf }) =>
    $isSelf ? theme.colors.primaryGlow : theme.colors.bgHover};
  border: 1px solid
    ${({ $isSelf }) =>
      $isSelf ? theme.colors.primary : theme.colors.border};
  font-size: 13px;
  color: ${theme.colors.text};
  line-height: 1.5;
  word-break: break-word;
`;

const InputRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  border-top: 1px solid ${theme.colors.border};
`;

const Input = styled.input`
  flex: 1;
  background: ${theme.colors.bgHover};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  padding: 10px 14px;
  font-size: 13px;
  color: ${theme.colors.text};
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s;

  &::placeholder {
    color: ${theme.colors.textDim};
  }

  &:focus {
    border-color: ${theme.colors.primary};
  }
`;

const SendBtn = styled.button<{ $sending: boolean }>`
  padding: 10px 16px;
  border-radius: ${theme.radii.md};
  background: ${theme.colors.primary};
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  border: none;
  cursor: ${({ $sending }) => ($sending ? "not-allowed" : "pointer")};
  opacity: ${({ $sending }) => ($sending ? 0.6 : 1)};
  transition: opacity 0.15s;
  white-space: nowrap;

  &:hover:not(:disabled) {
    opacity: 0.85;
  }
`;

function colorForUser(userId: string) {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

function getInitials(username: string) {
  return username.slice(0, 2).toUpperCase();
}

export default function ChatArea({ messages, onSendMessage, currentUserId }: Props) {
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    setInput("");
    try {
      await onSendMessage(text);
    } finally {
      setSending(false);
    }
  }

  return (
    <Wrapper>
      <Top>
        <VoiceWidget activeCount={2} />
      </Top>

      <MessagesArea>
        <SystemMsg>💬 ยินดีต้อนรับสู่ห้อง Party!</SystemMsg>
        {messages.map((msg) => (
          <BubbleRow key={msg.id} $isSelf={msg.isSelf}>
            <AvatarCircle $color={colorForUser(msg.userId)}>
              {getInitials(msg.username)}
            </AvatarCircle>
            <BubbleContent $isSelf={msg.isSelf}>
              <MetaLine>
                <BubbleUsername>{msg.username}</BubbleUsername>
                <BubbleTime>{msg.time}</BubbleTime>
              </MetaLine>
              <Bubble $isSelf={msg.isSelf}>{msg.text}</Bubble>
            </BubbleContent>
          </BubbleRow>
        ))}
        <div ref={bottomRef} />
      </MessagesArea>

      <InputRow>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void handleSend();
            }
          }}
          placeholder="พิมพ์ข้อความ... (Enter เพื่อส่ง)"
          disabled={sending}
        />
        <SendBtn $sending={sending} onClick={() => void handleSend()} disabled={sending}>
          {sending ? "..." : "ส่ง"}
        </SendBtn>
      </InputRow>
    </Wrapper>
  );
}
