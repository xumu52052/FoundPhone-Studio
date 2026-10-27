export { WeatherSkin, HealthSkin } from "./CalibratedSystemApps";
import { AudioPlayer, useTrack } from "../audio";
import { useSkinState } from "../skinState";
import {
  Calendar,
  Camera,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  FileText,
  Folder,
  Globe,
  Grid,
  Heart,
  Image,
  LockKeyhole,
  MapPin,
  Music,
  Phone,
  Search,
  SkipForward,
  Star,
  Users,
  Wallet,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { download } from "../io";
import { safeMedia, type Item } from "../schema";
import {
  Add,
  Avatar,
  Empty,
  groupItems,
  Header,
  Media,
  meta,
  Row,
  SearchBox,
  Tabs,
  useContent,
  type Props,
} from "./shared";
export function PhoneSkin(p: Props) {
  const { tab, setTab, q, setQ, items } = useContent(p, "最近通话");
  const [digits, setDigits] = useState(""),
    [call, setCall] = useState("");
  const list = tab === "收藏" ? items.filter((i) => i.favorite) : items;
  return (
    <div className="catalog-skin native-phone">
      <Header p={p} />
      <div className="catalog-scroll">
        <h1>{tab}</h1>
        {tab === "拨号键盘" ? (
          <div className="dialer">
            <output>{digits || "输入号码"}</output>
            <div>
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"].map(
                (k) => (
                  <button key={k} onClick={() => setDigits((s) => s + k)}>
                    {k}
                    <small>
                      {
                        (
                          {
                            "2": "ABC",
                            "3": "DEF",
                            "4": "GHI",
                            "5": "JKL",
                            "6": "MNO",
                            "7": "PQRS",
                            "8": "TUV",
                            "9": "WXYZ",
                          } as Record<string, string>
                        )[k]
                      }
                    </small>
                  </button>
                ),
              )}
            </div>
            <button
              className="dial-call"
              disabled={!digits}
              aria-label="模拟拨号"
              onClick={() => {
                setCall(digits);
                const i = items.find((i) => meta(i, "number") === digits);
                if (i) p.onRead(i.id);
              }}
            >
              <Phone size={24} />
            </button>
            <button onClick={() => setDigits((s) => s.slice(0, -1))}>
              删除
            </button>
          </div>
        ) : (
          <>
            <SearchBox value={q} set={setQ} />
            {list.map((i) => (
              <button
                className={`call-row ${meta(i, "status") === "未接" ? "missed" : ""}`}
                key={i.id}
                onClick={() => p.onItem(i)}
              >
                <Phone size={17} />
                <span>
                  <strong>{i.title}</strong>
                  <small>
                    {meta(i, "number", i.sender)} ·{" "}
                    {meta(i, "status", "通话记录")}
                  </small>
                </span>
                <time>{i.time.slice(5, 10)}</time>
              </button>
            ))}
            <Empty items={list} />
          </>
        )}
      </div>
      <Tabs
        tabs={["收藏", "最近通话", "通讯录", "拨号键盘"]}
        value={tab}
        set={setTab}
        icons={[<Star />, <Clock />, <Users />, <Grid />]}
      />
      {call && (
        <div className="virtual-call">
          <small>虚拟通话</small>
          <Avatar name={call} />
          <h2>{call}</h2>
          <p>这是作品内的通话模拟</p>
          <button aria-label="挂断" onClick={() => setCall("")}>
            <Phone />
          </button>
        </div>
      )}
    </div>
  );
}
export function ContactsSkin(p: Props) {
  const { q, setQ, items } = useContent(p, "所有联系人");
  return (
    <div className="catalog-skin native-contacts">
      <Header p={p} />
      <div className="catalog-scroll">
        <h1>通讯录</h1>
        <SearchBox value={q} set={setQ} />
        <button
          className="contact-self"
          onClick={() => {
            if (items[0]) p.onItem(items[0]);
            else if (p.creator) p.onAdd();
          }}
        >
          <Avatar name={p.owner ?? "我"} />
          <span>
            <strong>{p.owner ?? "我的名片"}</strong>
            <small>我的名片</small>
          </span>
        </button>
        {groupItems(items, "所有联系人").map((g) => (
          <section key={g}>
            <h4 className="native-section">{g}</h4>
            {items
              .filter((i) => (i.folder || "所有联系人") === g)
              .sort((a, b) => a.title.localeCompare(b.title, "zh-CN"))
              .map((i) => (
                <Row
                  key={i.id}
                  item={i}
                  onItem={p.onItem}
                  leading={<Avatar name={i.title} />}
                />
              ))}
          </section>
        ))}
        <Empty items={items} />
      </div>
    </div>
  );
}
export function PhotosSkin(p: Props) {
  const { tab, setTab, q, setQ, items } = useContent(p, "图库");
  const [album, setAlbum] = useState("");
  const list =
    tab === "收藏"
      ? items.filter((i) => i.favorite)
      : album
        ? items.filter((i) => (i.folder || "未分类") === album)
        : items;
  return (
    <div className="catalog-skin native-photos">
      <Header p={p} />
      <div className="catalog-scroll">
        <h1>{album || tab}</h1>
        {tab === "相簿" && !album ? (
          <div className="album-grid">
            {groupItems(items, "未分类").map((g) => (
              <button key={g} onClick={() => setAlbum(g)}>
                <Media
                  item={items.find((i) => (i.folder || "未分类") === g)!}
                />
                <strong>{g}</strong>
                <small>
                  {items.filter((i) => (i.folder || "未分类") === g).length} 项
                </small>
              </button>
            ))}
          </div>
        ) : (
          <>
            <SearchBox value={q} set={setQ} />
            <div className="photo-mosaic">
              {list.map((i) => (
                <button
                  aria-label={`查看${i.title}`}
                  key={i.id}
                  onClick={() => p.onItem(i)}
                >
                  <Media item={i} />
                  {i.favorite && <Heart size={12} fill="white" />}
                </button>
              ))}
            </div>
            <p className="media-count">{list.length} 个项目</p>
          </>
        )}
        <Empty items={list} />
      </div>
      <Tabs
        tabs={["图库", "相簿", "收藏"]}
        value={tab}
        set={(t) => {
          setTab(t);
          setAlbum("");
        }}
        icons={[<Image />, <Folder />, <Heart />]}
      />
    </div>
  );
}
export function CameraSkin(p: Props) {
  const [mode, setMode] = useState("照片"),
    [index, setIndex] = useState(0);
  const frames = p.items.filter((i) =>
    mode === "视频" ? i.kind === "video" : i.kind !== "video",
  );
  const frame = frames[index % Math.max(frames.length, 1)];
  return (
    <div className="catalog-skin native-camera">
      <Header p={p} />
      <div className="camera-top">
        <span>闪光灯关闭</span>
        <span>{mode === "视频" ? "HD · 30" : "4:3"}</span>
      </div>
      <div className="camera-view">
        {frame ? <Media item={frame} /> : <p>未设置取景画面</p>}
        <div className="camera-grid" />
      </div>
      <div className="camera-mode">
        {["视频", "照片"].map((m) => (
          <button
            className={mode === m ? "selected" : ""}
            key={m}
            onClick={() => {
              setMode(m);
              setIndex(0);
            }}
          >
            {m}
          </button>
        ))}
      </div>
      <div className="camera-controls">
        <button
          aria-label="查看上一画面"
          disabled={!frames.length}
          onClick={() => setIndex((i) => (i + 1) % frames.length)}
        >
          <Image size={24} />
        </button>
        <button
          className="camera-shutter"
          aria-label={p.creator ? "编辑拍摄画面" : "查看拍摄内容"}
          disabled={!p.creator && !frame}
          onClick={() => (p.creator ? p.onAdd() : frame && p.onItem(frame))}
        >
          <span />
        </button>
        <button
          aria-label="切换取景画面"
          disabled={frames.length < 2}
          onClick={() => setIndex((i) => i + 1)}
        >
          <Camera size={24} />
        </button>
      </div>
      <small className="camera-caption">作者设置的虚构取景内容</small>
    </div>
  );
}
export function SafariSkin(p: Props) {
  const [q, setQ] = useState(""),
    [tab, setTab] = useState("书签");
  const items = p.items
    .filter((i) =>
      (i.title + i.body + meta(i, "url"))
        .toLowerCase()
        .includes(q.toLowerCase()),
    )
    .filter((i) =>
      tab === "书签"
        ? i.favorite || i.folder !== "历史记录"
        : i.folder === "历史记录",
    );
  return (
    <div className="catalog-skin native-safari">
      <Header p={p} />
      <div className="catalog-scroll">
        <h1>{tab}</h1>
        <div className="safari-favorites">
          {items.map((i) => (
            <button key={i.id} onClick={() => p.onItem(i)}>
              <span>
                <Globe size={28} />
              </span>
              <strong>{i.title}</strong>
              <small>{meta(i, "url")}</small>
            </button>
          ))}
        </div>
        <Empty items={items} label="没有匹配的虚构网页" />
      </div>
      <label className="safari-address">
        <LockKeyhole size={13} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="搜索或输入虚构网址"
          aria-label="地址栏"
          onKeyDown={(e) => {
            if (e.key === "Enter" && items[0]) p.onItem(items[0]);
          }}
        />
        <Search size={16} />
      </label>
      <Tabs
        tabs={["书签", "历史记录"]}
        value={tab}
        set={setTab}
        icons={[<Globe />, <Clock />]}
      />
    </div>
  );
}
export function NotesSkin(p: Props) {
  const { q, setQ, items } = useContent(p, "备忘录");
  const [folder, setFolder] = useState<string | null>(null);
  const list = folder
    ? items.filter((i) => (i.folder || "备忘录") === folder)
    : items;
  return (
    <div className="catalog-skin native-notes">
      <Header p={p} />
      <div className="catalog-scroll">
        <button className="notes-back" onClick={() => setFolder(null)}>
          <Folder size={17} />
          文件夹
        </button>
        <h1>{folder || "所有备忘录"}</h1>
        <SearchBox value={q} set={setQ} />
        {!folder && (
          <div className="note-folders">
            {groupItems(items, "备忘录").map((g) => (
              <button key={g} onClick={() => setFolder(g)}>
                <Folder size={17} />
                {g}
                <small>
                  {items.filter((i) => (i.folder || "备忘录") === g).length}
                </small>
              </button>
            ))}
          </div>
        )}
        <div className="notes-list">
          {list.map((i) => (
            <button key={i.id} onClick={() => p.onItem(i)}>
              <strong>
                {i.password && <LockKeyhole size={12} />} {i.title}
              </strong>
              <p>
                <time>{i.time.slice(5, 10)}</time>{" "}
                {i.password ? "已锁定的备忘录" : i.body.split("\n")[0]}
              </p>
              <small>{i.folder}</small>
            </button>
          ))}
        </div>
        <Empty items={list} />
      </div>
      <div className="notes-footer">
        <span>{list.length} 则备忘录</span>
        <Add p={p} label="新建备忘录" />
      </div>
    </div>
  );
}
export function CalendarSkin(p: Props) {
  const [month, setMonth] = useState(9),
    [year, setYear] = useState(2026),
    [day, setDay] = useState(27);
  const prefix = `${year}-${String(month + 1).padStart(2, "0")}`;
  const isOnDate = (i: (typeof p.items)[number], d: number) => {
    const md = `${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    return i.time.startsWith(`${year}-${md}`) ||
      (i.meta?.recurring === "yearly" && i.time.slice(5, 10) === md);
  };
  const list = p.items.filter((i) => isOnDate(i, day));
  const move = (d: number) => {
    const date = new Date(Date.UTC(year, month + d, 1));
    setYear(date.getUTCFullYear());
    setMonth(date.getUTCMonth());
    setDay(1);
  };
  const first = new Date(Date.UTC(year, month, 1)).getUTCDay(),
    days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return (
    <div className="catalog-skin native-calendar">
      <Header p={p} />
      <div className="catalog-scroll">
        <div className="month-title">
          <button aria-label="上个月" onClick={() => move(-1)}>
            <ChevronLeft />
          </button>
          <h2>
            {year} 年 {month + 1} 月
          </h2>
          <button aria-label="下个月" onClick={() => move(1)}>
            <ChevronRight />
          </button>
        </div>
        <div className="calendar-grid">
          {["日", "一", "二", "三", "四", "五", "六"].map((t) => (
            <small key={t}>{t}</small>
          ))}
          {Array.from({ length: first }, (_, i) => (
            <span key={"blank" + i} />
          ))}
          {Array.from({ length: days }, (_, i) => (
            <button
              className={day === i + 1 ? "selected" : ""}
              key={i}
              onClick={() => setDay(i + 1)}
            >
              {i + 1}
              {p.items.some((x) => isOnDate(x, i + 1)) && <i />}
            </button>
          ))}
        </div>
        <h4 className="native-section">
          {month + 1} 月 {day} 日
        </h4>
        {list.map((i) => (
          <button
            className="calendar-event"
            key={i.id}
            onClick={() => p.onItem(i)}
          >
            <time>{i.time.slice(-5)}</time>
            <div>
              <strong>{i.title}</strong>
              <p>{meta(i, "location", i.body)}</p>
            </div>
          </button>
        ))}
        <Empty items={list} label="当天没有日程" />
        <Add p={p} label="添加日程" />
      </div>
    </div>
  );
}
export function MailSkin(p: Props) {
  const { tab, setTab, q, setQ, items } = useContent(p, "收件箱");
  const list = items.filter(
    (i) =>
      tab === "全部邮件" ||
      i.folder === tab ||
      (tab === "收件箱" &&
        (!i.folder || !["草稿", "已发送"].includes(i.folder))),
  );
  return (
    <div className="catalog-skin native-mail">
      <Header p={p} />
      <div className="mail-folders">
        {["收件箱", "草稿", "已发送", "全部邮件"].map((t) => (
          <button
            key={t}
            className={tab === t ? "selected" : ""}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="catalog-scroll">
        <h1>{tab}</h1>
        <SearchBox value={q} set={setQ} />
        {list.map((i) => (
          <button
            className="mail-preview"
            key={i.id}
            onClick={() => p.onItem(i)}
          >
            <i className={!i.read ? "unread" : ""} />
            <div>
              <strong>{i.sender}</strong>
              <h3>{i.title}</h3>
              <p>{i.body}</p>
            </div>
            <time>{i.time.slice(5, 10)}</time>
          </button>
        ))}
        <Empty items={list} />
      </div>
      <footer className="mail-footer">
        <span>{list.length} 封邮件</span>
        <Add p={p} label="写邮件" />
      </footer>
    </div>
  );
}
export function ClockSkin(p: Props) {
  const { tab, setTab, items } = useContent(p, "闹钟");
  const [enabled, setEnabled] = useSkinState<string[]>(p, "alarms", []),
    [seconds, setSeconds] = useState(0),
    [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [running]);
  return (
    <div className="catalog-skin native-clock">
      <Header p={p} />
      <div className="catalog-scroll">
        <h1>{tab}</h1>
        {tab === "秒表" ? (
          <div className="stopwatch">
            <output>
              {String(Math.floor(seconds / 60)).padStart(2, "0")}:
              {String(seconds % 60).padStart(2, "0")}
            </output>
            <div>
              <button
                onClick={() => {
                  setSeconds(0);
                  setRunning(false);
                }}
              >
                复位
              </button>
              <button onClick={() => setRunning(!running)}>
                {running ? "暂停" : "开始"}
              </button>
            </div>
          </div>
        ) : (
          items.map((i) => (
            <div className="alarm-row" key={i.id}>
              <button onClick={() => p.onItem(i)}>
                <time>{meta(i, "clock", i.time.slice(-5))}</time>
                <small>
                  {tab === "世界时钟" ? meta(i, "city", i.title) : i.title}
                </small>
              </button>
              {tab === "闹钟" ? (
                <button
                  role="switch"
                  aria-label={`闹钟${i.title}`}
                  aria-checked={enabled.includes(i.id)}
                  className={`native-switch ${enabled.includes(i.id) ? "on" : ""}`}
                  onClick={() =>
                    setEnabled(
                      enabled.includes(i.id)
                        ? enabled.filter((x) => x !== i.id)
                        : [...enabled, i.id],
                    )
                  }
                >
                  <span />
                </button>
              ) : (
                <Clock size={35} />
              )}
            </div>
          ))
        )}
      </div>
      <Tabs
        tabs={["世界时钟", "闹钟", "秒表"]}
        value={tab}
        set={setTab}
        icons={[<Globe />, <Clock />, <Clock />]}
      />
    </div>
  );
}
export function RemindersSkin(p: Props) {
  const { tab, setTab, q, setQ, items } = useContent(p, "全部");
  const [checked, setChecked] = useSkinState<string[]>(p, "checked", []);
  const list =
    tab === "已完成"
      ? items.filter((i) => checked.includes(i.id))
      : items.filter((i) => !checked.includes(i.id));
  return (
    <div className="catalog-skin native-reminders">
      <Header p={p} />
      <div className="catalog-scroll">
        <SearchBox value={q} set={setQ} />
        <div className="reminder-categories">
          {["全部", "已完成"].map((t) => (
            <button key={t} onClick={() => setTab(t)}>
              <Calendar size={22} />
              <strong>
                {t === "全部" ? items.length - checked.length : checked.length}
              </strong>
              <span>{t}</span>
            </button>
          ))}
        </div>
        <h1>{tab}</h1>
        {list.map((i) => (
          <div className="reminder-row" key={i.id}>
            <button
              aria-label={`完成${i.title}`}
              role="checkbox"
              aria-checked={checked.includes(i.id)}
              onClick={() =>
                setChecked(
                  checked.includes(i.id)
                    ? checked.filter((x) => x !== i.id)
                    : [...checked, i.id],
                )
              }
            >
              <CheckCircle size={21} />
            </button>
            <button onClick={() => p.onItem(i)}>
              <strong>{i.title}</strong>
              <small>
                {i.time} · {i.folder}
              </small>
            </button>
          </div>
        ))}
        <Add p={p} label="新提醒事项" />
      </div>
    </div>
  );
}
export function FilesSkin(p: Props) {
  const { tab, setTab, q, setQ, items } = useContent(p, "最近项目");
  const [folder, setFolder] = useState("");
  const list = folder
    ? items.filter((i) => (i.folder || "我的iPhone") === folder)
    : items;
  return (
    <div className="catalog-skin native-files">
      <Header p={p} />
      <div className="catalog-scroll">
        <h1>{folder || tab}</h1>
        <SearchBox value={q} set={setQ} />
        {tab === "浏览" && !folder ? (
          <div className="file-folders">
            {groupItems(items, "我的iPhone").map((g) => (
              <button key={g} onClick={() => setFolder(g)}>
                <Folder size={45} />
                <strong>{g}</strong>
              </button>
            ))}
          </div>
        ) : (
          <div className="file-grid">
            {list.map((i) => (
              <div key={i.id}>
                <button onClick={() => p.onItem(i)}>
                  {i.media ? <Media item={i} /> : <FileText size={49} />}
                  <strong>{i.title}</strong>
                  <small>
                    {meta(i, "extension", "文件")} ·{" "}
                    {meta(i, "size", i.time.slice(0, 10))}
                  </small>
                </button>
                <button
                  aria-label={`下载${i.title}文本`}
                  onClick={() =>
                    download(
                      new Blob([i.body], { type: "text/plain" }),
                      `${i.title}.txt`,
                    )
                  }
                >
                  <Download size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
        <Empty items={list} />
      </div>
      <Tabs
        tabs={["最近项目", "浏览"]}
        value={tab}
        set={(t) => {
          setTab(t);
          setFolder("");
        }}
        icons={[<Clock />, <Folder />]}
      />
    </div>
  );
}
export function MusicSkin(p: Props) {
  const [tab, setTab] = useState("首页");
  const [playlist, setPlaylist] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Item | null>(null);
  const [liked, setLiked] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [showPlayer, setShowPlayer] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const playable = (i: Item | null) => !!i && i.title === "偷偷做个梦" && i.sender.includes("穆祉丞");
  const audioPath = "/assets/story-music/tou-tou-zuo-ge-meng-37s.m4a";
  const coverPath = "/assets/story-music/tou-tou-zuo-ge-meng-cover.jpeg";
  const clock = (s: number) => `0:${String(Math.floor(Math.max(0, s))).padStart(2, "0")}`;
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    if (!playable(selected)) { a.pause(); setPlaying(false); setPosition(0); return; }
    a.pause(); a.currentTime = 0; setPosition(0); setPlaying(false);
    // Opening the song selects the clip; audio starts from the explicit song tap.
    a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }, [selected?.title, selected?.sender]);
  const togglePlayback = () => {
    const a = audioRef.current;
    if (!a || !playable(selected)) return;
    if (a.paused) a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    else { a.pause(); setPlaying(false); }
  };
  const playlists = ["我的喜欢 ♡", "🪵 分享给我的歌", "🪵 专场", "晚间耳机时间", "通勤循环"];
  const tracks = p.items.filter(i => i.id !== "test-item-music");
  const unique = tracks.filter((i, index, arr) => arr.findIndex(t => t.title === i.title && t.sender === i.sender) === index);
  const active = playlist ? tracks.filter(i => i.folder === playlist) : tab === "收藏" ? unique.filter(i => liked.includes(i.title + "|" + i.sender) || i.folder === "我的喜欢 ♡") : tab === "最近播放" ? recent.map(id => unique.find(i => i.title + "|" + i.sender === id)).filter((i): i is Item => !!i) : unique;
  const shown = active.filter(i => (i.title + " " + i.sender).toLowerCase().includes(query.toLowerCase()));
  const choose = (i: Item) => { setSelected(i); setShowPlayer(true); setRecent(prev => [i.title + "|" + i.sender, ...prev.filter(k => k !== i.title + "|" + i.sender)].slice(0, 30)); };
  const next = (offset: number) => { if (!selected || !shown.length) return; const index = shown.findIndex(i => i.title === selected.title && i.sender === selected.sender); choose(shown[(index + offset + shown.length) % shown.length]); };
  const isLiked = (i: Item) => liked.includes(i.title + "|" + i.sender) || (i.folder === "我的喜欢 ♡" && !liked.includes("!" + i.title + "|" + i.sender));
  const toggleLike = (i: Item) => { const key = i.title + "|" + i.sender; setLiked(prev => isLiked(i) ? [...prev.filter(k => k !== key), "!" + key] : [...prev.filter(k => k !== "!" + key), key]); };
  const btn = { background: "transparent", border: "none", color: "inherit", cursor: "pointer" } as const;
  return (
    <div className="catalog-skin native-music" style={{background:"#fffafc", color:"#302d31"}}>
      <Header p={p} />
      <div className="catalog-scroll" style={{padding:"10px 16px 120px"}}>
        <h1 style={{fontSize:29, margin:"12px 0 16px", color:"#242026"}}>{playlist || (tab === "首页" ? "音乐" : tab)}</h1>
        <SearchBox value={query} set={setQuery} placeholder="搜索歌曲或歌手" />
        {playlist && <button style={{...btn, padding:"14px 0", color:"#ad6581"}} onClick={() => {setPlaylist(""); setQuery("");}}>‹ 返回歌单</button>}
        {!playlist && tab === "首页" && <>
          <div style={{display:"flex", gap:9, margin:"17px 0"}}>
            <button style={{...btn, background:"#f7e4eb", borderRadius:12, padding:"12px 14px", flex:1}} onClick={() => setTab("收藏")}>♡ 我的喜欢</button>
            <button style={{...btn, background:"#f7e4eb", borderRadius:12, padding:"12px 14px", flex:1}} onClick={() => setTab("最近播放")}>◷ 最近播放</button>
          </div>
          <h2 style={{fontSize:17, margin:"18px 0 12px"}}>我的歌单</h2>
          <div style={{display:"grid", gridTemplateColumns:"repeat(2,minmax(0,1fr))", gap:12, marginBottom:22}}>
            {playlists.map((name, index) => <button key={name} style={{...btn, textAlign:"left", minWidth:0}} onClick={() => {setPlaylist(name); setQuery("");}}>
              <div style={{height:112, borderRadius:12, background:["#f6dce4","#e8e4f4","#f2e8d7","#dce8e6","#e4e9f5"][index], display:"flex", alignItems:"center", justifyContent:"center", fontSize:37}}>{["♡","♫","☆","☾","♬"][index]}</div>
              <strong style={{display:"block", fontSize:13, marginTop:8}}>{name}</strong>
              <small style={{color:"#999"}}>{tracks.filter(i => i.folder === name).length} 首歌曲</small>
            </button>)}
          </div>
          <h2 style={{fontSize:17, margin:"14px 0"}}>音乐库</h2>
        </>}
        {(playlist || tab !== "首页" || tab === "首页") && shown.map((i, n) => <div key={i.id} style={{display:"flex", alignItems:"center", gap:10, borderBottom:"1px solid #f1e8ed", padding:"11px 0"}}>
          <button style={{...btn, flex:1, display:"flex", textAlign:"left", gap:11, minWidth:0, alignItems:"center"}} onClick={() => choose(i)}>
            <span style={{width:40, height:40, flexShrink:0, borderRadius:8, background:"#f4e6ed", display:"grid", placeItems:"center", color:"#bc8196"}}>♫</span>
            <span style={{minWidth:0, flex:1}}><strong style={{display:"block", fontSize:13, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>{i.title}</strong><small style={{color:"#9c949a", fontSize:11}}>{i.sender}</small></span>
          </button>
          <button aria-label={isLiked(i) ? "取消喜欢" : "喜欢"} style={{...btn, fontSize:21, color:isLiked(i)?"#e46b91":"#bbb"}} onClick={() => toggleLike(i)}>{isLiked(i)?"♥":"♡"}</button>
        </div>)}
        {!shown.length && <p style={{color:"#999", padding:18}}>这里还没有歌曲</p>}
      </div>
      <audio ref={audioRef} src={audioPath} preload="metadata" onTimeUpdate={e => setPosition(Math.min(e.currentTarget.currentTime,37))} onEnded={() => {setPlaying(false);setPosition(37);}} onPause={() => setPlaying(false)} onPlay={() => setPlaying(true)} />
      {selected && <div className="native-now-playing" style={{display:"block", background:"#f8e8ef", padding:"10px 15px"}}>
        <button style={{...btn, width:"100%", textAlign:"left", fontWeight:600}} onClick={() => setShowPlayer(!showPlayer)}>{selected.title} · {selected.sender}　{showPlayer?"⌄":"⌃"}</button>
        {showPlayer && <div style={{textAlign:"center", padding:"14px 0 5px"}}>
          {playable(selected) ? <img src={coverPath} alt="偷偷做个梦 原版封面" style={{height:160,width:160,objectFit:"cover",borderRadius:16,display:"block",margin:"0 auto 12px"}} /> : <div style={{height:100, width:100, borderRadius:16, background:"#ecd5e0", margin:"0 auto 12px", display:"grid", placeItems:"center", fontSize:42}}>♫</div>}
          <strong style={{display:"block"}}>{selected.title}</strong><small>{selected.sender}</small>
          <div style={{display:"flex", justifyContent:"center", gap:35, margin:"15px 0"}}>
            <button aria-label="上一首" style={{...btn, fontSize:23}} onClick={() => next(-1)}>⏮</button>
            {playable(selected) ? <button aria-label={playing ? "暂停" : "播放"} style={{...btn,fontSize:24,color:"#ad6581"}} onClick={togglePlayback}>{playing ? "⏸" : "▶"}</button> : <span style={{fontSize:12, color:"#a37b8c"}}>未提供音频</span>}
            <button aria-label="下一首" style={{...btn, fontSize:23}} onClick={() => next(1)}>⏭</button>
          </div>
          {playable(selected) ? <div style={{padding:"4px 12px 8px"}}>
            <input aria-label="播放进度" type="range" min={0} max={37} step={0.1} value={Math.min(position,37)} onChange={e => { const a=audioRef.current; if(a){a.currentTime=Number(e.target.value);setPosition(a.currentTime);} }} style={{width:"100%",accentColor:"#ad6581"}} />
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#997f89"}}><span>{clock(position)}</span><span>0:37</span></div>
          </div> : <small style={{color:"#997f89"}}>当前歌曲未提供音频。</small>}
        </div>}
      </div>}
      <Tabs tabs={["首页", "收藏", "最近播放"]} value={tab} set={t => {setTab(t); setPlaylist(""); setQuery("");}} icons={[<Music />, <Heart />, <Clock />]} />
    </div>
  );
}
function LocationMap({
  items,
  onItem,
  find = false,
}: {
  items: Item[];
  onItem: (i: Item) => void;
  find?: boolean;
}) {
  return (
    <div className={`fiction-map ${find ? "find-map" : ""}`}>
      <svg viewBox="0 0 300 300" aria-label="原创虚构地图">
        <rect width="300" height="300" fill="#e4e5d8" />
        {[35, 100, 190, 260].map((n) => (
          <path
            key={n}
            d={`M0 ${n} H300 M${n} 0 V300`}
            stroke="#fff"
            strokeWidth="11"
          />
        ))}
        <path
          d="M20 0 Q190 110 120 300"
          stroke="#b6d8df"
          strokeWidth="24"
          fill="none"
        />
        <rect x="205" y="112" width="42" height="65" rx="7" fill="#bdcfac" />
      </svg>
      {items.map((i, n) => (
        <button
          key={i.id}
          aria-label={`地图位置${i.title}`}
          className="map-pin"
          style={{
            left: `${Math.max(5, Math.min(90, Number(meta(i, "x", String(20 + ((n * 17) % 65))))))}%`,
            top: `${Math.max(8, Math.min(80, Number(meta(i, "y", String(25 + ((n * 13) % 50))))))}%`,
          }}
          onClick={() => onItem(i)}
        >
          {find ? <Avatar name={i.title} /> : <MapPin size={24} />}
        </button>
      ))}
    </div>
  );
}
export function MapsSkin(p: Props) {
  const { q, setQ, items } = useContent(p, "地点");
  return (
    <div className="catalog-skin native-maps">
      <Header p={p} />
      <LocationMap items={items} onItem={p.onItem} />
      <div className="map-sheet">
        <SearchBox value={q} set={setQ} placeholder="搜索虚构地点" />
        <div className="map-places">
          {items.map((i) => (
            <Row key={i.id} item={i} onItem={p.onItem} leading={<MapPin />} />
          ))}
        </div>
      </div>
    </div>
  );
}
export function WalletSkin(p: Props) {
  const [selected, setSelected] = useState("");
  const cards = p.items.filter((i) => i.folder !== "交易"),
    transactions = p.items.filter((i) => i.folder === "交易");
  return (
    <div className="catalog-skin native-wallet">
      <Header p={p} />
      <div className="catalog-scroll">
        <h1>钱包</h1>
        <div className="wallet-stack">
          {cards.map((i, n) => (
            <button
              key={i.id}
              className={selected === i.id ? "selected" : ""}
              style={{
                background: ["#252d38", "#716456", "#4a655d", "#735e6b"][n % 4],
              }}
              onClick={() => {
                setSelected(i.id);
                p.onItem(i);
              }}
            >
              <strong>{i.title}</strong>
              <span>{meta(i, "number", "••••")}</span>
              <small>{meta(i, "amount", i.sender)}</small>
            </button>
          ))}
        </div>
        <h4 className="native-section">交易记录</h4>
        {transactions.map((i) => (
          <Row key={i.id} item={i} onItem={p.onItem} leading={<Wallet />}>
            <strong>{meta(i, "amount")}</strong>
          </Row>
        ))}
        <Empty items={p.items} />
      </div>
    </div>
  );
}
export function FindSkin(p: Props) {
  const { tab, setTab, items } = useContent(p, "设备");
  const list = items.filter((i) =>
    tab === "设备" ? i.folder !== "人物" : i.folder === "人物",
  );
  return (
    <div className="catalog-skin native-find">
      <Header p={p} />
      <LocationMap items={list} onItem={p.onItem} find />
      <div className="find-sheet">
        <h2>{tab}</h2>
        {list.map((i) => (
          <Row
            key={i.id}
            item={i}
            onItem={p.onItem}
            leading={<Avatar name={i.title} />}
          >
            {meta(i, "status", "位置记录")}
          </Row>
        ))}
        <Empty items={list} />
      </div>
      <Tabs
        tabs={["人物", "设备"]}
        value={tab}
        set={setTab}
        icons={[<Users />, <MapPin />]}
      />
    </div>
  );
}
