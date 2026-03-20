"use client";

import { useState, useMemo } from "react";
import styled from "styled-components";
import { Search } from "lucide-react";
import { theme } from "@/styles/theme";
import type { Party } from "@/types";
import { MOCK_PARTIES } from "@/lib/mock-data";
import SearchFilters, { SearchFilterState } from "@/components/search/SearchFilters";
import SearchResults from "@/components/search/SearchResults";

const DEFAULT_FILTERS: SearchFilterState = {
  game: "",
  joinMode: "",
  statuses: [],
  minRating: "",
};

const Page = styled.main`
  min-height: 100vh;
  background: ${theme.colors.bg};
  padding: 32px 24px 64px;

  @media (max-width: 768px) {
    padding: 20px 16px 48px;
  }
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  margin-bottom: 24px;
`;

const PageTitle = styled.h1`
  font-size: 26px;
  font-weight: 800;
  color: ${theme.colors.text};
  margin-bottom: 4px;

  @media (max-width: 480px) {
    font-size: 20px;
  }
`;

const PageSub = styled.p`
  font-size: 14px;
  color: ${theme.colors.textMuted};
`;

const SearchInputWrapper = styled.div`
  position: relative;
  margin-bottom: 28px;
`;

const SearchIcon = styled.span`
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: ${theme.colors.textMuted};
  display: flex;
  align-items: center;
  pointer-events: none;
`;

const SearchInput = styled.input`
  width: 100%;
  background: ${theme.colors.bgCard};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  padding: 12px 16px 12px 42px;
  font-size: 15px;
  color: ${theme.colors.text};
  outline: none;
  transition: border-color 0.15s;
  box-sizing: border-box;

  &::placeholder {
    color: ${theme.colors.textDim};
  }

  &:focus {
    border-color: ${theme.colors.primary};
  }
`;

const Layout = styled.div`
  display: flex;
  gap: 24px;
  align-items: flex-start;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

function applyFilters(
  parties: Party[],
  text: string,
  filters: SearchFilterState
): Party[] {
  return parties.filter((p) => {
    // Text search
    if (text.trim()) {
      const q = text.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchHost = (p.host_name ?? "").toLowerCase().includes(q);
      if (!matchTitle && !matchHost) return false;
    }

    // Game filter
    if (filters.game && p.game !== filters.game) return false;

    // Join mode filter
    if (filters.joinMode && p.join_mode !== filters.joinMode) return false;

    // Status filter (multi-select, OR logic)
    if (filters.statuses.length > 0) {
      const isFull = p.status === "full" || p.current_members >= p.max_members;
      const isPending = p.join_mode === "approve" && p.status === "open";
      const isOpen = p.status === "open";

      const matches = filters.statuses.some((s) => {
        if (s === "full") return isFull;
        if (s === "pending") return isPending;
        if (s === "open") return isOpen;
        return false;
      });
      if (!matches) return false;
    }

    // Min rating — no rating data yet, skip filtering
    return true;
  });
}

export default function SearchPage() {
  const [text, setText] = useState("");
  const [filters, setFilters] = useState<SearchFilterState>(DEFAULT_FILTERS);
  const [appliedText, setAppliedText] = useState("");
  const [appliedFilters, setAppliedFilters] = useState<SearchFilterState>(DEFAULT_FILTERS);

  const results = useMemo(
    () => applyFilters(MOCK_PARTIES, appliedText, appliedFilters),
    [appliedText, appliedFilters]
  );

  const handleSearch = () => {
    setAppliedText(text);
    setAppliedFilters(filters);
  };

  const handleReset = () => {
    setText("");
    setFilters(DEFAULT_FILTERS);
    setAppliedText("");
    setAppliedFilters(DEFAULT_FILTERS);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <Page>
      <Container>
        <PageHeader>
          <PageTitle>🔍 ค้นหา Party</PageTitle>
          <PageSub>ค้นหาปาร์ตี้เกมที่ใช่สำหรับคุณ</PageSub>
        </PageHeader>

        <SearchInputWrapper>
          <SearchIcon>
            <Search size={16} />
          </SearchIcon>
          <SearchInput
            type="text"
            placeholder="ค้นหา ชื่อ party, ผู้นำ..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </SearchInputWrapper>

        <Layout>
          <SearchFilters
            filters={filters}
            onChange={setFilters}
            onSearch={handleSearch}
            onReset={handleReset}
          />
          <SearchResults parties={results} />
        </Layout>
      </Container>
    </Page>
  );
}
