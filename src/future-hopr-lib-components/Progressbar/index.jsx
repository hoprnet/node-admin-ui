import React from 'react';
import styled from '@emotion/styled';
import { v } from '../../theme';

const Bar = styled.div`
  border: 1px solid ${v.border};
  background: ${v.surface2};
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 22px;
  border-radius: 4px;
`;

const Value = styled.div`
  position: absolute;
  line-height: 20px;
  font-family: var(--font-mono);
  font-size: 11.5px;
  color: ${v.text};
  z-index: 1;
  width: 100%;
  display: flex;
  -webkit-box-pack: center;
  justify-content: center;
`;

const Progress = styled.div`
  height: 100%;
  max-width: ${(props) => props.percentage};
  &.red {
    background-color: ${v.dangerSoft};
    box-shadow: inset -2px 0 0 ${v.danger};
  }
  &.orange {
    background-color: ${v.warningSoft};
    box-shadow: inset -2px 0 0 ${v.warning};
  }
  &.green {
    background-color: ${v.successSoft};
    box-shadow: inset -2px 0 0 ${v.success};
  }
`;

function ProgressBar(props) {
  function percentage() {
    if (!props.value) return '0%';
    if (props.value > 1) return '100%';
    return `${Math.round(props.value * 1000) / 10}%`;
  }

  function color() {
    if (!props.value || props.value <= 0.25) return 'red';
    if (props.value <= 0.76) return 'orange';
    return 'green';
  }

  return (
    <Bar>
      <Value className="value">{percentage()}</Value>
      <Progress
        className={`progress ${color()}`}
        percentage={percentage()}
      />
    </Bar>
  );
}

export default ProgressBar;
