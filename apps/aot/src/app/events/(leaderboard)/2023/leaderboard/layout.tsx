import { hasAdventStarted } from '~/utils/time-utils';
import { notFound } from 'next/navigation';
import { getAllFlags } from '~/utils/feature-flag';
import { YEAR } from '../date_constants';
import { DayScroller } from '../../_components/day-scroller';
import { ComingSoon } from '~/app/coming-soon';

export const dynamic = 'force-static';

export default async function LeaderboardLayout({ children }: { children: React.ReactNode }) {
  const { enableAotPlatform } = await getAllFlags();

  if (!enableAotPlatform) {
    return <ComingSoon />;
  }

  if (!hasAdventStarted(YEAR)) return notFound();

  return (
    <div className="container mx-auto pt-8">
      <div className="container fixed inset-0 top-20">
        <DayScroller year={YEAR} />
      </div>
      {children}
    </div>
  );
}