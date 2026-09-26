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

/** Soft blush band used at the top of inner pages. */
export function PageHeader({ eyebrow, title, subtitle, breadcrumbs, children, className }: PageHeaderProps) {
  return (
    <header className={cn('bg-blush py-12 md:py-16 lg:py-20', className)}>
      <Container className="text-center">
        {breadcrumbs && <Breadcrumbs items={breadcrumbs} className="mb-6 flex justify-center" />}
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h1 className="type-display mx-auto max-w-3xl text-foreground">{title}</h1>
        {subtitle && <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground md:text-lg">{subtitle}</p>}
        {children}
      </Container>
    </header>
  );
}
