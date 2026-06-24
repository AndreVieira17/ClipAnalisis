import { Composition } from 'remotion';
import { HeroLoop } from './HeroLoop';

// 8s perfect loop, 1:1 for the hero frame, 30fps to keep the file light.
export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="HeroLoop"
      component={HeroLoop}
      durationInFrames={240}
      fps={30}
      width={1080}
      height={1080}
    />
  );
};
