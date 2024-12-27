'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  AudioWaveform,
  Blocks,
  BookOpen,
  Bot,
  BrushIcon,
  Calendar,
  Code,
  CodeXml,
  CodeXmlIcon,
  Command,
  Home,
  HomeIcon,
  Inbox,
  Lamp,
  LifeBuoyIcon,
  Lightbulb,
  LightbulbIcon,
  MessageCircleQuestion,
  Palette,
  PaletteIcon,
  Search,
  SearchIcon,
  Settings2,
  Sparkles,
  SquareTerminal,
  StoreIcon,
  Trash2,
} from 'lucide-react';

import { NavFavorites } from '@/components/dashboard/nav-favorites';
import { NavMain } from '@/components/dashboard/nav-main';
import { NavSecondary } from '@/components/dashboard/nav-secondary';
import { NavWorkspaces } from '@/components/dashboard/nav-workspaces';
import { TeamSwitcher } from '@/components/dashboard/team-switcher';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';

// This is sample data.
const data = {
  // teams: [
  //   {
  //     name: 'Acme Inc',
  //     logo: Command,
  //     plan: 'Enterprise',
  //   },
  //   {
  //     name: 'Acme Corp.',
  //     logo: AudioWaveform,
  //     plan: 'Startup',
  //   },
  //   {
  //     name: 'Evil Corp.',
  //     logo: Command,
  //     plan: 'Free',
  //   },
  // ],
  navMain: [
    {
      title: 'Explore Ethscriptions',
      url: '/live',
      icon: SearchIcon,
      isActive: true,
      items: [
        {
          title: 'All',
          url: '#/livefeed',
        },
        {
          // title: 'Clean (no garbage)',
          title: 'Clean',
          url: '#/clean',
          // isActive: true,
        },
        {
          // title: 'Media (images & videos)',
          title: 'Media',
          url: '#/media',
        },
        {
          // title: 'Interactive (html, js, css)',
          title: 'Interactive',
          url: '#/interactive',
        },
        {
          title: 'Collections',
          url: '#/collections',
        },
      ],
    },
    {
      title: 'Learnhub',
      url: '#',
      icon: LightbulbIcon,
      items: [
        {
          title: 'The Basics',
          url: '#/basics',
        },
        {
          title: 'Guides',
          url: '#/guides',
        },
        {
          title: 'Tutorials',
          url: '#/tutorials',
        },
        {
          title: 'Resources',
          url: '#/resources',
        },
      ],
    },
    {
      title: 'Developers',
      url: '#',
      icon: CodeXmlIcon,
      items: [
        {
          title: 'Pricing & Usage',
          url: '#/api-pricing',
        },
        {
          title: 'APIs Reference',
          url: '#/api-reference',
        },
        {
          title: 'Dev Portal',
          url: '#/portal',
        },
        {
          title: 'Guides',
          url: '#/guides',
        },
      ],
    },
    {
      title: 'Creators Hub',
      url: '#',
      icon: PaletteIcon,
      items: [
        {
          title: 'Plans & Pricing',
          url: '#/creators-pricing',
        },
        {
          title: 'Launch Collection',
          url: '#/launchpad',
        },
        {
          title: 'FAQ & Guides',
          url: '#/creator-guides',
        },
      ],
    },
    // {
    //   title: 'Auction House',
    //   url: '#/auction-house',
    //   icon: StoreIcon,
    // },
    // {
    //   title: 'Create Ethscriptions',
    //   url: '#/create-ethscription',
    //   icon: BrushIcon,
    // },
  ],
  navSecondary: [
    {
      title: 'Auction House',
      url: '#/auction-house',
      icon: StoreIcon,
    },
    {
      title: 'Create Ethscription',
      url: '#/create-ethscription',
      icon: BrushIcon,
    },
    {
      title: 'Support',
      url: '#/support',
      icon: LifeBuoyIcon,
    },
  ],
  // navMain: [
  //   {
  //     title: 'Search',
  //     url: '#',
  //     icon: Search,
  //   },
  //   {
  //     title: 'Ask AI',
  //     url: '#',
  //     icon: Sparkles,
  //   },
  //   {
  //     title: 'Home',
  //     url: '#',
  //     icon: Home,
  //     isActive: true,
  //   },
  //   {
  //     title: 'Inbox',
  //     url: '#',
  //     icon: Inbox,
  //     badge: '10',
  //   },
  // ],
  // navSecondary: [
  //   {
  //     title: 'Calendar',
  //     url: '#',
  //     icon: Calendar,
  //   },
  //   {
  //     title: 'Settings',
  //     url: '#',
  //     icon: Settings2,
  //   },
  //   {
  //     title: 'Templates',
  //     url: '#',
  //     icon: Blocks,
  //   },
  //   {
  //     title: 'Trash',
  //     url: '#',
  //     icon: Trash2,
  //   },
  //   {
  //     title: 'Help',
  //     url: '#',
  //     icon: MessageCircleQuestion,
  //   },
  // ],
  favorites: [
    {
      name: '0xNeko OG',
      url: '#/collections/0xneko-og',
      logo: 'https://union-api.ordex.ai/content/embedded/4b26881dfc7b5d4ec69c6674c954c1072d31df09a791124f1742f991c3c3ea1d',
    },
    {
      name: 'Mfpurrs',
      url: '#/collectins/mfpurrs',
      logo: 'https://union-api.ordex.ai/content/embedded/c291fd1620209cb795414c7eeca189c64c3522e2f1736ae224c92cf501ccfadd',
    },
    {
      name: 'Ittybits',
      url: '#/collections/ittybits',
      logo: 'https://ordex.io/images/collections/ittybits/logo.png',
    },
    {
      name: 'Nakamingos',
      url: '#/collections/nagamingos',
      logo: 'https://union-api.ordex.ai/content/embedded/26d19751ad8edde3d60d5d158cd0c1d11cb7d6b49a67c9426f0b488517a0480c',
    },
    {
      name: 'Mickey Mouse',
      url: '#/collections/mickey-mouse',
      logo: 'https://union-api.ordex.ai/content/embedded/be74c0e4ad428e8964844681eaacc4e3fea5109888b632119ca3800847ff7ab7',
    },
    {
      name: 'Moonbirds',
      url: '#/collections/moonbirds',
      logo: 'https://union-api.ordex.ai/content/embedded/83226daaaed2c342ab9c93420f24635e2a7f69380600aa4cfc8ac2519c234fc8',
    },
  ],
  // workspaces: [
  //   {
  //     name: 'Personal Life Management',
  //     emoji: '🏠',
  //     pages: [
  //       {
  //         name: 'Daily Journal & Reflection',
  //         url: '#',
  //         emoji: '📔',
  //       },
  //       {
  //         name: 'Health & Wellness Tracker',
  //         url: '#',
  //         emoji: '🍏',
  //       },
  //       {
  //         name: 'Personal Growth & Learning Goals',
  //         url: '#',
  //         emoji: '🌟',
  //       },
  //     ],
  //   },
  //   {
  //     name: 'Professional Development',
  //     emoji: '💼',
  //     pages: [
  //       {
  //         name: 'Career Objectives & Milestones',
  //         url: '#',
  //         emoji: '🎯',
  //       },
  //       {
  //         name: 'Skill Acquisition & Training Log',
  //         url: '#',
  //         emoji: '🧠',
  //       },
  //       {
  //         name: 'Networking Contacts & Events',
  //         url: '#',
  //         emoji: '🤝',
  //       },
  //     ],
  //   },
  //   {
  //     name: 'Creative Projects',
  //     emoji: '🎨',
  //     pages: [
  //       {
  //         name: 'Writing Ideas & Story Outlines',
  //         url: '#',
  //         emoji: '✍️',
  //       },
  //       {
  //         name: 'Art & Design Portfolio',
  //         url: '#',
  //         emoji: '🖼️',
  //       },
  //       {
  //         name: 'Music Composition & Practice Log',
  //         url: '#',
  //         emoji: '🎵',
  //       },
  //     ],
  //   },
  //   {
  //     name: 'Home Management',
  //     emoji: '🏡',
  //     pages: [
  //       {
  //         name: 'Household Budget & Expense Tracking',
  //         url: '#',
  //         emoji: '💰',
  //       },
  //       {
  //         name: 'Home Maintenance Schedule & Tasks',
  //         url: '#',
  //         emoji: '🔧',
  //       },
  //       {
  //         name: 'Family Calendar & Event Planning',
  //         url: '#',
  //         emoji: '📅',
  //       },
  //     ],
  //   },
  //   {
  //     name: 'Travel & Adventure',
  //     emoji: '🧳',
  //     pages: [
  //       {
  //         name: 'Trip Planning & Itineraries',
  //         url: '#',
  //         emoji: '🗺️',
  //       },
  //       {
  //         name: 'Travel Bucket List & Inspiration',
  //         url: '#',
  //         emoji: '🌎',
  //       },
  //       {
  //         name: 'Travel Journal & Photo Gallery',
  //         url: '#',
  //         emoji: '📸',
  //       },
  //     ],
  //   },
  // ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="#sas">
                {/* <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <HomeIcon className="size-4" />
                </div> */}
                <div className="grid flex-1 text-center">
                  <span className="text-paytone animate-rainbow bg-gradient-to-br from-purple-400 to-orange-500 box-decoration-clone bg-size-2x bg-clip-text text-xl font-extrabold tracking-wide text-transparent sm:tracking-wider">
                    Calldata.Space
                  </span>
                  {/* <span className="truncate text-xs">heartbeat of the EVM</span> */}
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        {/* <TeamSwitcher teams={data.teams} />
        <NavMain items={data.navMain} /> */}
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} />
        <NavFavorites favorites={data.favorites} />
        {/* <NavWorkspaces workspaces={data.workspaces} /> */}
      </SidebarContent>
      {/* <SidebarRail /> */}
    </Sidebar>
  );
}
