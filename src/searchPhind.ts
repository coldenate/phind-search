import { Builder, By, Key, until, } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome";
declare var prompt: (message?: string, defaultValue?: string) => string | null;

interface PhindSearchOptions {
  headless?: boolean;
  useCreativeAnswer?: boolean;
  useExpertMode?: boolean;
  useConciseAnswer?: boolean;
}

class PhindAPI {
  private driver: any;
  private useConciseAnswer: boolean;

  constructor(options?: PhindSearchOptions) {
    const { headless = true, useCreativeAnswer = true, useExpertMode = false, useConciseAnswer = true } = options ?? {};

    this.useConciseAnswer = useConciseAnswer;

    const chromeOptions = new chrome.Options();
    if (headless) {
      chromeOptions.addArguments("--headless");
    }

    const driverPath = "/Users/n8sol/Code Projects/msedgedriver"; // specify the path to the ChromeDriver executable
    const service = new chrome.ServiceBuilder(driverPath).build();
    chrome.setDefaultService(service);

    this.driver = new Builder().forBrowser("chrome").setChromeOptions(chromeOptions).build();

    // Initialize, Configure LocalStorage
    this.driver.get("https://staging.phind.com/");
    this.driver.executeScript(`localStorage.setItem('useDetailedAnswer', ${!useConciseAnswer})`);
    this.driver.executeScript(`localStorage.setItem('useCreativeAnswer', ${useCreativeAnswer})`);
    this.driver.executeScript(`localStorage.setItem('useExpertMode', ${useExpertMode})`);
  }

  public async search(query: string, timeout = 30, verbose = false) {
    await this.driver.get(`https://staging.phind.com/search?q=${query}`);
    let searchResult = await this.driver.wait(
      until.elementLocated(
        By.css(
          ".col-lg-10 > div:nth-child(2) > div:nth-child(4) > div:nth-child(1) > div:nth-child(1) > span:nth-child(2)"
        )
      ),
      timeout * 1000
    );

    let searchResults = await searchResult.getText();
    if (verbose) {
      console.log("Parsing data stream...");
    }

    let searchResultsOld = "";
    while (searchResults !== searchResultsOld || searchResults === "") {
      searchResultsOld = searchResults;
      await this.driver.sleep((timeout / 15) * 1000);
      searchResults = await searchResult.getText();
    }

    return searchResults;
  }

  public async close(verbose = false) {
    if (verbose) {
      console.log("Shutting down the spider...");
    }
    await this.driver.quit();
  }
}

// If this module is ran as a script
if (require.main === module) {
  const search = async () => {
    const query = process.argv[2];
    console.log("Initialising the spider...");
    const phindAPI = new PhindAPI();

    while (true) {
      console.log("Connecting...");
      const searchResults = await phindAPI.search(query, 30, true);
      console.log(searchResults);
      const newQuery = prompt("Press enter to exit or enter a new query to fetch: ");
      if (!newQuery) {
        await phindAPI.close(true);
        process.exit();
      }
    }
  };

  search();
}

export default PhindAPI;
