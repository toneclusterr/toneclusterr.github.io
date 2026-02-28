/**
 * content-loader.js
 * Google スプレッドシートの CSV データを取得し、
 * releases.html / works.html のコンテンツを動的に生成する。
 */

const RELEASES_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQk7QqpNK8gMOWRHLd_6-L5K_yrnlYMrunNvUg71CHisjMW0c_JLZDyCHBfC4ic0hrGSAXxiybhGLqp/pub?gid=862052154&single=true&output=csv';

const WORKS_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vS7n6xPm4_OUFNf036OUHE4yJye5Ovq9C-sIUOy5d1EX4IBvBZNdEZolRiEVWyd11dvEzKsd5QaTsLu/pub?gid=1319497704&single=true&output=csv';

/* ───────── ユーティリティ ───────── */

/**
 * ローディングアニメーションを開始する
 */
const startLoadingAnimation = (elementId) => {
  const element = document.getElementById(elementId);
  if (!element) return null;

  let state = 0;
  // 初期表示
  element.innerHTML = '<p class="starnotes loading-text">☆loading☆</p>';

  const intervalId = setInterval(() => {
    state = 1 - state; // 0と1を切り替え
    const text = state === 0 ? '☆loading☆' : '♫loading♫';
    element.innerHTML = `<p class="starnotes loading-text">${text}</p>`;
  }, 200);

  return intervalId;
};

/**
 * CSV を fetch → PapaParse でパース → オブジェクト配列を返す
 */
async function fetchCSV(url) {
  const res = await fetch(url);
  const text = await res.text();
  const result = Papa.parse(text, { header: true, skipEmptyLines: true });
  return result.data;
}

/**
 * credits 文字列の "|" を <br> に変換
 */
function formatCredits(str) {
  if (!str) return '';
  return str
    .split('|')
    .map(s => s.trim())
    .join('<br>');
}

/* ───────── Releases ページの生成 ───────── */

function buildReleasesHTML(rows) {
  // --- TOC (目次) ---
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

  // --- 各リリースセクション ---
  let sectionsHTML = '';
  rows.forEach(row => {
    // link_ で始まるキーを収集
    const linkKeys = Object.keys(row).filter(
      k => k.startsWith('link_') && row[k]
    );
    // lyrics_ で始まるキーを収集
    const lyricsKeys = Object.keys(row).filter(
      k => k.startsWith('lyrics_') && row[k]
    );

    // リンク一覧
    let linksHTML = '';
    linkKeys.forEach(k => {
      const serviceName = k.replace('link_', '');
      linksHTML += `<li><a href="${row[k]}">${serviceName}</a></li>\n`;
    });

    // 歌詞リンク
    let lyricsHTML = '';
    if (lyricsKeys.length > 0) {
      lyricsHTML += '<p>☆ lyrics ☆</p>\n';
      lyricsKeys.forEach(k => {
        const lang = k.replace('lyrics_', '');
        lyricsHTML += `<li><a href="${row[k]}">lyrics ${lang}</a></li>\n`;
      });
    }

    // インスト
    let instHTML = '';
    if (row.inst_mp3) {
      const filename = row.inst_mp3.split('/').pop();
      instHTML = `<p>♫ inst ♫</p>
        <li><a href="${row.inst_mp3}" download="${filename}">${filename.replace('.mp3', '')}</a></li>`;
    }

    // クレジット
    let creditsHTML = '';
    if (row.credits) {
      creditsHTML = `<p>☆ credits ☆<br><br>${formatCredits(row.credits)}</p>`;
    }

    // YouTube
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

    // description (改行対応: | → <br>)
    const desc = row.description
      ? row.description
        .split('|')
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

  // アニメーション開始
  const loadingInterval = startLoadingAnimation(containerId);

  try {
    const rows = await fetchCSV(RELEASES_CSV_URL);
    // データ取得完了、アニメーション停止
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
    container.innerHTML = '<p>データの読み込みに失敗しました。</p>';
  }
}

/* ───────── Works ページの生成 ───────── */

function buildWorksHTML(rows) {
  // --- TOC ---
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

  // --- 各 works セクション ---
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

    // YouTube
    let videoHTML = '';
    if (row.youtube_url) {
      // URLからIDを抽出 (もしID直書きならそのまま使う)
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
      // ニコニコ動画の埋め込み (youtubeが優先、無ければニコニコ)
      // URLからID(smXXX等)を抽出 (もしID直書きならそのまま使う)
      let videoId = row.niconico_url;
      const match = row.niconico_url.match(/nicovideo\.jp\/watch\/([a-zA-Z0-9]+)/);
      if (match && match[1]) {
        videoId = match[1];
      }
      // ニコニコ動画の外部プレイヤー仕様 (scriptタグではなくiframeで直接呼び出し、YouTubeと同じサイズにするためvideo-containerを使用)
      videoHTML = `
        <div class="video-container">
          <iframe src="https://embed.nicovideo.jp/watch/${videoId}?jsapi=1"
            title="${row.title}" frameborder="0" allowfullscreen></iframe>
        </div>`;
    }

    // description (改行対応: | → <br>)
    const desc = row.description
      ? row.description
        .split('|')
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

  // アニメーション開始
  const loadingInterval = startLoadingAnimation(containerId);

  try {
    const rows = await fetchCSV(WORKS_CSV_URL);
    // データ取得完了、アニメーション停止
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
    container.innerHTML = '<p>データの読み込みに失敗しました。</p>';
  }
}

/* ───────── 初期化 ───────── */

document.addEventListener('DOMContentLoaded', () => {
  loadReleases();
  loadWorks();
});
