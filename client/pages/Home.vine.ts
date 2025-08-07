import { AuroraBackground, Greeting, WhoAmI } from '../components/Landing.vine'

export default function PageHome() {
  return vine`
    <div
      class="trantor-landing relative mb-auto w-full col-flex flex-1 pt-20 px-6% md:px-15% sm:px-15%"
    >
      <AuroraBackground />
      <div class="row-flex animate-fade-in animate-duration-1600">
        <div class="greeting-container w-full col-flex font-rubik">
          <Greeting />
          <WhoAmI />
        </div>
      </div>
    </div>
  `
}
