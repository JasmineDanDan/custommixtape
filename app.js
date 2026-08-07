const themes = {
  cream: { name: "Meadow Sprig", detail: "ivory linen with tiny green sprigs", image: "gift-meadow-linen-v2.webp", bg: "#f8f5ed", tape: "#f8f5ed", label: "#fffdf4", ink: "#52633e" },
  yellow: { name: "Lemon Windowpane", detail: "soft lemon checks with little dots", image: "gift-lemon-window-v2.webp", bg: "#fff3a7", tape: "#fff3a7", label: "#fff8c8", ink: "#715f1d" },
  brick: { name: "Coral Ribbon", detail: "blush paper with hand-drawn blooms", image: "gift-coral-ribbon-v2.webp", bg: "#fff2ef", tape: "#fff2ef", label: "#fff8f4", ink: "#9b5653" },
  sky: { name: "Powder Constellation", detail: "powder blue stars and soft constellations", image: "gift-moonlit-sky-v2.webp", bg: "#b9d8ef", tape: "#b9d8ef", label: "#eef8ff", ink: "#235276" }
};
const stickers = [
  { id: "birthday-cake", label: "Strawberry cake", image: "birthday-cake.webp" },
  { id: "ribbon-gift-box", label: "Gift box", image: "ribbon-gift-box.webp" },
  { id: "tulip-bouquet", label: "Tulip bouquet", image: "tulip-bouquet.webp" },
  { id: "candy-cane", label: "Candy cane", image: "candy-cane.webp" },
  { id: "latte", label: "Latte", image: "latte.webp" },
  { id: "little-sun", label: "Little sun", image: "little-sun.webp" },
  { id: "rainbow", label: "Rainbow", image: "rainbow.webp" },
  { id: "pink-rose", label: "Pink rose", image: "pink-rose.webp" },
  { id: "satin-bow", label: "Satin bow", image: "satin-bow.webp" }
];
const giftScenes = ['All','Birthday','For a friend','Love & anniversary','A little comfort'];
const songs = [
  ["three-kisses", "Three Kisses", ["Love & anniversary"], "2:45", "https://prod-1.storage.jamendo.com/?trackid=1329500&format=mp32", "Jake Gordon", "https://www.jamendo.com/track/1329500", "CC BY-SA 3.0"],
  ["contigo-es-diferente", "Contigo Es Diferente", ["For a friend","Love & anniversary"], "2:38", "https://prod-1.storage.jamendo.com/?trackid=1247821&format=mp32", "Diversion Sonora", "https://www.jamendo.com/track/1247821", "CC BY-SA 3.0"],
  ["mundanely-romantic", "Mundanely Romantic", ["Love & anniversary","A little comfort"], "2:54", "https://prod-1.storage.jamendo.com/?trackid=980573&format=mp32", "Crazy Quilt Bouquet", "https://www.jamendo.com/track/980573", "CC BY-SA 3.0"],
  ["happy-birthday", "Happy Birthday", ["Birthday"], "2:37", "https://prod-1.storage.jamendo.com/?trackid=1083525&format=mp32", "Jason Silver", "https://www.jamendo.com/track/1083525", "CC BY-SA 3.0"],
  ["happy-phone", "Happy Phone", ["For a friend","A little comfort"], "2:15", "https://prod-1.storage.jamendo.com/?trackid=838203&format=mp32", "Zoltan Percsich", "https://www.jamendo.com/track/838203", "CC BY-SA 3.0"]
].map(([id,title,scenes,duration,audio,creator,source,license]) => ({id,title,scenes,duration,audio,creator,source,license}));

const isJCard = location.pathname.includes("custom-j-cards");
let activeAudio;
let activeSongId;
let toastTimer;
function toast(message) { clearTimeout(toastTimer); const node=document.querySelector('.toast') || document.body.appendChild(Object.assign(document.createElement('div'),{className:'toast'})); node.textContent=message; toastTimer=setTimeout(()=>node.remove(),2800); }
function esc(text="") { return String(text).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
function encode(value) { return btoa(unescape(encodeURIComponent(JSON.stringify(value)))).replaceAll('+','-').replaceAll('/','_').replaceAll('=',''); }
function decode(value) { try { return JSON.parse(decodeURIComponent(escape(atob(value.replaceAll('-','+').replaceAll('_','/') + '==='.slice((value.length+3)%4))))); } catch { return null; } }
function readDraft(key) { try { const value=JSON.parse(localStorage.getItem(key)||'null'); return value&&typeof value==='object'?value:null; } catch { return null; } }
function saveDraft(key,state) { try { localStorage.setItem(key,JSON.stringify(state)); } catch {} }
function clearDraft(key) { try { localStorage.removeItem(key); } catch {} }
function applyHash(state) { const payload = location.hash.startsWith('#card=') ? decode(location.hash.slice(6)) : null; return payload && typeof payload === 'object' ? {...state,...payload} : state; }
function writeHash(state) { history.replaceState(null,'',`${location.pathname}#card=${encode(state)}`); return location.href; }
function commonHeader(active) { return `<header class="site-header"><a class="brand" href="${isJCard ? '../' : './'}"><i class="brand-mark"></i>Tape Note</a><nav class="site-nav"><a class="${active==='mix'?'active':''}" href="${isJCard ? '../' : './'}">Make a mixtape</a><a class="${active==='jcard'?'active':''}" href="${isJCard ? './' : './custom-j-cards/'}">Custom J cards</a></nav></header>`; }
function commonFooter() { const prefix=isJCard?'../':'./'; return `<footer class="site-footer"><div class="site-footer-brand"><strong>Tape Note</strong><span>Small musical gifts, made with care.</span></div><nav class="product-switch" aria-label="Choose a gift format"><a href="${prefix}"><strong>Make a mixtape</strong><small>Playable music gift</small></a><a href="${isJCard?'./':'./custom-j-cards/'}"><strong>Custom J cards</strong><small>Printable album insert</small></a></nav><nav class="site-footer-links" aria-label="Footer"><a href="${prefix}privacy.html">Privacy & data</a><a href="${prefix}music-credits.html">Music credits</a><a href="${prefix}contact.html">Contact</a></nav><small>Keep personal details out of public gift links.</small></footer>`; }
function assetPath(file) { return `${isJCard ? '../' : './'}assets/${file}`; }
function getThemeStyle(theme) { const t=themes[theme]; return `--theme-bg:${t.bg};--theme-tape:${t.tape};--theme-label:${t.label};--theme-ink:${t.ink};--theme-art:url('${assetPath(t.image)}')`; }
function getThemeThumbStyle(theme) { const t=themes[theme]; return `--thumb-art:url("${assetPath(t.image)}")`; }
function updatePreviewControls() {
  document.querySelectorAll('[data-play]').forEach(button=>{ const playing=button.dataset.play===activeSongId; button.classList.toggle('is-playing',playing); button.innerHTML=playing?'&#9632;':'&#9654;'; button.setAttribute('aria-label',`${playing?'Stop preview':'Preview'} ${button.dataset.songTitle}`); button.setAttribute('aria-pressed',String(playing)); });
  document.querySelectorAll('[data-action="play-all"]').forEach(button=>{ const playing=Boolean(activeSongId); button.classList.toggle('is-playing',playing); button.setAttribute('aria-label',playing?'Stop selected song':'Play selected song'); button.setAttribute('aria-pressed',String(playing)); if(button.classList.contains('cassette-play')) button.innerHTML=playing?'&#9632;':'&#9654;'; });
  document.querySelectorAll('.gift-cassette-player').forEach(player=>player.classList.toggle('is-playing',Boolean(activeSongId)));
  document.querySelectorAll('[data-gift-play]').forEach(button=>button.classList.toggle('is-current',button.dataset.giftPlay===activeSongId));
  document.querySelectorAll('[data-now-playing]').forEach(node=>{ const song=activeSongId&&songs.find(item=>item.id===activeSongId); const fallback=songs.find(item=>item.id===node.dataset.nowPlaying); node.textContent=song?`Playing: ${song.title}`:fallback?`Ready: ${fallback.title}`:'made with care'; });
}
function playPreview(song) {
  if (!song) return;
  if (activeAudio && activeSongId===song.id) { activeAudio.pause(); activeAudio.currentTime=0; activeAudio=null; activeSongId=null; updatePreviewControls(); return; }
  if (activeAudio) { activeAudio.pause(); activeAudio.currentTime=0; }
  const audio=new Audio(song.audio);
  audio.preload='metadata';
  audio.addEventListener('ended',()=>{ if(activeAudio===audio) { activeAudio=null; activeSongId=null; updatePreviewControls(); } });
  audio.addEventListener('error',()=>{ if(activeAudio===audio) { activeAudio=null; activeSongId=null; updatePreviewControls(); toast('This preview is temporarily unavailable.'); } },{once:true});
  activeAudio=audio; activeSongId=song.id; updatePreviewControls();
  audio.play().then(()=>toast(`Playing ${song.title} (${song.duration})`)).catch(()=>{ if(activeAudio===audio) { activeAudio=null; activeSongId=null; updatePreviewControls(); toast('Tap play again to start this preview.'); } });
}

function MixApp() {
  const starter = () => ({ theme:'cream', stickers:[], songs:[], recipient:'', sender:'', note:'A little collection for the moments we keep.', step:0, mood:'All', generated:false });
  const hasCardHash=location.hash.startsWith('#card=');
  let state = hasCardHash ? applyHash(starter()) : {...starter(),...(readDraft('tape-note-mixtape-draft')||{})};
  if (!Array.isArray(state.stickers)) state.stickers = state.sticker ? [state.sticker] : [];
  state.stickers = [...new Set(state.stickers.filter(id=>stickers.some(sticker=>sticker.id===id)))].slice(0,3);
  if (!Array.isArray(state.songs)) state.songs = [];
  state.songs = [...new Set(state.songs.filter(id=>songs.some(song=>song.id===id)))].slice(0,4);
  if (typeof state.recipient !== 'string') state.recipient = typeof state.for === 'string' ? state.for : '';
  state.recipient = state.recipient.slice(0,40);
  if (typeof state.sender !== 'string') state.sender = '';
  state.sender = state.sender.slice(0,40);
  if (!giftScenes.includes(state.mood)) state.mood = 'All';
  const root=document.querySelector('#app');
  let recipientOpened=false;
  const selectedSongs=()=>state.songs.map(id=>songs.find(song=>song.id===id)).filter(Boolean);
  function valid() { return !state.songs.length ? 'Choose at least one song for your mixtape.' : !state.note.trim() ? 'Add a little note for your friend.' : ''; }
  function stickerMarkup(id, extra='') { const sticker=stickers.find(item=>item.id===id); return sticker ? `<span class="gift-sticker sticker-${sticker.id} ${extra}" aria-hidden="true"><img src="${assetPath(`gift-stickers/${sticker.image}`)}" alt="" loading="lazy" decoding="async" /></span>` : ''; }
  function selectedStickerMarkup() { return state.stickers.map((id,index)=>stickerMarkup(id,`on-jcard sticker-count-${state.stickers.length} sticker-slot-${index}`)).join(''); }
  function cassetteMarkup(playable=false) {
    const first=selectedSongs()[0];
    return `<div class="cassette"><div class="tape-title">Made for you</div><div class="tape-from"${playable&&first?` data-now-playing="${first.id}"`:''}>${playable&&first?`Ready: ${esc(first.title)}`:'made with care'}</div><i class="reel one"></i><i class="reel two"></i><div class="tape-window"><i></i><i></i></div>${playable?'<button class="cassette-play" data-action="play-all" aria-label="Play selected song" aria-pressed="false" title="Play selected song">&#9654;</button>':''}<div class="cassette-lower"><i class="case-hole left"></i><i class="case-pin left"></i><i class="case-pin right"></i><i class="case-hole right"></i></div><i class="case-screw screw-one"></i><i class="case-screw screw-two"></i><div class="tape-count">SIDE A &nbsp; / &nbsp; ${state.songs.length || 'NO'} TRACK${state.songs.length===1?'':'S'}</div></div>`;
  }
  function cassettePreview() {
    return `<div class="artboard cassette-board" id="artboard" style="${getThemeStyle(state.theme)}">${cassetteMarkup()}</div>`;
  }
  function jCardPreview(mode='package') {
    const tracks=selectedSongs();
    const showNote=mode==='note' || mode==='final';
    return `<div class="artboard gift-artboard ${mode==='final'?'final-gift':''}" id="artboard" style="${getThemeStyle(state.theme)}">${showNote?`<div class="little-note-card"><span class="note-to" data-recipient-preview ${state.recipient?'':'hidden'}><small>To</small><b data-recipient-name>${esc(state.recipient)}</b></span><span class="note-from" data-sender-preview ${state.sender?'':'hidden'}><small>From</small><b data-sender-name>${esc(state.sender)}</b></span><p id="note-preview">${esc(state.note || 'A little note for you.')}</p></div>`:''}<div class="jcase jcase-with-frame"><div class="jcase-shell"></div><div class="jcase-paper"></div><div class="jcase-shine"></div><div class="jcard-top">${selectedStickerMarkup()}</div><div class="jcard-band"><span>A</span><b>DATE/TIME</b><i></i><small>NOISE REDUCTION&nbsp;&nbsp; ON&nbsp; OFF</small><span>B</span><b>DATE/TIME</b><i></i><small>NOISE REDUCTION&nbsp;&nbsp; ON&nbsp; OFF</small></div><ol class="jcard-tracks">${tracks.map((song,i)=>`<li>${i+1}. ${esc(song.title)}</li>`).join('') || '<li>your first song will appear here</li>'}</ol><img class="jcase-frame" src="${assetPath('vintage-plastic-jcase-frame-alpha.webp')}" alt="" aria-hidden="true" decoding="async" /></div>${mode==='final'?playerCard():''}</div>`;
  }
  function playerCard() {
    const tracks=selectedSongs(), first=tracks[0];
    return `<div class="gift-player-stack"><div class="gift-cassette-player" aria-label="${esc(first?.title || 'Your mixtape')} player">${cassetteMarkup(true)}</div><div class="gift-track-list" aria-label="Selected songs">${tracks.map((song,index)=>`<button class="gift-track-button ${index===0?'is-current':''}" data-gift-play="${song.id}" type="button"><span>${index+1}</span><strong>${esc(song.title)}</strong><small>${song.duration}</small></button>`).join('')}</div></div>`;
  }
  function preview() {
    if (state.step===0) return cassettePreview();
    if (state.step===3) return jCardPreview('note');
    return jCardPreview('package');
  }
  function actionBar() {
    return `<div class="action-bar editor-actions"><button class="secondary" data-action="back" ${state.step===0?'disabled':''}>Back</button><button class="primary" data-action="${state.step===3?'finish':'next'}">${state.step===3?'Finish':'Next'}</button></div>`;
  }
  function giftView(isOwner) {
    const url=writeHash({...state,generated:true});
    const ownerControls=isOwner?`<div class="share-panel"><label>Share link</label><div><input readonly value="Gift link ready to copy" data-share-url="${esc(url)}" aria-label="Gift link ready to copy" /><button class="primary" data-action="share">Copy</button></div><p class="privacy-note share-privacy">Anyone with your share link can see this gift's content. Please do not include private or sensitive information.</p></div><div class="action-bar"><button class="secondary" data-action="edit">Edit gift</button><button class="secondary" data-action="reset">Start over</button></div>`:'';
    const credits=`<details class="gift-credits"><summary>Music credits</summary><div>${selectedSongs().map(song=>`<p><strong>${esc(song.title)}</strong> by <a href="${song.source}" target="_blank" rel="noreferrer">${esc(song.creator)}</a> · <a href="${song.source}" target="_blank" rel="noreferrer">${esc(song.license)}</a></p>`).join('')}</div></details>`;
    const opening=!isOwner&&!recipientOpened?`<div class="recipient-opening"><p>A small musical gift is waiting for you.</p><button class="primary" data-action="open-recipient-gift">Open your mixtape</button></div>`:'';
    root.innerHTML = `${commonHeader('mix')}<section class="gift-page"><div class="gift-heading"><h1>${isOwner?'Share your mixtape':'A mixtape for you'}</h1></div><div class="gift-showcase ${!isOwner&&!recipientOpened?'is-awaiting-open':''}">${opening}${jCardPreview('final')}</div>${ownerControls}${credits}</section>${commonFooter()}`;
    bindGift();
  }
  function render() {
    if(!state.generated) saveDraft('tape-note-mixtape-draft',state);
    if (state.generated) { giftView(sessionStorage.getItem('made-mixtape')==='1'); return; }
    root.innerHTML = `${commonHeader('mix')}
      <section class="intro mix-intro"><div><h1><span class="mix-title-primary">Create Your Mixtape for You</span><span class="mix-title-secondary">— A Personalized Retro Cassette Card.</span></h1><p>Make your own mixtape in a few thoughtful steps: choose a look, add songs, and share a small musical gift.</p></div></section>
      <section class="workspace" id="mixtape-maker"><aside class="preview-column"><div class="preview-shell">${preview()}</div></aside>
      <section class="editor"><div class="step-tabs">${['Look','Stickers','Songs','Note'].map((name,i)=>`<button class="step-tab ${state.step===i?'active':''}" data-step="${i}" ${i===3&&!state.songs.length?'disabled aria-disabled="true" title="Choose at least one song first"':''}><small>${i+1}</small> ${name}</button>`).join('')}</div><div class="editor-panel">${panel()}</div>${actionBar()}</section></section>
      <section class="mix-howto" aria-labelledby="mix-howto-heading"><div class="mix-howto-heading"><div class="eyebrow">How to</div><h2 id="mix-howto-heading">A Mixtape for You, in three small moves.</h2><p>Make it for a birthday, a thank-you, a new beginning, or just because.</p></div><div class="mix-howto-steps"><article><span>01</span><h3>Set the mood</h3><p>Choose a cassette look and a few keepsake stickers that fit the occasion.</p></article><article><span>02</span><h3>Pick the soundtrack</h3><p>Listen to the previews, then arrange up to four songs in the order you want them heard.</p></article><article><span>03</span><h3>Write and share</h3><p>Add a short note, finish the gift, and send one link to the person it was made for.</p></article></div></section>
      <section class="mix-what-is" aria-labelledby="mix-what-is-heading"><div><div class="eyebrow">About the gift</div><h2 id="mix-what-is-heading">What is a virtual mixtape?</h2></div><div><p>A virtual mixtape is a small music gift with the care of a handmade cassette: a look, a short note, and songs arranged in a personal order. It is made to be opened as a moment, not managed as a playlist.</p><p>When you share it, the recipient sees the cassette card you designed and can start the selected music when they choose.</p></div></section>
      <section class="mix-why" aria-labelledby="mix-why-heading"><div class="mix-section-heading"><div class="eyebrow">Why</div><h2 id="mix-why-heading">A few songs can say more than a message.</h2><p>Make the gesture feel considered without making it complicated.</p></div><div class="mix-why-points"><article><h3>It feels personal</h3><p>The songs, cassette look, and note all come from you, so the gift has a point of view.</p></article><article><h3>It creates a moment</h3><p>Instead of sending a bare link, you give someone an opening sequence with a message inside.</p></article><article><h3>It is easy to give</h3><p>There is no account to set up. When it is ready, a single link is enough to send it on.</p></article></div></section>
      <section class="mix-faq" aria-labelledby="mix-faq-heading"><div class="mix-faq-heading"><div class="eyebrow">FAQ</div><h2 id="mix-faq-heading">A few useful things to know.</h2></div><div class="faq"><details open><summary>Does the recipient need an account?</summary><p>No. Anyone with the gift link can open the mixtape in their browser.</p></details><details><summary>Can the recipient play the songs?</summary><p>Yes. The shared gift keeps the selected openly licensed songs and their order. Playback starts only after the recipient chooses to press play.</p></details><details><summary>Where does my mixtape live before I share it?</summary><p>Your work stays in this browser while you make it. The gift link carries the card settings when you are ready to send it.</p></details><details><summary>Can I make a matching paper insert?</summary><p>Yes. Use <a href="custom-j-cards/">Custom J cards</a> to make a printable cassette insert with an album title, dedication, and track list.</p></details></div></section>${commonFooter()}`;
    bind();
  }
  function panel() {
    if (state.step===0) return `<div class="step-heading"><h2>Pick a cassette backdrop</h2><span>Choose a background pattern</span></div><div class="backdrop-grid">${Object.entries(themes).map(([id,t])=>`<button class="backdrop-option ${state.theme===id?'selected':''}" data-theme="${id}" style="--backdrop-color:${t.tape};--backdrop-art:url('${assetPath(t.image)}')" aria-label="${t.name}" title="${t.name}"><i aria-hidden="true"></i></button>`).join('')}</div>`;
    if (state.step===1) return `<div class="step-heading"><h2>Dress the J-Card</h2><span>${state.stickers.length}/3 selected</span></div><div class="sticker-grid gift-sticker-grid">${stickers.map(sticker=>`<button class="sticker-option ${state.stickers.includes(sticker.id)?'selected':''}" data-sticker-choice="${sticker.id}" aria-pressed="${state.stickers.includes(sticker.id)}">${stickerMarkup(sticker.id)}<span>${sticker.label}</span></button>`).join('')}</div><p class="privacy-note">Choose up to three keepsakes for the cassette's outer J-Card.</p>`;
    if (state.step===2) { const visible=songs.filter(song=>state.mood==='All'||song.scenes.includes(state.mood)); return `<div class="step-heading"><h2>Pick the soundtrack</h2><span>Choose 1 to 4 songs</span></div><div class="playlist-filter">${giftScenes.map(scene=>`<button class="filter-pill ${scene===state.mood?'active':''}" data-mood="${scene}">${scene}</button>`).join('')}</div><div class="song-list">${visible.map(song=>{const playing=activeSongId===song.id;return `<div class="song ${state.songs.includes(song.id)?'chosen':''}"><button class="song-play ${playing?'is-playing':''}" data-play="${song.id}" data-song-title="${esc(song.title)}" aria-label="${playing?'Stop preview':'Preview'} ${esc(song.title)}" aria-pressed="${playing}">${playing?'&#9632;':'&#9654;'}</button><div><strong>${song.title}</strong><small>${song.scenes[0]} &middot; ${song.duration} &middot; <a href="${song.source}" target="_blank" rel="noreferrer" title="${esc(song.creator)} on Jamendo">${song.license}</a></small></div><button class="song-add" data-song="${song.id}">${state.songs.includes(song.id)?'Added':'Add'}</button></div>`;}).join('')}</div><div class="chosen-tracks"><h3>Your cassette order</h3>${selectedSongs().map((song,i)=>`<div class="chosen-row"><span>${i+1}</span><span>${song.title}</span><button class="small-action" data-move="${song.id}:up" ${i===0?'disabled':''}>up</button><button class="small-action" data-move="${song.id}:down" ${i===state.songs.length-1?'disabled':''}>down</button><button class="small-action" data-remove-song="${song.id}">x</button></div>`).join('') || '<p class="privacy-note">No tracks yet.</p>'}</div>`; }
    return `<div class="step-heading"><h2>Add a little note</h2><span>${state.note.length}/140</span></div><div class="note-editor field-grid"><div class="field"><label>To <span>${state.recipient.length}/40</span></label><input maxlength="40" data-field="recipient" placeholder="Who is this little gift for?" value="${esc(state.recipient)}" /></div><div class="field"><label>From <span>${state.sender.length}/40</span></label><input maxlength="40" data-field="sender" placeholder="Your name (optional)" value="${esc(state.sender)}" /></div><div class="field full"><label>Little note <span>${state.note.length}/140</span></label><textarea maxlength="140" data-field="note" placeholder="Write something short and sweet">${esc(state.note)}</textarea></div></div><p class="privacy-note">Keep it small and personal, like the first line on a folded note tucked into the tape case.</p>`;
  }
  function bind() {
    root.querySelectorAll('[data-step]').forEach(btn=>btn.onclick=()=>{ const nextStep=+btn.dataset.step; if(nextStep===3&&!state.songs.length){toast('Choose at least one song before adding a note.');return;} state.step=nextStep;render();});
    root.querySelectorAll('[data-theme]').forEach(btn=>btn.onclick=()=>{state.theme=btn.dataset.theme;render();});
    root.querySelectorAll('[data-sticker-choice]').forEach(btn=>btn.onclick=()=>{ const id=btn.dataset.stickerChoice; state.stickers=state.stickers.includes(id)?state.stickers.filter(stickerId=>stickerId!==id):(state.stickers.length<3?[...state.stickers,id]:state.stickers); if(!state.stickers.includes(id)&&!btn.classList.contains('selected'))toast('You can choose up to 3 stickers.'); render(); });
    root.querySelectorAll('[data-mood]').forEach(btn=>btn.onclick=()=>{state.mood=btn.dataset.mood;render();});
    root.querySelectorAll('[data-play]').forEach(btn=>btn.onclick=()=>playPreview(songs.find(s=>s.id===btn.dataset.play)));
    root.querySelectorAll('[data-song]').forEach(btn=>btn.onclick=()=>{ const id=btn.dataset.song; state.songs=state.songs.includes(id)?state.songs.filter(item=>item!==id):(state.songs.length<4?[...state.songs,id]:state.songs); if(state.songs.length>=4&&!state.songs.includes(id))toast('You can choose up to 4 songs.'); render(); });
    root.querySelectorAll('[data-remove-song]').forEach(btn=>btn.onclick=()=>{state.songs=state.songs.filter(item=>item!==btn.dataset.removeSong);render();});
    root.querySelectorAll('[data-move]').forEach(btn=>btn.onclick=()=>{const [id,dir]=btn.dataset.move.split(':'); const index=state.songs.indexOf(id), next=dir==='up'?index-1:index+1; if(next>=0&&next<state.songs.length)[state.songs[index],state.songs[next]]=[state.songs[next],state.songs[index]];render();});
    root.querySelectorAll('[data-field]').forEach(input=>input.oninput=()=>{
      const field=input.dataset.field;
      state[field]=input.value;
      input.closest('.field').querySelector('label span').textContent=`${input.value.length}/${input.maxLength}`;
      const note=document.querySelector('#note-preview');
      if(field==='note'&&note) note.textContent=state.note || 'A little note for you.';
      if(field==='recipient'){const recipient=document.querySelector('[data-recipient-preview]');const recipientName=document.querySelector('[data-recipient-name]');if(recipient&&recipientName){recipient.hidden=!state.recipient.trim();recipientName.textContent=state.recipient.trim();}}
      if(field==='sender'){const sender=document.querySelector('[data-sender-preview]');const senderName=document.querySelector('[data-sender-name]');if(sender&&senderName){sender.hidden=!state.sender.trim();senderName.textContent=state.sender.trim();}}
      saveDraft('tape-note-mixtape-draft',state);
    });
    root.querySelector('[data-action="back"]')?.addEventListener('click',()=>{state.step=Math.max(0,state.step-1);render();});
    root.querySelector('[data-action="next"]')?.addEventListener('click',()=>{if(state.step===2&&!state.songs.length){toast('Choose at least one song before adding a note.');return;} state.step=Math.min(3,state.step+1);render();});
    root.querySelector('[data-action="finish"]')?.addEventListener('click',()=>{ const error=valid(); if(error){ toast(error); return; } const scrollY=window.scrollY; if(activeAudio){activeAudio.pause();activeAudio.currentTime=0;} activeAudio=null;activeSongId=null; state.generated=true; sessionStorage.setItem('made-mixtape','1'); writeHash(state); render(); requestAnimationFrame(()=>window.scrollTo({top:scrollY,behavior:'auto'})); toast('Your mixtape gift is ready.'); });
    root.querySelector('[data-action="play-all"]')?.addEventListener('click',()=>{const song=selectedSongs()[0];if(song)playPreview(song);});
    root.querySelectorAll('[data-gift-play]').forEach(button=>button.addEventListener('click',()=>{const song=selectedSongs().find(item=>item.id===button.dataset.giftPlay);if(song)playPreview(song);}));
    root.querySelector('[data-action="focus-maker"]')?.addEventListener('click',()=>{state.step=0;render();requestAnimationFrame(()=>root.querySelector('#mixtape-maker')?.scrollIntoView({behavior:'smooth',block:'start'}));});
  }
  function bindGift() {
    root.querySelector('[data-action="share"]')?.addEventListener('click',()=>{const input=root.querySelector('.share-panel input');copyShareLink(input?.dataset.shareUrl||location.href);});
    root.querySelector('[data-action="download"]')?.addEventListener('click',()=>downloadMix(state));
    root.querySelector('[data-action="edit"]')?.addEventListener('click',()=>{state.generated=false;writeHash(state);render();});
    root.querySelector('[data-action="reset"]')?.addEventListener('click',()=>{ if(confirm('Start over with a blank mixtape gift?')) { location.hash=''; state=starter(); clearDraft('tape-note-mixtape-draft'); sessionStorage.removeItem('made-mixtape'); render(); } });
    root.querySelector('[data-action="play-all"]')?.addEventListener('click',()=>{const song=selectedSongs()[0];if(song)playPreview(song);});
    root.querySelectorAll('[data-gift-play]').forEach(button=>button.addEventListener('click',()=>{const song=selectedSongs().find(item=>item.id===button.dataset.giftPlay);if(song)playPreview(song);}));
    root.querySelector('[data-action="open-recipient-gift"]')?.addEventListener('click',()=>{recipientOpened=true;giftView(false);});
  }
  render();
}

function enableDrag(node,onDelete,getSticker) { let dragging=false,startX,startY; node.addEventListener('pointerdown',event=>{dragging=false;startX=event.clientX;startY=event.clientY;node.setPointerCapture(event.pointerId);}); node.addEventListener('pointermove',event=>{if(!node.hasPointerCapture(event.pointerId))return; const board=document.querySelector('#artboard'), rect=board.getBoundingClientRect(); if(Math.abs(event.clientX-startX)>4||Math.abs(event.clientY-startY)>4)dragging=true; if(dragging){const sticker=getSticker(); sticker.x=Math.min(90,Math.max(0,(event.clientX-rect.left)/rect.width*100-5));sticker.y=Math.min(90,Math.max(0,(event.clientY-rect.top)/rect.height*100-5));node.style.left=`${sticker.x}%`;node.style.top=`${sticker.y}%`;}}); node.addEventListener('pointerup',event=>{const index=+node.dataset.sticker; if(!dragging)onDelete(index); node.releasePointerCapture(event.pointerId);}); }
async function themeArtData(theme) { try { const response=await fetch(assetPath(themes[theme].image)); if(!response.ok)throw new Error('asset'); const blob=await response.blob(); return await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(blob);}); } catch { return ''; } }
async function jCardTemplateArtData(file) { try { const response=await fetch(assetPath(file)); if(!response.ok)throw new Error('asset'); const blob=await response.blob(); return await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(blob);}); } catch { return ''; } }
function mixSvg(state,art='') {
  const t=themes[state.theme], tracks=state.songs.map(id=>songs.find(song=>song.id===id)?.title).filter(Boolean);
  const note=String(state.note||'A little mixtape, just for you.');
  const noteLines=(note.match(/.{1,31}(?:\s|$)|.{1,31}/g)||[note]).slice(0,5);
  const noteHeight=64+noteLines.length*22;
  const noteText=noteLines.map((line,index)=>`<text x="30" y="${43+index*22}" font-family="cursive" font-size="14" font-style="italic" fill="#2c6796">${esc(line.trim())}</text>`).join('');
  const marks={"birthday-cake":"\u{1F382}","ribbon-gift-box":"\u{1F381}","tulip-bouquet":"\u{1F490}","candy-cane":"\u{1F36C}","latte":"\u2615","little-sun":"\u2600","rainbow":"\u{1F308}","pink-rose":"\u{1F339}","satin-bow":"\u{1F380}"};
  const stickerMarkup=(state.stickers||[]).slice(0,3).map((id,index)=>`<text x="${86+index*92}" y="72" text-anchor="middle" font-size="42">${marks[id]||'\u2713'}</text>`).join('');
  const tapeArt=art?`<image href="${art}" x="24" y="22" width="312" height="114" preserveAspectRatio="xMidYMid slice" clip-path="url(#tape-label)"/>`:'';
  const trackRows=tracks.slice(0,4).map((title,index)=>`<text x="${index%2?204:30}" y="${142+Math.floor(index/2)*25}" font-family="sans-serif" font-size="12" fill="#2d6fa8">${index+1}. ${esc(title)}</text>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1800" height="1200" viewBox="0 0 900 600"><defs><linearGradient id="case" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ffffff"/><stop offset=".52" stop-color="#e9edeb"/><stop offset="1" stop-color="#cbd2d0"/></linearGradient><filter id="shadow" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="12" stdDeviation="10" flood-color="#315b63" flood-opacity=".3"/></filter><pattern id="paper-lines" width="20" height="22" patternUnits="userSpaceOnUse"><rect width="20" height="22" fill="#fffefb"/><path d="M0 21.5H20" stroke="#cfdbec" stroke-width="1"/></pattern><clipPath id="tape-label"><path d="M18 0H342L360 14V122L342 136H18L0 122V14Z"/></clipPath></defs><rect width="900" height="600" fill="#b6d9e2"/><path d="M0 36H900M0 72H900M0 108H900M0 144H900M0 180H900M0 216H900M0 252H900M0 288H900M0 324H900M0 360H900M0 396H900M0 432H900M0 468H900M0 504H900M0 540H900M0 576H900" stroke="#fff" opacity=".08"/><!-- Note stays fully readable above the overlapping J-Card. --><g transform="translate(340 52) rotate(-6 145 ${noteHeight/2})" filter="url(#shadow)"><rect width="290" height="${noteHeight}" rx="7" fill="url(#paper-lines)"/><path d="M39 0V${noteHeight}" stroke="#edaaa5" stroke-width="1.5"/><circle cx="19" cy="28" r="6" fill="#acd4df"/><circle cx="19" cy="56" r="6" fill="#acd4df"/><circle cx="19" cy="84" r="6" fill="#acd4df"/>${noteText}</g><g transform="translate(420 176) rotate(12 180 104)" filter="url(#shadow)"><rect width="360" height="208" rx="7" fill="url(#case)" stroke="#f8faf9" stroke-width="4"/><rect x="14" y="14" width="332" height="180" rx="3" fill="#fffdf6" stroke="#cfcbc2"/><rect x="14" y="100" width="332" height="25" fill="#f7f1e3" stroke="#d7d0c1"/><text x="28" y="116" font-family="monospace" font-size="7" fill="#3c3934">A   DATE/TIME   &#9633;       B   DATE/TIME   &#9633;</text>${stickerMarkup}<path d="M24 134H336M24 159H336M24 184H336" stroke="#ddd5c6" stroke-dasharray="2 3"/>${trackRows}<path d="M5 7H355V201H5Z" fill="none" stroke="#84939b" opacity=".28"/></g><g transform="translate(104 286) rotate(-13 180 99)" filter="url(#shadow)"><rect width="360" height="198" rx="17" fill="url(#case)" stroke="#fff" stroke-width="3"/><path d="M18 20H342L354 32V130L342 142H18L6 130V32Z" fill="${t.tape}" stroke="#9ca9a6" stroke-width="2"/>${tapeArt}<rect x="95" y="32" width="170" height="38" rx="3" fill="#fffdf5" opacity=".84"/><text x="180" y="55" text-anchor="middle" font-family="serif" font-weight="700" font-size="20" fill="${t.ink}">Made for you</text><text x="180" y="77" text-anchor="middle" font-family="monospace" font-size="9" fill="${t.ink}">SIDE A / ${tracks.length} TRACK${tracks.length===1?'':'S'}</text><g fill="#eef3f1" stroke="#828e8c" stroke-width="4"><circle cx="88" cy="103" r="30"/><circle cx="272" cy="103" r="30"/></g><g fill="#a8b0ae"><circle cx="88" cy="103" r="19"/><circle cx="272" cy="103" r="19"/></g><g fill="#b6d9e2"><circle cx="88" cy="103" r="8"/><circle cx="272" cy="103" r="8"/></g><rect x="145" y="83" width="70" height="39" rx="3" fill="#1d1c1a" stroke="#e4e8e5" stroke-width="6"/><path d="M72 145H288L314 192H46Z" fill="url(#case)" stroke="#b0bab8"/><circle cx="76" cy="174" r="8" fill="#b6d9e2"/><circle cx="284" cy="174" r="8" fill="#b6d9e2"/></g></svg>`;
}
function downloadSvg(svg,name) { const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'})); const image=new Image(); image.onload=()=>{const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;canvas.getContext('2d').drawImage(image,0,0);URL.revokeObjectURL(url); const link=document.createElement('a');link.download=name;link.href=canvas.toDataURL('image/png');link.click();toast('PNG downloaded.');}; image.onerror=()=>toast('Could not create the image. Please try again.');image.src=url; }
async function downloadMix(state) { downloadSvg(mixSvg(state,await themeArtData(state.theme)),'my-mixtape-card.png'); }
async function copyShareLink(url) {
  try { await navigator.clipboard.writeText(url); toast('Share link copied.'); return; }
  catch {}
  const input=document.querySelector('.share-panel input');
  if(input) {
    const visibleValue=input.value;
    input.value=url;
    input.focus(); input.select();
    try { if(document.execCommand('copy')) { input.value=visibleValue; toast('Share link copied.'); return; } }
    catch {}
    input.value=visibleValue;
  }
  toast('Select and copy the link from the field.');
}

function JCardApp() {
  const initialState={theme:'cream',template:'minimal',title:'A little something',artist:'',recipient:'',sender:'',sideA:['Golden Hour','Paper Moon','',''],sideB:['Postcard Home','After the Rain','',''],note:'Made slowly, with you in mind.'};
  const blankState=()=>({...initialState,sideA:[...initialState.sideA],sideB:[...initialState.sideB]});
  const sharedGift=location.hash.startsWith('#jgift=')?decode(location.hash.slice(7)):null;
  const hasJCardHash=location.hash.startsWith('#card=');
  let state=sharedGift&&typeof sharedGift==='object'?{...blankState(),...sharedGift}:hasJCardHash?applyHash(blankState()):{...blankState(),...(readDraft('tape-note-jcard-draft')||{})}; const root=document.querySelector('#app');
  state.example=state.title===initialState.title&&!state.artist&&!state.recipient&&!state.sender&&JSON.stringify(state.sideA)===JSON.stringify(initialState.sideA)&&JSON.stringify(state.sideB)===JSON.stringify(initialState.sideB)&&state.note===initialState.note;
  let recipientOpened=false;
  const albumBy=()=>state.artist.trim()?`Curated by ${state.artist.trim()}`:'Curated by you';
  const giftFor=()=>state.recipient.trim()?`For ${state.recipient.trim()}`:'For you';
  const giftFrom=()=>state.sender.trim()?`From ${state.sender.trim()}`:'Made with care';
  const hasTracks=()=>[...state.sideA,...state.sideB].some(track=>track.trim());
  const error=()=>!state.title.trim()?'Add an album title.':!state.artist.trim()?'Add the album artist or curator.':!state.recipient.trim()?'Add who this album is for.':!state.sender.trim()?'Add who this album is from.':!state.note.trim()?'Add a little note.':'';
  const deliveryReady=()=>!error()&&hasTracks();
  const shareGiftUrl=()=>`${location.origin}${location.pathname}#jgift=${encode(state)}`;
  const editorUrl=()=>`${location.pathname}#card=${encode(state)}`;
  function navigateTo(url){
    window.addEventListener('hashchange',()=>location.reload(),{once:true});
    location.assign(url);
  }
  function recipientGiftPage(){
    const opening=!recipientOpened?`<div class="recipient-opening"><p>A little paper keepsake is waiting for you.</p><button class="primary" data-j-action="open-recipient">Open your J-card</button></div>`:'';
    root.innerHTML=`<section class="jcard-reveal-page"><div class="jcard-reveal"><div class="jcard-reveal-kicker">${esc(giftFrom())}</div><div class="jcard-reveal-content ${recipientOpened?'':'is-awaiting-open'}">${opening}${artboard()}</div></div></section>`;
    root.querySelector('[data-j-action="open-recipient"]')?.addEventListener('click',()=>{recipientOpened=true;recipientGiftPage();});
  }
  function artboard(){return `<div class="j-gift-case"><div id="j-artboard" class="j-artboard template-${state.template}" style="${getThemeStyle(state.theme)}"><div class="j-panel j-spine"><div class="j-spine-top"><div class="j-small">A personal mixtape</div><div class="j-title" id="j-title-preview">${esc(state.title||'Untitled')}</div><div class="j-artist" id="j-artist-preview">${esc(albumBy())}</div></div><div class="j-spine-mark" aria-hidden="true"></div><div class="j-gift-meta"><span id="j-recipient-preview">${esc(giftFor())}</span><span id="j-sender-preview">${esc(giftFrom())}</span></div></div><div class="j-panel j-list-panel"><div class="j-track-heading">Side A</div><ol class="j-tracks" id="j-side-a-preview">${state.sideA.filter(Boolean).map(track=>`<li>${esc(track)}</li>`).join('')||'<li>your first track</li>'}</ol><div class="j-note"><span class="j-note-recipient" id="j-note-recipient-preview">${esc(giftFor())}</span><p id="j-note-preview">${esc(state.note)}</p></div></div><div class="j-panel j-cover-panel"><div class="j-track-heading">Side B</div><ol class="j-tracks" id="j-side-b-preview">${state.sideB.filter(Boolean).map(track=>`<li>${esc(track)}</li>`).join('')||'<li>your next track</li>'}</ol><div class="j-cover" aria-hidden="true"><i></i><b>Side B</b></div></div><div class="print-lines"></div></div></div>`;}
  function render(){saveDraft('tape-note-jcard-draft',state);const exampleNotice=state.example?'<span class="example-badge">Example content - replace before sharing</span>':'';root.innerHTML=`${commonHeader('jcard')}<section class="intro jcard-intro"><div>${exampleNotice}<h1>Custom J Cards for Gifting</h1><p>Make a cassette insert with a note and the songs you chose.</p></div></section><section class="workspace jcard-workspace"><aside class="preview-column"><div class="preview-shell">${artboard()}</div></aside><section class="editor"><div class="step-tabs"><button class="step-tab active" data-j-step="style">1 Style</button><button class="step-tab" data-j-step="text">2 Gift note</button><button class="step-tab" data-j-step="tracks">3 Tracks</button></div><div class="editor-panel" id="j-panel">${panel('style')}</div><div id="j-actions">${jcardActions('style')}</div></section></section><section class="jcard-readable-summary" aria-label="J-card details"><strong>${esc(state.title)}</strong><span>${esc(albumBy())}</span><span>${esc(giftFor())} · ${esc(giftFrom())}</span><div>${state.sideA.filter(Boolean).map(track=>`<span>Side A · ${esc(track)}</span>`).join('')}${state.sideB.filter(Boolean).map(track=>`<span>Side B · ${esc(track)}</span>`).join('')}</div></section><section class="jcard-howto" aria-labelledby="jcard-howto-heading"><div class="jcard-howto-heading"><div class="eyebrow">How to</div><h2 id="jcard-howto-heading">Make a J-card gift in three steps.</h2><p>Turn a few thoughtful details into a paper keepsake for one person.</p></div><div class="jcard-howto-steps"><article><span>01</span><h3>Choose the paper</h3><p>Pick a J-card background that suits the person, the music, or the occasion.</p></article><article><span>02</span><h3>Write the dedication</h3><p>Add the album title, curator, recipient, sender, and a short note.</p></article><article><span>03</span><h3>Add tracks and share</h3><p>Arrange songs across Side A and B, then send the finished card by link or print.</p></article></div></section><section class="jcard-why" aria-labelledby="jcard-why-heading"><div class="jcard-section-heading"><div class="eyebrow">Why</div><h2 id="jcard-why-heading">A J-card makes the gift feel real.</h2><p>It gives the music a place to live, even before the first song begins.</p></div><div class="jcard-why-points"><article><h3>It gives the album a home</h3><p>Your title, artist, note, and track order become one considered object.</p></article><article><h3>It feels made for one person</h3><p>The dedication and the songs turn a familiar format into a personal keepsake.</p></article><article><h3>It can be held onto</h3><p>Print it for a case, tuck it into a present, or keep the digital link close.</p></article></div></section><section class="jcard-what-is" aria-labelledby="jcard-what-is-heading"><div><div class="eyebrow">About the gift</div><h2 id="jcard-what-is-heading">What is a J-card?</h2></div><div><p>A J-card is the folded paper insert inside a cassette case. It carries the album identity, the track list, and the small details that make a mixtape feel like it belongs to someone.</p><p>This version works as a printable cassette insert, a digital music gift, or a paper keepsake to place inside another present.</p></div></section><section class="jcard-faq" aria-labelledby="jcard-faq-heading"><div class="jcard-faq-heading"><div class="eyebrow">FAQ</div><h2 id="jcard-faq-heading">A few useful things to know.</h2></div><div class="faq"><details open><summary>What will I receive?</summary><p>The print version is a high-resolution PNG with quiet fold guides for cutting and folding.</p></details><details><summary>Do I need a real cassette?</summary><p>No. The J-card can be the gift itself, a music-themed note, or an insert for a real cassette case.</p></details><details><summary>Can I share it digitally?</summary><p>Yes. Preview the recipient view and copy a link that keeps the album details, dedication, and track list.</p></details><details><summary>Can I also make a mixtape cassette card?</summary><p>Yes. Use <a href="../">Make a mixtape</a> for a playable cassette-style music gift.</p></details></div></section>`;bind();}
  function panel(type){if(type==='style')return `<div class="step-heading"><h2>Choose a background image</h2><span>Three J-card papers</span></div><div class="theme-grid template-grid">${[['minimal','Letterpress ivory','warm stationery / pressed stem'],['floral','Flower garden','pressed blooms / keepsake'],['grid','Record atelier','paper collage / soft notation']].map(([id,name,detail])=>`<button class="template-option template-choice-${id} ${state.template===id?'selected':''}" data-template="${id}" aria-pressed="${state.template===id}"><i class="template-swatch" aria-hidden="true"></i><span>${name}</span><small>${detail}</small></button>`).join('')}</div>`;if(type==='text')return `<div class="step-heading"><h2>Album & dedication</h2><span>Make it yours</span></div><div class="field-grid"><div class="field full"><label>Album title <span>${state.title.length}/32</span></label><input maxlength="32" data-j-field="title" value="${esc(state.title)}" placeholder="Name this mixtape" /></div><div class="field full"><label>Artist / Curated by <span>${state.artist.length}/24</span></label><input maxlength="24" data-j-field="artist" value="${esc(state.artist)}" placeholder="Who made this album?" /></div><div class="field"><label>To <span>${state.recipient.length}/24</span></label><input maxlength="24" data-j-field="recipient" value="${esc(state.recipient)}" placeholder="Who is this for?" /></div><div class="field"><label>From <span>${state.sender.length}/24</span></label><input maxlength="24" data-j-field="sender" value="${esc(state.sender)}" placeholder="Your name" /></div><div class="field full"><label>A little note <span>${state.note.length}/130</span></label><textarea maxlength="130" data-j-field="note" placeholder="A few words to go with the songs.">${esc(state.note)}</textarea></div></div>`;return `<div class="step-heading"><h2>Add the tracks</h2><span>Up to 4 per side</span></div><div class="track-inputs">${['sideA','sideB'].map(side=>`<div class="track-box"><h3>${side==='sideA'?'Side A':'Side B'}</h3>${state[side].map((track,i)=>`<input maxlength="40" data-j-track="${side}:${i}" value="${esc(track)}" placeholder="Track ${i+1}" />`).join('')}</div>`).join('')}</div>`;}
  function jcardActions(step){
    if(step==='style')return `<div class="action-bar jcard-action-bar"><button class="secondary" type="button" disabled>Back</button><button class="primary" type="button" data-j-continue="text">Next</button></div>`;
    if(step==='text')return `<div class="action-bar jcard-action-bar"><button class="secondary" type="button" data-j-continue="style">Back</button><button class="primary" type="button" data-j-continue="tracks">Next</button></div>`;
    return `<div class="action-bar jcard-action-bar"><button class="primary" type="button" data-j-action="open-gift">Preview recipient view</button><button class="secondary" type="button" data-j-action="share">Copy gift link</button><button class="secondary" type="button" data-j-action="print">Download print version</button><button class="secondary" type="button" data-j-action="reset">Start over</button></div>`;
  }
  function refreshActions(step){const host=root.querySelector('#j-actions');if(!host)return;host.innerHTML=jcardActions(step);bindActionBar();}
  function changePanel(type){root.querySelectorAll('[data-j-step]').forEach(btn=>btn.classList.toggle('active',btn.dataset.jStep===type));root.querySelector('#j-panel').innerHTML=panel(type);refreshActions(type);bindPanel();}
  function refreshGiftPreview(){document.querySelector('#j-title-preview').textContent=state.title||'Untitled';document.querySelector('#j-artist-preview').textContent=albumBy();document.querySelector('#j-recipient-preview').textContent=giftFor();document.querySelector('#j-sender-preview').textContent=giftFrom();document.querySelector('#j-note-recipient-preview').textContent=giftFor();document.querySelector('#j-note-preview').textContent=state.note;}
  function renderTrackNotePicker(){
    const host=root.querySelector('.track-inputs');
    if(!host)return;
    const tracks=['sideA','sideB'].flatMap(side=>state[side].map((title,index)=>({key:`${side}:${index}`,title})).filter(item=>item.title.trim()));
    const selected=selectedTrackNotes();
    host.insertAdjacentHTML('afterend',`<section class="track-note-picker"><div class="track-note-heading"><div><h3>Little listening notes</h3><p>Choose up to two songs and add a short reason.</p></div><span>${selected.length}/2</span></div><div class="track-note-choices">${tracks.map(item=>`<button type="button" class="track-note-choice ${selected.some(note=>note.key===item.key)?'selected':''}" data-j-note-toggle="${item.key}"><span>${esc(item.title)}</span><i aria-hidden="true">${selected.some(note=>note.key===item.key)?'-':'+'}</i></button>`).join('')}</div>${selected.map(item=>`<label class="track-note-field"><span>${esc(trackForKey(item.key))}</span><textarea maxlength="54" data-j-track-note="${item.key}" placeholder="Why did you choose this one?">${esc(item.note)}</textarea></label>`).join('')}</section>`);
    root.querySelectorAll('[data-j-note-toggle]').forEach(button=>button.onclick=()=>{
      const key=button.dataset.jNoteToggle;
      const existing=state.trackNotes.findIndex(item=>item.key===key);
      if(existing>=0)state.trackNotes.splice(existing,1);
      else if(state.trackNotes.length<2)state.trackNotes.push({key,note:''});
      else return toast('You can add notes to up to two songs.');
      root.querySelector('.track-note-picker')?.remove();
      renderTrackNotePicker();
      renderTrackNotesPreview();
    });
    root.querySelectorAll('[data-j-track-note]').forEach(input=>input.oninput=()=>{
      const item=state.trackNotes.find(note=>note.key===input.dataset.jTrackNote);
      if(item){item.note=input.value;renderTrackNotesPreview();}
    });
  }
  function bindPanel(){
    root.querySelectorAll('[data-theme]').forEach(btn=>btn.onclick=()=>{state.example=false;state.theme=btn.dataset.theme;render();});
    root.querySelectorAll('[data-template]').forEach(btn=>btn.onclick=()=>{state.example=false;state.template=btn.dataset.template;render();});
    root.querySelectorAll('[data-j-field]').forEach(input=>{const update=()=>{const field=input.dataset.jField;state.example=false;state[field]=input.value;const counter=input.closest('.field').querySelector('label span');if(counter&&input.maxLength>0)counter.textContent=`${input.value.length}/${input.maxLength}`;saveDraft('tape-note-jcard-draft',state);refreshGiftPreview();};input.oninput=update;input.onchange=update;});
    root.querySelectorAll('[data-j-track]').forEach(input=>input.oninput=()=>{const [side,index]=input.dataset.jTrack.split(':');state.example=false;state[side][+index]=input.value;saveDraft('tape-note-jcard-draft',state);const target=document.querySelector(side==='sideA'?'#j-side-a-preview':'#j-side-b-preview');target.innerHTML=state[side].filter(Boolean).map(track=>`<li>${esc(track)}</li>`).join('') || '<li>your first track</li>';refreshActions('tracks');});
  }
  function bindActionBar(){
    root.querySelectorAll('[data-j-continue]').forEach(button=>button.onclick=()=>changePanel(button.dataset.jContinue));
    const printButton=root.querySelector('[data-j-action="print"]');
    if(printButton)printButton.onclick=async()=>{if(!deliveryReady())return toast(error()||'Add at least one track.');await downloadJ(state,'custom-j-card-gift-print.png',true);};
    const shareButton=root.querySelector('[data-j-action="share"]');
    if(shareButton)shareButton.onclick=()=>{if(!deliveryReady())return toast(error()||'Add at least one track.');copyShareLink(shareGiftUrl());};
    const previewButton=root.querySelector('[data-j-action="open-gift"]');
    if(previewButton)previewButton.onclick=()=>{if(!deliveryReady())return toast(error()||'Add at least one track.');navigateTo(shareGiftUrl());};
    const resetButton=root.querySelector('[data-j-action="reset"]');
    if(resetButton)resetButton.onclick=()=>{if(confirm('Start over with a blank J-card gift?')){location.hash='';state=blankState();state.example=true;clearDraft('tape-note-jcard-draft');render();}};
  }
  function bind(){
    root.insertAdjacentHTML('beforeend',commonFooter());
    root.querySelectorAll('[data-j-step]').forEach(btn=>btn.onclick=()=>changePanel(btn.dataset.jStep));
    bindPanel();
    const downloadFaq=root.querySelector('.faq details p');
    if(downloadFaq)downloadFaq.textContent='The print download is a high-resolution PNG with quiet fold guides for cutting and folding.';
    bindActionBar();
  }
  if(sharedGift)recipientGiftPage();else render();
}
async function downloadJLegacy(state,name,print){const t=themes[state.theme],a=state.sideA.filter(Boolean),b=state.sideB.filter(Boolean),template=['minimal','floral','grid'].includes(state.template)?state.template:'minimal';const list=(arr,x)=>arr.map((track,i)=>`<tspan x="${x}" dy="31">${i+1}. ${esc(track)}</tspan>`).join('');const fold=print?`<path d="M 660 0 V 1400 M 1320 0 V 1400" stroke="${t.ink}" stroke-dasharray="10 9" opacity=".58"/>`:'';const flowerArt=template==='floral'?await jCardFlowerArtData():'';const paper=template==='floral'?`${flowerArt?`<image href="${flowerArt}" width="1980" height="1400" preserveAspectRatio="xMidYMid slice"/>`:''}<rect width="1980" height="1400" fill="${t.bg}" opacity=".34"/>`:template==='grid'?`<rect width="1980" height="1400" fill="${t.bg}"/><path d="M0 0H1980V1400H0Z M0 70H1980M0 140H1980M0 210H1980M0 280H1980M0 350H1980M0 420H1980M0 490H1980M0 560H1980M0 630H1980M0 700H1980M0 770H1980M0 840H1980M0 910H1980M0 980H1980M0 1050H1980M0 1120H1980M0 1190H1980M0 1260H1980M0 1330H1980M110 0V1400M220 0V1400M330 0V1400M440 0V1400M550 0V1400M660 0V1400M770 0V1400M880 0V1400M990 0V1400M1100 0V1400M1210 0V1400M1320 0V1400M1430 0V1400M1540 0V1400M1650 0V1400M1760 0V1400M1870 0V1400" fill="none" stroke="${t.ink}" stroke-width="1" opacity=".24"/>`:`<rect width="1980" height="1400" fill="${t.bg}"/><path d="M100 110H1880M100 1290H1880" stroke="${t.ink}" stroke-width="3" opacity=".35"/><path d="M140 160V1240" stroke="${t.ink}" stroke-width="2" opacity=".15"/>`;const panels=template==='floral'?`<rect x="706" y="110" width="550" height="1010" rx="18" fill="${t.label}" opacity=".76"/><rect x="1370" y="110" width="500" height="660" rx="18" fill="${t.label}" opacity=".76"/>`:template==='grid'?`<rect x="700" y="110" width="570" height="1050" fill="${t.label}" opacity=".82"/><rect x="1360" y="110" width="520" height="660" fill="${t.label}" opacity=".82"/>`:'';const cover=template==='floral'?`<g transform="translate(1430 820)"><path d="M0 250C42 142 89 62 179 0C260 61 314 143 360 250C302 298 60 298 0 250Z" fill="#f8f0e6" stroke="#9d675b" stroke-width="5"/><path d="M180 241C159 154 126 97 66 55M180 241C201 153 239 90 297 48" fill="none" stroke="#769071" stroke-width="9"/><g fill="#d78d87"><circle cx="70" cy="52" r="27"/><circle cx="133" cy="87" r="29"/><circle cx="247" cy="84" r="30"/><circle cx="305" cy="45" r="25"/></g></g>`:template==='grid'?`<g transform="translate(1570 980)"><circle r="235" fill="#273943"/><circle r="170" fill="none" stroke="#f3f0df" stroke-width="6" opacity=".6"/><circle r="78" fill="#c86456"/><circle r="22" fill="${t.bg}"/><path d="M0-235V-250" stroke="#c86456" stroke-width="9"/></g>`:`<g transform="translate(1570 980)"><rect x="-235" y="-235" width="470" height="470" rx="18" fill="${t.label}" stroke="${t.ink}" stroke-width="5" opacity=".94"/><path d="M-135 128C-108-46-40-126 0-126C40-126 108-46 135 128" fill="none" stroke="${t.ink}" stroke-width="8" opacity=".62"/><circle cy="13" r="40" fill="none" stroke="${t.ink}" stroke-width="7" opacity=".62"/></g>`;downloadSvg(`<svg xmlns="http://www.w3.org/2000/svg" width="2480" height="1754" viewBox="0 0 1980 1400">${paper}${panels}<rect x="70" y="70" width="1840" height="1260" fill="none" stroke="${t.ink}" stroke-width="3"/>${fold}<text x="130" y="190" font-family="serif" font-size="58" font-weight="700" fill="${t.ink}">${esc(state.title)}</text><text x="130" y="246" font-family="monospace" font-size="25" fill="${t.ink}">${esc(state.artist)}</text><text x="760" y="205" font-family="monospace" font-size="28" font-weight="700" fill="${t.ink}">SIDE A</text><text x="760" y="254" font-family="sans-serif" font-size="28" fill="${t.ink}">${list(a,760)}</text><text x="1420" y="205" font-family="monospace" font-size="28" font-weight="700" fill="${t.ink}">SIDE B</text><text x="1420" y="254" font-family="sans-serif" font-size="28" fill="${t.ink}">${list(b,1420)}</text>${cover}<text x="990" y="1165" text-anchor="middle" font-family="serif" font-size="38" font-style="italic" fill="${t.ink}">${esc(state.note)}</text></svg>`,name);}

async function downloadJ(state,name,print) {
  // Export uses its own SVG, so keep its typography within a deliberately smaller
  // safe area than the visible note card. SVG text does not wrap by itself.
  const wrapExportText=(value,maxCharacters)=>{
    const words=String(value||'').trim().split(/\s+/).filter(Boolean);
    const lines=[];
    let line='';
    for(const word of words){
      if(!line){
        if(word.length<=maxCharacters){ line=word; continue; }
        for(let index=0;index<word.length;index+=maxCharacters)lines.push(word.slice(index,index+maxCharacters));
        continue;
      }
      if(`${line} ${word}`.length<=maxCharacters){ line=`${line} ${word}`; continue; }
      lines.push(line);
      if(word.length<=maxCharacters)line=word;
      else{
        for(let index=0;index<word.length;index+=maxCharacters)lines.push(word.slice(index,index+maxCharacters));
        line='';
      }
    }
    if(line)lines.push(line);
    return lines.length?lines:['Made with care.'];
  };
  const t=themes[state.theme];
  const template=['minimal','floral','grid'].includes(state.template)?state.template:'minimal';
  const artist=String(state.artist||'').trim();
  const recipient=String(state.recipient||'').trim();
  const sender=String(state.sender||'').trim();
  const recipientLabel=recipient?`For ${recipient}`:'For someone special';
  const senderLabel=sender?`From ${sender}`:'Made with care';
  const artistLabel=artist?`Curated by ${artist}`:'Curated by you';
  const files={minimal:'jcard-letterpress-ivory-v1.webp',floral:'jcard-flower-garden-v1.webp',grid:'jcard-record-atelier-v1.webp'};
  const art=await jCardTemplateArtData(files[template]);
  const sideA=state.sideA.filter(Boolean),sideB=state.sideB.filter(Boolean);
  const list=(tracks,x)=>{let rows=0;return tracks.map((track,index)=>wrapExportText(track,19).slice(0,2).map((line,lineIndex)=>{const row=`<tspan x="${x}" dy="${rows?31:0}">${lineIndex?'   ':`${index+1}. `}${esc(line)}</tspan>`;rows++;return row;}).join('')).join('');};
  const noteLines=wrapExportText(state.note||'Made with care.',30).slice(0,5);
  const titleLines=wrapExportText(state.title||'A little something',15).slice(0,3);
  const titleText=titleLines.map((line,index)=>`<tspan x="130" dy="${index?60:0}">${esc(line)}</tspan>`).join('');
  const titleBottom=190+(titleLines.length-1)*60;
  const artistLines=wrapExportText(artistLabel,22).slice(0,2);
  const artistY=titleBottom+56;
  const artistText=artistLines.map((line,index)=>`<tspan x="130" dy="${index?31:0}">${esc(line)}</tspan>`).join('');
  const metaY=artistY+(artistLines.length-1)*31+35;
  const noteHeight=62+noteLines.length*37;
  const noteY=1190-noteHeight;
  const noteText=noteLines.map((line,index)=>`<tspan x="730" dy="${index?37:0}">${esc(line)}</tspan>`).join('');
  const paper=art?`<image href="${art}" width="1980" height="1400" preserveAspectRatio="xMidYMid slice"/><rect width="1980" height="1400" fill="#e8dcc5" opacity="${template==='floral'?'.12':'.06'}"/>`:`<rect width="1980" height="1400" fill="${t.bg}"/>`;
  const panels='';
  const cover=art?`<image href="${art}" x="1410" y="765" width="405" height="350" preserveAspectRatio="xMaxYMax slice"/>`:`<rect x="1410" y="765" width="405" height="350" fill="${t.label}"/>`;
  const folds=print?`<path d="M660 0V1400M1320 0V1400" stroke="${t.ink}" stroke-width="2" stroke-dasharray="10 9" opacity=".55"/>`:'';
  await document.fonts.ready;
  downloadSvg(`<svg xmlns="http://www.w3.org/2000/svg" width="2480" height="1754" viewBox="0 0 1980 1400">${paper}${panels}${folds}<text x="130" y="190" font-family="Fraunces, Georgia, serif" font-size="58" font-weight="700" fill="${t.ink}">${titleText}</text><text x="130" y="${artistY}" font-family="DM Mono, monospace" font-size="25" fill="${t.ink}">${artistText}</text><text x="130" y="${metaY}" font-family="DM Mono, monospace" font-size="18" fill="${t.ink}" opacity=".72">${esc(recipientLabel)} &amp; ${esc(senderLabel)}</text><text x="760" y="205" font-family="DM Mono, monospace" font-size="28" font-weight="700" fill="${t.ink}">SIDE A</text><text x="760" y="255" font-family="DM Sans, Arial, sans-serif" font-size="28" fill="${t.ink}">${list(sideA,760)}</text><text x="1420" y="205" font-family="DM Mono, monospace" font-size="28" font-weight="700" fill="${t.ink}">SIDE B</text><text x="1420" y="255" font-family="DM Sans, Arial, sans-serif" font-size="28" fill="${t.ink}">${list(sideB,1420)}</text>${cover}<g transform="translate(0 ${noteY})"><rect x="700" width="570" height="${noteHeight}" rx="5" fill="#eadfc8" opacity=".28"/><text x="730" y="29" font-family="DM Mono, monospace" font-size="15" fill="${t.ink}" opacity=".68">${esc(recipientLabel.toUpperCase())}</text><text x="730" y="59" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="30" font-weight="600" fill="${t.ink}">${noteText}</text></g></svg>`,name);
}

function reorderJCardSections() {
  const why = document.querySelector('.jcard-why');
  const about = document.querySelector('.jcard-what-is');
  if (why && about && why.compareDocumentPosition(about) & Node.DOCUMENT_POSITION_FOLLOWING) {
    why.parentNode.insertBefore(about, why);
  }
}

function updateJCardMarketingCopy() {
  if (!isJCard) return;
  reorderJCardSections();
  const setText = (selector, text) => {
    const element = document.querySelector(selector);
    if (element && element.textContent !== text) element.textContent = text;
  };
  const setAll = (selector, texts) => {
    document.querySelectorAll(selector).forEach((element, index) => {
      if (texts[index] && element.textContent !== texts[index]) element.textContent = texts[index];
    });
  };
  const setIf = (selector, currentText, text) => {
    const element = document.querySelector(selector);
    if (element && element.textContent === currentText) element.textContent = text;
  };

  setText('.jcard-intro h1', 'Create a Cassette J Card Template');
  setText('.jcard-intro p', 'Choose a cassette tape J card template, add your album details and tracks, then download a printable cassette insert.');
  setText('.jcard-howto-heading h2', 'Build a Cassette J Card from a Template');
  setText('.jcard-howto-heading p', 'Turn a thoughtful mixtape into a printable cassette card with a template made for one person.');
  setAll('.jcard-howto-steps article h3', ['Choose a J Card Template', 'Write the Dedication', 'Add Tracks and Share']);
  setAll('.jcard-howto-steps article p', [
    'Pick a cassette J card template that suits the person, the music, or the occasion.',
    'Add the album title, curator, recipient, sender, and a short note.',
    'Arrange the tracks across Side A and B, then download or share the finished cassette J card.'
  ]);
  setText('.jcard-why h2', 'A Cassette J Card Makes the Gift Feel Real');
  setText('.jcard-why > .jcard-section-heading > p', 'Give your mixtape a home with a cassette tape J card template that feels made for one person.');
  setAll('.jcard-why-points article p', [
    'Your title, artist, note, and track order become one considered cassette J card.',
    'The dedication and songs turn a familiar format into a personal keepsake.',
    'Download your printable design, tuck it into a case, or share the digital card.'
  ]);
  setText('.jcard-what-is h2', 'What Is a Cassette J Card?');
  setAll('.jcard-what-is > div:last-child p', [
    'A cassette J card is the folded paper insert inside a cassette case. It carries the album identity, track list, and details that make a mixtape feel like it belongs to someone.',
    'Use this cassette tape J card template as a printable insert, a digital music gift, or a paper keepsake for another present.'
  ]);
  setAll('.jcard-faq summary', ['What will I receive from the J card template?', 'Do I need a real cassette?', 'Can I share my cassette J card digitally?', 'Can I also make a mixtape cassette card?']);
  setAll('.jcard-faq details p', [
    'The print version is a high-resolution PNG with quiet fold guides for cutting and folding.',
    'No. The J card can be the gift itself, a music-themed note, or an insert for a real cassette case.',
    'Yes. Preview the recipient view and copy a link that keeps the album details, dedication, and track list.',
    'Yes. Use Make a mixtape for a playable cassette-style music gift.'
  ]);
  setIf('#j-panel .step-heading h2', 'Choose a background image', 'Choose a Cassette J Card Template');
  setIf('#j-panel .step-heading span', 'Three J-card papers', 'Three printable template styles');
  setIf('#j-panel .privacy-note', "Choose up to three keepsakes for the cassette's outer J-Card.", 'Choose up to three keepsakes for the cassette J card.');
}

function updateMixMarketingCopy() {
  if (isJCard) return;
  const setText = (selector, text) => {
    const element = document.querySelector(selector);
    if (element && element.textContent !== text) element.textContent = text;
  };
  const setAll = (selector, texts) => {
    document.querySelectorAll(selector).forEach((element, index) => {
      if (texts[index] && element.textContent !== texts[index]) element.textContent = texts[index];
    });
  };

  setText('.mix-intro p', 'Create a mixtape for someone special with a simple mixtape maker. Choose a cassette look, add songs, and share a personalized musical gift.');
  setText('.mix-howto-heading h2', 'Make a Mixtape for You in Three Small Moves');
  setText('.mix-howto-heading p', 'Use this cassette tape creator to turn a few thoughtful details into a personal music gift.');
  setAll('.mix-howto-steps article p', [
    'Choose a cassette design and a few stickers that fit the person, the music, or the occasion.',
    'Use the mixtape maker to preview songs and arrange them in the order you want them heard.',
    'Add a short note, finish your mixtape for you, and share one memorable gift link.'
  ]);
  setText('.mix-what-is h2', 'What Is a Mixtape for You?');
  setAll('.mix-what-is > div:last-child p', [
    'A mixtape for you is a small music gift with the care of a handmade cassette: a look, a short note, and songs arranged in a personal order.',
    'Our cassette tape creator turns those details into a digital cassette card that someone special can open and play.'
  ]);
  setText('.mix-why h2', 'Why Make a Mixtape for You?');
  setText('.mix-why > .mix-section-heading > p', 'A mixtape maker makes the gesture feel considered without making it complicated.');
  setAll('.mix-why-points article p', [
    'The songs, cassette look, and note all come from you, so the gift has a point of view.',
    'Instead of sending a bare link, give someone a cassette card with an opening sequence and a message inside.',
    'There is no account to set up. When your mixtape for you is ready, one link is enough to share it.'
  ]);
  setAll('.mix-faq summary', ['Does the recipient need an account?', 'Can the recipient play the songs?', 'Where does my mixtape live before I share it?', 'Can I make a matching cassette J card?']);
  setAll('.mix-faq details p', [
    'No. Anyone with the gift link can open your mixtape for you in a browser.',
    'Yes. The shared gift keeps the selected openly licensed songs and their order. Playback starts after the recipient presses play.',
    'Your mixtape stays in this browser while you make it. The gift link carries the card settings when you are ready to share.',
    'Yes. Use Custom J cards to create a printable cassette insert with an album title, dedication, and track list.'
  ]);
}

if (isJCard) {
  const appRoot = document.querySelector('#app');
  new MutationObserver(updateJCardMarketingCopy).observe(appRoot, { childList: true, subtree: true });
} else {
  const appRoot = document.querySelector('#app');
  new MutationObserver(updateMixMarketingCopy).observe(appRoot, { childList: true, subtree: true });
}

isJCard ? JCardApp() : MixApp();
