const RELEASES_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQk7QqpNK8gMOWRHLd_6-L5K_yrnlYMrunNvUg71CHisjMW0c_JLZDyCHBfC4ic0hrGSAXxiybhGLqp/pub?gid=862052154&single=true&output=csv';

const WORKS_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vS7n6xPm4_OUFNf036OUHE4yJye5Ovq9C-sIUOy5d1EX4IBvBZNdEZolRiEVWyd11dvEzKsd5QaTsLu/pub?gid=1319497704&single=true&output=csv';

const BLOG_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vRsUxdFjUFSvBHvYWlRn2Lnq8EZqIx77aRcZUpO4hpvpd_rlZeQwi2ggGYY22uy63v-xx_KOWX6FuOY/pub?gid=0&single=true&output=csv';

const startLoadingAnimation = (elementId) => {
  const element = document.getElementById(elementId);
  if (!element) return null;

  let state = 0;
  element.innerHTML = '<p class="starnotes loading-text">☆loading☆</p>';

  const intervalId = setInterval(() => {
    state = 1 - state;
    const text = state === 0 ? '☆loading☆' : '♫loading♫';
    element.innerHTML = `<p class="starnotes loading-text">${text}</p>`;
  }, 200);

  return intervalId;
};

async function fetchCSV(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  const text = await res.text();
  const result = Papa.parse(text, { header: true, skipEmptyLines: true });
  if (result.errors.length > 0 && result.data.length === 0) {
    throw new Error('CSV parsing error');
  }
  return result.data;
}

function formatCredits(str) {
  if (!str) return '';
  return str
    .split('|')
    .map(s => s.trim())
    .join('<br>');
}

function buildReleasesHTML(rows) {
  let tocItems = '';
  rows.forEach(row => {
    tocItems += `<li><a href="#${row.id}">${row.title}</a></li>\n`;
  });

  const tocHTML = `
    <details class="toc">
      <summary>index</summary>
      <ul>
        ${tocItems}
      </ul>
    </details>`;

  let sectionsHTML = '';
  rows.forEach(row => {
    const linkKeys = Object.keys(row).filter(
      k => k.startsWith('link_') && row[k]
    );
    const lyricsKeys = Object.keys(row).filter(
      k => k.startsWith('lyrics_') && row[k]
    );

    let linksHTML = '';
    linkKeys.forEach(k => {
      const serviceName = k.replace('link_', '');
      linksHTML += `<li><a href="${row[k]}">${serviceName}</a></li>\n`;
    });

    let lyricsHTML = '';
    if (lyricsKeys.length > 0) {
      lyricsHTML += '<p>☆ lyrics ☆</p>\n';
      lyricsKeys.forEach(k => {
        const lang = k.replace('lyrics_', '');
        lyricsHTML += `<li><a href="${row[k]}">lyrics ${lang}</a></li>\n`;
      });
    }

    let instHTML = '';
    if (row.inst_mp3) {
      const filename = row.inst_mp3.split('/').pop();
      instHTML = `<p>♫ inst ♫</p>
        <li><a href="${row.inst_mp3}" download="${filename}">${filename.replace('.mp3', '')}</a></li>`;
    }

    let creditsHTML = '';
    if (row.credits) {
      creditsHTML = `<p>☆ credits ☆<br><br>${formatCredits(row.credits)}</p>`;
    }

    let videoHTML = '';
    if (row.youtube_id) {
      let videoId = row.youtube_id;
      const match = row.youtube_id.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
      if (match && match[1]) {
        videoId = match[1];
      }
      videoHTML = `
        <div class="video-container">
          <iframe src="https://www.youtube.com/embed/${videoId}"
            title="${row.title}" frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
        </div>`;
    }

    const desc = row.description
      ? row.description
        .split(/\r\n|\n|\|/)
        .map(s => s.trim())
        .join('<br>')
      : '';
    const dateStr = row.date || '';

    sectionsHTML += `
      <section class="release" id="${row.id}">
        <h2>${row.title}</h2>
        ${videoHTML}
        <p class="description">${dateStr}${dateStr && desc ? '<br>' : ''}${desc}</p>
        <nav class="links">
          <ul>
            ${linksHTML}
            ${lyricsHTML}
            ${instHTML}
            ${creditsHTML}
          </ul>
        </nav>
      </section>

      <p class="starnotes">☆♫☆</p>
    `;
  });

  return { tocHTML, sectionsHTML };
}

async function loadReleases() {
  const containerId = 'releases-content';
  const container = document.getElementById(containerId);
  if (!container) return;

  const loadingInterval = startLoadingAnimation(containerId);

  try {
    const rows = await fetchCSV(RELEASES_CSV_URL);
    if (loadingInterval) clearInterval(loadingInterval);

    const { tocHTML, sectionsHTML } = buildReleasesHTML(rows);
    container.innerHTML = `
      ${tocHTML}

      <p class="starnotes">☆♫☆</p>

      ${sectionsHTML}
    `;
  } catch (err) {
    console.error('Failed to load releases:', err);
    if (loadingInterval) clearInterval(loadingInterval);
    container.innerHTML = '<p class="starnotes loading-text">☹☹☹<br>!!! loading failed !!!<br>☹☹☹</p>';
  }
}

function buildWorksHTML(rows) {
  let tocItems = '';
  rows.forEach(row => {
    tocItems += `<li><a href="#${row.id}">${row.title}</a></li>\n`;
  });

  const tocHTML = `
    <details class="toc">
      <summary>index</summary>
      <ul>
        ${tocItems}
      </ul>
    </details>`;

  let sectionsHTML = '';
  rows.forEach(row => {
    let linkHTML = '';
    if (row.link_url) {
      linkHTML = `
        <nav class="links">
          <ul>
            <li><a href="${row.link_url}">${row.link_text || row.link_url}</a></li>
          </ul>
        </nav>`;
    }

    let videoHTML = '';
    if (row.youtube_url) {
      let videoId = row.youtube_url;
      const match = row.youtube_url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
      if (match && match[1]) {
        videoId = match[1];
      }
      videoHTML = `
        <div class="video-container">
          <iframe src="https://www.youtube.com/embed/${videoId}"
            title="${row.title}" frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
        </div>`;
    } else if (row.niconico_url) {
      let videoId = row.niconico_url;
      const match = row.niconico_url.match(/nicovideo\.jp\/watch\/([a-zA-Z0-9]+)/);
      if (match && match[1]) {
        videoId = match[1];
      }
      videoHTML = `
        <div class="video-container">
          <iframe src="https://embed.nicovideo.jp/watch/${videoId}?jsapi=1"
            title="${row.title}" frameborder="0" allowfullscreen></iframe>
        </div>`;
    }

    const desc = row.description
      ? row.description
        .split(/\r\n|\n|\|/)
        .map(s => s.trim())
        .join('<br>')
      : '';

    sectionsHTML += `
      <section class="release" id="${row.id}">
        <h2>${row.title}</h2>
        ${videoHTML}
        <p class="description">${desc}</p>
        ${linkHTML}
      </section>

      <p class="starnotes">☆♫☆</p>
    `;
  });

  return { tocHTML, sectionsHTML };
}

async function loadWorks() {
  const containerId = 'works-content';
  const container = document.getElementById(containerId);
  if (!container) return;

  const loadingInterval = startLoadingAnimation(containerId);

  try {
    const rows = await fetchCSV(WORKS_CSV_URL);
    if (loadingInterval) clearInterval(loadingInterval);

    const { tocHTML, sectionsHTML } = buildWorksHTML(rows);
    container.innerHTML = `
      ${tocHTML}

      <p class="starnotes">☆♫☆</p>

      ${sectionsHTML}
    `;
  } catch (err) {
    console.error('Failed to load works:', err);
    if (loadingInterval) clearInterval(loadingInterval);
    container.innerHTML = '<p class="starnotes loading-text">☹☹☹<br>!!! loading failed !!!<br>☹☹☹</p>';
  }
}

function parseBlogLine(lineText) {
  const text = lineText.trim();
  if (!text) return '';

  const youtubeMatch = text.match(/^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})(?:\S*)?$/);
  if (youtubeMatch && youtubeMatch[1]) {
    const videoId = youtubeMatch[1];
    return `
      <div class="video-container">
        <iframe src="https://www.youtube.com/embed/${videoId}"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
      </div>`;
  }

  const nicoMatch = text.match(/^(?:https?:\/\/)?(?:www\.)?nicovideo\.jp\/watch\/([a-zA-Z0-9]+)(?:\S*)?$/);
  if (nicoMatch && nicoMatch[1]) {
    const videoId = nicoMatch[1];
    return `
      <div class="video-container">
        <iframe src="https://embed.nicovideo.jp/watch/${videoId}?jsapi=1"
          frameborder="0" allowfullscreen></iframe>
      </div>`;
  }

  const imageMatch = text.match(/^(https?:\/\/\S+\.(?:jpe?g|png|gif|webp)(?:\?\S*)?(?:#\S*)?)$/i);
  if (imageMatch && imageMatch[1]) {
    const imageUrl = imageMatch[1];
    return `<img src="${imageUrl}" alt="blog image" style="max-width: 100%; margin: 10px auto; display: block;">`;
  }

  const linkMatch = text.match(/^(https?:\/\/\S+)$/);
  if (linkMatch && linkMatch[1]) {
    const url = linkMatch[1];
    return `<a href="${url}" target="_blank" rel="noopener">${url}</a>`;
  }

  return text;
}

function buildBlogHTML(rows) {
  let tocItems = '';
  rows.forEach(row => {
    const titleText = row.title || row.date || '無題';
    tocItems += `<li><a href="#${row.id}">${titleText}</a></li>\n`;
  });

  const tocHTML = `
    <details class="toc">
      <summary>index</summary>
      <ul>
        ${tocItems}
      </ul>
    </details>`;

  let sectionsHTML = '';
  rows.forEach(row => {
    let linkHTML = '';
    if (row.link_url) {
      linkHTML = `
        <nav class="links">
          <ul>
            <li><a href="${row.link_url}">${row.link_text || row.link_url}</a></li>
          </ul>
        </nav>`;
    }

    let videoHTML = '';
    if (row.youtube_url) {
      let videoId = row.youtube_url;
      const match = row.youtube_url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
      if (match && match[1]) {
        videoId = match[1];
      }
      videoHTML = `
        <div class="video-container">
          <iframe src="https://www.youtube.com/embed/${videoId}"
            title="${row.title}" frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
        </div>`;
    }

    const descContents = row.description
      ? row.description
        .split(/\r\n|\n|\|/)
        .map(s => parseBlogLine(s))
      : [];

    let descHTML = '';
    descContents.forEach((lineHTML, i) => {
      descHTML += lineHTML;
      if (i < descContents.length - 1) {
        if (!lineHTML.startsWith('<div') && !lineHTML.startsWith('<img') && lineHTML !== '') {
          descHTML += '<br>';
        }
      }
    });

    const dateStr = row.date || '';

    sectionsHTML += `
      <section class="release" id="${row.id}">
        <h2>${row.title || ''}</h2>
        ${videoHTML}
        <div class="description">${dateStr}${dateStr && descHTML ? '<br><br>' : ''}${descHTML}</div>
        ${linkHTML}
      </section>

      <p class="starnotes">☆♫☆</p>
    `;
  });

  return { tocHTML, sectionsHTML };
}

async function loadBlog() {
  const containerId = 'blog-content';
  const container = document.getElementById(containerId);
  if (!container) return;

  const loadingInterval = startLoadingAnimation(containerId);

  try {
    const rows = await fetchCSV(BLOG_CSV_URL);
    if (loadingInterval) clearInterval(loadingInterval);

    const { tocHTML, sectionsHTML } = buildBlogHTML(rows);
    container.innerHTML = `
      ${tocHTML}

      <p class="starnotes">☆♫☆</p>

      ${sectionsHTML}
    `;
  } catch (err) {
    console.error('Failed to load blog:', err);
    if (loadingInterval) clearInterval(loadingInterval);
    container.innerHTML = '<p class="starnotes loading-text">☹☹☹<br>!!! loading failed !!!<br>☹☹☹</p>';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadReleases();
  loadWorks();
  loadBlog();
});
