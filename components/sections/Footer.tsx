import Link from "next/link";
import { Briefcase, Github } from "lucide-react";

const LINKS = {
  Product: [
    { label: "Browse Tasks", href: "/tasks" },
    { label: "Post a Task",  href: "/tasks/new" },
    { label: "Dashboard",    href: "/dashboard" },
  ],
  Company: [
    { label: "About",   href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  Legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms",   href: "/terms" },
  ],
} as const;

export default function Footer() {
  return (
    <footer className="bg-white border-t border-zinc-100">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-12 sm:py-16">

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-8">

          {/* Brand */}
          <div className="col-span-2 sm:col-span-4 lg:col-span-2 flex flex-col gap-4">
            <Link href="/" className="inline-flex items-center gap-2 group w-fit">
              <div className="h-7 w-7 rounded-lg bg-zinc-900 flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-200">
                <Briefcase className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-sm font-bold text-zinc-900 tracking-tight">LocalGig</span>
            </Link>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-xs">
              A hyperlocal marketplace connecting people with trusted workers in their city. Built in Bengaluru.
            </p>
            <a
              href="https://github.com/vamshi-vamsharaj/localgig"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-zinc-700 transition-colors w-fit"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
          </div>

          {/* Link columns */}
          {(Object.entries(LINKS) as unknown as [keyof typeof LINKS, { label: string; href: string }[]][]).map(([group, items]) => (
            <div key={group} className="flex flex-col gap-3">
              <p className="text-xs font-bold text-zinc-900 uppercase tracking-wider">{group}</p>
              <ul className="flex flex-col gap-2">
                {items.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-zinc-400">
            © {new Date().getFullYear()} LocalGig. All rights reserved.
          </p>
          <p className="text-xs text-zinc-400">
            Made with ♥ in Hyderabad
          </p>
        </div>
      </div>
    </footer>
  );
}