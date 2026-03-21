"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import styled, { keyframes } from "styled-components";
import { Search } from "lucide-react";
import { theme } from "@/styles/theme";
import type { Party } from "@/types";
import SearchFilters, { SearchFilterState } from "@/components/search/SearchFilters";
import SearchResults from "@/components/search/SearchResults";
import AuthGuard from "@/components/auth/AuthGuard";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ApiParty {
  id: string;
  title: string;
  status: string;
  join_mode: string;
  host_id: string;
  max_members: number;
  current_members?: number;
  game_id: string | null;
  description?: string | null;
  games?: { name: string; cover_url: string | null } | null;
  memberships?: Array<{ count: number }>;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const DEFAULT_FILTERS: SearchFilterState = {
  game: "",
  joinMode: "",
  statuses: [],
  minRating: "",
};

// ---------------------------------------------------------------------------
// Styled components
// ---------------------------------------------------------------------------

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

  &::placeholder { color: ${theme.colors.textDim}; }
  &:focus { border-color: ${theme.colors.primary}; }
`;

const Layout = styled.div`
  display: flex;
  gap: 24px;
  align-items: flex-start;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const SkeletonGrid = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 14px;
  }
`;

const SkeletonCard = styled.div`
  height: 200px;
  border-radius: ${theme.radii.lg};
  background: linear-gradient(
    90deg,
    ${theme.colors.bgCard} 25%,
    ${theme.colors.bgHover} 50%,
    ${theme.colors.bgCard} 75%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.4s infinite;
`;

const ErrorBox = styled.div`
  flex: 1;
  background: ${theme.colors.bgCard};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  padding: 48px 24px;
  text-align: center;
`;

const ErrorText = styled.p`
  font-size: 14px;
  color: ${theme.colors.textMuted};
  margin-bottom: 16px;
`;

const RetryBtn = styled.button`
  padding: 8px 20px;
  border-radius: ${theme.radii.md};
  border: 1px solid ${theme.colors.primary};
  background: transparent;
  color: ${theme.colors.primary};
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
  &:hover { background: ${theme.colors.primary}; color: #fff; }
`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mapJoinMode(apiMode: string): "auto" | "approve" {
  return apiMode === "open" ? "auto" : "approve";
}

function mapApiParty(p: ApiParty): Party {
  const memberCount =
    p.current_members ??
    (Array.isArray(p.memberships) ? (p.memberships[0]?.count ?? 0) : 0);

  const rawStatus = p.status;
  const status: "open" | "full" | "closed" =
    rawStatus === "full" || rawStatus === "closed" ? rawStatus : "open";

  return {
    id: p.id,
    title: p.title,
    game: p.game_id ?? "",
    game_name: p.games?.name ?? "",
    host_id: p.host_id,
    max_members: p.max_members,
    current_members: memberCount,
    status,
    description: p.description ?? undefined,
    language: "th",
    join_mode: mapJoinMode(p.join_mode),
    created_at: p.created_at,
  };
}

function applyFilters(
  parties: Party[],
  text: string,
  filters: SearchFilterState
): Party[] {
  return parties.filter((p) => {
    if (text.trim()) {
      const q = text.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchHost = (p.host_name ?? "").toLowerCase().includes(q);
      const matchGame = (p.game_name ?? p.game).toLowerCase().includes(q);
      if (!matchTitle && !matchHost && !matchGame) return false;
    }

    if (filters.game) {
      const gameName = (p.game_name ?? p.game).toLowerCase();
      if (!gameName.includes(filters.game.toLowerCase())) return false;
    }

    if (filters.joinMode && p.join_mode !== filters.joinMode) return false;

    if (filters.minRating) {
      const minR = parseFloat(filters.minRating);
      if (!isNaN(minR) && minR > 0) {
        if ((p.host_rating ?? 0) < minR) return false;
      }
    }

    if (filters.statuses.length > 0) {
      const isFull = p.status === "full" || p.current_members >= p.max_members;
      const isOpen = p.status === "open" && !isFull;
      const isPending = p.join_mode === "approve" && isOpen;

      const matches = filters.statuses.some((s) => {
        if (s === "full") return isFull;
        if (s === "pending") return isPending;
        if (s === "open") return isOpen;
        return false;
      });
      if (!matches) return false;
    }

    return true;
  });
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function LoadingSkeleton() {
  return (
    <SkeletonGrid>
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </SkeletonGrid>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <ErrorBox>
      <ErrorText>{message}</ErrorText>
      <RetryBtn onClick={onRetry}>ลองใหม่</RetryBtn>
    </ErrorBox>
  );
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function SearchPage() {
  const [text, setText] = useState("");
  const [filters, setFilters] = useState<SearchFilterState>(DEFAULT_FILTERS);
  const [appliedText, setAppliedText] = useState("");
  const [appliedFilters, setAppliedFilters] = useState<SearchFilterState>(DEFAULT_FILTERS);

  const [allParties, setAllParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchParties = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/parties?page=0");
      if (!res.ok) throw new Error("fetch failed");
      const json = (await res.json()) as { data: ApiParty[] };
      setAllParties((json.data ?? []).map(mapApiParty));
    } catch {
      setError("ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchParties();
  }, [fetchParties]);

  const results = useMemo(
    () => applyFilters(allParties, appliedText, appliedFilters),
    [allParties, appliedText, appliedFilters]
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
    <AuthGuard>
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
            {loading ? (
              <LoadingSkeleton />
            ) : error ? (
              <ErrorState message={error} onRetry={fetchParties} />
            ) : (
              <SearchResults parties={results} />
            )}
          </Layout>
        </Container>
      </Page>
    </AuthGuard>
  );
}
