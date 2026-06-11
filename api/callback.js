export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send("<h1>Fout: geen code ontvangen van GitHub</h1>");
  }

  try {
    const response = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const data = await response.json();

    if (!data.access_token) {
      return res
        .status(400)
        .send(`<h1>Auth fout: ${data.error_description || "Onbekende fout"}</h1>`);
    }

    const token = data.access_token;
    const provider = "github";

    // Stuur token terug naar Decap CMS popup via postMessage
    const html = `<!DOCTYPE html>
<html>
<body>
<script>
(function() {
  var token = ${JSON.stringify(token)};
  var provider = "github";
  function receiveMessage(e) {
    window.opener.postMessage(
      "authorization:" + provider + ":success:" + JSON.stringify({ token: token, provider: provider }),
      e.origin
    );
    window.removeEventListener("message", receiveMessage, false);
  }
  window.addEventListener("message", receiveMessage, false);
  window.opener.postMessage("authorizing:" + provider, "*");
})();
</script>
</body>
</html>`;

    res.setHeader("Content-Type", "text/html");
    res.send(html);
  } catch (err) {
    res.status(500).send(`<h1>Serverfout: ${err.message}</h1>`);
  }
}
