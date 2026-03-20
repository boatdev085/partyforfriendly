import styled from "styled-components";
import { theme } from "@/styles/theme";

interface Props {
  activeCount: number;
  discordLink?: string;
}

const Widget = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: ${theme.colors.bgCard};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
`;

const Info = styled.div`
  flex: 1;
  min-width: 0;
`;

const Label = styled.div`
  font-size: 12px;
  color: ${theme.colors.textMuted};
  margin-bottom: 4px;
`;

const Chips = styled.div`
  display: flex;
  gap: 4px;
`;

const Chip = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${theme.colors.primary};
  border: 2px solid ${theme.colors.bgCard};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  color: #fff;
`;

const JoinBtn = styled.button`
  padding: 7px 14px;
  border-radius: ${theme.radii.md};
  background: #5865f2;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  transition: opacity 0.15s;

  &:hover {
    opacity: 0.85;
  }
`;

export default function VoiceWidget({ activeCount, discordLink }: Props) {
  const chipLabels = Array.from({ length: Math.min(activeCount, 4) }, (_, i) =>
    String.fromCharCode(65 + i)
  );

  return (
    <Widget>
      <Info>
        <Label>
          {activeCount} คนคุยอยู่ · Discord session เดิม
        </Label>
        <Chips>
          {chipLabels.map((label, i) => (
            <Chip key={i}>{label}</Chip>
          ))}
        </Chips>
      </Info>
      <JoinBtn
        onClick={() => {
          if (discordLink) window.open(discordLink, "_blank");
        }}
      >
        Join Voice
      </JoinBtn>
    </Widget>
  );
}
