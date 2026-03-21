'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import styled from 'styled-components';
import { theme } from '@/styles/theme';

const PageContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 2rem;

  h1 {
    font-size: 2rem;
    font-weight: 700;
    color: ${theme.colors.text};
    margin-bottom: 0.5rem;
  }

  p {
    color: ${theme.colors.textMuted};
    font-size: 0.95rem;
  }
`;

const PartyGridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const LoadingCard = styled.div`
  height: 300px;
  border-radius: 12px;
  background: linear-gradient(90deg, ${theme.colors.bgCard} 0%, ${theme.colors.bg} 50%, ${theme.colors.bgCard} 100%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;

  @keyframes loading {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`;

const ErrorContainer = styled.div`
  padding: 2rem;
  background-color: ${theme.colors.bgCard};
  border: 1px solid ${theme.colors.border};
  border-radius: 12px;
  color: ${theme.colors.text};
  text-align: center;

  h3 {
    margin-bottom: 0.5rem;
    font-size: 1.1rem;
  }

  p {
    color: ${theme.colors.textMuted};
    margin-bottom: 1rem;
  }

  button {
    padding: 0.5rem 1rem;
    background-color: ${theme.colors.primary};
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: opacity 0.2s;

    &:hover {
      opacity: 0.9;
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 2rem;

  h3 {
    font-size: 1.3rem;
    color: ${theme.colors.text};
    margin-bottom: 0.5rem;
  }

  p {
    color: ${theme.colors.textMuted};
  }
`;

const PartyCardStyled = styled.div`
  padding: 1.5rem;
  background-color: ${theme.colors.bgCard};
  border: 1px solid ${theme.colors.border};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${theme.colors.primary};
    transform: translateY(-2px);
  }

  h3 {
    font-size: 1.1rem;
    font-weight: 700;
    color: ${theme.colors.text};
    margin: 0 0 0.5rem 0;
  }

  .game {
    font-size: 0.85rem;
    color: ${theme.colors.primary};
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .description {
    font-size: 0.9rem;
    color: ${theme.colors.textMuted};
    margin-bottom: 1rem;
    line-height: 1.4;
  }

  .meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.85rem;
    color: ${theme.colors.textMuted};

    .members {
      display: flex;
      align-items: center;
      gap: 0.3rem;
    }
  }

  .tags {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.8rem;
    flex-wrap: wrap;

    span {
      font-size: 0.75rem;
      padding: 0.25rem 0.5rem;
      background-color: ${theme.colors.bg};
      color: ${theme.colors.primary};
      border-radius: 4px;
    }
  }
`;

interface Party {
  id: string;
  title: string;
  description: string;
  game_id: string;
  games?: { name: string; icon?: string };
  party_members?: Array<{ count: number }>;
  max_members: number;
  join_mode: string;
  status: string;
  tags?: string[];
}

export default function PartiesPage() {
  const searchParams = useSearchParams();
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchParties = async () => {
      try {
        setLoading(true);
        setError(null);

        const queryParams = new URLSearchParams();
        queryParams.set('page', page.toString());

        const gameId = searchParams.get('game');
        if (gameId) queryParams.set('game', gameId);

        const joinMode = searchParams.get('join_mode');
        if (joinMode) queryParams.set('join_mode', joinMode);

        const status = searchParams.get('status');
        if (status) queryParams.set('status', status);

        const response = await fetch(`/api/parties?${queryParams.toString()}`);

        if (!response.ok) {
          throw new Error('Failed to fetch parties');
        }

        const result = await response.json();
        setParties(result.data || []);
        setTotal(result.total || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setParties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchParties();
  }, [searchParams, page]);

  const handlePartyClick = (partyId: string) => {
    window.location.href = `/parties/${partyId}`;
  };

  return (
    <PageContainer>
      <Header>
        <h1>ค้นหาปาร์ตี้</h1>
        <p>ค้นหาและเข้าร่วมปาร์ตี้ที่เหมาะกับคุณ</p>
      </Header>

      {error && (
        <ErrorContainer>
          <h3>เกิดข้อผิดพลาด</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>ลองใหม่อีกครั้ง</button>
        </ErrorContainer>
      )}

      {loading && !error ? (
        <PartyGridContainer>
          {Array.from({ length: 6 }).map((_, i) => (
            <LoadingCard key={i} />
          ))}
        </PartyGridContainer>
      ) : parties.length > 0 ? (
        <>
          <PartyGridContainer>
            {parties.map((party) => (
              <PartyCardStyled
                key={party.id}
                onClick={() => handlePartyClick(party.id)}
              >
                <div className="game">{party.games?.name || 'Unknown Game'}</div>
                <h3>{party.title}</h3>
                <div className="description">
                  {party.description || 'No description'}
                </div>
                <div className="meta">
                  <div className="members">
                    👥 {party.party_members?.[0]?.count || 0}/{party.max_members}
                  </div>
                  <div>
                    {party.join_mode === 'open' && '🔓 เปิด'}
                    {party.join_mode === 'request' && '📝 ขอเข้า'}
                    {party.join_mode === 'invite' && '🔐 เชิญเท่านั้น'}
                  </div>
                </div>
                {party.tags && party.tags.length > 0 && (
                  <div className="tags">
                    {party.tags.map((tag, idx) => (
                      <span key={idx}>{tag}</span>
                    ))}
                  </div>
                )}
              </PartyCardStyled>
            ))}
          </PartyGridContainer>

          {total > 20 && (
            <div
              style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'center',
                marginTop: '2rem',
              }}
            >
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor:
                    page === 0 ? theme.colors.bg : theme.colors.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: page === 0 ? 'not-allowed' : 'pointer',
                  opacity: page === 0 ? 0.5 : 1,
                }}
              >
                ← ก่อนหน้า
              </button>
              <span
                style={{
                  alignSelf: 'center',
                  color: theme.colors.textMuted,
                }}
              >
                หน้า {page + 1} จากทั้งหมด {Math.ceil(total / 20)} หน้า
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= Math.ceil(total / 20) - 1}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor:
                    page >= Math.ceil(total / 20) - 1
                      ? theme.colors.bg
                      : theme.colors.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor:
                    page >= Math.ceil(total / 20) - 1 ? 'not-allowed' : 'pointer',
                  opacity: page >= Math.ceil(total / 20) - 1 ? 0.5 : 1,
                }}
              >
                ถัดไป →
              </button>
            </div>
          )}
        </>
      ) : (
        <EmptyState>
          <h3>ไม่พบปาร์ตี้</h3>
          <p>ไม่มีปาร์ตี้ที่ตรงกับเกณฑ์ของคุณ ลองเปลี่ยนตัวกรองหรือสร้างปาร์ตี้ใหม่</p>
        </EmptyState>
      )}
    </PageContainer>
  );
}
