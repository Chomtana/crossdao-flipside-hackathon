import ActionButton from "../ActionButton";
import discordIcon from "src/assets/social-button/discord.png";
import QuestButton from "../QuestButton";

export default function DiscordJoinQuestButton() {
  return (
    <QuestButton color="white" background="#5B68F4" icon={discordIcon}>
      Join Opti.Domains
    </QuestButton>
  );
}
