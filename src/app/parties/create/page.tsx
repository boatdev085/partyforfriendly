'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import toast from 'react-hot-toast';
import { theme } from '@/styles/theme';

const FormContainer = styled.div`
  max-width: 600px;
  margin: 2rem auto;
  padding: 0 1rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: ${theme.colors.text};
  font-weight: 600;
  font-size: 0.95rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${theme.colors.border};
  border-radius: 8px;
  background-color: ${theme.colors.bgCard};
  color: ${theme.colors.text};
  font-size: 1rem;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }

  &::placeholder {
    color: ${theme.colors.textMuted};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${theme.colors.border};
  border-radius: 8px;
  background-color: ${theme.colors.bgCard};
  color: ${theme.colors.text};
  font-size: 1rem;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }

  option {
    background-color: ${theme.colors.bgCard};
    color: ${theme.colors.text};
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${theme.colors.border};
  border-radius: 8px;
  background-color: ${theme.colors.bgCard};
  color: ${theme.colors.text};
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  min-height: 120px;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }

  &::placeholder {
    color: ${theme.colors.textMuted};
  }
`;

const TagsHint = styled.p`
  font-size: 0.85rem;
  color: ${theme.colors.textMuted};
  margin-top: 0.25rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
`;

const SubmitButton = styled.button`
  flex: 1;
  padding: 0.75rem 1.5rem;
  background-color: ${theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CancelButton = styled.button`
  flex: 1;
  padding: 0.75rem 1.5rem;
  background-color: ${theme.colors.bgCard};
  color: ${theme.colors.text};
  border: 1px solid ${theme.colors.border};
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${theme.colors.bg};
  }
`;

const Title = styled.h1`
  font-size: 1.8rem;
  font-weight: 700;
  color: ${theme.colors.text};
  margin-bottom: 2rem;
`;

interface FormData {
  title: string;
  game_id: string;
  description: string;
  join_mode: string;
  max_members: string;
  tags: string;
  discord_voice_link: string;
  scheduled_at: string;
}

export default function CreatePartyPage() {
  const router = useRouter();
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingGames, setLoadingGames] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    game_id: '',
    description: '',
    join_mode: 'open',
    max_members: '4',
    tags: '',
    discord_voice_link: '',
    scheduled_at: '',
  });

  // Fetch games on mount
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch('/api/games');
        if (response.ok) {
          const data = await response.json();
          setGames(data);
        }
      } catch (err) {
        console.error('Failed to fetch games:', err);
        toast.error('ไม่สามารถโหลดรายชื่อเกมได้');
      } finally {
        setLoadingGames(false);
      }
    };

    fetchGames();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast.error('โปรดกรอกชื่อปาร์ตี้');
      return;
    }

    if (!formData.game_id) {
      toast.error('โปรดเลือกเกม');
      return;
    }

    const maxMembers = parseInt(formData.max_members);
    if (isNaN(maxMembers) || maxMembers < 2) {
      toast.error('จำนวนสมาชิกสูงสุดต้องเป็นอย่างน้อย 2');
      return;
    }

    try {
      setLoading(true);

      // Parse tags
      const tags = formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const payload = {
        title: formData.title.trim(),
        game_id: formData.game_id,
        description: formData.description.trim(),
        join_mode: formData.join_mode,
        max_members: maxMembers,
        tags,
        discord_voice_link: formData.discord_voice_link.trim() || null,
        scheduled_at: formData.scheduled_at || null,
      };

      const response = await fetch('/api/parties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'ไม่สามารถสร้างปาร์ตี้ได้');
        return;
      }

      const newParty = await response.json();
      toast.success('สร้างปาร์ตี้สำเร็จ');

      // Redirect to party room
      router.push(`/parties/${newParty.id}`);
    } catch (err) {
      console.error('Create party error:', err);
      toast.error('เกิดข้อผิดพลาด โปรดลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormContainer>
      <Title>สร้างปาร์ตี้</Title>

      <form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="title">ชื่อปาร์ตี้ *</Label>
          <Input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="เช่น ค้นหาคนเล่น Valorant"
            disabled={loading}
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="game_id">เลือกเกม *</Label>
          <Select
            id="game_id"
            name="game_id"
            value={formData.game_id}
            onChange={handleChange}
            disabled={loading || loadingGames}
          >
            <option value="">-- เลือกเกม --</option>
            {games.map((game) => (
              <option key={game.id} value={game.id}>
                {game.name}
              </option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup>
          <Label htmlFor="description">รายละเอียด</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="บอกเพิ่มเติมเกี่ยวกับปาร์ตี้ของคุณ..."
            disabled={loading}
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="join_mode">วิธีการเข้าร่วม *</Label>
          <Select
            id="join_mode"
            name="join_mode"
            value={formData.join_mode}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="open">เปิด (ใครก็เข้าได้)</option>
            <option value="request">ขอเข้า (ต้องรออนุมัติ)</option>
            <option value="invite_only">เชิญเท่านั้น</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <Label htmlFor="max_members">จำนวนสมาชิกสูงสุด *</Label>
          <Input
            type="number"
            id="max_members"
            name="max_members"
            min="2"
            max="100"
            value={formData.max_members}
            onChange={handleChange}
            disabled={loading}
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="tags">แท็ก (คั่นด้วยจุลภาค)</Label>
          <Input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="เช่น casual, competitive, beginner"
            disabled={loading}
          />
          <TagsHint>เพิ่มแท็กเพื่อให้ผู้เล่นอื่นหาปาร์ตี้ของคุณได้ง่ายขึ้น</TagsHint>
        </FormGroup>

        <FormGroup>
          <Label htmlFor="discord_voice_link">ลิงค์เซิร์ฟเวอร์ Discord (ไม่จำเป็น)</Label>
          <Input
            type="url"
            id="discord_voice_link"
            name="discord_voice_link"
            value={formData.discord_voice_link}
            onChange={handleChange}
            placeholder="https://discord.gg/..."
            disabled={loading}
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="scheduled_at">วันเวลาที่ตั้งไว้ (ไม่จำเป็น)</Label>
          <Input
            type="datetime-local"
            id="scheduled_at"
            name="scheduled_at"
            value={formData.scheduled_at}
            onChange={handleChange}
            disabled={loading}
          />
        </FormGroup>

        <ButtonGroup>
          <CancelButton
            type="button"
            onClick={() => router.back()}
            disabled={loading}
          >
            ยกเลิก
          </CancelButton>
          <SubmitButton type="submit" disabled={loading || loadingGames}>
            {loading ? 'กำลังสร้าง...' : 'สร้างปาร์ตี้'}
          </SubmitButton>
        </ButtonGroup>
      </form>
    </FormContainer>
  );
}
