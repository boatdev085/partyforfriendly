"use client";

import styled from "styled-components";
import { theme } from "@/styles/theme";

export interface PartyHistoryEntry {
  id: string;
  icon: string;
  name: string;
  relativeDate: string;
  memberCount: string;
}

interface Props {
  entries: PartyHistoryEntry[];
}

const Wrapper = styled.div`
  background: ${theme.colors.bgCard};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  padding: 20px 24px;
`;

const Title = styled.h2`
  font-size: 15px;
  font-weight: 700;
  color: ${theme.colors.text};
  margin: 0 0 16px;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: ${theme.colors.bgHover};
  border-radius: ${theme.radii.md};
`;

const Icon = styled.span`
  font-size: 20px;
  flex-shrink: 0;
`;

const Info = styled.div`
  flex: 1;
  min-width: 0;
`;

const PartyName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Meta = styled.div`
  font-size: 12px;
  color: ${theme.colors.textMuted};
  margin-top: 2px;
`;

const CompletedBadge = styled.span`
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: ${theme.radii.sm};
  color: ${theme.colors.success};
  background: rgba(34, 197, 94, 0.12);
  flex-shrink: 0;
`;

export default function PartyHistory({ entries }: Props) {
  return (
    <Wrapper>
      <Title>📜 Party History</Title>
      <List>
        {entries.map((e) => (
          <Row key={e.id}>
            <Icon>{e.icon}</Icon>
            <Info>
              <PartyName>{e.name}</PartyName>
              <Meta>
                {e.relativeDate} · {e.memberCount}
              </Meta>
            </Info>
            <CompletedBadge>Completed</CompletedBadge>
          </Row>
        ))}
      </List>
    </Wrapper>
  );
}
