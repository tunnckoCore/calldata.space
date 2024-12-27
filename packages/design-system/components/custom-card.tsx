import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface CardProps {
  title: string;
  text: string;
  to?: string;
  href?: string;
  external?: boolean;
  icon: string;
}

export function CustomCard({ title, text, to, href, external = false, icon }: CardProps) {
  const target = external ? { target: '_blank' } : {};
  const _href = to || href || '#';

  return (
    <Link href={_href} {...target}>
      <Card className="feature group h-full w-full rounded-xl border border-[#673d94] bg-purple-400/10 bg-clip-padding p-6 shadow-md shadow-[#673d94]/50 backdrop-blur-lg backdrop-filter transition hover:border-purple-500">
        <CardHeader className="mx-auto w-full p-0">
          <CardTitle className="flex w-full items-center justify-between text-lg font-semibold">
            <div className="flex items-center gap-3">
              <div
                className="flex rounded-md border border-[#673d94] bg-purple-400/15 bg-clip-padding p-2 backdrop-blur-lg backdrop-filter transition group-hover:border-purple-500"
                dangerouslySetInnerHTML={{ __html: icon }}
              />
              <div className="title animate-rainbow bg-gradient-to-br from-purple-400 to-orange-400 bg-size-2x bg-clip-text text-lg tracking-wider text-transparent sm:text-xl">
                {title}
              </div>
            </div>
            <div className="hidden sm:group-hover:flex sm:group-hover:transition">
              <ArrowRight className="h-6 w-6 text-white" />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="mt-4 p-0">
          <p className="text-base leading-relaxed text-slate-200">{text}</p>
        </CardContent>
      </Card>
      {/* <ShadCard className="feature group flex h-full rounded-xl border border-[#673d94] bg-purple-400/10 bg-clip-padding p-0 shadow-md shadow-[#673d94]/50 backdrop-blur-lg backdrop-filter transition hover:border-purple-500">
        <CardContent className="flex h-full flex-col items-start p-6">
          <CardHeader className="mx-auto w-full p-0">
            <dt className="flex w-full items-center justify-between text-lg font-semibold">
              <div className="flex items-center gap-3">
                <div
                  className="flex rounded-md border border-[#673d94] bg-purple-400/15 bg-clip-padding p-2 backdrop-blur-lg backdrop-filter transition group-hover:border-purple-500"
                  dangerouslySetInnerHTML={{ __html: icon }}
                />
                <div className="title animate-rainbow bg-gradient-to-br from-purple-400 to-orange-400 bg-size-2x bg-clip-text text-lg tracking-wider text-transparent sm:text-xl">
                  {title}
                </div>
              </div>
              <div className="hidden sm:group-hover:flex sm:group-hover:transition">
                <ArrowRight className="h-6 w-6 text-white" />
              </div>
            </dt>
          </CardHeader>
          <dd className="mt-4 leading-relaxed text-slate-100">{text}</dd>
        </CardContent>
      </ShadCard> */}
    </Link>
  );
}

// NOTE: Original html/astro/jsx based
// function Card({ title, text, to, href, external = false, icon }: CardProps) {
//   const target = external ? { target: '_blank' } : {};
//   const _href = to || href || '#';

//   return (
//     <Link
//       href={_href}
//       {...target}
//       className="feature group flex rounded-xl border border-[#673d94] bg-purple-400/10 bg-clip-padding p-6 shadow-md shadow-[#673d94]/50 backdrop-blur-lg backdrop-filter transition hover:border-purple-500"
//     >
//       <div className="feature flex flex-col items-start">
//         <dt className="mx-auto flex w-full items-center justify-between text-lg font-semibold">
//           <div className="flex items-center gap-3">
//             <div
//               className="flex rounded-md border border-[#673d94] bg-purple-400/15 bg-clip-padding p-2 backdrop-blur-lg backdrop-filter transition group-hover:border-purple-500"
//               dangerouslySetInnerHTML={{ __html: icon }}
//             />
//             <div
//               className="title animate-rainbow bg-gradient-to-br from-purple-400 to-orange-400 bg-size-2x bg-clip-text text-lg tracking-wider text-transparent sm:text-xl"
//             >
//               {title}
//             </div>
//           </div>
//           <div className="hidden sm:group-hover:flex sm:group-hover:transition">
//             <ArrowRight className="h-6 w-6 text-white" />
//             {/* <svg
//               className="h-6 w-6 text-white"
//               aria-hidden="true"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth="1.5"
//               viewBox="0 0 24 24"
//               xmlns="http://www.w3.org/2000/svg"
//             >
//               <path
//                 d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//               ></path>
//             </svg> */}
//           </div>
//         </dt>
//         <dd className="mt-4 leading-relaxed text-slate-100">{text}</dd>
//       </div>
//     </Link>
//   );
// };
