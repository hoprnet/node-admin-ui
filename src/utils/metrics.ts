/**
 * Parses Node metrics to Apex charts ready data.
 * @param data The string of metrics from HOPRd.
 * @returns Apex chart ready {}.
 */
const ensureEntry = (parsed: any, key: string) => {
  if (!parsed[key]) {
    parsed[key] = {
      name: '',
      type: '',
      data: [],
      categories: [],
      length: 0,
    };
  }
  return parsed[key];
};

export const parseMetrics = (data: string) => {
  const parsed: any = {};
  const tmp = data.split('\n');
  let lastKey = '';
  for (let i = 0; i < tmp.length; i++) {
    const line = tmp[i];
    if (!line) continue;
    const string = line.split(' ');

    if (string[0] === '#' && string[1] === 'HELP') {
      const key = (lastKey = string[2]);
      ensureEntry(parsed, key).name = line.replace(`# HELP ${key} `, '');
    } else if (string[0] === '#' && string[1] === 'TYPE') {
      const key = (lastKey = string[2]);
      ensureEntry(parsed, key).type = line.replace(`# TYPE ${key} `, '');
    } else {
      if (!lastKey || !parsed[lastKey]) continue;
      const parsedData = parseFloat(string[string.length - 1]);
      if (!Number.isNaN(parsedData)) parsed[lastKey].data.push(parsedData);
      const category = string[0].replace(lastKey, '').replace(/^_/, '');
      parsed[lastKey].categories.push(category);
      parsed[lastKey].length++;
    }
  }

  console.log('Metrics:', parsed);
  return parsed;
};
