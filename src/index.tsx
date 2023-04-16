import { ActionPanel, Action, List } from "@raycast/api";
import { useFetch, Response } from "@raycast/utils";
import { useState } from "react";
import { URLSearchParams } from "node:url";



// create a request object that POSTs to this link https://www.phind.com/api/bing/search/

// const request = new Request("https://www.phind.com/api/bing/search/", {
//   method: "POST",
//   headers: {
//     "Content-Type": "application/json",
//   },
//   // body: JSON.stringify({
//   //   q: "react",
//   // }),
// });

// create a function that fetches a post request to "https://www.phind.com/api/bing/search/" with an input of the search query and returns the response object from the API. SUPPORT the const { data, isLoading }

export default function Command() {
  const [searchText, setSearchText] = useState("");
  let data: any;

  fetch("https://www.phind.com/api/bing/search/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      q: searchText,
    }),
  })
    .then((response) => {
      data = response.json();
    })
    .then((data) => console.log(data));

  data = parseFetchResponse(data);

  return (
    <List isLoading={true} onSearchTextChange={setSearchText} searchBarPlaceholder="Search Phind" throttle>
      <List.Section title="Results" subtitle={data?.length + ""}>
        {data?.map((searchResult: SearchResult) => (
          <SearchListItem key={searchResult.name} searchResult={searchResult} />
        ))}
      </List.Section>
    </List>
  );
}

function SearchListItem({ searchResult }: { searchResult: SearchResult }) {
  return (
    <List.Item
      title={searchResult.name}
      subtitle={searchResult.description}
      actions={
        <ActionPanel>
          <ActionPanel.Section>
            <Action.OpenInBrowser title="Open in Browser" url={searchResult.url} />
          </ActionPanel.Section>
          <ActionPanel.Section>
            <Action.CopyToClipboard
              title="Copy Install Command"
              content={`npm install ${searchResult.name}`}
              shortcut={{ modifiers: ["cmd"], key: "." }}
            />
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
}

/** Parse the response from the fetch query into something we can display */
async function parseFetchResponse(response: Response) {
  console.log(response.json());
  const json = (await response.json()) as
    | {
        results: {
          suggestion: {
            name: string;
          };
        }[];
      }
    | { code: string; message: string };

  if (!response.ok || "message" in json) {
    throw new Error("message" in json ? json.message : response.statusText);
  }

  return json.results.map((result) => {
    return {
      name: result.suggestion.name,
    } as SearchResult;
  });
}

interface SearchResult {
  name: string;
  description?: string;
  url: string;
}
