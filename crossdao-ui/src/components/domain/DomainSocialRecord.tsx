import { Skeleton } from "antd"
import { useEffect, useState } from "react"
import { SocialProfileSimple } from "src/utils/social-oracle"
import { SocialConfig, getSocialConfig } from "src/utils/social-oracle-config"

interface DomainSocialRecordProps extends SocialConfig {
  provider: string
  identity?: string
  displayName?: string
}

export function DomainSocialRecord(props: DomainSocialRecordProps) {
  return (
    <div className="flex items-center">
      <div className='mr-2'>
        <img src={props.icon} className="rounded-full" style={{ height: 24 }}></img>
      </div>

      <div className='mr-3'>{props.displayName || props.identity || "Not Set"}</div>

      {/* Edit button */}
      {/* <div className='cursor-pointer hover:opacity-90'>
        <img src="/images/edit-64px.png" style={{ height: 18 }}></img>
      </div> */}
    </div>
  )
}

interface DomainSocialRecordFromProfilesProps {
  provider: string
  profiles: SocialProfileSimple[]
  loading: boolean
}

export function DomainSocialRecordFromProfiles({ provider, profiles, loading }: DomainSocialRecordFromProfilesProps) {
  const profile = profiles.find((x: SocialProfileSimple) => x.provider == provider)
  const [ config, setConfig ] = useState<SocialConfig>()

  useEffect(() => {
    getSocialConfig(provider).then(result => setConfig(result))
  }, [])

  if (loading || !config) {
    return (
      <div>
        <Skeleton.Input size="small" active={true} />
      </div>
    )
  }

  return (
    <DomainSocialRecord
      {...config}
      provider={provider}
      identity={profile?.identity}
      displayName={profile?.displayName}
    ></DomainSocialRecord>
  )
}
