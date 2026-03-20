"use client";

import styled from "styled-components";
import { theme } from "@/styles/theme";

export interface GameEntry {
  id: string;
  icon: string;
  name: string;
  inGameUsername: string;
  server: string;
  rank: string;
}

interface Props {
  games: GameEntry[];
  isSelf?: boolean;
  onAdd?: () => void;
}

const Wrapper = styled.div`
  background: ${theme.colors.bgCard};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  padding: 20px 24px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const Title = styled.h2`
  font-size: 15px;
  font-weight: 700;
  color: ${theme.colors.text};
  margin: 0;
`;

const AddBtn = styled.button`
  padding: 5px 12px;
  border-radius: ${theme.radii.md};
  background: transparent;
  border: 1px solid ${theme.colors.border};
  color: ${theme.colors.textMuted};
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    border-color: ${theme.colors.primary};
    color: ${theme.colors.primary};
  }
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const GameRow = styled.div`
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

const GameName = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: ${theme.colors.text};
  min-width: 80px;
`;

const Meta = styled.span`
  font-size: 13px;
  color: ${theme.colors.textMuted};
`;

export default function GamesList({ games, isSelf, onAdd }: Props) {
  return (
    <Wrapper>
      <Header>
        <Title>🎮 เกมที่เล่น</Title>
        {isSelf && <AddBtn onClick={onAdd}>+ เพิ่มเกม</AddBtn>}
      </Header>
      <List>
        {games.map((g) => (
          <GameRow key={g.id}>
            <Icon>{g.icon}</Icon>
            <GameName>{g.name}</GameName>
            <Meta>
              {g.inGameUsername} · {g.server} · {g.rank}
            </Meta>
          </GameRow>
        ))}
      </List>
    </Wrapper>
  );
}
