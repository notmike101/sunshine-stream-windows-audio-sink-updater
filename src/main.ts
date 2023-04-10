import path from 'path';
import { platform } from 'os';
import { execSync } from 'child_process';
import { program } from '@commander-js/extra-typings';
import { readFileSync, writeFileSync } from 'fs';

interface IDevice {
  'Device ID': string;
  'Device name': string;
  'Adapter name': string;
  'Device description': string;
  'Device state': string;
  Mono: string;
  Sterio: string;
  'Surround 5.1': string;
  'Surround 7.1': string;
}

const isWindows = platform() === 'win32';

const getAudioDevices = (pathToSunshineAudioTool = 'C:\\Program Files\\Sunshine\\tools\\audio-info.exe') => {
  let audioToolOutput = '';

  try {
    const output = execSync(`"${path.resolve(pathToSunshineAudioTool)}"`);

    audioToolOutput = output.toString();
  } catch (err) {
    throw new Error((err as Error).message);
  }

  const devices: IDevice[] = [];

  audioToolOutput.toString()
    .replace('====== Found 5 audio devices ======', '')
    .replace(/(\s)+/gim, '$1')
    .trim()
    .split('===== Device =====')
    .filter((entry) => entry.trim().split('\n').filter(Boolean).length > 0)
    .forEach((entry) => {
      const deviceEntry = entry.trim()?.split('\n')?.filter(Boolean);

      if (!deviceEntry || deviceEntry.length === 0) return;

      const device = deviceEntry.reduce<IDevice>((accumulator, line) => {
        const [key, value] = line.split(': ');

        return {
          ...accumulator,
          [key.trim()]: value.trim(),
        };
      }, {} as IDevice);

      devices.push(device);
    });

  return devices;
};

const setSunshineVariable = (key: string, value: string, pathToSunshineConfig = 'C:\\Program Files\\Sunshine\\config\\sunshine.conf') => {
  const data = readFileSync(pathToSunshineConfig, 'utf8');
  const regex = new RegExp(`${key} = (.*)`, 'gim');
  const newData = data.replace(regex, `${key} = ${value}`);

  writeFileSync(pathToSunshineConfig, newData);
};

program.command('get-devices')
  .description('Get a list of all available audio devices')
  .action(() => {
    const audioDevices = getAudioDevices();

    console.log(audioDevices);
  });

program.command('set-audio-sink')
  .description('Set the audio sink to a specific device')
  .argument<string>('<device-identifier>', 'the unique name of the audio device to use')
  .action((deviceId) => {
    const audioDevices = getAudioDevices();
    const device = audioDevices.find((device) => device['Device name'] === deviceId);

    if (!device) {
      console.error(`[ERROR] Could not find a device with the name "${deviceId}"`);
      process.exit(1);
    }

    deviceId = device['Device ID'];

    try {
      setSunshineVariable('audio_sink', deviceId);
      console.log('Audio sink set to', deviceId);
    } catch (err) {
      console.warn(err);
    }
  });

program.command('set-virtual-sink')
  .description('Set the virtual audio sink to a specific device')
  .argument<string>('<device-id>', 'The unique name of the virtual device to use')
  .action((deviceId) => {

    const audioDevices = getAudioDevices();
    const device = audioDevices.find((device) => device['Device name'] === deviceId);

    if (!device) {
      console.error(`[ERROR] Could not find a device with the name "${deviceId}"`);
      process.exit(1);
    }

    deviceId = device['Device ID'];

    try {
      setSunshineVariable('virtual_sink', deviceId);

      console.log('Virtual sink set to', deviceId);
    } catch (err) {
      console.warn(err);
    }
  });

if (!isWindows) {
  console.error('[ERROR] This tool is only supported on Windows');
  process.exit(1);
}

program.parse(process.argv);
