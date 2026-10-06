import styled from '@emotion/styled';
import { layout } from '../../theme';

// Page container. The legacy colour variants (yellow, gradients, ...) are kept
// as props for compatibility but all render on the app canvas now.
const SSection = styled.section`
  &.section--disabled {
    filter: opacity(0.4);
    pointer-events: none;
  }

  &.full-height-min {
    min-height: calc(100vh - ${layout.navBarHeight}px);
  }
  &.full-height {
    min-height: calc(100vh - ${layout.navBarHeight}px);
  }
  &.section--center {
    display: flex;
  }
  padding: 28px 32px 56px;
  @media (max-width: 700px) {
    padding: 20px 16px 40px;
  }
`;

const Content = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 20px;
  width: 100%;
  &.content--center {
    align-items: center;
  }
`;

interface SectionProps {
  className?: string;
  gradient?: boolean;
  yellow?: boolean;
  yellowLight?: boolean;
  darkGradient?: boolean;
  lightBlueGradient?: boolean;
  lightBlue?: boolean;
  gray?: boolean;
  darkGray?: boolean;
  lightGray?: boolean;
  fullHeightMin?: boolean;
  fullHeight?: boolean;
  center?: boolean;
  disabled?: boolean;
  id?: string;
  children?: any;
}

const Section: React.FC<SectionProps> = (props) => {
  return (
    <SSection
      className={[
        `Section`,
        props.className && props.className,
        props.gradient && 'section--gradient',
        props.yellow && 'section--yellow',
        props.yellowLight && 'section--yellow-light',
        props.darkGradient && 'section--dark-gradient',
        props.lightBlueGradient && 'section--light-blue-gradient',
        props.lightBlue && 'section--light-blue',
        props.gray && 'section--gray',
        props.darkGray && 'section--dark-gray',
        props.lightGray && 'section--light-gray',
        props.fullHeightMin && 'full-height-min',
        props.fullHeight && 'full-height',
        props.center && 'section--center',
        props.disabled && 'section--disabled',
      ].join(' ')}
      id={props.id}
    >
      <Content className={[`Content`, props.center && 'content--center'].join(' ')}>{props.children}</Content>
    </SSection>
  );
};

export default Section;
