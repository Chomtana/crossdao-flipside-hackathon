import { ISocialOracleState } from "src/context/SocialOracleContext";
import ActionButton from "../ActionButton";
import twitterIcon from "src/assets/social-button/twitter.png";

export default function TwitterButton(props: any) {
  const social = props.state.find((x: ISocialOracleState) => x.provider == 'twitter')

  return (
    <ActionButton color="white" background="#3198D5" icon={twitterIcon} {...props}>
      {social?.displayName ?? 'Login with Twitter'}
    </ActionButton>
  );
}
