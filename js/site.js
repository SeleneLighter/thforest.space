document.addEventListener("DOMContentLoaded", () => {
  const notice = document.getElementById("notice");
  const showNotice = () => {
    if (!notice) return;
    notice.classList.add("active");
    window.setTimeout(() => notice.classList.remove("active"), 2000);
  };

  const copyWithFallback = (value) => {
    const input = document.createElement("textarea");
    input.value = value;
    input.setAttribute("readonly", "");
    input.style.position = "fixed";
    input.style.opacity = "0";
    document.body.appendChild(input);
    input.select();
    input.setSelectionRange(0, input.value.length);

    try {
      if (!document.execCommand("copy")) throw new Error("浏览器拒绝了复制命令");
    } finally {
      input.remove();
    }
  };

  const copyText = async (value) => {
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(value);
        return;
      } catch (error) {
        console.warn("Clipboard API 不可用，尝试兼容复制方式:", error);
      }
    }

    copyWithFallback(value);
  };

  document.querySelectorAll("[data-copy]").forEach((button) => {
    button.addEventListener("click", async () => {
      const value = button.dataset.copy || "";
      try {
        await copyText(value);
        showNotice();
      } catch (error) {
        console.error("复制失败:", error);
      }
    });
  });

  const search = document.getElementById("article-search");
  const cards = [...document.querySelectorAll("#posts-grid .post-link")];
  const noResults = document.getElementById("no-results");
  const normalize = (value) => value.normalize("NFKC").toLocaleLowerCase();
  const filterArticles = () => {
    const query = normalize(search.value);
    const keywords = query.split(/\s+/).filter(Boolean);
    let visible = 0;

    cards.forEach((card) => {
      const content = normalize(card.dataset.search || card.textContent || "");
      const matches = keywords.every((keyword) => content.includes(keyword));
      card.hidden = !matches;
      if (matches) visible += 1;
    });

    if (noResults) noResults.hidden = !query || visible !== 0;
  };

  if (search) {
    search.addEventListener("input", filterArticles);
    search.addEventListener("search", filterArticles);
  }
});
