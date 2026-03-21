import styled from "styled-components";
import { theme } from "@/styles/theme";

interface Props {
  game: string;
  joinMode: string;
  current: number;
  max: number;
}

const Card = styled.div`
  background: ${theme.colors.bgCard};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  padding: 16px;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0;

  &:not(:last-child) {
    border-bottom: 1px solid ${theme.colors.border};
  }
`;

const Label = styled.span`
  font-size: 12px;
  color: ${theme.colors.textMuted};
`;

const Value = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: ${theme.colors.text};
`;

const GameTag = styled.span`
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: ${theme.colors.primary};
  background: ${theme.colors.primaryGlow};
  padding: 3px 8px;
  border-radius: ${theme.radii.sm};
`;

const Slots = styled.span<{ $isFull: boolean }>`
  font-size: 13px;
  font-weight: 700;
  color: ${({ $isFull }) => ($isFull ? theme.colors.full : theme.colors.accent)};
`;

export default function PartyInfoCard({ game, joinMode, current, max }: Props) {
  const isFull = current >= max;
  const modeLabel =
    joinMode === "open" || joinMode === "auto"
      ? "🔓 เปิด"
      : joinMode === "request"
      ? "🔒 ขออนุมัติ"
      : "🔒 Invite Only";

  return (
    <Card>
      <Row>
        <Label>เกม</Label>
        <GameTag>{game}</GameTag>
      </Row>
      <Row>
        <Label>การเข้าร่วม</Label>
        <Value>{modeLabel}</Value>
      </Row>
      <Row>
        <Label>สมาชิก</Label>
        <Slots $isFull={isFull}>
          {current}/{max}
        </Slots>
      </Row>
    </Card>
  );
}
