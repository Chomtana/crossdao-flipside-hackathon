import { ConnectButton } from '@rainbow-me/rainbowkit'
import useAccountSiwe from './hooks/useAccountSiwe'
import RegisterFirstDomain from './components/RegisterFirstDomain'
import DomainList from './components/domain/DomainList'
import { useAccount } from 'wagmi'
import ProposalSection from './components/axelar-flipside/ProposalSection'

function App() {
  const { address } = useAccount()

  return (
    <>
      <div className="min-h-screen bg-red-900 text-white selection:bg-indigo-500 selection:text-white">
        <div className="fixed z-[100] flex w-full flex-col bg-gray-800/40 p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <a href="/">
                <div className="relative flex h-10 items-center">
                  <span style={{boxSizing: 'border-box', display: 'block', overflow: 'hidden', width: 'initial', height: 'initial', background: 'none', opacity: 1, border: 0, margin: 0, padding: 0, position: 'absolute', top: 0, left: 0, bottom: 0, right: 0}}>
                    <img alt="nft project logo" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" decoding="async" data-nimg="fill" style={{position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, boxSizing: 'border-box', padding: 0, border: 'none', margin: 'auto', display: 'block', width: 0, height: 0, minWidth: '100%', maxWidth: '100%', minHeight: '100%', maxHeight: '100%', objectFit: 'contain'}} />
                  </span>
                </div>
              </a>
              {/* <div className="ml-10 hidden xl:flex">
                <div className="space-x-6"><a className="text-gray-300 transition duration-300 hover:text-white" href="/#gallery">Gallery</a><a className="text-gray-300 transition duration-300 hover:text-white" href="/#features">Features</a><a className="text-gray-300 transition duration-300 hover:text-white" href="/#roadmap">Roadmap</a><a className="text-gray-300 transition duration-300 hover:text-white" href="/#team">Team</a><a className="text-gray-300 transition duration-300 hover:text-white" href="/#faq">FAQ</a></div>
              </div> */}
            </div>
            <div className="items-center space-x-4 inline-flex">
              {/* <a href="/#">
                <div className="rounded-full bg-gray-500 hover:bg-gray-700 p-2 shadow-lg shadow-white/10 transition duration-300 hover:scale-110">
                  <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 640 512" height={28} width={28} xmlns="http://www.w3.org/2000/svg">
                    <path d="M524.531,69.836a1.5,1.5,0,0,0-.764-.7A485.065,485.065,0,0,0,404.081,32.03a1.816,1.816,0,0,0-1.923.91,337.461,337.461,0,0,0-14.9,30.6,447.848,447.848,0,0,0-134.426,0,309.541,309.541,0,0,0-15.135-30.6,1.89,1.89,0,0,0-1.924-.91A483.689,483.689,0,0,0,116.085,69.137a1.712,1.712,0,0,0-.788.676C39.068,183.651,18.186,294.69,28.43,404.354a2.016,2.016,0,0,0,.765,1.375A487.666,487.666,0,0,0,176.02,479.918a1.9,1.9,0,0,0,2.063-.676A348.2,348.2,0,0,0,208.12,430.4a1.86,1.86,0,0,0-1.019-2.588,321.173,321.173,0,0,1-45.868-21.853,1.885,1.885,0,0,1-.185-3.126c3.082-2.309,6.166-4.711,9.109-7.137a1.819,1.819,0,0,1,1.9-.256c96.229,43.917,200.41,43.917,295.5,0a1.812,1.812,0,0,1,1.924.233c2.944,2.426,6.027,4.851,9.132,7.16a1.884,1.884,0,0,1-.162,3.126,301.407,301.407,0,0,1-45.89,21.83,1.875,1.875,0,0,0-1,2.611,391.055,391.055,0,0,0,30.014,48.815,1.864,1.864,0,0,0,2.063.7A486.048,486.048,0,0,0,610.7,405.729a1.882,1.882,0,0,0,.765-1.352C623.729,277.594,590.933,167.465,524.531,69.836ZM222.491,337.58c-28.972,0-52.844-26.587-52.844-59.239S193.056,219.1,222.491,219.1c29.665,0,53.306,26.82,52.843,59.239C275.334,310.993,251.924,337.58,222.491,337.58Zm195.38,0c-28.971,0-52.843-26.587-52.843-59.239S388.437,219.1,417.871,219.1c29.667,0,53.307,26.82,52.844,59.239C470.715,310.993,447.538,337.58,417.871,337.58Z" />
                  </svg>
                </div>
              </a>
              <a href="/#">
                <div className="rounded-full bg-indigo-400 hover:bg-indigo-500 p-2 shadow-lg shadow-white/10 transition duration-300 hover:scale-110">
                  <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 448 512" height={28} width={28} xmlns="http://www.w3.org/2000/svg">
                    <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
                  </svg>
                </div>
              </a>
              <a href="/#">
                <div className="rounded-full bg-indigo-400 hover:bg-indigo-500 p-2 shadow-lg shadow-white/10 transition duration-300 hover:scale-110">
                  <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 512 512" height={28} width={28} xmlns="http://www.w3.org/2000/svg">
                    <path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z" />
                  </svg>
                </div>
              </a> */}
              {/* <a href="/#">
                <div className="rounded-2xl bg-gradient-to-r from-indigo-500 via-teal-600 to-indigo-500 bg-size-200 bg-pos-0 px-4 py-2 font-semibold shadow-lg shadow-white/10 transition-all duration-300 hover:bg-pos-100">Connect Wallet</div>
              </a> */}

              <ConnectButton
                showBalance={{
                  smallScreen: false,
                  largeScreen: true,
                }}
              />
            </div>
            {/* <div className="inline-flex md:hidden">
              <div className="cursor-pointer rounded-full bg-indigo-500 p-2 shadow-lg shadow-white/10 transition-colors hover:bg-indigo-600">
                <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 448 512" height={22} width={22} xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 132h416c8.837 0 16-7.163 16-16V76c0-8.837-7.163-16-16-16H16C7.163 60 0 67.163 0 76v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16z" />
                </svg>
              </div>
            </div> */}
          </div>

          <div className="hidden">
            <div className="relative z-50 flex w-full flex-col space-y-4 bg-transparent px-6 pb-2 pt-8">
              <h4 className="mb-2 text-lg">Useful Links:</h4>
              <a className="text-gray-300 transition duration-300 hover:text-white" href="/#gallery">Gallery</a><a className="text-gray-300 transition duration-300 hover:text-white" href="/#features">Features</a><a className="text-gray-300 transition duration-300 hover:text-white" href="/#roadmap">Roadmap</a><a className="text-gray-300 transition duration-300 hover:text-white" href="/#team">Team</a><a className="text-gray-300 transition duration-300 hover:text-white" href="/#faq">FAQ</a>
              <div className="flex items-center space-x-4">
                <a href="/#">
                  <div className="rounded-full bg-gray-500 hover:bg-gray-600 p-2 shadow-lg shadow-white/10 transition duration-300 hover:scale-110">
                    <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 640 512" height={28} width={28} xmlns="http://www.w3.org/2000/svg">
                      <path d="M524.531,69.836a1.5,1.5,0,0,0-.764-.7A485.065,485.065,0,0,0,404.081,32.03a1.816,1.816,0,0,0-1.923.91,337.461,337.461,0,0,0-14.9,30.6,447.848,447.848,0,0,0-134.426,0,309.541,309.541,0,0,0-15.135-30.6,1.89,1.89,0,0,0-1.924-.91A483.689,483.689,0,0,0,116.085,69.137a1.712,1.712,0,0,0-.788.676C39.068,183.651,18.186,294.69,28.43,404.354a2.016,2.016,0,0,0,.765,1.375A487.666,487.666,0,0,0,176.02,479.918a1.9,1.9,0,0,0,2.063-.676A348.2,348.2,0,0,0,208.12,430.4a1.86,1.86,0,0,0-1.019-2.588,321.173,321.173,0,0,1-45.868-21.853,1.885,1.885,0,0,1-.185-3.126c3.082-2.309,6.166-4.711,9.109-7.137a1.819,1.819,0,0,1,1.9-.256c96.229,43.917,200.41,43.917,295.5,0a1.812,1.812,0,0,1,1.924.233c2.944,2.426,6.027,4.851,9.132,7.16a1.884,1.884,0,0,1-.162,3.126,301.407,301.407,0,0,1-45.89,21.83,1.875,1.875,0,0,0-1,2.611,391.055,391.055,0,0,0,30.014,48.815,1.864,1.864,0,0,0,2.063.7A486.048,486.048,0,0,0,610.7,405.729a1.882,1.882,0,0,0,.765-1.352C623.729,277.594,590.933,167.465,524.531,69.836ZM222.491,337.58c-28.972,0-52.844-26.587-52.844-59.239S193.056,219.1,222.491,219.1c29.665,0,53.306,26.82,52.843,59.239C275.334,310.993,251.924,337.58,222.491,337.58Zm195.38,0c-28.971,0-52.843-26.587-52.843-59.239S388.437,219.1,417.871,219.1c29.667,0,53.307,26.82,52.844,59.239C470.715,310.993,447.538,337.58,417.871,337.58Z" />
                    </svg>
                  </div>
                </a>
                <a href="/#">
                  <div className="rounded-full bg-indigo-400 hover:bg-indigo-500 p-2 shadow-lg shadow-white/10 transition duration-300 hover:scale-110">
                    <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 448 512" height={28} width={28} xmlns="http://www.w3.org/2000/svg">
                      <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
                    </svg>
                  </div>
                </a>
                <a href="/#">
                  <div className="rounded-full bg-indigo-400 hover:bg-indigo-500 p-2 shadow-lg shadow-white/10 transition duration-300 hover:scale-110">
                    <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 512 512" height={28} width={28} xmlns="http://www.w3.org/2000/svg">
                      <path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z" />
                    </svg>
                  </div>
                </a>
              </div>
              <a href="/#">
                <div className="w-fit rounded-2xl bg-gradient-to-r from-indigo-500 via-teal-600 to-indigo-500 bg-size-200 bg-pos-0 px-4 py-2 font-semibold shadow-lg shadow-white/10 transition-all duration-300 hover:bg-pos-100">View on OpenSea</div>
              </a>
            </div>
          </div>
        </div>

        <main className="w-full pt-24">
          {/* <div className="relative w-full">
            <div className="absolute -bottom-44 -left-4 h-72 w-72 animate-blob rounded-full bg-teal-500/50 mix-blend-overlay blur-2xl filter" />
            <div className="animation-delay-2000 absolute top-0 h-96 w-96 animate-blob rounded-full bg-teal-200/20 mix-blend-overlay blur-2xl filter" />
            <div className="animation-delay-4000 absolute top-44 left-44 h-72 w-72 animate-blob rounded-full bg-indigo-300/30 mix-blend-overlay blur-2xl filter" />
          </div> */}
          {/* <div className="absolute mx-auto mt-16 flex h-[400px] w-full bg-transparent px-20">
            <div className="h-full w-full bg-repeat heropattern-plus-gray-700" />
          </div> */}
          <div className="container relative z-20 mx-auto grid grid-cols-1 gap-x-4 gap-y-20 py-16 lg:grid-cols-2 px-6">
            <div className="flex flex-col items-center justify-center text-center lg:items-start lg:text-left">
              <h1 className="mb-4 text-6xl font-bold xl:text-7xl">CrossDAO</h1>
              <h2 className="mb-12 text-4xl font-bold text-amber-300 underline decoration-amber-200/30 xl:text-5xl">.axl Domains</h2>
              <p className="text-md mb-10 font-medium text-gray-300 xl:text-lg" style={{ maxWidth: 540 }}>
              Let's DAO from multiple chains jointly vote on proposals together and post the proof to any governance forums.
              </p>
              <div className="flex flex-col items-center sm:space-x-4 space-y-4 sm:flex-row sm:space-y-0">
                {/* <a href="/#mydomains">
                  <div className="flex w-fit space-x-2 rounded-2xl bg-amber-600 px-4 py-3 font-semibold shadow-lg transition-all duration-300 hover:-translate-y-[1px] hover:bg-amber-700">
                    <span>Register Your DAO</span> 
                    <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 448 512" height={24} width={24} xmlns="http://www.w3.org/2000/svg">
                      <path d="M413.1 222.5l22.2 22.2c9.4 9.4 9.4 24.6 0 33.9L241 473c-9.4 9.4-24.6 9.4-33.9 0L12.7 278.6c-9.4-9.4-9.4-24.6 0-33.9l22.2-22.2c9.5-9.5 25-9.3 34.3.4L184 343.4V56c0-13.3 10.7-24 24-24h32c13.3 0 24 10.7 24 24v287.4l114.8-120.5c9.3-9.8 24.8-10 34.3-.4z" />
                    </svg>
                  </div>
                </a> */}
                <a href="https://zonic.app/collection/boredtown" target="_blank">
                  <div className="flex w-fit space-x-2 rounded-2xl bg-teal-600 px-4 py-3 font-semibold shadow-lg shadow-teal-500/20 transition-all duration-300 hover:-translate-y-[1px] hover:bg-teal-700">
                    <span>Register Your DAO</span> 
                    <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 448 512" height={22} width={22} xmlns="http://www.w3.org/2000/svg">
                      <path d="M190.5 66.9l22.2-22.2c9.4-9.4 24.6-9.4 33.9 0L441 239c9.4 9.4 9.4 24.6 0 33.9L246.6 467.3c-9.4 9.4-24.6 9.4-33.9 0l-22.2-22.2c-9.5-9.5-9.3-25 .4-34.3L311.4 296H24c-13.3 0-24-10.7-24-24v-32c0-13.3 10.7-24 24-24h287.4L190.9 101.2c-9.8-9.3-10-24.8-.4-34.3z" />
                    </svg>
                  </div>
                </a>
              </div>
            </div>
            <div className="ml-10 flex justify-center">
              <div className="relative -skew-y-3 mt-24 z-10 skew-x-6">
                <div className="h-[15rem] w-[11rem] rounded-2xl bg-gray-900 shadow-xl xl:h-[23rem] xl:w-[18rem]">
                  <div className="relative h-[11rem] w-full xl:h-[18rem]">
                    <span style={{boxSizing: 'border-box', display: 'block', overflow: 'hidden', width: 'initial', height: 'initial', background: 'none', opacity: 1, border: 0, margin: 0, padding: 0, position: 'absolute', top: 0, left: 0, bottom: 0, right: 0}}>
                      <img alt="Top Card" src="/images/boredtown.gif" decoding="async" data-nimg="fill" className="heroCard rounded-t-2xl" style={{position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, boxSizing: 'border-box', padding: 0, border: 'none', margin: 'auto', display: 'block', width: 0, height: 0, minWidth: '100%', maxWidth: '100%', minHeight: '100%', maxHeight: '100%', objectFit: 'cover'}} />
                    </span>
                  </div>
                  <div className="flex h-[4rem] w-full items-center justify-between px-4 xl:h-[5rem]">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="text-xs text-gray-300 xl:text-sm">Bored Town</p>
                        <p className="text-md font-medium text-indigo-300 xl:text-xl">bored.town</p>
                      </div>
                    </div>
                    <a target="_blank" href="https://zonic.app/collection/boredtown">
                      <div className="xl:text-md hidden w-fit space-x-2 rounded-2xl bg-teal-600 px-2 py-3 text-sm font-semibold shadow-lg shadow-teal-500/20 transition-all duration-300 hover:bg-teal-700 xl:flex xl:px-4">Buy Now</div>
                    </a>
                  </div>
                </div>
              </div>
              <div className="relative skew-y-3 -translate-x-20 animate-pulse -skew-x-6">
                <div className="h-[15rem] w-[11rem] rounded-2xl bg-gray-900 shadow-xl xl:h-[23rem] xl:w-[18rem]">
                  <div className="relative h-[11rem] w-full xl:h-[18rem]">
                    <span style={{boxSizing: 'border-box', display: 'block', overflow: 'hidden', width: 'initial', height: 'initial', background: 'none', opacity: 1, border: 0, margin: 0, padding: 0, position: 'absolute', top: 0, left: 0, bottom: 0, right: 0}}>
                      <img alt="Back Card" src="/images/zkalien.gif" decoding="async" data-nimg="fill" className="heroCard rounded-t-2xl" style={{position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, boxSizing: 'border-box', padding: 0, border: 'none', margin: 'auto', display: 'block', width: 0, height: 0, minWidth: '100%', maxWidth: '100%', minHeight: '100%', maxHeight: '100%', objectFit: 'cover'}} />
                    </span>
                  </div>
                  <div className="flex h-[4rem] w-full items-center justify-end px-4 xl:h-[5rem]">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="text-xs text-gray-300 xl:text-sm text-right">Zkalien</p>
                        <p className="text-md font-medium text-indigo-300 xl:text-xl">zkalien.town</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* <section className="gallery container relative z-10 mx-auto py-10 px-6" id="claimdomains">
            <h3 className="mb-4 text-center text-3xl font-semibold underline decoration-amber-500/80 lg:text-left xl:text-4xl">Claim Domains</h3>

            <RegisterFirstDomain />
          </section> */}

          <div className='flex justify-center'>
            <div style={{maxWidth: 600}}>
              <h3 className="mb-4 text-center text-3xl font-semibold underline decoration-amber-500/80 xl:text-4xl">Register Domain</h3>

              <RegisterFirstDomain />
            </div>
          </div>

          {address &&
            <section className="gallery container relative z-10 mx-auto py-10 px-6" id="mydomains">
              <h3 className="mb-4 text-center text-3xl font-semibold underline decoration-amber-500/80 lg:text-left xl:text-4xl">My Domains</h3>

              <div className='mt-8'>
                <DomainList
                  owner={address!}
                  tld='axl.axelar.op'
                  formattedTld='axl'
                ></DomainList>
              </div>

              {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 mt-8 gap-4">
                <div className="rounded-xl bg-red-950 p-4 shadow-lg h-full flex flex-col items-center justify-center text-xl text-amber-100 cursor-pointer hover:opacity-90 transition duration-200" style={{ minHeight: 200 }}>
                  <div className='mb-5'>
                    <img src="/images/add-256px.png" style={{ height: 54 }} />
                  </div>

                  <div>Add Subdomain</div>
                  <div>(Alternative Wallet)</div>
                </div>
              </div> */}
            </section>
          }

          {address &&
            <ProposalSection />
          }

          {/* <section className="gallery container relative z-10 mx-auto py-10 px-6" id="gallery">
            <h3 className="mb-4 text-center text-3xl font-semibold underline decoration-amber-500/80 lg:text-left xl:text-4xl">Gallery</h3>
            <div className="react-multi-carousel-list gallery-slider ">
              <ul className="react-multi-carousel-track " style={{transition: 'none', overflow: 'unset', transform: 'translate3d(0px,0,0)'}} />
            </div>
          </section> */}

          <section id="roadmap" className="container relative mx-auto py-12 px-6">
            <h3 className="mb-8 text-center text-3xl font-semibold underline decoration-amber-500/80 lg:text-left xl:text-4xl">Use Cases</h3>
            <div className="relative flex flex-col">
              <div className="absolute left-[50%] z-40 h-full w-[2px] rounded-full bg-indigo-300/60 blur-sm lg:left-[44px]" />
              <div className="my-3 flex flex-col items-center space-x-4 space-y-4 rounded-xl bg-red-950 px-4 py-6 shadow-lg transition duration-300 hover:shadow-2xl lg:flex-row">
                <div className="z-50 rounded-full bg-amber-600 px-6 text-xl font-semibold shadow-md shadow-amber-500/30"><span>1</span></div>
                <div>
                  <h3 className="mb-2 text-center text-2xl font-semibold lg:text-left">NFT Whitelisting</h3>
                  <p className="text-center text-gray-300 lg:text-left">
                    Eligibility for whitelisting not only Bored Town's official NFTs but also those created by Bored Town partnered artists across various blockchain networks.
                  </p>
                </div>
              </div>
              <div className="my-3 flex flex-col items-center space-x-4 space-y-4 rounded-xl bg-red-950 px-4 py-6 shadow-lg transition duration-300 hover:shadow-2xl lg:flex-row">
                <div className="z-50 rounded-full bg-amber-600 px-6 text-xl font-semibold shadow-md shadow-amber-500/30"><span>2</span></div>
                <div>
                  <h3 className="mb-2 text-center text-2xl font-semibold lg:text-left">Optimism Attestation</h3>
                  <p className="text-center text-gray-300 lg:text-left">
                    Attest your wallet and social links associated with your domain name, along with your Bored Town activities, to the official Optimism attestation contract. 
                    This will not only serve as a record of your activity but also increase your chances of receiving the <span className="text-amber-300">OP airdrop</span>.
                  </p>
                </div>
              </div>
              <div className="my-3 flex flex-col items-center space-x-4 space-y-4 rounded-xl bg-red-950 px-4 py-6 shadow-lg transition duration-300 hover:shadow-2xl lg:flex-row">
                <div className="z-50 rounded-full bg-amber-600 px-6 text-xl font-semibold shadow-md shadow-amber-500/30"><span>3</span></div>
                <div>
                  <h3 className="mb-2 text-center text-2xl font-semibold lg:text-left">Singularity</h3>
                  <p className="text-center text-gray-300 lg:text-left">
                    By associating your wallet address into a single domain, you can bid farewell to the inconvenience of using long, unreadable wallet addresses that vary across different blockchain networks.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* <section id="team" className="gallery container relative z-10 mx-auto bg-repeat py-12 heropattern-plus-gray-700">
            <h3 className="mb-8 text-center text-3xl font-semibold underline decoration-indigo-500/80 lg:text-left xl:text-4xl">Team</h3>
            <div className="react-multi-carousel-list team-slider ">
              <ul className="react-multi-carousel-track " style={{transition: 'none', overflow: 'unset', transform: 'translate3d(0px,0,0)'}} />
            </div>
          </section> */}

          {/* <section id="faq" className="container relative mx-auto py-12">
            <h3 className="mb-14 text-center text-3xl font-semibold underline decoration-indigo-500/80 lg:text-left xl:text-4xl">Frequently Asked Questions</h3>
            <div className="my-6">
              <div className="rounded-t-2xl bg-teal-600/80 flex w-full cursor-pointer select-none items-center justify-between border-2 border-teal-600/30 px-4 py-4 text-gray-300 transition duration-300 hover:border-teal-600/80 hover:text-white">
                <h4 className="text-lg font-medium">What is Octo Space?</h4>
                <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 448 512" height={22} width={22} xmlns="http://www.w3.org/2000/svg">
                  <path d="M416 208H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h384c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z" />
                </svg>
              </div>
              <div className="inline-flex w-full rounded-b-2xl border-x-2 border-b-2 border-dashed border-teal-600/30 px-4 py-4 text-gray-300">
                <h5>Octo Space is a collection of 1000+ amazing figures with
                  different attributes and styles hosted on Ethereum Blockchain. 
                  You can buy these figures on OpenSea.
                </h5>
              </div>
            </div>
            <div className="my-6">
              <div className="rounded-t-2xl bg-teal-600/80 flex w-full cursor-pointer select-none items-center justify-between border-2 border-teal-600/30 px-4 py-4 text-gray-300 transition duration-300 hover:border-teal-600/80 hover:text-white">
                <h4 className="text-lg font-medium">How much do they Cost?</h4>
                <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 448 512" height={22} width={22} xmlns="http://www.w3.org/2000/svg">
                  <path d="M416 208H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h384c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z" />
                </svg>
              </div>
              <div className="inline-flex w-full rounded-b-2xl border-x-2 border-b-2 border-dashed border-teal-600/30 px-4 py-4 text-gray-300">
                <h5>Octo Space is a collection of 1000+ amazing figures with
                  different attributes and styles hosted on Ethereum Blockchain. 
                  You can buy these figures on OpenSea.
                </h5>
              </div>
            </div>
            <div className="my-6">
              <div className="rounded-t-2xl bg-teal-600/80 flex w-full cursor-pointer select-none items-center justify-between border-2 border-teal-600/30 px-4 py-4 text-gray-300 transition duration-300 hover:border-teal-600/80 hover:text-white">
                <h4 className="text-lg font-medium">Can I buy an NFT from Opensea?</h4>
                <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 448 512" height={22} width={22} xmlns="http://www.w3.org/2000/svg">
                  <path d="M416 208H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h384c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z" />
                </svg>
              </div>
              <div className="inline-flex w-full rounded-b-2xl border-x-2 border-b-2 border-dashed border-teal-600/30 px-4 py-4 text-gray-300">
                <h5>Octo Space is a collection of 1000+ amazing figures with
                  different attributes and styles hosted on Ethereum Blockchain. 
                  You can buy these figures on OpenSea.
                </h5>
              </div>
            </div>
          </section> */}
        </main>
        <div className="bg-transparent py-10 text-gray-300">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex flex-col">
              <div className="mb-3 text-lg">Bored Town Social</div>

              <div className="flex items-center space-x-4">
                <a href="/#">
                  <div className="rounded-full bg-gray-900/40 p-2 transition duration-300 hover:scale-110">
                    <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 640 512" height={28} width={28} xmlns="http://www.w3.org/2000/svg">
                      <path d="M524.531,69.836a1.5,1.5,0,0,0-.764-.7A485.065,485.065,0,0,0,404.081,32.03a1.816,1.816,0,0,0-1.923.91,337.461,337.461,0,0,0-14.9,30.6,447.848,447.848,0,0,0-134.426,0,309.541,309.541,0,0,0-15.135-30.6,1.89,1.89,0,0,0-1.924-.91A483.689,483.689,0,0,0,116.085,69.137a1.712,1.712,0,0,0-.788.676C39.068,183.651,18.186,294.69,28.43,404.354a2.016,2.016,0,0,0,.765,1.375A487.666,487.666,0,0,0,176.02,479.918a1.9,1.9,0,0,0,2.063-.676A348.2,348.2,0,0,0,208.12,430.4a1.86,1.86,0,0,0-1.019-2.588,321.173,321.173,0,0,1-45.868-21.853,1.885,1.885,0,0,1-.185-3.126c3.082-2.309,6.166-4.711,9.109-7.137a1.819,1.819,0,0,1,1.9-.256c96.229,43.917,200.41,43.917,295.5,0a1.812,1.812,0,0,1,1.924.233c2.944,2.426,6.027,4.851,9.132,7.16a1.884,1.884,0,0,1-.162,3.126,301.407,301.407,0,0,1-45.89,21.83,1.875,1.875,0,0,0-1,2.611,391.055,391.055,0,0,0,30.014,48.815,1.864,1.864,0,0,0,2.063.7A486.048,486.048,0,0,0,610.7,405.729a1.882,1.882,0,0,0,.765-1.352C623.729,277.594,590.933,167.465,524.531,69.836ZM222.491,337.58c-28.972,0-52.844-26.587-52.844-59.239S193.056,219.1,222.491,219.1c29.665,0,53.306,26.82,52.843,59.239C275.334,310.993,251.924,337.58,222.491,337.58Zm195.38,0c-28.971,0-52.843-26.587-52.843-59.239S388.437,219.1,417.871,219.1c29.667,0,53.307,26.82,52.844,59.239C470.715,310.993,447.538,337.58,417.871,337.58Z" />
                    </svg>
                  </div>
                </a>
                {/* <a href="/#">
                  <div className="rounded-full bg-gray-900/40 p-2 transition duration-300 hover:scale-110">
                    <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 448 512" height={28} width={28} xmlns="http://www.w3.org/2000/svg">
                      <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
                    </svg>
                  </div>
                </a> */}
                <a href="/#">
                  <div className="rounded-full bg-gray-900/40 p-2 transition duration-300 hover:scale-110">
                    <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 512 512" height={28} width={28} xmlns="http://www.w3.org/2000/svg">
                      <path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z" />
                    </svg>
                  </div>
                </a>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <div className="mb-3 text-lg">Opti.Domains Social</div>

              <div className="flex items-center space-x-4">
                <a href="/#">
                  <div className="rounded-full bg-gray-900/40 p-2 transition duration-300 hover:scale-110">
                    <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 640 512" height={28} width={28} xmlns="http://www.w3.org/2000/svg">
                      <path d="M524.531,69.836a1.5,1.5,0,0,0-.764-.7A485.065,485.065,0,0,0,404.081,32.03a1.816,1.816,0,0,0-1.923.91,337.461,337.461,0,0,0-14.9,30.6,447.848,447.848,0,0,0-134.426,0,309.541,309.541,0,0,0-15.135-30.6,1.89,1.89,0,0,0-1.924-.91A483.689,483.689,0,0,0,116.085,69.137a1.712,1.712,0,0,0-.788.676C39.068,183.651,18.186,294.69,28.43,404.354a2.016,2.016,0,0,0,.765,1.375A487.666,487.666,0,0,0,176.02,479.918a1.9,1.9,0,0,0,2.063-.676A348.2,348.2,0,0,0,208.12,430.4a1.86,1.86,0,0,0-1.019-2.588,321.173,321.173,0,0,1-45.868-21.853,1.885,1.885,0,0,1-.185-3.126c3.082-2.309,6.166-4.711,9.109-7.137a1.819,1.819,0,0,1,1.9-.256c96.229,43.917,200.41,43.917,295.5,0a1.812,1.812,0,0,1,1.924.233c2.944,2.426,6.027,4.851,9.132,7.16a1.884,1.884,0,0,1-.162,3.126,301.407,301.407,0,0,1-45.89,21.83,1.875,1.875,0,0,0-1,2.611,391.055,391.055,0,0,0,30.014,48.815,1.864,1.864,0,0,0,2.063.7A486.048,486.048,0,0,0,610.7,405.729a1.882,1.882,0,0,0,.765-1.352C623.729,277.594,590.933,167.465,524.531,69.836ZM222.491,337.58c-28.972,0-52.844-26.587-52.844-59.239S193.056,219.1,222.491,219.1c29.665,0,53.306,26.82,52.843,59.239C275.334,310.993,251.924,337.58,222.491,337.58Zm195.38,0c-28.971,0-52.843-26.587-52.843-59.239S388.437,219.1,417.871,219.1c29.667,0,53.307,26.82,52.844,59.239C470.715,310.993,447.538,337.58,417.871,337.58Z" />
                    </svg>
                  </div>
                </a>
                {/* <a href="/#">
                  <div className="rounded-full bg-gray-900/40 p-2 transition duration-300 hover:scale-110">
                    <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 448 512" height={28} width={28} xmlns="http://www.w3.org/2000/svg">
                      <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
                    </svg>
                  </div>
                </a> */}
                <a href="/#">
                  <div className="rounded-full bg-gray-900/40 p-2 transition duration-300 hover:scale-110">
                    <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 512 512" height={28} width={28} xmlns="http://www.w3.org/2000/svg">
                      <path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z" />
                    </svg>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
