"use client";

import { useState, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { theme } from "@/styles/theme";
import toast, { Toaster } from "react-hot-toast";
import AuthGuard from "@/components/auth/AuthGuard";

// ─── Types ────────────────────────────────────────────────────────────────────

type Game = "rov" | "valorant" | "pubg" | "freefire" | "";
type JoinMode = "auto" | "approve";

interface FormData {
  partyName: string;
  game: Game;
  maxMembers: number;
  description: string;
  joinMode: JoinMode;
  discordLink: string;
  tags: string[];
}

interface FormErrors {
  partyName?: string;
  game?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const GAMES: { value: Game; label: string; icon: string }[] = [
  { value: "rov", label: "ROV", icon: "⚔️" },
  { value: "valorant", label: "Valorant", icon: "🔫" },
  { value: "pubg", label: "PUBG", icon: "🪖" },
  { value: "freefire", label: "Free Fire", icon: "🔥" },
];

const MEMBER_OPTIONS = [2, 3, 4, 5, 6, 10];

const PRESET_TAGS = ["Diamond+", "ไม่ toxic", "ซีเรียส", "สบายๆ"];

// ─── Styled Components ────────────────────────────────────────────────────────

const Page = styled.main`
  min-height: 100vh;
  background: ${theme.colors.bg};
  padding: 32px 24px 64px;

  @media (max-width: 768px) {
    padding: 20px 16px 48px;
  }
`;

const Container = styled.div`
  max-width: 640px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  margin-bottom: 24px;
`;

const PageTitle = styled.h1`
  font-size: 24px;
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

const Card = styled.div`
  background: ${theme.colors.bgCard};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 28px;

  @media (max-width: 480px) {
    padding: 20px 16px;
    gap: 22px;
  }
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const SectionLabel = styled.label`
  font-size: 13px;
  font-weight: 700;
  color: ${theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.06em;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const Input = styled.input<{ $hasError?: boolean }>`
  width: 100%;
  background: ${theme.colors.bg};
  border: 1.5px solid ${({ $hasError }) => ($hasError ? theme.colors.danger : theme.colors.border)};
  border-radius: ${theme.radii.md};
  padding: 11px 14px;
  font-size: 14px;
  color: ${theme.colors.text};
  font-family: ${theme.fonts.sans};
  outline: none;
  transition: border-color 0.15s;
  box-sizing: border-box;

  &::placeholder {
    color: ${theme.colors.textDim};
  }

  &:focus {
    border-color: ${({ $hasError }) => ($hasError ? theme.colors.danger : theme.colors.primary)};
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  background: ${theme.colors.bg};
  border: 1.5px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  padding: 11px 14px;
  font-size: 14px;
  color: ${theme.colors.text};
  font-family: ${theme.fonts.sans};
  outline: none;
  resize: vertical;
  min-height: 90px;
  transition: border-color 0.15s;
  box-sizing: border-box;

  &::placeholder {
    color: ${theme.colors.textDim};
  }

  &:focus {
    border-color: ${theme.colors.primary};
  }
`;

const Select = styled.select<{ $hasError?: boolean }>`
  width: 100%;
  background: ${theme.colors.bg};
  border: 1.5px solid ${({ $hasError }) => ($hasError ? theme.colors.danger : theme.colors.border)};
  border-radius: ${theme.radii.md};
  padding: 11px 14px;
  font-size: 14px;
  color: ${theme.colors.text};
  font-family: ${theme.fonts.sans};
  outline: none;
  cursor: pointer;
  appearance: none;
  transition: border-color 0.15s;
  box-sizing: border-box;

  &:focus {
    border-color: ${({ $hasError }) => ($hasError ? theme.colors.danger : theme.colors.primary)};
  }

  option {
    background: ${theme.colors.bgCard};
    color: ${theme.colors.text};
  }
`;

const SelectWrapper = styled.div`
  position: relative;

  &::after {
    content: "▾";
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: ${theme.colors.textMuted};
    pointer-events: none;
    font-size: 12px;
  }
`;

const ErrorMsg = styled.p`
  font-size: 12px;
  color: ${theme.colors.danger};
  margin-top: -4px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const ToggleBtn = styled.button<{ $active: boolean }>`
  padding: 8px 18px;
  border-radius: ${theme.radii.md};
  font-size: 14px;
  font-weight: 600;
  font-family: ${theme.fonts.sans};
  cursor: pointer;
  transition: all 0.15s;
  border: 2px solid ${({ $active }) => ($active ? theme.colors.primary : theme.colors.border)};
  background: ${({ $active }) => ($active ? theme.colors.primaryGlow : "transparent")};
  color: ${({ $active }) => ($active ? theme.colors.primary : theme.colors.textMuted)};

  &:hover {
    border-color: ${theme.colors.primary};
    color: ${theme.colors.primary};
  }
`;

const JoinModeGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;

  @media (max-width: 380px) {
    grid-template-columns: 1fr;
  }
`;

const JoinCard = styled.button<{ $active: boolean }>`
  padding: 16px;
  border-radius: ${theme.radii.md};
  border: 2px solid ${({ $active }) => ($active ? theme.colors.primary : theme.colors.border)};
  background: ${({ $active }) => ($active ? theme.colors.primaryGlow : "transparent")};
  cursor: pointer;
  text-align: left;
  transition: all 0.15s;
  font-family: ${theme.fonts.sans};

  &:hover {
    border-color: ${theme.colors.primary};
  }
`;

const JoinCardTitle = styled.div<{ $active: boolean }>`
  font-size: 15px;
  font-weight: 700;
  color: ${({ $active }) => ($active ? theme.colors.primary : theme.colors.text)};
  margin-bottom: 4px;
`;

const JoinCardDesc = styled.div`
  font-size: 12px;
  color: ${theme.colors.textMuted};
  line-height: 1.5;
`;

const TagsArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ChipsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const PresetChip = styled.button<{ $active: boolean }>`
  padding: 6px 14px;
  border-radius: ${theme.radii.full};
  font-size: 13px;
  font-weight: 600;
  font-family: ${theme.fonts.sans};
  cursor: pointer;
  transition: all 0.15s;
  border: 1.5px solid ${({ $active }) => ($active ? theme.colors.primary : theme.colors.border)};
  background: ${({ $active }) => ($active ? theme.colors.primaryGlow : "transparent")};
  color: ${({ $active }) => ($active ? theme.colors.primary : theme.colors.textMuted)};

  &:hover {
    border-color: ${theme.colors.primary};
    color: ${theme.colors.primary};
  }
`;

const SelectedChip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px 5px 12px;
  border-radius: ${theme.radii.full};
  background: ${theme.colors.primaryGlow};
  border: 1.5px solid ${theme.colors.primary};
  color: ${theme.colors.primary};
  font-size: 13px;
  font-weight: 600;
`;

const RemoveBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${theme.colors.primary};
  font-size: 14px;
  line-height: 1;
  padding: 0;
  display: flex;
  align-items: center;
  opacity: 0.7;
  font-family: ${theme.fonts.sans};

  &:hover {
    opacity: 1;
  }
`;

const TagInputRow = styled.div`
  display: flex;
  gap: 8px;
`;

const TagInput = styled.input`
  flex: 1;
  background: ${theme.colors.bg};
  border: 1.5px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  padding: 9px 12px;
  font-size: 13px;
  color: ${theme.colors.text};
  font-family: ${theme.fonts.sans};
  outline: none;
  transition: border-color 0.15s;

  &::placeholder {
    color: ${theme.colors.textDim};
  }

  &:focus {
    border-color: ${theme.colors.primary};
  }
`;

const AddTagBtn = styled.button`
  background: ${theme.colors.primary};
  border: none;
  border-radius: ${theme.radii.md};
  padding: 9px 14px;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  cursor: pointer;
  font-family: ${theme.fonts.sans};
  white-space: nowrap;
  transition: background 0.15s;

  &:hover {
    background: ${theme.colors.primaryHover};
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${theme.colors.border};
  margin: 0;
`;

const Footer = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;

  @media (max-width: 480px) {
    flex-direction: column-reverse;
  }
`;

const BtnCancel = styled.button`
  padding: 12px 24px;
  border-radius: ${theme.radii.md};
  border: 1.5px solid ${theme.colors.border};
  background: transparent;
  color: ${theme.colors.textMuted};
  font-size: 14px;
  font-weight: 600;
  font-family: ${theme.fonts.sans};
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    border-color: ${theme.colors.borderLight};
    color: ${theme.colors.text};
  }

  @media (max-width: 480px) {
    width: 100%;
  }
`;

const BtnSubmit = styled.button`
  padding: 12px 28px;
  border-radius: ${theme.radii.md};
  border: none;
  background: ${theme.colors.primary};
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  font-family: ${theme.fonts.sans};
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: ${theme.colors.primaryHover};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 480px) {
    width: 100%;
  }
`;

// ─── Page Component ───────────────────────────────────────────────────────────

export default function CreatePartyPage() {
  const router = useRouter();

  const [form, setForm] = useState<FormData>({
    partyName: "",
    game: "",
    maxMembers: 5,
    description: "",
    joinMode: "auto",
    discordLink: "",
    tags: [],
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [tagInput, setTagInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ── Validation ─────────────────────────────────────────────────────────────

  function validate(): boolean {
    const newErrors: FormErrors = {};
    if (!form.partyName.trim()) newErrors.partyName = "กรุณากรอกชื่อ Party";
    if (!form.game) newErrors.game = "กรุณาเลือกเกม";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // ── Handlers ───────────────────────────────────────────────────────────────

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    console.log("formData:", form);

    setTimeout(() => {
      setSubmitting(false);
      toast.success("🎉 สร้าง Party สำเร็จ!", {
        style: {
          background: theme.colors.bgCard,
          color: theme.colors.text,
          border: `1px solid ${theme.colors.border}`,
        },
      });
      setTimeout(() => router.push("/parties"), 1200);
    }, 600);
  }

  function toggleTag(tag: string) {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  }

  function removeTag(tag: string) {
    setForm((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
  }

  function addCustomTag() {
    const val = tagInput.trim();
    if (!val || form.tags.includes(val)) return;
    setForm((prev) => ({ ...prev, tags: [...prev.tags, val] }));
    setTagInput("");
  }

  function handleTagKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addCustomTag();
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <AuthGuard>
    <Page>
      <Toaster position="top-center" />
      <Container>
        <PageHeader>
          <PageTitle>🎮 สร้าง Party</PageTitle>
          <PageSub>ตั้งค่า Party และรอเพื่อนเข้าร่วม</PageSub>
        </PageHeader>

        <form onSubmit={handleSubmit} noValidate>
          <Card>
            {/* Party Name */}
            <Section>
              <SectionLabel htmlFor="partyName">📌 ชื่อ Party</SectionLabel>
              <Input
                id="partyName"
                type="text"
                placeholder="ชื่อ Party ของคุณ..."
                value={form.partyName}
                $hasError={!!errors.partyName}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, partyName: e.target.value }));
                  if (errors.partyName) setErrors((prev) => ({ ...prev, partyName: undefined }));
                }}
              />
              {errors.partyName && <ErrorMsg>{errors.partyName}</ErrorMsg>}
            </Section>

            <Divider />

            {/* Game */}
            <Section>
              <SectionLabel htmlFor="game">🎮 เกม</SectionLabel>
              <SelectWrapper>
                <Select
                  id="game"
                  value={form.game}
                  $hasError={!!errors.game}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, game: e.target.value as Game }));
                    if (errors.game) setErrors((prev) => ({ ...prev, game: undefined }));
                  }}
                >
                  <option value="">เลือกเกม...</option>
                  {GAMES.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.icon} {g.label}
                    </option>
                  ))}
                </Select>
              </SelectWrapper>
              {errors.game && <ErrorMsg>{errors.game}</ErrorMsg>}
            </Section>

            <Divider />

            {/* Max Members */}
            <Section>
              <SectionLabel>👥 จำนวนสมาชิกสูงสุด</SectionLabel>
              <ButtonGroup>
                {MEMBER_OPTIONS.map((n) => (
                  <ToggleBtn
                    key={n}
                    type="button"
                    $active={form.maxMembers === n}
                    onClick={() => setForm((prev) => ({ ...prev, maxMembers: n }))}
                  >
                    {n}
                  </ToggleBtn>
                ))}
              </ButtonGroup>
            </Section>

            <Divider />

            {/* Description */}
            <Section>
              <SectionLabel htmlFor="description">📝 คำอธิบาย</SectionLabel>
              <Textarea
                id="description"
                placeholder="Diamond+ ช่วยกัน ไม่ toxic..."
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
              />
            </Section>

            <Divider />

            {/* Join Mode */}
            <Section>
              <SectionLabel>🔐 โหมดเข้าร่วม</SectionLabel>
              <JoinModeGrid>
                <JoinCard
                  type="button"
                  $active={form.joinMode === "auto"}
                  onClick={() => setForm((prev) => ({ ...prev, joinMode: "auto" }))}
                >
                  <JoinCardTitle $active={form.joinMode === "auto"}>
                    🔓 Auto Join
                  </JoinCardTitle>
                  <JoinCardDesc>เข้าได้เลย ไม่ต้อง approve</JoinCardDesc>
                </JoinCard>
                <JoinCard
                  type="button"
                  $active={form.joinMode === "approve"}
                  onClick={() => setForm((prev) => ({ ...prev, joinMode: "approve" }))}
                >
                  <JoinCardTitle $active={form.joinMode === "approve"}>
                    🔒 Approve
                  </JoinCardTitle>
                  <JoinCardDesc>ต้อง approve ก่อนเข้า</JoinCardDesc>
                </JoinCard>
              </JoinModeGrid>
            </Section>

            <Divider />

            {/* Discord Link */}
            <Section>
              <SectionLabel htmlFor="discordLink">🎙 Discord Voice Link (ไม่บังคับ)</SectionLabel>
              <Input
                id="discordLink"
                type="url"
                placeholder="https://discord.gg/..."
                value={form.discordLink}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, discordLink: e.target.value }))
                }
              />
            </Section>

            <Divider />

            {/* Tags */}
            <Section>
              <SectionLabel>🏷️ Tags</SectionLabel>
              <TagsArea>
                {/* Preset chips */}
                <ChipsRow>
                  {PRESET_TAGS.map((tag) => (
                    <PresetChip
                      key={tag}
                      type="button"
                      $active={form.tags.includes(tag)}
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </PresetChip>
                  ))}
                </ChipsRow>

                {/* Custom tag input */}
                <TagInputRow>
                  <TagInput
                    type="text"
                    placeholder="เพิ่ม tag เอง... (กด Enter)"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    maxLength={20}
                  />
                  <AddTagBtn
                    type="button"
                    onClick={addCustomTag}
                    disabled={!tagInput.trim()}
                  >
                    + เพิ่ม
                  </AddTagBtn>
                </TagInputRow>

                {/* Selected tags */}
                {form.tags.length > 0 && (
                  <ChipsRow>
                    {form.tags.map((tag) => (
                      <SelectedChip key={tag}>
                        {tag}
                        <RemoveBtn
                          type="button"
                          onClick={() => removeTag(tag)}
                          aria-label={`ลบ tag ${tag}`}
                        >
                          ✕
                        </RemoveBtn>
                      </SelectedChip>
                    ))}
                  </ChipsRow>
                )}
              </TagsArea>
            </Section>

            <Divider />

            {/* Footer buttons */}
            <Footer>
              <BtnCancel type="button" onClick={() => router.back()}>
                ยกเลิก
              </BtnCancel>
              <BtnSubmit type="submit" disabled={submitting}>
                {submitting ? "กำลังสร้าง..." : "🎮 สร้าง Party"}
              </BtnSubmit>
            </Footer>
          </Card>
        </form>
      </Container>
    </Page>
    </AuthGuard>
  );
}
