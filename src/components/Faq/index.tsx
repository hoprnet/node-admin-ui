import { useEffect, useState } from 'react';
import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import styled from '@emotion/styled';
import { v } from '../../theme';

const StyledCard = styled.section`
  display: flex;
  flex-direction: column;
  font-size: 13px;
`;

const Header = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: ${v.text3};
  padding-bottom: 4px;
  border-bottom: 1px solid ${v.border};
`;

const StyledAccordion = styled(Accordion)`
  &.Mui-expanded {
    margin: 0;
  }
`;

const SAccordionSummary = styled(AccordionSummary)`
  &.Mui-expanded {
    min-height: 40px;
  }
  .MuiAccordionSummary-expandIconWrapper svg {
    width: 18px;
    height: 18px;
  }
`;

const Title = styled.h3`
  font-size: 13px;
  font-weight: 500;
  line-height: 1.4;
  color: ${v.text};
  margin: 0;
  padding-right: 8px;
`;

const AccordionContent = styled(AccordionDetails)``;

const Content = styled.div`
  overflow-wrap: break-word;
  a {
    color: ${v.accentText};
    text-decoration: underline;
    text-underline-offset: 2px;
  }
`;

type FaqProps = {
  variant: 'blue' | 'pink';
  label: string;
  data: {
    id: number;
    title: string;
    content: string | JSX.Element;
  }[];
};

export default function FAQ({ variant, label, data }: FaqProps) {
  const [expandedId, set_expandedId] = useState<number | false>(false);

  useEffect(() => {
    set_expandedId(false);
  }, [data]);

  const handleAccordionClick = (id: number) => {
    set_expandedId((prevId) => {
      return prevId === id ? false : id;
    });
  };

  return (
    <StyledCard className={`Faq ${variant}`}>
      <Header>Help</Header>
      {data.map((faqItem) => (
        <StyledAccordion
          key={faqItem.id}
          expanded={expandedId === faqItem.id}
          onChange={() => handleAccordionClick(faqItem.id)}
        >
          <SAccordionSummary
            className={`SAccordionSummary ${variant}`}
            expandIcon={<ExpandMoreIcon />}
          >
            <Title>{faqItem.title}</Title>
          </SAccordionSummary>
          <AccordionContent className={`Content ${variant}`}>
            <Content>{faqItem.content}</Content>
          </AccordionContent>
        </StyledAccordion>
      ))}
    </StyledCard>
  );
}
