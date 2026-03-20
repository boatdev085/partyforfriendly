"use client";

import styled from "styled-components";
import { theme } from "@/styles/theme";
import type { Party } from "@/types";
import PartyCard from "@/components/party/PartyCard";

interface Props {
  parties: Party[];
}

const Section = styled.div`
  flex: 1;
  min-width: 0;
`;

const ResultsHeader = styled.div`
  margin-bottom: 20px;
`;

const ResultsTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: ${theme.colors.text};

  span {
    color: ${theme.colors.primary};
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 14px;
  }
`;

const Empty = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  color: ${theme.colors.textMuted};
  font-size: 15px;
`;

export default function SearchResults({ parties }: Props) {
  return (
    <Section>
      <ResultsHeader>
        <ResultsTitle>
          ผลการค้นหา — พบ <span>{parties.length}</span> party
        </ResultsTitle>
      </ResultsHeader>

      <Grid>
        {parties.length === 0 ? (
          <Empty>ไม่พบปาร์ตี้ที่ตรงกับตัวกรอง</Empty>
        ) : (
          parties.map((party) => <PartyCard key={party.id} party={party} />)
        )}
      </Grid>
    </Section>
  );
}
