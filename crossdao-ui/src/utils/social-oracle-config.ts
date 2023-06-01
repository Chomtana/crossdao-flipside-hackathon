// Social icons
import discordIcon from "src/assets/social-button/discord.png";
import facebookIcon from "src/assets/social-button/facebook.png";
import githubIcon from "src/assets/social-button/github.png";
import googleIcon from "src/assets/social-button/google.png";
import lineIcon from "src/assets/social-button/line.png";
import linkedInIcon from "src/assets/social-button/linkedin.png";
import microsoftIcon from "src/assets/social-button/microsoft.png";
import twitterIcon from "src/assets/social-button/twitter.png";

// Wallet icons
import suiIcon from "src/assets/social-button/sui.png";
import aptosIcon from "src/assets/social-button/aptos.png";

export interface SocialConfig {
  name: string;
  color: string;
  background: string;
  icon: string;
}

const SOCIAL_ORACLE_CONFIG: {[provider: string]: SocialConfig} = {
  discord: {
    name: 'Discord',
    color: 'white',
    background: '#5B68F4',
    icon: discordIcon,
  },
  facebook: {
    name: 'Facebook',
    color: 'white',
    background: '#1679F1',
    icon: facebookIcon,
  },
  github: {
    name: 'Github',
    color: 'white',
    background: '#161B22',
    icon: githubIcon,
  },
  google: {
    name: 'Google',
    color: 'black',
    background: 'white',
    icon: googleIcon,
  },
  line: {
    name: 'Line',
    color: 'white',
    background: '#22BA4F',
    icon: lineIcon,
  },
  linkedin: {
    name: 'LinkedIn',
    color: 'white',
    background: '#0C64C5',
    icon: linkedInIcon,
  },
  microsoft: {
    name: 'Microsoft',
    color: 'black',
    background: 'white',
    icon: microsoftIcon,
  },
  twitter: {
    name: 'Twitter',
    color: 'white',
    background: '#3198D5',
    icon: twitterIcon,
  },
}

export async function getSocialConfig(provider: string) {
  return SOCIAL_ORACLE_CONFIG[provider];
}