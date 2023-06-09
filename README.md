
# Sunshine Windows Audio Sink Updater

Allows users to set the audio_sink and virtual_sink devices by specifying the device name.

**NOTE** THIS DOES NOT RESTART SUNSHINE. THESE CHANGES DO NOT APPLY UNTIL IT IS RESTARTED.

## Usage

Since this is written in typescript, so you must build this using `npm run build` before using.

Once built, use `npm start` to run the script.


### Windows Task Scheduler

I recommend using the Windows Task Schedule and creating a task to run the script on startup.
See `TASK.xml` for an example of how to do this.

### Options:
  `-h, --help`: display help for command

### Commands:
  `get-devices`: Get a list of all available audio devices

  `set-audio-sink <device-identifier>`: Set the audio sink to a specific device

  `set-virtual-sink <device-id>`: Set the virtual audio sink to a specific device

  `help [command]`: display help for command
