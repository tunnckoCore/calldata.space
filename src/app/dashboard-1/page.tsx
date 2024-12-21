import { AppSidebar } from '@/components/dashboard/app-sidebar';
import { NavActions } from '@/components/dashboard/nav-actions';
import { NavUser } from '@/components/dashboard/nav-user';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

export default function Page() {
  const data = {
    name: 'tunnckocore.eth',
    address: '0xA20C...5002',
    avatar: 'https://avatars.githubusercontent.com/u/5038030?v=4',
  };
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background/60">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-b-sidebar">
          <div className="flex flex-1 items-center gap-2 px-3">
            <SidebarTrigger className="hover:bg-sidebar" />
            <Separator orientation="vertical" className="mr-2 h-4 bg-sidebar" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage className="line-clamp-1 text-secondary-foreground">
                    The Heartbeat of the EVM calldata
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="ml-auto px-3">
            <NavUser user={data} />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="grid auto-rows-min gap-4 md:grid-cols-5">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-xl bg-muted/50" />
            ))}
          </div>
        </div>
        {/* <div className="flex flex-1 flex-col gap-4 px-4 py-10">
          <div className="mx-auto h-24 w-full max-w-3xl rounded-xl bg-muted/50" />
          <div className="mx-auto h-full w-full max-w-3xl rounded-xl bg-muted/50" />
        </div> */}
      </SidebarInset>
    </SidebarProvider>
  );
}
