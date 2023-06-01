import { useEffect } from "react";

export default function SocialOracleCallback() {
  useEffect(() => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());

    window.opener.postMessage(params.nonce + JSON.stringify(params), window.location.origin)

    setTimeout(() => window.close(), 500);
  })

  return (
    <div></div>
  )
}