import { prisma } from '@repo/db';
import { notFound } from 'next/navigation';
import { SharedSolutions } from './_components/SharedSolutions';
import { Alert, AlertDescription, AlertTitle } from '@repo/ui/components/alert';
import { Button } from '@repo/ui/components/button';
import Link from 'next/link';
import { auth } from '~/server/auth';

export default async function SharedSolutionPage(props: { params: { username: string } }) {
  const [, username] = decodeURIComponent(props.params.username).split('@');
  if (username === undefined) {
    notFound();
  }
  const sharedSolutions = await prisma.sharedSolution.findMany({
    select: {
      isPinned: true,
      challenge: {
        select: {
          difficulty: true,
          name: true,
        },
      },
      _count: {
        select: {
          vote: true,
          solutionComment: true,
        },
      },
    },
    where: {
      user: {
        name: username,
      },
    },
  });
  const solutions = sharedSolutions.map((s) => ({
    commentCount: s._count.solutionComment,
    voteCount: s._count.vote,
    isPinned: s.isPinned,
    challenge: { difficulty: s.challenge?.difficulty ?? 'BEGINNER', name: s.challenge?.name ?? '' },
  }));

  const session = await auth();
  const isOwnProfile = username === session?.user.name;

  return (
    <div className="mt-8 lg:mt-10">
      <h1 className="text-center text-xl">Shared Solutions</h1>
      {solutions.length > 0 ? (
        <SharedSolutions
          solutions={solutions}
          className="mt-2"
          isOwnProfile={isOwnProfile}
          username={username}
        />
      ) : (
        <Alert className="mx-auto mt-4 w-fit md:px-8">
          <AlertTitle className="mx-auto w-fit md:px-8">
            <AlertTitle className="text-center leading-normal">
              <span>{isOwnProfile ? "You haven't" : `@${username} hasn't`}</span> shared any{' '}
              challenges yet
            </AlertTitle>
            {isOwnProfile ? (
              <AlertDescription className="flex justify-center">
                <Button variant="link" size="sm">
                  <Link href="./completed">
                    Explore your completed solutions and share your own!
                  </Link>
                </Button>
              </AlertDescription>
            ) : null}
          </AlertTitle>
        </Alert>
      )}
    </div>
  );
}