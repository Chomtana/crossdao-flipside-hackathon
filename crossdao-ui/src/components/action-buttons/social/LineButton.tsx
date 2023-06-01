import { ISocialOracleState } from "src/context/SocialOracleContext";
import ActionButton from "../ActionButton";
import lineIcon from "src/assets/social-button/line.png";

export default function LineButton(props: any) {
  const state = props.state.find((x: ISocialOracleState) => x.provider == 'line')

  return (
    <ActionButton color="white" background="#22BA4F" icon={lineIcon} {...props}>
      {state?.displayName ?? 'Login with Line'}
    </ActionButton>
  );
}
