import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ArrowRight } from "lucide-react"
import Link from "next/link";
export default function Home() {
  return (
    <div className="flex min-h-screen items-col  bg-white">

      <main className="flex-1">
        {/*hero section */}
        <section className="container mx-auto px-4 py-32">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-black text-6xl mb-6 font-bold">
              Find Work Near You. Hire Talent Around You.
            </h1>
            <p className="text-muted-foreground mb-10 text-xl">
              A smarter way to connect local jobs and local talent.            </p>
            <div className="text-black gap-4 flex flex-col items-center">
              <Link href="/sign-up">
                <Button size="lg" className="text-0.8lg h-10 px-6 font-medium ">
                  Get Started<ArrowRight className="ml-1 mt-1" />
                </Button>
              </Link>

              <p className="text-muted-foreground  text-sm">
                Choose your role and start in seconds.
              </p>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
