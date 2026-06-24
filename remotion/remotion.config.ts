import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('png');
Config.setOverwriteOutput(true);
// transparent-friendly bg handled inside the composition (solid black)
Config.setEntryPoint('./src/index.ts');
