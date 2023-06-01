import ActionButton from "../ActionButton";
import solanaIcon from "src/assets/social-button/solana.png";

export default function SolanaButton() {
  return (
    <ActionButton color="white" background="black" icon={solanaIcon}>
      Connect Solana Wallet
    </ActionButton>
  );
}
