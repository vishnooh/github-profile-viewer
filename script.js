const searchForm = document.querySelector(".search-container"),
  searchedText = document.querySelector("input"),
  searchButton = document.querySelector("button"),
  loadingState = document.querySelector(".loading-state"),
  emptyState = document.querySelector(".empty-state"),
  errorState = document.querySelector(".error-state"),
  foundState = document.querySelector(".found-state"),
  rateState = document.querySelector(".rate-limit-state"),
  usernameSpans = document.querySelectorAll(".searched-username"),
  profilePic = document.querySelector("#profile-pic"),
  profileName = document.querySelector("#name"),
  profileUsername = document.querySelector("#username"),
  profileLink = document.querySelector("#profile-link"),
  profileDescription = document.querySelector("#profile-description"),
  locationBlock = document.querySelector("#location-block"),
  profileLocation = document.querySelector("#profile-location"),
  joinedDate = document.querySelector("#joined-date"),
  websiteLink = document.querySelector("#website-link"),
  websiteText = document.querySelector("#website-text"),
  socialsLink = document.querySelector("#socials-link"),
  socialsText = document.querySelector("#socials-text"),
  repoCount = document.querySelector("#repo-count"),
  followersCount = document.querySelector("#followers-count"),
  followingCount = document.querySelector("#following-count");

// keep Search disabled until there is something to look up
searchedText.addEventListener("input", function () {
  searchButton.disabled = searchedText.value.trim() === "";
});

// runs on Search click or Enter, async because we wait on GitHub
searchForm.addEventListener("submit", async function (event) {
  // stop browser from reloading the page on submit
  event.preventDefault();

  // trim so to remove stray space
  const fixedUsername = searchedText.value.trim();
  // show loading, hide every other state
  loadingState.hidden = false;
  emptyState.hidden = true;
  errorState.hidden = true;
  foundState.hidden = true;
  rateState.hidden = true;

  // put the searched name in both messages (loading and not-found)
  usernameSpans.forEach(function (span) {
    span.textContent = "@" + fixedUsername;
  });

  // time the request to enforce a minimum loading time
  const loadingStartedAt = performance.now();
  const response = await fetch("https://api.github.com/users/" + fixedUsername);
  console.log(response.status);
  const data = await response.json();
  const elapsedMs = performance.now() - loadingStartedAt;
  console.log(data);

  // hold the loading page briefly
  const minimumLoadingMs = 300;

  if (elapsedMs < minimumLoadingMs) {
    const remainingDelayMs = minimumLoadingMs - elapsedMs;

    // pause for whatever is left of the minimum
    await new Promise(function (resolve) {
      setTimeout(resolve, remainingDelayMs);
    });
  }

  // pick which state to show based on response

  if (response.status === 404) {
    loadingState.hidden = true;
    errorState.hidden = false;
  } else if (response.ok) {
    loadingState.hidden = true;
    foundState.hidden = false;

    profileName.textContent = data.name || data.login;

    profileUsername.textContent = "@"+data.login;
    profilePic.src = data.avatar_url;
    profileLink.href = data.html_url;

    profileDescription.hidden = !data.bio;
    profileDescription.textContent = data.bio;
    
    locationBlock.hidden = !data.location;
    profileLocation.textContent = data.location;
    
  

    joinedDate.textContent = "Joined "+ new Date(data.created_at).toLocaleDateString("en-GB", { month: "long", year: "numeric"});
    
    websiteLink.hidden = !data.blog;
    
    //check to see if given link starts with http
    if(!data.blog.startsWith("http")) {
      websiteLink.href = "https://" + data.blog; 
    }

    else
      websiteLink.href = data.blog;

    websiteText.textContent = data.blog;


    socialsLink.hidden = !data.twitter_username;
    socialsLink.href = "https://x.com/"+data.twitter_username;
    socialsText.textContent = data.twitter_username;

    repoCount.textContent = data.public_repos;
    followersCount.textContent = data.followers;
    followingCount.textContent = data.following;


    
  }

  // rate limited or any other failure
  else {
    rateState.hidden = false;
    loadingState.hidden = true;
  }
});
