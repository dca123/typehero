import { prisma } from '@repo/db';
import { Challenges } from './_components/challenges';
import { notFound } from 'next/navigation';
import { auth } from '~/server/auth';
import { AlertTitle, Alert, AlertDescription } from '@repo/ui/components/alert';
import { Button } from '@repo/ui/components/button';
import Link from 'next/link';

export default async function CompletedPage(props: { params: { username: string } }) {
  const [, username] = decodeURIComponent(props.params.username).split('@');
  if (username === undefined) {
    notFound();
  }
  const challenges = await prisma.challenge.findMany({
    select: {
      difficulty: true,
      id: true,
      name: true,
      submission: true,
      updatedAt: true,
      shortDescription: true,
      user: {
        select: { name: true },
      },
      _count: {
        select: {
          vote: true,
          comment: true,
        },
      },
    },
    where: {
      submission: {
        some: {
          isSuccessful: true,
          user: {
            name: username,
          },
        },
      },
    },
  });
  const session = await auth();
  const isOwnProfile = username === session?.user.name;

  return (
    <div className="mt-8 lg:mt-10">
      <h1 className="text-center text-xl">Completed Challenges</h1>
      {challenges.length > 0 ? (
        <Challenges
          challenges={challenges}
          isOwnProfile={isOwnProfile}
          username={username}
          className="mt-2"
        />
      ) : (
        <Alert className="mx-auto mt-4 w-fit md:px-8">
          <AlertTitle className="mx-auto w-fit md:px-8">
            <AlertTitle className="text-center leading-normal">
              <span>{isOwnProfile ? "You haven't" : `@${username} hasn't`}</span> completed any{' '}
              challenges yet
            </AlertTitle>
            {isOwnProfile ? (
              <AlertDescription className="flex justify-center">
                <Button variant="link" size="sm">
                  <Link href={`/explore}`}>Get started with your first challenge</Link>
                </Button>
              </AlertDescription>
            ) : null}
          </AlertTitle>
        </Alert>
      )}
    </div>
  );
}