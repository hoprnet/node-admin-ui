import React from 'react';
import styled from '@emotion/styled';

import Typography from '../Typography/index.jsx';
import Button from '../Button';

const SBrick = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  gap: 16px;
  &.Brick--reverse {
    flex-direction: row-reverse;
    gap: 32px;
  }
  &.mbt80 {
    margin-top: 80px;
    margin-bottom: 80px;
  }
`;

type TextContainerProps = {
  centerText?: boolean;
};

const TextContainer = styled.div<TextContainerProps>`
  flex: 6;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  div {
    text-align: left;
  }
  ${(props) => (props.centerText ? 'justify-content: center;' : '')}
`;

const ImageContainer = styled.div`
  display: flex;
  justify-content: center;
  flex: 5;
  @media (max-width: 699px) {
    display: none;
  }
`;

type ImageProps = {
  noShadow?: boolean;
};

const Image = styled.img<ImageProps>`
  height: auto;
  max-width: 100%;
  border-radius: 28px;
  ${(props) => (props.noShadow ? '' : 'box-shadow: 0px 2px 34px -7px rgb(0 0 0 / 50%);')}
  &.mobileOnly {
    margin-bottom: 16px;
    @media (min-width: 700px) {
      display: none;
    }
  }
`;

type BrickProps = {
  title: string;
  text: React.ReactNode;
  image: string;
  className?: string;
  reverse?: boolean;
  centerText?: boolean;
  noShadow?: boolean;
  button?: string;
  buttonHref?: string;
};

function Brick({
  className = '',
  reverse = false,
  centerText,
  title,
  image,
  noShadow,
  text,
  button,
  buttonHref,
}: BrickProps) {
  return (
    <SBrick className={`Brick ${reverse ? 'Brick--reverse' : ''} ${className}`}>
      <TextContainer centerText={centerText}>
        <Typography type="h5">{title}</Typography>
        <Image
          className="mobileOnly"
          src={image}
          noShadow={noShadow}
        />
        <Typography>{text}</Typography>
        {button && (
          <Button
            href={buttonHref}
            target="_blank"
          >
            {button}
          </Button>
        )}
      </TextContainer>
      <ImageContainer>
        <Image
          src={image}
          noShadow={noShadow}
        />
      </ImageContainer>
    </SBrick>
  );
}

export default Brick;
