import type { ColorValue } from "react-native";
import Svg, { Path } from "react-native-svg";
import { withUniwind } from "uniwind";

const ThemedPath = withUniwind(Path);

export function T3Wordmark(props: {
  readonly height: number;
  readonly color?: ColorValue;
  readonly colorClassName?: string;
}) {
  const aspectRatio = 44 / 30;
  return (
    <Svg
      accessibilityLabel="Remix Workbench"
      height={props.height}
      width={props.height * aspectRatio}
      viewBox="13 18 44 30"
    >
      <ThemedPath
        d="M13 18h9l5 18 5-12h6l4 12 6-18h9L46 48h-8l-4-11-5 11h-8z"
        color={props.color}
        colorClassName={props.colorClassName}
        fill="currentColor"
      />
    </Svg>
  );
}
