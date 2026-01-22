import styled from '@emotion/styled';

const H2 = styled.h2`
  font-family: 'Source Code Pro';
  font-style: normal;
  font-weight: 400;
  font-size: 50px;
  line-height: 1.25;

  letter-spacing: 0.5px;

  color: #414141;
  margin-bottom: 32px;

  &.typography--center {
    text-align: center;
  }
  &.typography--fullWidth {
    width: 100%;
  }

  @media (max-width: 768px) {
    font-size: 36px;
  }
  @media (max-width: 330px) {
    font-size: 28px;
  }
`;

const H5 = styled.h5`
  font-family: 'Source Code Pro';
  font-style: normal;
  font-weight: 400;
  font-size: 28px;
  line-height: 25px;

  &.typography--center {
    text-align: center;
  }
  letter-spacing: 0.15px;

  color: #414141;
`;

const H6 = styled.h6`
  font-family: 'Source Code Pro';
  font-style: normal;
  font-weight: 700;
  font-weight: 700;
  font-size: 20px;
  line-height: 1.5;

  &.typography--center {
    text-align: center;
  }
  letter-spacing: 0.15px;
  color: #414141;
  margin: 0;
  &.typography--white {
    color: #fff;
  }
  &.mb32 {
    margin-bottom: 32px;
  }
`;

const Small1 = styled.div`
  font-family: 'Source Code Pro';
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 1.6;
  /* or 144% */

  text-align: left;

  &.typography--center {
    text-align: center;
  }
  letter-spacing: 0.25px;

  color: #414141;
  margin-bottom: 32px;
  @media (max-width: 330px) {
    font-size: 10px;
  }

  &.mb80 {
    margin-bottom: 80px;
  }
`;

const PlainText = styled.div`
  font-family: 'Source Code Pro';
  font-style: normal;
  font-weight: 400;
  font-size: 18px;
  line-height: 1.6;
  /* or 144% */

  text-align: left;

  &.typography--center {
    text-align: center;
  }
  letter-spacing: 0.25px;

  color: #414141;
  margin-bottom: 32px;
  @media (max-width: 768px) {
    font-size: 16px;
  }
  @media (max-width: 330px) {
    font-size: 14px;
  }

  &.mb80 {
    margin-bottom: 80px;
  }
`;

function Typography({ type, className = '', center, fullWidth, white, children, ...props }) {
  if (type === 'h2') {
    return (
      <H2
        {...props}
        className={`Typography--h2 ${className} ${center ? 'typography--center' : ''} ${
          fullWidth ? 'typography--fullWidth' : ''
        }`}
      >
        {children}
      </H2>
    );
  } else if (type === 'h5') {
    return (
      <H5
        {...props}
        className={`Typography--h5 ${className} ${center ? 'typography--center' : ''} ${
          fullWidth ? 'typography--fullWidth' : ''
        }`}
      >
        {children}
      </H5>
    );
  } else if (type === 'h6') {
    return (
      <H6
        {...props}
        className={`Typography--h5 ${className}  ${center ? 'typography--center' : ''} ${
          white ? 'typography--white' : ''
        }`}
      >
        {children}
      </H6>
    );
  } else if (type === 'small1') {
    return (
      <Small1
        {...props}
        className={`Typography--small1 ${className} ${center ? 'typography--center' : ''} ${
          white ? 'typography--white' : ''
        }`}
      >
        {children}
      </Small1>
    );
  }

  return (
    <PlainText
      {...props}
      className={`Typography--PlainText ${className} ${center ? 'typography--center' : ''}`}
    >
      {children}
    </PlainText>
  );
}

export default Typography;
