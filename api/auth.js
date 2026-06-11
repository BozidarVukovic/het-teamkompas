export default function handler(req, res) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const siteUrl = process.env.SITE_URL || "https://www.mijnteamkompas.nl";
  const redirectUri = `${siteUrl}/api/callback`;

  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", "repo,user");

  res.redirect(302, url.toString());
}
