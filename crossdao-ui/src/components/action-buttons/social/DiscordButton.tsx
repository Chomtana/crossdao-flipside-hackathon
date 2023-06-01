import { ISocialOracleState } from "src/context/SocialOracleContext";
import ActionButton from "../ActionButton";
import discordIcon from "src/assets/social-button/discord.png";

export default function DiscordButton(props: any) {
  const state = props.state.find((x: ISocialOracleState) => x.provider == 'discord')

  return (
    <ActionButton color="white" background="#5B68F4" icon={discordIcon} {...props}>
      {state?.displayName ?? 'Login with Discord'}
    </ActionButton>
  );
}
