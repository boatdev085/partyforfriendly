import styled from "styled-components";
import { theme } from "@/styles/theme";

export interface Member {
  id: string;
  username: string;
  isLeader: boolean;
  isOnline: boolean;
  rating: number;
  isSelf?: boolean;
}

interface Props {
  members: Member[];
  maxMembers: number;
}

const avatarColors = [
  "#7c6aff",
  "#00d4aa",
  "#f59e0b",
  "#ef4444",
  "#5865f2",
  "#22c55e",
];

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: ${theme.radii.md};
  background: ${theme.colors.bgHover};
`;

const EmptyRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: ${theme.radii.md};
  border: 1px dashed ${theme.colors.border};
  color: ${theme.colors.textDim};
  font-size: 13px;
`;

const Avatar = styled.div<{ $color: string }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
`;

const Info = styled.div`
  flex: 1;
  min-width: 0;
`;

const NameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const Username = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: ${theme.colors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const OnlineDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${theme.colors.success};
  display: inline-block;
  flex-shrink: 0;
`;

const LeaderIcon = styled.span`
  font-size: 13px;
`;

const SelfTag = styled.span`
  font-size: 10px;
  font-weight: 700;
  color: ${theme.colors.primary};
  background: ${theme.colors.primaryGlow};
  padding: 1px 6px;
  border-radius: ${theme.radii.sm};
`;

const Rating = styled.span`
  font-size: 12px;
  color: ${theme.colors.warning};
  white-space: nowrap;
  flex-shrink: 0;
`;

function getInitials(username: string) {
  return username.slice(0, 2).toUpperCase();
}

export default function MembersList({ members, maxMembers }: Props) {
  const emptySlots = maxMembers - members.length;

  return (
    <Wrapper>
      {members.map((member, i) => (
        <Row key={member.id}>
          <Avatar $color={avatarColors[i % avatarColors.length]}>
            {getInitials(member.username)}
          </Avatar>
          <Info>
            <NameRow>
              <Username>{member.username}</Username>
              {member.isOnline && <OnlineDot />}
              {member.isLeader && <LeaderIcon>👑</LeaderIcon>}
              {member.isSelf && <SelfTag>YOU</SelfTag>}
            </NameRow>
          </Info>
          <Rating>⭐ {member.rating.toFixed(1)}</Rating>
        </Row>
      ))}
      {Array.from({ length: emptySlots }).map((_, i) => (
        <EmptyRow key={`empty-${i}`}>+ รอสมาชิก</EmptyRow>
      ))}
    </Wrapper>
  );
}
