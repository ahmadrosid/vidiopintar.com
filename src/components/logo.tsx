import Link from "next/link"

export const Logo = () => {
  return (
    <Link href="/" className="flex gap-1 items-center">
      <img src="play.svg" className="size-5 "></img>
      <span className="select-none tracking-tight">vidiopintar</span>
    </Link>
  )
}
