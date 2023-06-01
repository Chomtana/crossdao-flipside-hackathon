import { ISocialOracleState } from "src/context/SocialOracleContext";
import ActionButton from "../ActionButton";
import facebookIcon from "src/assets/social-button/facebook.png";

export default function FacebookButton(props: any) {
  const state = props.state.find((x: ISocialOracleState) => x.provider == 'facebook')

  return (
    <ActionButton color="white" background="#1679F1" icon={facebookIcon} {...props}>
      {state?.displayName ?? 'Login with Facebook'}
    </ActionButton>
  );
}
