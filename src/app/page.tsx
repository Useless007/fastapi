"use client";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  // สร้างตัวแปร state ชื่อ input และ setSearchResult
  // โดยหลัง useState<string>() คือกำหนดค่าเริ่มต้นให้เป็น string
  // และ useState<{
  //   result: string[];
  //   duration: number;
  // }>(
  //   คือกำหนดค่าเริ่มต้นให้เป็น object ที่มี key ชื่อ result และ duration
  const [DomResult, setDomResult] = useState<boolean>(false);
  const [Country, setCountry] = useState<string>();
  const [input, setInput] = useState<string>();
  const [searchResults, setSearchResult] = useState<{
    results: string[];
    duration: number;
  }>();

  useEffect(
    () => {
      // สร้าง function fetchData ที่รับค่า input และทำการ fetch ข้อมูลจาก api
      const fetchData = async () => {
        // console.log(DomResult);
        if (!input) {
          setDomResult(false);
          return setSearchResult(undefined);
        }
        // once deployed, prefix this with your cloudflare worker url
        // i.e.: https://<name>.<account-name>.workers.dev/api/search?q=${input}

        // const res = await fetch(`/api/search?q=${input}`);
        const res = await fetch(
          `https://fastapi.useless007.workers.dev/api/search?q=${input}`
        );
        const data = (await res.json()) as {
          results: string[];
          duration: number;
        };
        setSearchResult(data);
      };

      // เรียกใช้ function fetchData
      // console.log("Capital from state: ", Country);
      fetchData();
    },
    // กำหนด dependency ให้ useEffect ทำงานเมื่อ input มีการเปลี่ยนแปลง
    [input]
  );

  useEffect(() => {
    // console.log(Country);
    if (!Country) return setDomResult(false);
    setDomResult(true);
    // console.log("Capital Change: ", Country);
    // console.log(DomResult);
  }, [Country]);

  return (
    <main className="h-screen w-screen grainy">
      <div className="flex flex-col gap-6 items-center pt-32 duration-500 animate-in animate fade-in-5 slide-in-from-bottom-2.5">
        <h1 className="text-5xl tracking-tight font-bold">SpeedSearch ⚡</h1>
        <p className="text-zinc-600 text-lg max-w-prose text-center">
          A high-performance API built with Hono, Next.js, Redis and Cloudflare.{" "}
          <br /> Type a query below and get your results in miliseconds.
        </p>

        <div className="max-w-md w-full">
          <Command>
            <CommandInput
              value={input}
              onValueChange={setInput}
              placeholder="Search countries..."
              className="placeholder:text-zinc-500"
            />
            <CommandList>
              {/* <p>{searchResults?.results}</p> */}
              {/* <p>{searchResults?.results.length}</p> */}
              {searchResults?.results.length === 0 && DomResult !== true ? (
                <CommandEmpty>No results found.</CommandEmpty>
              ) : null}
              {DomResult === true ? (
                <CommandEmpty>Your Select Country: {Country}</CommandEmpty>
              ) : null}

              {searchResults?.results ? (
                <CommandGroup heading="Results">
                  {searchResults?.results?.map((result) => (
                    <CommandItem
                      key={result}
                      value={result}
                      onSelect={(e) => {
                        const capital =
                          e.charAt(0).toUpperCase() + e.slice(1).toLowerCase();
                        setInput(capital);
                        setCountry(capital);
                        setDomResult(true);
                        // console.log(e);
                        // console.log(capital);
                      }}
                    >
                      {result}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ) : null}
              {searchResults?.results ? (
                <>
                  <div className="h-px w-full bg-zinc-200" />
                  <p className="p-2 text-xs text-zinc-500">
                    Found {searchResults?.results?.length} results in{" "}
                    {searchResults?.duration.toFixed(0)}ms
                  </p>
                </>
              ) : null}
            </CommandList>
          </Command>
        </div>
      </div>
    </main>
  );
}
