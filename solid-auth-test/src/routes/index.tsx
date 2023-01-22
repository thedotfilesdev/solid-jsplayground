import { Suspense, type VoidComponent } from "solid-js";
import { A, Head, Title, Meta, Link } from "solid-start";
import { trpc } from "../utils/trpc";
import { signOut, signIn } from "@auth/solid-start/client";
import { createServerData$ } from "solid-start/server";
import { getSession } from "@auth/solid-start";
import { authOpts } from "./api/auth/[...solidauth]";
import example from "~/server/trpc/router/example";
import { createContext } from "~/server/trpc/context";

const Home: VoidComponent = () => {
  const hello = trpc.example.hello.useQuery(() => ({ name: "from tRPC" }));
  return (
    <>
      <Head>
        <Title>An app</Title>
        <Meta name="description" content="Generated by create-jd-app" />
        <Link rel="icon" href="/favicon.ico" />
      </Head>
      <main class="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#026d56] to-[#152a2c]">
        <div class="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <div class="flex flex-col items-center gap-2">
            <Suspense>
              <AuthShowcase />
            </Suspense>
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;

const AuthShowcase: VoidComponent = () => {
  const data = createSession();
  return (
    <div class="flex flex-col items-center justify-center gap-4">
      <p class="text-center text-2xl text-white">
        {data()?.session && (
          <span>Logged in as {data()?.session?.user?.name}</span>
        )}
      </p>
      <button
        class="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        onClick={
          data()?.session ? () => void signOut() : () => void signIn("github")
        }
      >
        {data()?.session ? "Sign out" : "Sign in"}
      </button>
    </div>
  );
};

const createSession = () => {
  return createServerData$(async (_, event) => {
    const result = await example
      .createCaller(
        await createContext({
          req: event.request,
          res: { headers: event.request.headers },
        })
      )
      .hello({ name: "test" });

    const session = await getSession(event.request, authOpts);
    return {
      session,
      result,
    };
  });
};
