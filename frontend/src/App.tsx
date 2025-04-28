import { Button } from "@/components/ui/button";
import { useUpProvider } from "./services/UPProvider";
import Dashboard from "./components/owner/dashboard";
import {
  fetchOwnedLSP8Tokens,
  useLSP8OwnedTokens,
} from "./hooks/useLsp8OwnedTokens";
import { useEffect } from "react";

function App() {
  const { accounts, contextAccounts } = useUpProvider();

  // useEffect(() => {
  //   const test = async () => {
  //     console.log(accounts[0], "lol");
  //     const x = await fetchOwnedLSP8Tokens(
  //       accounts[0],
  //       "0x62C31c7ca0dc27630Db4B6ADf5C2aF5763B0fD3a"
  //     );
  //     console.log(x, "lol");
  //   };
  //   test();
  // }, []);

  const isReady =
    accounts &&
    accounts.length > 0 &&
    contextAccounts &&
    contextAccounts.length > 0;

  if (!isReady)
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full border-4 border-gray-300 border-t-gray-900 h-12 w-12" />
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );

  return <Dashboard />;
}

export default App;
