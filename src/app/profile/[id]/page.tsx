"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import styled, { keyframes } from "styled-components";
import { theme } from "@/styles/theme";
import ProfileHeader from "@/components/profile/ProfileHeader";
import StatsRow from "@/components/profile/StatsRow";
import GamesList, { GameEntry } from "@/components/profile/GamesList";
import RatingOverview from "@/components/profile/RatingOverview";
import PartyHistory, { PartyHistoryEntry } from "@/components/profile/PartyHistory";
import AuthGuard from "@/components/auth/AuthGuard";

// ---------------------------------------------------------------------------
// Styled components — page layout
// ---------------------------------------------------------------------------

const PageWrapper = styled.div`
  min-height: 100vh;
  background: ${theme.colors.bg};
  font-family: ${theme.fonts.sans};
  padding: 32px 16px 48px;

  @media (max-width: 768px) {
    padding: 20px 12px 40px;
  }
`;

const Inner = styled.div`
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
`;

const SkeletonBlock = styled.div<{ $h?: string }>`
  height: ${({ $h }) => $h ?? "120px"};
  background: ${theme.colors.bgCard};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

const NotFound = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: ${theme.colors.textMuted};
  font-size: 16px;
`;

const BadgesSection = styled.div`
  background: ${theme.colors.bgCard};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  padding: 20px 24px;
`;

const BadgesTitle = styled.h2`
  font-size: 15px;
  font-weight: 700;
  color: ${theme.colors.text};
  margin: 0 0 14px;
`;

const BadgesEmpty = styled.p`
  font-size: 13px;
  color: ${theme.colors.textMuted};
  margin: 0;
`;

const BadgesList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const BadgeItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 14px;
  background: ${theme.colors.bgHover};
  border-radius: ${theme.radii.md};
  min-width: 72px;
  cursor: default;
`;

const BadgeIcon = styled.span`
  font-size: 24px;
`;

const BadgeName = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: ${theme.colors.textMuted};
  text-align: center;
`;

// ---------------------------------------------------------------------------
// Styled components — Modal overlay + dialog
// ---------------------------------------------------------------------------

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
`;

const ModalBox = styled.div`
  background: ${theme.colors.bgCard};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  padding: 28px 24px 24px;
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ModalTitle = styled.h2`
  font-size: 17px;
  font-weight: 700;
  color: ${theme.colors.text};
  margin: 0;
`;

const Label = styled.label`
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: ${theme.colors.textMuted};
`;

const Input = styled.input`
  background: ${theme.colors.bg};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  padding: 10px 12px;
  font-size: 14px;
  color: ${theme.colors.text};
  outline: none;
  transition: border-color 0.15s;
  &:focus { border-color: ${theme.colors.primary}; }
`;

const Select = styled.select`
  background: ${theme.colors.bg};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  padding: 10px 12px;
  font-size: 14px;
  color: ${theme.colors.text};
  outline: none;
  transition: border-color 0.15s;
  &:focus { border-color: ${theme.colors.primary}; }
`;

const BtnRow = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
`;

const CancelBtn = styled.button`
  padding: 8px 18px;
  border-radius: ${theme.radii.md};
  border: 1px solid ${theme.colors.border};
  background: transparent;
  color: ${theme.colors.textMuted};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  &:hover { border-color: ${theme.colors.text}; color: ${theme.colors.text}; }
`;

const SaveBtn = styled.button`
  padding: 8px 20px;
  border-radius: ${theme.radii.md};
  border: none;
  background: ${theme.colors.primary};
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s;
  &:hover { opacity: 0.85; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface UserData {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  average_rating: number | null;
  party_count: number;
  rating_distribution?: Record<number, number>;
}

interface BadgeData {
  id: string;
  user_id: string;
  badge_id: string;
  awarded_at: string;
  badge: {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    icon_url: string | null;
  };
}

interface GameProfileData {
  id: string;
  game_id: string;
  in_game_name: string | null;
  rank: string | null;
  role: string | null;
  game: { id: string; name: string; slug: string; cover_url: string | null } | null;
}

interface PartyHistoryData {
  joined_at: string;
  party: {
    id: string;
    title: string;
    max_members: number;
    current_members: number;
    status: string;
    game: { name: string } | null;
  } | null;
}

interface GameRow {
  id: string;
  name: string;
  slug: string;
  cover_url: string | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function relativeDate(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days === 0) return "วันนี้";
  if (days === 1) return "เมื่อวาน";
  if (days < 7) return `${days} วันก่อน`;
  if (days < 30) return `${Math.floor(days / 7)} สัปดาห์ก่อน`;
  return `${Math.floor(days / 30)} เดือนก่อน`;
}

function gameIcon(name?: string | null): string {
  const n = (name ?? "").toLowerCase();
  if (n.includes("rov") || n.includes("arena")) return "⚔️";
  if (n.includes("valorant")) return "🔫";
  if (n.includes("pubg")) return "🪖";
  if (n.includes("genshin")) return "🌸";
  if (n.includes("minecraft")) return "⛏️";
  return "🎮";
}

function toGameEntries(profiles: GameProfileData[]): GameEntry[] {
  return profiles.map((p) => ({
    id: p.id,
    icon: gameIcon(p.game?.name),
    name: p.game?.name ?? "Unknown",
    inGameUsername: p.in_game_name ?? "-",
    server: "SEA",
    rank: p.rank ?? "-",
  }));
}

function toPartyHistory(items: PartyHistoryData[]): PartyHistoryEntry[] {
  return items
    .filter((item) => item.party !== null)
    .map((item) => ({
      id: item.party!.id,
      icon: gameIcon(item.party!.game?.name),
      name: item.party!.title,
      relativeDate: relativeDate(item.joined_at),
      memberCount: `${item.party!.current_members}/${item.party!.max_members}`,
    }));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ProfilePage() {
  const params = useParams();
  const { data: session } = useSession();

  const profileId = params?.id as string;

  const [user, setUser] = useState<UserData | null>(null);
  const [gameProfiles, setGameProfiles] = useState<GameProfileData[]>([]);
  const [partyHistory, setPartyHistory] = useState<PartyHistoryData[]>([]);
  const [badges, setBadges] = useState<BadgeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Edit profile modal state
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ display_name: "" });
  const [editSaving, setEditSaving] = useState(false);

  // Add game modal state
  const [addGameOpen, setAddGameOpen] = useState(false);
  const [availableGames, setAvailableGames] = useState<GameRow[]>([]);
  const [addGameForm, setAddGameForm] = useState({ game_id: "", in_game_name: "", rank: "" });
  const [addGameSaving, setAddGameSaving] = useState(false);

  const fetchProfile = useCallback(() => {
    if (!profileId) return;
    setLoading(true);
    setNotFound(false);
    Promise.all([
      fetch(`/api/users/${profileId}`).then((r) => r.json()),
      fetch(`/api/users/${profileId}/game-profiles`).then((r) => r.json()),
      fetch(`/api/users/${profileId}/party-history`).then((r) => r.json()),
      fetch(`/api/users/${profileId}/badges`).then((r) => r.json()),
    ])
      .then(([userRes, gpRes, phRes, badgesRes]) => {
        if (userRes.error === "user_not_found") { setNotFound(true); return; }
        setUser(userRes.data ?? null);
        setGameProfiles(gpRes.data ?? []);
        setPartyHistory(phRes.data ?? []);
        setBadges(badgesRes.data ?? []);
      })
      .catch((err) => console.error("[ProfilePage] fetch error", err))
      .finally(() => setLoading(false));
  }, [profileId]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  // isSelf: compare profileId with the logged-in user's Supabase UUID
  const sessionUserId = (session?.user as { id?: string })?.id;
  const isSelf = !!sessionUserId && sessionUserId === profileId;

  const displayName = user?.display_name ?? user?.username ?? "Unknown Player";

  const ratingAvg = user?.average_rating ?? 0;
  const ratingDist = (() => {
    const dist = user?.rating_distribution ?? {};
    const total = Object.values(dist).reduce((a, b) => a + b, 0);
    return [5, 4, 3, 2, 1].map((stars) => ({
      stars,
      percent: total > 0 ? Math.round(((dist[stars] ?? 0) / total) * 100) : 0,
    }));
  })();

  // Completion: closed parties / total parties in history
  const completion = partyHistory.length > 0
    ? Math.round((partyHistory.filter((p) => p.party?.status === "closed").length / partyHistory.length) * 100)
    : 0;

  // Open edit modal — prefill with current data
  const handleOpenEdit = () => {
    setEditForm({ display_name: user?.display_name ?? user?.username ?? "" });
    setEditOpen(true);
  };

  // Save display_name via PATCH /api/users/[id]
  const handleSaveEdit = async () => {
    if (!editForm.display_name.trim()) return;
    setEditSaving(true);
    try {
      const res = await fetch(`/api/users/${profileId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ display_name: editForm.display_name }),
      });
      if (!res.ok) throw new Error("patch failed");
      const json = await res.json() as { data: UserData };
      setUser((prev) => prev ? { ...prev, display_name: json.data.display_name } : prev);
      setEditOpen(false);
    } catch (err) {
      console.error("[ProfilePage] edit error", err);
    } finally {
      setEditSaving(false);
    }
  };

  // Open add-game modal — fetch available games
  const handleOpenAddGame = async () => {
    setAddGameForm({ game_id: "", in_game_name: "", rank: "" });
    setAddGameOpen(true);
    if (availableGames.length === 0) {
      try {
        const res = await fetch("/api/games");
        if (res.ok) {
          const json = await res.json() as GameRow[];
          setAvailableGames(json);
          if (json.length > 0) setAddGameForm((f) => ({ ...f, game_id: json[0].id }));
        }
      } catch (err) {
        console.error("[ProfilePage] fetch games error", err);
      }
    } else {
      setAddGameForm((f) => ({ ...f, game_id: availableGames[0]?.id ?? "" }));
    }
  };

  // Save game profile via POST /api/users/[id]/game-profiles
  const handleSaveGame = async () => {
    if (!addGameForm.game_id) return;
    setAddGameSaving(true);
    try {
      const res = await fetch(`/api/users/${profileId}/game-profiles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          game_id: addGameForm.game_id,
          in_game_name: addGameForm.in_game_name || null,
          rank: addGameForm.rank || null,
        }),
      });
      if (!res.ok) throw new Error("post failed");
      // Refresh game profiles
      const gpRes = await fetch(`/api/users/${profileId}/game-profiles`);
      const gpJson = await gpRes.json() as { data: GameProfileData[] };
      setGameProfiles(gpJson.data ?? []);
      setAddGameOpen(false);
    } catch (err) {
      console.error("[ProfilePage] add game error", err);
    } finally {
      setAddGameSaving(false);
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <PageWrapper>
          <Inner>
            <SkeletonBlock $h="180px" />
            <SkeletonBlock $h="100px" />
            <SkeletonBlock $h="160px" />
            <SkeletonBlock $h="200px" />
          </Inner>
        </PageWrapper>
      </AuthGuard>
    );
  }

  if (notFound) {
    return (
      <AuthGuard>
        <PageWrapper>
          <NotFound>ไม่พบผู้ใช้งานนี้ 😕</NotFound>
        </PageWrapper>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <PageWrapper>
        <Inner>
          <ProfileHeader
            username={displayName}
            bio={isSelf ? "โปรไฟล์ของคุณ" : `@${user?.username ?? ""}`}
            isSelf={isSelf}
            onEdit={handleOpenEdit}
            avatarUrl={user?.avatar_url}
          />
          <StatsRow
            parties={user?.party_count ?? 0}
            rating={ratingAvg}
            kicks={0}
            completion={completion}
          />
          <GamesList
            games={toGameEntries(gameProfiles)}
            isSelf={isSelf}
            onAdd={handleOpenAddGame}
          />
          <RatingOverview
            score={ratingAvg}
            totalReviews={user?.party_count ?? 0}
            distribution={ratingDist}
          />
          <PartyHistory entries={toPartyHistory(partyHistory)} />

          {/* ── Badges ── */}
          <BadgesSection>
            <BadgesTitle>🏅 เหรียญรางวัล</BadgesTitle>
            {badges.length === 0 ? (
              <BadgesEmpty>ยังไม่มีเหรียญรางวัล</BadgesEmpty>
            ) : (
              <BadgesList>
                {badges.map((ub) => (
                  <BadgeItem key={ub.id} title={ub.badge.description ?? ub.badge.name}>
                    <BadgeIcon>{ub.badge.icon_url ? "🏅" : "🎖️"}</BadgeIcon>
                    <BadgeName>{ub.badge.name}</BadgeName>
                  </BadgeItem>
                ))}
              </BadgesList>
            )}
          </BadgesSection>
        </Inner>
      </PageWrapper>

      {/* ── Edit Profile Modal ── */}
      {editOpen && (
        <Overlay onClick={() => setEditOpen(false)}>
          <ModalBox onClick={(e) => e.stopPropagation()}>
            <ModalTitle>✏️ แก้ไขโปรไฟล์</ModalTitle>
            <Label>
              ชื่อที่แสดง
              <Input
                value={editForm.display_name}
                onChange={(e) => setEditForm({ display_name: e.target.value })}
                placeholder="Display name"
                maxLength={50}
                autoFocus
              />
            </Label>
            <BtnRow>
              <CancelBtn onClick={() => setEditOpen(false)}>ยกเลิก</CancelBtn>
              <SaveBtn onClick={handleSaveEdit} disabled={editSaving || !editForm.display_name.trim()}>
                {editSaving ? "กำลังบันทึก…" : "บันทึก"}
              </SaveBtn>
            </BtnRow>
          </ModalBox>
        </Overlay>
      )}

      {/* ── Add Game Modal ── */}
      {addGameOpen && (
        <Overlay onClick={() => setAddGameOpen(false)}>
          <ModalBox onClick={(e) => e.stopPropagation()}>
            <ModalTitle>🎮 เพิ่มเกม</ModalTitle>
            <Label>
              เลือกเกม
              <Select
                value={addGameForm.game_id}
                onChange={(e) => setAddGameForm((f) => ({ ...f, game_id: e.target.value }))}
              >
                {availableGames.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </Select>
            </Label>
            <Label>
              ชื่อในเกม
              <Input
                value={addGameForm.in_game_name}
                onChange={(e) => setAddGameForm((f) => ({ ...f, in_game_name: e.target.value }))}
                placeholder="In-game name"
                maxLength={60}
              />
            </Label>
            <Label>
              Rank
              <Input
                value={addGameForm.rank}
                onChange={(e) => setAddGameForm((f) => ({ ...f, rank: e.target.value }))}
                placeholder="เช่น Diamond, Immortal"
                maxLength={40}
              />
            </Label>
            <BtnRow>
              <CancelBtn onClick={() => setAddGameOpen(false)}>ยกเลิก</CancelBtn>
              <SaveBtn onClick={handleSaveGame} disabled={addGameSaving || !addGameForm.game_id}>
                {addGameSaving ? "กำลังบันทึก…" : "เพิ่มเกม"}
              </SaveBtn>
            </BtnRow>
          </ModalBox>
        </Overlay>
      )}
    </AuthGuard>
  );
}
