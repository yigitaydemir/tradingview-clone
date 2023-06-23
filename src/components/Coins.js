import React, { useEffect, useState } from "react";
import { Table, Checkbox, Pagination } from "flowbite-react/lib/esm";
import { Link } from "react-router-dom";
import { auth, db } from "../utils/Firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  arrayRemove,
  arrayUnion,
  doc,
  setDoc,
  updateDoc,
} from "firebase/firestore";

const Coins = () => {
  const [user, loading] = useAuthState(auth);

  const [coins, setCoins] = useState();

  const [currentPage, setCurrentPage] = useState(1);
  const [coinsPerPage, setCoinsPerPage] = useState(10);

  useEffect(() => {
    const options = {
      headers: {
        "Content-Type": "application/json",
        "x-access-token":
          "coinrankingffd88d7f1f3ded6efdd4294f69bc4947eaeea7a7afd17f66",
      },
    };

    fetch("https://api.coinranking.com/v2/coins", options)
      .then((response) => response.json())
      .then((result) => setCoins(result.data.coins));
  }, []);

  // Get Current Coins
  const indexOfLastCoin = currentPage * coinsPerPage;
  const indexOfFirstCoin = indexOfLastCoin - coinsPerPage;
  const currentCoins = coins?.slice(indexOfFirstCoin, indexOfLastCoin);

  const onPageChange = (page) => setCurrentPage(page);

  const handleWatchlist = async (e) => {
    if (user) {
      // if logged in
      await setDoc(doc(db, "watchlists", user.uid), {
        watchlist: []
      });
      const watchlistRef = doc(db, "watchlists", user.uid);

      if (e.target.checked) {
        // add to watchlist
        await updateDoc(watchlistRef, {
          watchlist: arrayUnion(e.target.value),
        });
      } else {
        // remove from watchlist
        await updateDoc(watchlistRef, {
          watchlist: arrayRemove(e.target.value),
        });
      }
    } else {
      // if not logged in
      console.log("uye girisi yapilmamis...");
    }
  };

  return (
    <div>
      <Table hoverable className="w-full max-w-screen-xl m-auto my-5">
        <Table.Head>
          <Table.HeadCell></Table.HeadCell>
          <Table.HeadCell>Rank</Table.HeadCell>
          <Table.HeadCell>Name</Table.HeadCell>
          <Table.HeadCell className="text-right">Price</Table.HeadCell>
          <Table.HeadCell className="text-right">24 %</Table.HeadCell>
          <Table.HeadCell className="text-right">Market Cap</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y">
          {currentCoins?.map((coin) => (
            <Table.Row
              key={coin.rank}
              className="bg-white dark:border-gray-700 dark:bg-gray-800"
            >
              <Table.Cell className="!p-4">
                <Checkbox
                  value={coin.uuid}
                  onChange={(e) => handleWatchlist(e)}
                />
              </Table.Cell>
              <Table.Cell>{coin.rank}</Table.Cell>
              <Table.Cell className="flex justify-start items-center whitespace-nowrap font-medium">
                <img src={coin.iconUrl} className="w-7"></img>
                <Link to={`/coins/${coin.uuid}`}>
                  <span className="mx-2 text-gray-900 dark:text-white">
                    {coin.name}
                  </span>
                </Link>

                <span className="text-grey-100">{coin.symbol}</span>
              </Table.Cell>
              <Table.Cell className="text-right">
                {Number(coin.price).toFixed(5)}
              </Table.Cell>
              <Table.Cell
                className={
                  Number(coin.change) < 0
                    ? "text-red-500 text-right"
                    : "text-green-500 text-right"
                }
              >
                {coin.change}
              </Table.Cell>
              <Table.Cell className="text-right">
                {Number(coin.marketCap).toLocaleString()}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>

      <div className="flex items-center justify-center">
        <Pagination
          currentPage={currentPage}
          onPageChange={(page) => {
            setCurrentPage(page);
          }}
          showIcons
          totalPages={5}
          className="inline-block my-4"
        />
      </div>
    </div>
  );
};

export default Coins;