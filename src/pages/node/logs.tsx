// HOPR Components
import LogLine from '../../components/LogLine';
import Section from '../../future-hopr-lib-components/Section';
import { CardStack } from '../../future-hopr-lib-components/Table/columed-data';
import { SubpageTitle } from '../../components/SubpageTitle';

// Mui

function SectionLogs() {
  return (
    <Section
      className="Section--logs"
      id="Section--logs"
      fullHeightMin
      yellow
    >
      <SubpageTitle title="Logs" />
      <CardStack>
        <LogLine
          log={{
            id: '',
            message: '',
            timestamp: 0,
          }}
          key={'test-log'}
        />
      </CardStack>
    </Section>
  );
}

export default SectionLogs;
