import type { ThemeProviderProps } from 'next-themes';
import { Toaster } from './components/ui/sonner';
import { TooltipProvider } from './components/ui/tooltip';
import { ThemeProvider } from './providers/theme';

type DesignSystemProviderProps = ThemeProviderProps;

export const DesignSystemProvider = ({ children, ...props }: DesignSystemProviderProps) => (
  <ThemeProvider {...props}>
    <TooltipProvider>{children}</TooltipProvider>
    <Toaster />
  </ThemeProvider>
);
