"use client";

import styled from "styled-components";
import { theme } from "@/styles/theme";

export interface SearchFilterState {
  game: string;
  joinMode: string;
  statuses: string[];
  minRating: string;
}

interface Props {
  filters: SearchFilterState;
  onChange: (filters: SearchFilterState) => void;
  onSearch: () => void;
  onReset: () => void;
}

const Panel = styled.aside`
  background: ${theme.colors.bgCard};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  padding: 20px;
  width: 280px;
  flex-shrink: 0;
  align-self: flex-start;
  position: sticky;
  top: 20px;

  @media (max-width: 768px) {
    width: 100%;
    position: static;
  }
`;

const FilterGroup = styled.div`
  margin-bottom: 20px;

  &:last-of-type {
    margin-bottom: 0;
  }
`;

const FilterLabel = styled.p`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: ${theme.colors.textMuted};
  margin-bottom: 10px;
`;

const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Chip = styled.button<{ $active: boolean }>`
  font-size: 12px;
  font-weight: 600;
  padding: 5px 12px;
  border-radius: ${theme.radii.full};
  border: 1px solid
    ${({ $active }) => ($active ? theme.colors.primary : theme.colors.border)};
  background: ${({ $active }) =>
    $active ? `${theme.colors.primary}22` : "transparent"};
  color: ${({ $active }) =>
    $active ? theme.colors.primary : theme.colors.textMuted};
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    border-color: ${theme.colors.primary};
    color: ${theme.colors.primary};
  }
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${theme.colors.border};
  margin: 20px 0;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 20px;
`;

const ResetBtn = styled.button`
  flex: 1;
  padding: 10px;
  border-radius: ${theme.radii.md};
  font-size: 13px;
  font-weight: 600;
  border: 1px solid ${theme.colors.border};
  background: transparent;
  color: ${theme.colors.textMuted};
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    border-color: ${theme.colors.borderLight};
    color: ${theme.colors.text};
  }
`;

const SearchBtn = styled.button`
  flex: 2;
  padding: 10px;
  border-radius: ${theme.radii.md};
  font-size: 13px;
  font-weight: 700;
  border: none;
  background: ${theme.colors.primary};
  color: #fff;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: ${theme.colors.primaryHover};
  }
`;

const GAMES = [
  { value: "", label: "All" },
  { value: "rov", label: "⚔️ ROV" },
  { value: "valorant", label: "🔫 Valorant" },
  { value: "pubg", label: "🪖 PUBG" },
  { value: "freefire", label: "🔥 Free Fire" },
];

const JOIN_MODES = [
  { value: "", label: "All" },
  { value: "auto", label: "🔓 Auto" },
  { value: "approve", label: "🔒 Approve" },
];

const STATUSES = [
  { value: "open", label: "🟢 Open" },
  { value: "pending", label: "🟡 Pending" },
  { value: "full", label: "🔴 Full" },
];

const RATINGS = [
  { value: "", label: "All" },
  { value: "3.0", label: "3.0+" },
  { value: "4.0", label: "4.0+" },
  { value: "4.5", label: "4.5+" },
];

export default function SearchFilters({ filters, onChange, onSearch, onReset }: Props) {
  const toggleStatus = (value: string) => {
    const next = filters.statuses.includes(value)
      ? filters.statuses.filter((s) => s !== value)
      : [...filters.statuses, value];
    onChange({ ...filters, statuses: next });
  };

  return (
    <Panel>
      <FilterGroup>
        <FilterLabel>Game</FilterLabel>
        <ChipRow>
          {GAMES.map((g) => (
            <Chip
              key={g.value}
              $active={filters.game === g.value}
              onClick={() => onChange({ ...filters, game: g.value })}
            >
              {g.label}
            </Chip>
          ))}
        </ChipRow>
      </FilterGroup>

      <Divider />

      <FilterGroup>
        <FilterLabel>Join Mode</FilterLabel>
        <ChipRow>
          {JOIN_MODES.map((m) => (
            <Chip
              key={m.value}
              $active={filters.joinMode === m.value}
              onClick={() => onChange({ ...filters, joinMode: m.value })}
            >
              {m.label}
            </Chip>
          ))}
        </ChipRow>
      </FilterGroup>

      <Divider />

      <FilterGroup>
        <FilterLabel>Status</FilterLabel>
        <ChipRow>
          {STATUSES.map((s) => (
            <Chip
              key={s.value}
              $active={filters.statuses.includes(s.value)}
              onClick={() => toggleStatus(s.value)}
            >
              {s.label}
            </Chip>
          ))}
        </ChipRow>
      </FilterGroup>

      <Divider />

      <FilterGroup>
        <FilterLabel>Min Leader Rating</FilterLabel>
        <ChipRow>
          {RATINGS.map((r) => (
            <Chip
              key={r.value}
              $active={filters.minRating === r.value}
              onClick={() => onChange({ ...filters, minRating: r.value })}
            >
              {r.label}
            </Chip>
          ))}
        </ChipRow>
      </FilterGroup>

      <ButtonRow>
        <ResetBtn onClick={onReset}>Reset</ResetBtn>
        <SearchBtn onClick={onSearch}>🔍 ค้นหา</SearchBtn>
      </ButtonRow>
    </Panel>
  );
}
