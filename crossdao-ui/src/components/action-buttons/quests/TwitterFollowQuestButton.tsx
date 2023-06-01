import ActionButton from "../ActionButton";
import twitterIcon from "src/assets/social-button/twitter.png";
import QuestButton from "../QuestButton";

export default function TwitterFollowQuestButton() {
  return (
    <QuestButton color="white" background="#3198D5" icon={twitterIcon}>
      Follow @optidomains
    </QuestButton>
  );
}
