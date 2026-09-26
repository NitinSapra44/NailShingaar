import { cn } from '@/lib/utils';
import { Container } from './Container';
import { Breadcrumbs, type Crumb } from './Breadcrumbs';

type PageHeaderProps = {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  breadcrumbs?: Crumb[];
  children?: React.ReactNode;
  className?: string;
};

/** Editorial header used at the top of inner pages. */
export function PageHeader({ eyebrow, title, subtitle, breadcrumbs, children, className }: PageHeaderProps) {
  return (
    <header className={cn('border-b border-border bg-background pb-12 pt-10 md:pb-16 md:pt-14', className)}>
      <Container>
        {breadcrumbs && <Breadcrumbs items={breadcrumbs} className="mb-8" />}
        {eyebrow && (
          <p className="eyebrow mb-5 flex items-center gap-3">
            <span aria-hidden className="h-px w-8 bg-foreground/30" />
            {eyebrow}
          </p>
        )}
        <h1 className="max-w-4xl text-[40px] font-medium leading-[0.98] tracking-[-0.04em] text-foreground sm:text-[56px] lg:text-[76px]">
          {title}
        </h1>
        {subtitle && <p className="mt-6 max-w-xl text-base text-muted-foreground md:text-lg">{subtitle}</p>}
        {children}
      </Container>
    </header>
  );
}
