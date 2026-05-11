import styled from '@emotion/styled';

const SStepper = styled.div``;

const Content = styled.div`
  max-width: 1098px;
  margin: auto;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding-left: 16px;
  padding-right: 16px;
  margin-top: 32px;
  &.content--center {
    align-items: center;
  }
`;

const StepsConainer = styled.div`
  display: flex;
  flex-direction: row;
`;

const Steps = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
`;

const Step = styled.div`
  font-size: 14px;
  text-align: center;
  color: #666;
  cursor: default;
  margin: 0 3px;
  padding: 10px 10px 10px 30px;
  min-width: 200px;
  float: left;
  position: relative;
  /* background-color: #d9e3f7; */
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  transition: background-color 0.2s ease;
  :before {
    content: '';
    display: block;
    position: absolute;
    transform: skew(-40deg, 0);
    background-color: #d9e3f7;
    height: 50%;
    bottom: 0;
    z-index: -1;
    left: 5px;
    width: 100%;
  }
  :after {
    content: '';
    display: block;
    position: absolute;
    transform: skew(40deg, 0);
    background: #d9e3f7;
    height: 50%;
    top: 0;
    z-index: -1;
    left: 5px;
    width: 100%;
  }

  &.current-step {
    color: #fff;
    :after,
    :before {
      background-color: #23468c;
    }
  }

  &.current-step:after {
    border-left: 17px solid #23468c;
  }
`;

function Stepper({ children, currentStep, steps = [] }) {
  const step = children?.length > 0 ? children[currentStep] : children;

  return (
    <SStepper className={``}>
      {/* <StepsConainer> */}
      <Steps>
        {steps.map((step, index) => (
          <Step
            className={`step ${index === currentStep ? 'current-step' : ''}`}
            key={`step_${index}`}
          >
            <span>{step.name}</span>
          </Step>
        ))}
      </Steps>
      {/* </StepsConainer> */}
      <Content>{step}</Content>
    </SStepper>
  );
}

export default Stepper;
