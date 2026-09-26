import { cn } from '@/lib/utils';

type ContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  as?: 'div' | 'section' | 'header' | 'footer' | 'nav';
};

/** Max 1240px wide, 16 / 24 / 32px side padding (see tailwind container config). */
export function Container({ as: Tag = 'div', className, ...props }: ContainerProps) {
  return <Tag className={cn('container', className)} {...props} />;
}
