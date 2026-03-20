"use client";

import { useState } from "react";
import styled from "styled-components";
import { theme } from "@/styles/theme";

const Card = styled.div`
  background: ${theme.colors.bgCard};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const SectionTitle = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: ${theme.colors.text};
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FieldLabel = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: ${theme.colors.textMuted};
`;

const ToggleRow = styled.div`
  display: flex;
  gap: 8px;
`;

const ToggleBtn = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 9px 12px;
  border-radius: ${theme.radii.md};
  border: 1px solid
    ${({ $active }) => ($active ? theme.colors.primary : theme.colors.border)};
  background: ${({ $active }) =>
    $active ? theme.colors.primaryGlow : "transparent"};
  color: ${({ $active }) =>
    $active ? theme.colors.primary : theme.colors.textMuted};
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    border-color: ${theme.colors.primary};
    color: ${theme.colors.primary};
  }
`;

const MaxMembersRow = styled.div`
  display: flex;
  gap: 8px;
`;

const MaxBtn = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 9px 4px;
  border-radius: ${theme.radii.md};
  border: 1px solid
    ${({ $active }) => ($active ? theme.colors.primary : theme.colors.border)};
  background: ${({ $active }) =>
    $active ? theme.colors.primaryGlow : "transparent"};
  color: ${({ $active }) =>
    $active ? theme.colors.primary : theme.colors.textMuted};
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    border-color: ${theme.colors.primary};
    color: ${theme.colors.primary};
  }
`;

const TextInput = styled.input`
  width: 100%;
  padding: 9px 12px;
  background: ${theme.colors.bg};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  color: ${theme.colors.text};
  font-size: 14px;
  font-family: ${theme.fonts.sans};
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.15s;

  &:focus {
    border-color: ${theme.colors.primary};
  }

  &::placeholder {
    color: ${theme.colors.textDim};
  }
`;

const SaveBtn = styled.button`
  padding: 10px 20px;
  border-radius: ${theme.radii.md};
  background: ${theme.colors.primary};
  border: none;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  align-self: flex-start;
  transition: background 0.15s;

  &:hover {
    background: ${theme.colors.primaryHover};
  }
`;

type JoinMode = "auto" | "approve";

interface PartySettingsProps {
  initialJoinMode?: JoinMode;
  initialMaxMembers?: number;
  initialDiscord?: string;
  onSave?: (settings: {
    joinMode: JoinMode;
    maxMembers: number;
    discord: string;
  }) => void;
}

export default function PartySettings({
  initialJoinMode = "auto",
  initialMaxMembers = 5,
  initialDiscord = "",
  onSave,
}: PartySettingsProps) {
  const [joinMode, setJoinMode] = useState<JoinMode>(initialJoinMode);
  const [maxMembers, setMaxMembers] = useState(initialMaxMembers);
  const [discord, setDiscord] = useState(initialDiscord);

  const handleSave = () => {
    onSave?.({ joinMode, maxMembers, discord });
  };

  return (
    <Card>
      <SectionTitle>⚙️ ตั้งค่าห้อง</SectionTitle>

      <FieldGroup>
        <FieldLabel>Join Mode</FieldLabel>
        <ToggleRow>
          <ToggleBtn
            $active={joinMode === "auto"}
            onClick={() => setJoinMode("auto")}
          >
            🔓 Auto
          </ToggleBtn>
          <ToggleBtn
            $active={joinMode === "approve"}
            onClick={() => setJoinMode("approve")}
          >
            🔒 Approve
          </ToggleBtn>
        </ToggleRow>
      </FieldGroup>

      <FieldGroup>
        <FieldLabel>Max Members</FieldLabel>
        <MaxMembersRow>
          {[3, 4, 5, 6].map((n) => (
            <MaxBtn
              key={n}
              $active={maxMembers === n}
              onClick={() => setMaxMembers(n)}
            >
              {n}
            </MaxBtn>
          ))}
        </MaxMembersRow>
      </FieldGroup>

      <FieldGroup>
        <FieldLabel>Discord Voice Channel</FieldLabel>
        <TextInput
          type="text"
          placeholder="discord.gg/xxxxxxx"
          value={discord}
          onChange={(e) => setDiscord(e.target.value)}
        />
      </FieldGroup>

      <SaveBtn onClick={handleSave}>💾 Save</SaveBtn>
    </Card>
  );
}
