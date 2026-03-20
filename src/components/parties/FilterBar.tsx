"use client";

import { useState } from "react";
import styled from "styled-components";
import { theme } from "@/styles/theme";
import type { Party } from "@/types";

interface Props {
  parties: Party[];
  onFilter: (filtered: Party[]) => void;
}

const GAME_CHIPS = [
  { key: "all", label: "ทั้งหมด" },
  { key: "rov", label: "⚔️ ROV" },
  { key: "valorant", label: "🔫 Valorant" },
  { key: "pubg", label: "🪖 PUBG" },
  { key: "freefire", label: "🔥 Free Fire" },
  { key: "open", label: "🟢 เปิดอยู่" },
];

const Wrapper = styled.div`
  margin-bottom: 20px;
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const ChipScroll = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  flex: 1;
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const Chip = styled.button<{ $active: boolean }>`
  font-size: 12px;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: ${theme.radii.full};
  border: 1px solid ${({ $active }) => ($active ? theme.colors.primary : theme.colors.border)};
  background: ${({ $active }) => ($active ? theme.colors.primary : "transparent")};
  color: ${({ $active }) => ($active ? "#fff" : theme.colors.textMuted)};
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;

  &:hover {
    border-color: ${theme.colors.primary};
    color: ${({ $active }) => ($active ? "#fff" : theme.colors.primary)};
  }
`;

const FilterBtn = styled.button<{ $open: boolean }>`
  font-size: 12px;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: ${theme.radii.full};
  border: 1px solid ${({ $open }) => ($open ? theme.colors.primary : theme.colors.border)};
  background: ${({ $open }) => ($open ? theme.colors.primaryGlow : "transparent")};
  color: ${({ $open }) => ($open ? theme.colors.primary : theme.colors.textMuted)};
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: all 0.15s;
`;

const AdvancedPanel = styled.div<{ $open: boolean }>`
  overflow: hidden;
  max-height: ${({ $open }) => ($open ? "300px" : "0")};
  transition: max-height 0.25s ease;
`;

const PanelInner = styled.div`
  background: ${theme.colors.bgCard};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FilterLabel = styled.span`
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${theme.colors.textMuted};
`;

const CheckRow = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const CheckItem = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: ${theme.colors.text};
  cursor: pointer;

  input {
    accent-color: ${theme.colors.primary};
    cursor: pointer;
  }
`;

export default function FilterBar({ parties, onFilter }: Props) {
  const [activeGame, setActiveGame] = useState("all");
  const [panelOpen, setPanelOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<Set<string>>(
    new Set(["open", "full", "closed"])
  );
  const [joinMode, setJoinMode] = useState("all");

  const applyFilters = (game: string, statuses: Set<string>, mode: string) => {
    let result = [...parties];

    if (game === "open") {
      result = result.filter((p) => p.status === "open");
    } else if (game !== "all") {
      result = result.filter((p) => p.game === game);
    }

    result = result.filter((p) => statuses.has(p.status));

    if (mode !== "all") {
      result = result.filter((p) => p.join_mode === mode);
    }

    onFilter(result);
  };

  const handleGameChip = (key: string) => {
    setActiveGame(key);
    applyFilters(key, statusFilter, joinMode);
  };

  const toggleStatus = (s: string) => {
    const next = new Set(statusFilter);
    if (next.has(s)) {
      next.delete(s);
    } else {
      next.add(s);
    }
    setStatusFilter(next);
    applyFilters(activeGame, next, joinMode);
  };

  const handleJoinMode = (mode: string) => {
    setJoinMode(mode);
    applyFilters(activeGame, statusFilter, mode);
  };

  return (
    <Wrapper>
      <TopRow>
        <ChipScroll>
          {GAME_CHIPS.map((c) => (
            <Chip key={c.key} $active={activeGame === c.key} onClick={() => handleGameChip(c.key)}>
              {c.label}
            </Chip>
          ))}
        </ChipScroll>
        <FilterBtn $open={panelOpen} onClick={() => setPanelOpen((v) => !v)}>
          🔍 Filter
        </FilterBtn>
      </TopRow>

      <AdvancedPanel $open={panelOpen}>
        <PanelInner>
          <FilterGroup>
            <FilterLabel>Status</FilterLabel>
            <CheckRow>
              {(["open", "full", "closed"] as const).map((s) => (
                <CheckItem key={s}>
                  <input
                    type="checkbox"
                    checked={statusFilter.has(s)}
                    onChange={() => toggleStatus(s)}
                  />
                  {s.toUpperCase()}
                </CheckItem>
              ))}
            </CheckRow>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Join Mode</FilterLabel>
            <CheckRow>
              {(["all", "auto", "approve"] as const).map((m) => (
                <CheckItem key={m}>
                  <input
                    type="radio"
                    name="joinMode"
                    value={m}
                    checked={joinMode === m}
                    onChange={() => handleJoinMode(m)}
                  />
                  {m === "all" ? "All" : m === "auto" ? "🔓 Auto" : "🔒 Approve"}
                </CheckItem>
              ))}
            </CheckRow>
          </FilterGroup>
        </PanelInner>
      </AdvancedPanel>
    </Wrapper>
  );
}
