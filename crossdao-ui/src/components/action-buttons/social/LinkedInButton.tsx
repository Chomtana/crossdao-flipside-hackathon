import { ISocialOracleState } from "src/context/SocialOracleContext";
import ActionButton from "../ActionButton";
import linkedInIcon from "src/assets/social-button/linkedin.png";

export default function LinkedInButton(props: any) {
  const state = props.state.find((x: ISocialOracleState) => x.provider == 'linkedin')

  return (
    <ActionButton color="white" background="#0C64C5" icon={linkedInIcon} {...props}>
      {state?.displayName ?? 'Login with LinkedIn'}
    </ActionButton>
  );
}
