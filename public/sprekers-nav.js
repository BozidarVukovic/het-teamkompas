(() => {
  const targetHref = "/sprekers";

  function normalizeHref(anchor) {
    try {
      return new URL(anchor.href, window.location.origin).pathname.replace(/\/$/, "") || "/";
    } catch {
      return anchor.getAttribute("href") || "";
    }
  }

  function addSpeakerLinks() {
    const teamdagLinks = [...document.querySelectorAll('a[href]')]
      .filter((anchor) => normalizeHref(anchor) === "/teamdag");

    teamdagLinks.forEach((teamdagLink) => {
      const parent = teamdagLink.parentElement;
      if (!parent) return;

      const alreadyPresent = [...parent.querySelectorAll('a[href]')]
        .some((anchor) => normalizeHref(anchor) === targetHref);
      if (alreadyPresent) return;

      const speakerLink = teamdagLink.cloneNode(true);
      speakerLink.href = targetHref;
      speakerLink.textContent = "Sprekers";
      speakerLink.removeAttribute("aria-current");
      speakerLink.onclick = null;
      speakerLink.addEventListener("click", () => {
        window.location.href = targetHref;
      });
      teamdagLink.insertAdjacentElement("afterend", speakerLink);
    });

    document.querySelectorAll("footer").forEach((footer) => {
      if (footer.querySelector('a[href="/sprekers"]')) return;
      const link = document.createElement("a");
      link.href = targetHref;
      link.textContent = "Sprekers";
      link.style.marginLeft = "16px";
      link.style.color = "inherit";
      footer.appendChild(link);
    });
  }

  let scheduled = false;
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(() => {
      scheduled = false;
      addSpeakerLinks();
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", schedule, { once: true });
  } else {
    schedule();
  }

  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
