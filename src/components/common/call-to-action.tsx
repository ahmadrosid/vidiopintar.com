import { FormStartLearning } from "../landing/FormStartLearning"

export default function CallToAction() {
  return (
    <div className=" flex bg-card gap-6 mt-2.5 items-center justify-center w-full min-h-[378px] px-12 rounded-xs lg:bg-[url(/footer-asset.svg)] sm:bg-none bg-no-repeat bg-right bg-contain">
      <div className="flex flex-col justify-center gap-6 w-full h-full">
        <div className="text-3xl font-semibold text-left tracking-tight">
          Start your learning today, Free.
          <div className="text-base font-normal mt-2 text-secondary-foreground tracking-normal">
            Learn Any Topic, One Video at a Time.
          </div>
        </div>
        <div className="relative">
          <FormStartLearning isFooter={true} />
        </div>
      </div>
    </div>
  )
}
