import { NativeComposer } from "./DeviceSystem";
import { useSkinState } from "./skinState";
import { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  Plus,
  CirclePlus,
  Search,
  MessageCircle,
  Users,
  Compass,
  User,
  Camera,
  Phone,
  Video,
  Settings,
  Heart,
  Send,
  Home,
  Play,
  Bookmark,
  MoreHorizontal,
  Mic,
  Smile,
  Grid,
  CheckCheck,
  AtSign,
  Star,
  Music,
  Image as ImageIcon,
  Layers,
  ShoppingBag,
} from "lucide-react";
import { safeMedia, type Item, type UiValue } from "./schema";
export type SkinProps = {
  ui?: Record<string, UiValue>;
  onUi?: (key: string, value: UiValue) => void;
  appId?: string;
  owner?: string;
  virtualTime?: string;
  name: string;
  items: Item[];
  creator: boolean;
  onRead: (id: string) => void;
  onItem: (i: Item) => void;
  onAdd: () => void;
  onBack: () => void;
  thread: string;
  onThread: (s: string) => void;
};
function Avatar({
  name,
  round = false,
  src = "",
}: {
  name: string;
  round?: boolean;
  src?: string;
}) {
  return (
    <span className={`skin-avatar ${round ? "round" : ""}`}>
      {(src.startsWith("/assets/wechat/") || safeMedia(src)?.startsWith("data:image/")) ? (
        <img src={src.startsWith("/assets/wechat/") ? src : safeMedia(src)} alt="" />
      ) : (
        name.slice(0, 1)
      )}
    </span>
  );
}
function ItemMedia({ item }: { item: Item }) {
  const src = safeMedia(item.media);
  return src ? (
    item.kind === "audio" ? (
      <audio controls src={src} />
    ) : item.kind === "video" ? (
      <video controls playsInline src={src} />
    ) : (
      <img loading="lazy" alt={item.title} src={src} />
    )
  ) : (
    <div className="skin-photo">
      <span>{item.title}</span>
    </div>
  );
}
function MessageList({
  items,
  creator,
  onItem,
  onRead,
  whatsapp = false,
  chatWallpaper,
  boyfriendChat = false,
  participantAvatar,
}: {
  items: Item[];
  boyfriendChat?: boolean;
  participantAvatar?: string;
  chatWallpaper?: string;
  creator: boolean;
  onItem: (i: Item) => void;
  onRead: (id: string) => void;
  whatsapp?: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const previousCount = useRef(items.length);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
    const frame = requestAnimationFrame(() => { el.scrollTop = el.scrollHeight; });
    return () => cancelAnimationFrame(frame);
  }, []);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const wasNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 110;
    if (items.length !== previousCount.current && wasNearBottom) el.scrollTop = el.scrollHeight;
    previousCount.current = items.length;
  }, [items.length]);
  return (
    <div ref={scrollRef} className={`skin-messages ${whatsapp ? "wa-wallpaper" : ""} ${chatWallpaper ? "wx-custom-chat-wallpaper" : ""}`} style={chatWallpaper ? { backgroundImage: `url("${chatWallpaper}")` } : undefined}>
      <div className="skin-date">{items[0]?.time.slice(0, 10)}</div>
      {items.map((i) => (
        <div
          key={i.id}
          className={`skin-message ${i.outgoing ? "outgoing" : ""}`}
        >
          {!whatsapp && !i.outgoing && (
            <Avatar name={i.sender} src={participantAvatar || i.avatar} />
          )}
          <button
            className="skin-bubble"
            onClick={() => (creator ? onItem(i) : onRead(i.id))}
          >
            {["image", "audio", "video"].includes(i.kind) ? (
              <ItemMedia item={i} />
            ) : i.kind === "transfer" ? (
              <div className="skin-transfer">
                ¥ {i.body}
                <small>转账记录 · 虚构</small>
              </div>
            ) : (
              i.body
            )}
            <small className={whatsapp ? undefined : "wx-message-time"}>
              {i.time.slice(-5)}{" "}
              {whatsapp && i.outgoing && <CheckCheck size={11} />}
            </small>
          </button>
          {!whatsapp && i.outgoing && <Avatar name={i.sender} src="/assets/wechat/my-chat-avatar.jpeg" />}
        </div>
      ))}
    </div>
  );
}
function Compose({
  creator,
  onAdd,
  wa = false,
}: {
  creator: boolean;
  onAdd: () => void;
  wa?: boolean;
}) {
  return (
    <div className={`skin-compose ${wa ? "wa-compose" : ""}`}>
      {wa ? <Plus size={20} /> : <Mic size={20} />}
      <NativeComposer creator={creator} onAdd={onAdd} />

      <Smile size={21} />
      {wa ? <Mic size={20} /> : <Plus size={22} />}
    </div>
  );
}
// The countdown begins when the phone app bundle loads, not when the chat is opened.
const wxTimedNotificationStart = Date.now();
// Must match the 20-second delivery marker written by Phone.tsx.
const wxTimedNotificationKey = "foundphone-boyfriend-20s-v1";
const wxTimedSender = "Aaa最帅的mua～";
const wxTimedBody = "宝宝，你在干嘛呀？怎么不回我消息😿";

export function WeChatSkin(p: SkinProps) {
  const [tab, setTab] = useState("微信"),
    [query, setQuery] = useState(""),
    [moments, setMoments] = useState(false),
    [menu, setMenu] = useState(false),
    [searchOpen, setSearchOpen] = useState(false),
    [utility, setUtility] = useState("");
  const hasDeliveredBoyfriendMessage = () => {
    try {
      return localStorage.getItem(wxTimedNotificationKey) === "1" ||
        sessionStorage.getItem(wxTimedNotificationKey) === "1" ||
        sessionStorage.getItem("foundphone-boyfriend-60s-v1") === "1";
    } catch { return false; }
  };
  const [timedDelivered, setTimedDelivered] = useState(hasDeliveredBoyfriendMessage);
  // The phone shell owns the timer. Also recheck persistent delivery on mount,
  // when returning to WeChat, and when the app regains focus: a missed toast
  // must never mean a missing chat message.
  useEffect(() => {
    const onDelivery = () => setTimedDelivered(true);
    const syncDelivery = () => {
      if (hasDeliveredBoyfriendMessage()) setTimedDelivered(true);
    };
    syncDelivery();
    window.addEventListener("foundphone:boyfriend-message", onDelivery);
    window.addEventListener("focus", syncDelivery);
    document.addEventListener("visibilitychange", syncDelivery);
    return () => {
      window.removeEventListener("foundphone:boyfriend-message", onDelivery);
      window.removeEventListener("focus", syncDelivery);
      document.removeEventListener("visibilitychange", syncDelivery);
    };
  }, []);
  useEffect(() => {
    if (p.thread === wxTimedSender) {
      if (hasDeliveredBoyfriendMessage()) setTimedDelivered(true);
    }
  }, [p.thread]);
  const timedMessage: Item | null = timedDelivered && !p.creator ? {
    ...(p.items[0] || {}),
    id: "foundphone-boyfriend-timed-message-v1",
    title: wxTimedSender,
    body: wxTimedBody,
    sender: wxTimedSender,
    avatar: "/assets/wechat/aaa-dog.jpeg",
    time: new Date().toISOString().slice(0, 16).replace("T", " "),
    kind: "text",
    media: "",
    outgoing: false,
    read: false,
  } as Item : null;
  // Interactive otome-style reply: stored only for this visitor's browser tab.
  type ReplyChoice = "busy" | "miss";
  const [replyChoice, setReplyChoice] = useState<ReplyChoice | "">(() => {
    try { const value = sessionStorage.getItem("foundphone-boyfriend-reply-v1"); return value === "busy" || value === "miss" ? value : ""; }
    catch { return ""; }
  });
  const [replyOpen, setReplyOpen] = useState(false);
  const [boyfriendTyping, setBoyfriendTyping] = useState(false);
  const [replyReady, setReplyReady] = useState(() => {
    try { return sessionStorage.getItem("foundphone-boyfriend-answer-v1") === "1"; }
    catch { return false; }
  });
  useEffect(() => {
    if (!replyChoice || replyReady) return;
    const typingTimer = window.setTimeout(() => setBoyfriendTyping(true), 700);
    const answerTimer = window.setTimeout(() => {
      setBoyfriendTyping(false);
      setReplyReady(true);
      try { sessionStorage.setItem("foundphone-boyfriend-answer-v1", "1"); } catch { /* private browsing */ }
    }, 3000);
    return () => { window.clearTimeout(typingTimer); window.clearTimeout(answerTimer); };
  }, [replyChoice, replyReady]);
  const selectReply = (choice: ReplyChoice) => {
    if (replyChoice) return;
    setReplyChoice(choice);
    setReplyOpen(false);
    try { sessionStorage.setItem("foundphone-boyfriend-reply-v1", choice); } catch { /* private browsing */ }
  };
  const createStoryMessage = (id: string, body: string, outgoing: boolean): Item => ({
    ...(p.items[0] || {}), id, title: wxTimedSender, body,
    sender: outgoing ? "我" : wxTimedSender,
    avatar: outgoing ? "/assets/wechat/my-chat-avatar.jpeg" : "/assets/wechat/aaa-dog.jpeg",
    time: new Date().toISOString().slice(0, 16).replace("T", " "),
    kind: "text", media: "", outgoing, read: true,
  } as Item);
  const storyMessages: Item[] = timedMessage ? [timedMessage] : [];
  if (timedMessage && replyChoice) {
    storyMessages.push(createStoryMessage("foundphone-boyfriend-user-reply-v1",
      replyChoice === "busy" ? "刚刚在忙啦，才看到消息" : "因为我在想你呀～", true));
    if (replyReady) storyMessages.push(createStoryMessage("foundphone-boyfriend-answer-v1",
      replyChoice === "busy"
        ? "没事宝宝，忙完了吗？我刚刚还在想你怎么一直没动静呢哈哈哈"
        : "这么巧啊，我刚刚也在想你。", false));
  }
  // The continuation is gated by real user actions and persisted across visits.
  const progressKey = "foundphone-wx-call-progress-v1";
  type CallProgress = "waiting" | "voice-ready" | "voice-heard" | "accept" | "decline" | "ringing" | "connected" | "ended" | "rejected";
  const [callProgress, setCallProgress] = useState<CallProgress>(() => {
    try { return (localStorage.getItem(progressKey) as CallProgress) || "waiting"; }
    catch { return "waiting"; }
  });
  const [voicePlaying, setVoicePlaying] = useState(false);
  const [callPlaying, setCallPlaying] = useState(false);
  const [callSeconds, setCallSeconds] = useState(() => { try { return Number(localStorage.getItem("foundphone-wx-call-seconds-v1") || 0); } catch { return 0; } });
  const [callAudioEnded, setCallAudioEnded] = useState(false);
  const [ringNotice, setRingNotice] = useState("");
  const voiceAudio = useRef<HTMLAudioElement>(null);
  const callAudio = useRef<HTMLAudioElement>(null);
  const ringAudio = useRef<HTMLAudioElement>(null);
  const setProgress = (next: CallProgress) => {
    setCallProgress(next);
    try { localStorage.setItem(progressKey, next); } catch { /* private mode */ }
  };
  useEffect(() => {
    if (replyReady && callProgress === "waiting") setProgress("voice-ready");
  }, [replyReady, callProgress]);
  useEffect(() => {
    if (callProgress !== "connected") return;
    const timer = window.setInterval(() => setCallSeconds((n) => n + 1), 1000);
    return () => window.clearInterval(timer);
  }, [callProgress]);
  useEffect(() => {
    if (p.thread === wxTimedSender) return;
    voiceAudio.current?.pause();
    callAudio.current?.pause();
    ringAudio.current?.pause();
    setVoicePlaying(false);
    setCallPlaying(false);
    // Do not leave an invisible incoming call ringing when navigating away.
    if (callProgress === "ringing") setProgress("rejected");
  }, [p.thread]);
  const beginCall = () => {
    if (callProgress !== "accept") return;
    setProgress("ringing");
    setRingNotice("");
    window.setTimeout(() => {
      const audio = ringAudio.current;
      if (audio) audio.play().catch(() => setRingNotice("点击接听或拒绝来电"));
    }, 0);
  };
  const answerCall = () => {
    ringAudio.current?.pause();
    if (ringAudio.current) ringAudio.current.currentTime = 0;
    setCallSeconds(0);
    setCallAudioEnded(false);
    setProgress("connected");
    window.setTimeout(() => {
      callAudio.current?.play().then(() => setCallPlaying(true)).catch(() => setCallPlaying(false));
    }, 0);
  };
  const finishCall = (status: "ended" | "rejected") => {
    ringAudio.current?.pause();
    callAudio.current?.pause();
    setCallPlaying(false);
    if (status === "ended") { try { localStorage.setItem("foundphone-wx-call-seconds-v1", String(callSeconds)); } catch {} }
    setProgress(status);
    if (status === "ended") window.dispatchEvent(new Event("foundphone:secret-call-ended"));
  };
  const callDuration = `${String(Math.floor(callSeconds / 60)).padStart(2,"0")}:${String(callSeconds % 60).padStart(2,"0")}`;
  if (timedMessage && replyReady && callProgress !== "waiting") {
    storyMessages.push(createStoryMessage("foundphone-wx-voice-prompt", "🎙️ 语音消息 · 点击下方语音气泡收听", false));
    if (["accept","ringing","connected","ended","rejected"].includes(callProgress)) {
      storyMessages.push(createStoryMessage("foundphone-wx-user-call-choice", "接呀，正好我也想你了", true));
      storyMessages.push(createStoryMessage("foundphone-wx-call-ready", "好，那我打过来啦。", false));
    }
    if (callProgress === "decline") {
      storyMessages.push(createStoryMessage("foundphone-wx-user-call-decline", "现在不太方便，等会儿好不好？", true));
      storyMessages.push(createStoryMessage("foundphone-wx-call-decline-reply", "好呀，那你先忙，等你有空了我们再打。", false));
    }
    if (callProgress === "ended") storyMessages.push(createStoryMessage("foundphone-wx-call-history", `语音通话 ${callDuration}`, false));
    if (callProgress === "rejected") storyMessages.push(createStoryMessage("foundphone-wx-call-rejected", "已拒绝语音通话", false));
  }
  // Secret voice memo continuation: append-only, never changes the existing call flow.
  type SecretChoice = "playful" | "sweet";
  const [secretReady, setSecretReady] = useState(() => {try{return localStorage.getItem("foundphone-secret-wx-ready-v1")==="1"}catch{return false}});
  useEffect(()=>{const sync=()=>setSecretReady(true);window.addEventListener("foundphone:secret-wx-ready",sync);return()=>window.removeEventListener("foundphone:secret-wx-ready",sync)},[]);
  const [secretFirst, setSecretFirst] = useState<SecretChoice | "">(() => {try{return (localStorage.getItem("foundphone-secret-wx-first-v1") as SecretChoice)||""}catch{return ""}});
  const [secretSecond, setSecretSecond] = useState<SecretChoice | "">(() => {try{return (localStorage.getItem("foundphone-secret-wx-second-v1") as SecretChoice)||""}catch{return ""}});

  const secretEnabled = !p.creator && callProgress==="ended" && secretReady;
  if(secretEnabled){
    storyMessages.push(createStoryMessage("secret-wx-intro","宝宝，你是不是发现什么了😼",false));
    if(secretFirst){
      storyMessages.push(createStoryMessage("secret-wx-first-user",secretFirst==="playful"?"穆祉丞！你什么时候偷偷录的！！":"呜呜呜宝宝……我听完了，好喜欢你",true));
      const lines=secretFirst==="playful"?["哈哈哈哈哈真的被你发现了啊","就上次你去洗澡的时候，我偷偷拿你手机录的","怎么样，男朋友是不是还挺会准备惊喜的😼"]:["哎呀……怎么还哭了呀","本来是想偷偷给你个惊喜的","你喜欢就好。我录的时候还紧张了半天呢"];
      lines.forEach((line,i)=>storyMessages.push(createStoryMessage(`secret-wx-first-answer-${i}`,line,false)));
      if(secretSecond){
        storyMessages.push(createStoryMessage("secret-wx-second-user",secretSecond==="playful"?"好吧，承认你这次真的有把我哄到😼":"那你以后也要一直这么喜欢我哦🥺",true));
        ["不过说真的，宝宝。","录音里说的每一句话，都是真的。","当面说可能会有点不好意思，所以才偷偷录下来的。","喜欢你，特别特别喜欢。"].forEach((line,i)=>storyMessages.push(createStoryMessage(`secret-wx-final-${i}`,line,false)));
      }
    }
  }
  const chooseSecret = (stage:1|2,choice:SecretChoice)=>{if(stage===1){if(secretFirst)return;setSecretFirst(choice);try{localStorage.setItem("foundphone-secret-wx-first-v1",choice)}catch{}}else{if(!secretFirst||secretSecond)return;setSecretSecond(choice);try{localStorage.setItem("foundphone-secret-wx-second-v1",choice)}catch{}}};
  const [catfoodReady,setCatfoodReady] = useState(() => {try{return localStorage.getItem("foundphone-catfood-ordered-v1")==="1"}catch{return false}});
  const catfoodAudioRef = useRef<HTMLAudioElement>(null);
  const [catfoodVoicePlaying,setCatfoodVoicePlaying] = useState(false);
  const [catfoodVoiceHeard,setCatfoodVoiceHeard] = useState(() => {try{return localStorage.getItem("foundphone-catfood-voice-heard-v1")==="1"}catch{return false}});
  const [catfoodAcknowledged,setCatfoodAcknowledged] = useState(() => {try{return localStorage.getItem("foundphone-catfood-ack-v1")==="1"}catch{return false}});
  useEffect(()=>{const sync=()=>setCatfoodReady(true);window.addEventListener("foundphone:catfood-ordered",sync);return()=>window.removeEventListener("foundphone:catfood-ordered",sync)},[]);
  const acknowledgeCatfoodVoice = () => {
    if (!catfoodVoiceHeard || catfoodAcknowledged) return;
    setCatfoodAcknowledged(true);
    try { localStorage.setItem("foundphone-catfood-ack-v1", "1"); } catch {}
  };
  if(catfoodReady && !p.creator){
    ["宝宝，你是不是又给面团买东西了？","我刚看见猫粮订单了哈哈哈","你等一下，我跟你说个事"].forEach((line,i)=>storyMessages.push(createStoryMessage(`catfood-message-${i}`,line,false)));
  }
  const boyfriendItems = [...p.items, ...storyMessages];
  const [readThreads, setReadThreads] = useSkinState<string[]>(
    p,
    "readThreads",
    [],
  );
  // Author-defined WeChat conversation order. Empty threads intentionally have no
  // invented messages; later story updates can fill them by matching title.
  const orderedChats = [
    "Aaa最帅的mua～",
    "🪵助理",
    "好闺闺",
    "妈咪～",
    "🪵mama",
  ];
  // User-supplied original images; keep chat list and message avatars consistent.
  const chatAvatars: Record<string, string> = {
    "Aaa最帅的mua～": "/assets/wechat/aaa-dog.jpeg",
    "好闺闺": "/assets/wechat/avatar-bestie.jpeg",
    "🪵mama": "/assets/wechat/avatar-his-mom.jpeg",
    "妈咪～": "/assets/wechat/avatar-my-mom.jpeg",
    "🪵助理": "/assets/wechat/avatar-assistant.jpeg",
  };
  const conversations = orderedChats;
  const contacts = [
    ...new Set(p.items.map((i) => i.sender).filter((s) => s !== "我" && s !== "李姐")),
  ];
  const posts = p.items.filter(
    (i) => i.folder === "朋友圈" || i.kind === "post",
  );
  return (
    <div
      className="wechat-ui independent-skin"
      data-tab={tab}
      data-thread={!!p.thread}
      data-moments={moments}
      data-utility={!!utility}
    >
      <div className="app-nav wx-nav">
        <button
          aria-label={utility || p.thread || moments ? "返回" : "收藏"}
          onClick={() =>
            utility
              ? setUtility("")
              : p.thread
                ? p.onThread("")
                : moments
                  ? setMoments(false)
                  : setUtility("收藏")
          }
        >
          {utility || p.thread || moments ? (
            <ChevronLeft size={22} />
          ) : (
            <Star size={22} />
          )}
        </button>
        <strong>
          {utility ||
            p.thread ||
            (moments ? "朋友圈" : tab === "微信" ? p.name : tab)}
        </strong>
        <button
          aria-label={
            p.creator ? "新增内容" : p.thread ? "聊天详情" : "微信菜单"
          }
          onClick={
            p.creator
              ? p.onAdd
              : () => (p.thread ? setUtility("聊天信息") : setMenu(!menu))
          }
        >
          {p.thread ? <MoreHorizontal size={22} /> : <CirclePlus size={22} />}
        </button>
      </div>
      {menu && (
        <div className="wx-popup-menu" role="menu">
          {["搜索", "发起群聊", "添加朋友", "扫一扫", "收付款"].map((label) => (
            <button
              role="menuitem"
              key={label}
              onClick={() => {
                setMenu(false);
                if (label === "搜索") {
                  setSearchOpen(true);
                } else setUtility(label);
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}
      {utility ? (
        <div className="skin-scroll wx-utility">
          {utility === "聊天信息" && (
            <div className="wx-members">
              {[
                ...new Set(
                  p.items
                    .filter((i) => i.title === p.thread)
                    .map((i) => i.sender),
                ),
              ].map((name) => (
                <div key={name}>
                  <Avatar
                    name={name}
                    src={p.items.find((i) => i.sender === name)?.avatar}
                  />
                  <small>{name}</small>
                </div>
              ))}
            </div>
          )}
          {p.items
            .filter((i) => i.folder === utility)
            .map((i) => (
              <button
                key={i.id}
                className="wx-discovery"
                onClick={() => p.onItem(i)}
              >
                {i.title}
                <span>›</span>
              </button>
            ))}
          {!p.items.some((i) => i.folder === utility) &&
            utility !== "聊天信息" && <p className="skin-empty">暂无内容</p>}
        </div>
      ) : p.thread ? (
        <>
          <MessageList
            items={boyfriendItems.filter((i) => i.title === p.thread)}
            chatWallpaper={p.thread === "Aaa最帅的mua～" ? "/assets/wechat/chat-boyfriend-bg.jpeg" : "/assets/wechat/chat-others-bg.jpeg"}
            boyfriendChat={p.thread === "Aaa最帅的mua～"}
            participantAvatar={chatAvatars[p.thread]}
            creator={p.creator}
            onItem={p.onItem}
            onRead={p.onRead}
          />
          {!p.creator && p.thread === wxTimedSender && catfoodReady && (
            <div style={{padding:"8px 14px 12px",background:"transparent",display:"grid",justifyItems:"start",gap:10}}>
              <audio
                ref={catfoodAudioRef}
                preload="metadata"
                src="/assets/wechat/catfood-dad-voice.mp3"
                style={{display:"none"}}
                aria-label="面团爸爸的微信语音"
                onPlay={() => setCatfoodVoicePlaying(true)}
                onPause={() => setCatfoodVoicePlaying(false)}
                onEnded={() => {
                  setCatfoodVoicePlaying(false);
                  setCatfoodVoiceHeard(true);
                  try { localStorage.setItem("foundphone-catfood-voice-heard-v1", "1"); } catch {}
                }}
              />
              <button
                type="button"
                aria-label={catfoodVoicePlaying ? "暂停语音" : "播放语音"}
                onClick={() => {
                  const audio = catfoodAudioRef.current;
                  if (!audio) return;
                  if (catfoodVoicePlaying) audio.pause();
                  else audio.play().catch(() => setCatfoodVoicePlaying(false));
                }}
                style={{justifySelf:"start",background:"#fff",border:"none",borderRadius:13,padding:"12px 18px",fontSize:14,color:"#222",cursor:"pointer"}}
              >
                {catfoodVoicePlaying ? "Ⅱ" : "▶"}　)))　31″
              </button>
              {catfoodVoiceHeard && !catfoodAcknowledged && (
                <button
                  type="button"
                  onClick={acknowledgeCatfoodVoice}
                  style={{justifySelf:"start",padding:"10px 18px",border:"1px solid #d9e6d8",borderRadius:18,background:"#f3f8f1",color:"#365b38",fontSize:14,cursor:"pointer"}}
                >知道了～</button>
              )}
              {catfoodAcknowledged && (
                <div style={{width:"100%",display:"grid",gap:9,paddingTop:2}}>
                  <div style={{justifySelf:"end",maxWidth:"78%",padding:"9px 12px",borderRadius:"14px 4px 14px 14px",background:"#95ec69",color:"#24301f",fontSize:14}}>知道了～</div>
                  <div style={{justifySelf:"start",maxWidth:"82%",padding:"9px 12px",borderRadius:"4px 14px 14px 14px",background:"#fff",border:"1px solid #eee",color:"#222",fontSize:14}}>忙完跟我说一声。</div>
                </div>
              )}
            </div>
          )}
          {!p.creator && p.thread === wxTimedSender && secretEnabled && !secretSecond && (
            <div style={{padding:"12px 14px",background:"#e8e8e8",display:"grid",gap:8}}>
              <div style={{fontSize:12,color:"#666",textAlign:"center"}}>选择一句回复</div>
              {(!secretFirst ? [["playful","穆祉丞！你什么时候偷偷录的！！"],["sweet","呜呜呜宝宝……我听完了，好喜欢你"]] : [["playful","好吧，承认你这次真的有把我哄到😼"],["sweet","那你以后也要一直这么喜欢我哦🥺"]]).map(([choice,label])=><button type="button" key={choice} style={{padding:13,border:0,borderRadius:10,background:"white",textAlign:"left",color:"#222"}} onClick={()=>chooseSecret(secretFirst?2:1,choice as SecretChoice)}>{label}</button>)}
            </div>
          )}
          {!p.creator && p.thread === wxTimedSender && timedDelivered && replyReady && callProgress !== "waiting" && (
            <div style={{padding:"10px 14px",background:"#e8e8e8",display:"grid",gap:10}}>
              <audio ref={voiceAudio} preload="metadata" src="/assets/wechat/voice-call-question.m4a"
                onEnded={() => { setVoicePlaying(false); if (callProgress === "voice-ready") setProgress("voice-heard"); }}
                onPause={() => setVoicePlaying(false)} />
              <audio ref={callAudio} preload="metadata" src="/assets/wechat/voice-call-conversation.m4a"
                onEnded={() => { setCallPlaying(false); setCallAudioEnded(true); }} onPause={() => setCallPlaying(false)} />
              <audio ref={ringAudio} loop preload="auto" src="/assets/wechat/incoming-call-tone.wav" />
              {(["voice-ready","voice-heard"].includes(callProgress)) && (
                <button type="button" style={{justifySelf:"start",background:"#fff",border:"none",borderRadius:13,padding:"12px 18px",fontSize:14,color:"#222"}}
                  onClick={() => {
                    const audio = voiceAudio.current;
                    if (!audio) return;
                    if (audio.paused) audio.play().then(() => setVoicePlaying(true)).catch(() => setRingNotice("请再点一次播放语音"));
                    else audio.pause();
                  }}>
                  {voicePlaying ? "Ⅱ" : "▶"}　)))　6″ {callProgress === "voice-heard" ? "✓" : ""}
                </button>
              )}
              {callProgress === "voice-heard" && (
                <div style={{display:"grid",gap:8}}>
                  <div style={{fontSize:12,color:"#777",textAlign:"center"}}>选择一句回复</div>
                  <button type="button" style={{padding:13,border:0,borderRadius:10,background:"white",textAlign:"left"}} onClick={() => setProgress("accept")}>接呀，正好我也想你了</button>
                  <button type="button" style={{padding:13,border:0,borderRadius:10,background:"white",textAlign:"left"}} onClick={() => setProgress("decline")}>现在不太方便，等会儿好不好？</button>
                </div>
              )}
              {callProgress === "accept" && <button type="button" onClick={beginCall} style={{padding:12,background:"#07c160",border:0,borderRadius:12,color:"white"}}>📞 查看 🪵 发来的语音通话</button>}
              {(["ringing","connected"].includes(callProgress)) && (
                <div role="dialog" aria-label="微信语音通话" style={{background:"#23272c",color:"white",borderRadius:20,padding:"28px 18px",display:"grid",gap:18,textAlign:"center",justifyItems:"center"}}>
                  <img src="/assets/wechat/aaa-dog.jpeg" alt="" style={{width:70,height:70,borderRadius:15,objectFit:"cover"}} />
                  <strong>Aaa最帅的mua～</strong>
                  <span>{callProgress === "ringing" ? "微信语音通话邀请…" : `语音通话 ${callDuration}`}</span>
                  {ringNotice && <small>{ringNotice}</small>}
                  {callProgress === "connected" && <div style={{fontSize:12,color:"#ddd"}}>{callAudioEnded ? "对方说完啦，可以挂断通话" : callPlaying ? "正在通话…" : "音频已暂停"}</div>}
                  {callProgress === "connected" && !callAudioEnded && !callPlaying && <button type="button" onClick={() => callAudio.current?.play().then(() => setCallPlaying(true)).catch(() => setRingNotice("请再点一次播放"))} style={{border:0,borderRadius:10,padding:10}}>▶ 继续播放</button>}
                  <div style={{display:"flex",gap:30}}>
                    <button type="button" onClick={() => finishCall(callProgress === "ringing" ? "rejected" : "ended")} style={{background:"#e54848",border:0,borderRadius:50,color:"white",padding:16}}>📞 {callProgress === "ringing" ? "拒绝" : "挂断"}</button>
                    {callProgress === "ringing" && <button type="button" onClick={answerCall} style={{background:"#07c160",border:0,borderRadius:50,color:"white",padding:16}}>📞 接听</button>}
                  </div>
                </div>
              )}
            </div>
          )}
          {!p.creator && p.thread === wxTimedSender && timedDelivered && (
            <>
              {boyfriendTyping && !replyReady && (
                <div role="status" style={{padding:"7px 16px",fontSize:12,color:"#777",background:"#f4f4f4"}}>对方正在输入中…</div>
              )}
              {replyOpen && !replyChoice && (
                <div style={{background:"#e9e9ed",padding:"12px 12px 8px",display:"grid",gap:9}}>
                  <div style={{textAlign:"center",fontSize:12,color:"#777"}}>选择一句回复</div>
                  <button type="button" onClick={() => selectReply("busy")} style={{padding:13,borderRadius:10,background:"white",border:"1px solid #ddd",color:"#222",textAlign:"left"}}>刚刚在忙啦，才看到消息</button>
                  <button type="button" onClick={() => selectReply("miss")} style={{padding:13,borderRadius:10,background:"white",border:"1px solid #ddd",color:"#222",textAlign:"left"}}>因为我在想你呀～</button>
                  <div style={{height:32,display:"flex",justifyContent:"space-around",color:"#a4a4a8",fontSize:16}}><span>ABC</span><span>空格</span><span>↵</span></div>
                </div>
              )}
              {!replyChoice && (
                <button type="button" onClick={() => setReplyOpen((v) => !v)}
                  style={{width:"100%",background:"#f7f7f7",border:"none",borderTop:"1px solid #ddd",padding:"13px 15px",textAlign:"left",color:"#888",fontSize:14}}>
                  <span aria-hidden="true">⌨　</span>{replyOpen ? "收起回复选项" : "点击输入框回复…"}
                </button>
              )}
            </>
          )}
          {(p.creator || p.thread !== wxTimedSender || !timedDelivered) && <Compose creator={p.creator} onAdd={p.onAdd} />}
        </>
      ) : moments ? (
        <div className="wx-moments">
          <div className="wx-moment-cover">
            <Camera size={32} />
            <span>朋友圈</span>
          </div>
          {posts.map((i) => (
            <button
              key={i.id}
              className="wx-moment-post"
              onClick={() => p.onItem(i)}
            >
              <Avatar name={i.sender} />
              <div>
                <strong>{i.sender}</strong>
                <p>{i.body}</p>
                {i.media && <ItemMedia item={i} />}
                <small>{i.time}</small>
              </div>
            </button>
          ))}
          {!posts.length && <p className="skin-empty">暂无朋友圈动态</p>}
          {p.creator && (
            <button className="phone-add" onClick={p.onAdd}>
              添加朋友圈动态
            </button>
          )}
        </div>
      ) : (
        <div className="skin-scroll">
          {tab === "微信" ? (
            <>
              {searchOpen && (
                <label className="wx-search">
                  <Search size={14} />
                  <input
                    aria-label="搜索微信内容"
                    placeholder="搜索"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </label>
              )}
              {conversations
                .filter(
                  (t) =>
                    t.includes(query) ||
                    p.items.some(
                      (i) => i.title === t && i.body.includes(query),
                    ),
                )
                .map((t) => {
                  const list = boyfriendItems.filter((i) => i.title === t),
                    last = list.at(-1);
                  return (
                    <button
                      className={`wx-chat-row ${t === orderedChats[0] ? "wx-pinned-chat" : ""}`}
                      key={t}
                      onClick={() => {
                        setReadThreads((v) => (v.includes(t) ? v : [...v, t]));
                        p.onThread(t);
                        p.onRead(t);
                      }}
                    >
                      <span className="wx-chat-avatar">
                        <Avatar name={t} src={chatAvatars[t] || last?.avatar || ""} />
                        {!readThreads.includes(t) &&
                          list.some((i) => !i.read) && (
                            <b className="wx-unread">
                              {list.filter((i) => !i.read).length}
                            </b>
                          )}
                      </span>
                      <div>
                        <strong>{t}</strong>
                        {last && <p>{last.body}</p>}
                      </div>
                      {last?.time && <time>{last.time.slice(-5)}</time>}
                    </button>
                  );
                })}
              {!conversations.length && <p className="skin-empty">暂无聊天</p>}
            </>
          ) : tab === "通讯录" ? (
            <div className="wx-address-book">
              <label className="wx-search"><Search size={16} /><input aria-label="搜索联系人" placeholder="搜索" value={query} onChange={(e) => setQuery(e.target.value)} /></label>
              {[
                ["新的朋友", "#ff9b32"], ["仅聊天的朋友", "#ff9b32"],
                ["群聊", "#07c160"], ["标签", "#1686ed"],
                ["公众号", "#1686ed"], ["服务号", "#16b0ef"],
                ["企业微信联系人", "#3186cf"],
              ].filter(([name]) => name.includes(query)).map(([name,color]) => (
                <button key={name} className="wx-contact" onClick={() => setUtility(name)}>
                  <span className="wx-contact-symbol" style={{background:color}}><Users size={19} color="white" /></span>{name}
                </button>
              ))}
              {"时代峰峻".includes(query) && <><div className="wx-section-label">我的企业</div><button className="wx-contact" type="button"><img className="wx-custom-avatar" src="/assets/wechat/company.jpeg" alt="时代峰峻" />时代峰峻</button></>}
              {"Aaa最帅的mua～".includes(query) && <><div className="wx-section-label">A</div><button className="wx-contact" type="button"><img className="wx-custom-avatar" src="/assets/wechat/aaa-dog.jpeg" alt="Aaa最帅的mua～头像" />Aaa最帅的mua～</button></>}
              {contacts.filter((c) => c.includes(query) && c !== "Aaa最帅的mua～").map((c) => (
                <button key={c} className="wx-contact" onClick={() => { const item=p.items.find(i=>i.sender===c); if(item){p.onThread(item.title);p.onRead(item.title)} }}><Avatar name={c} src={chatAvatars[c] || p.items.find(i=>i.sender===c)?.avatar}/>{c}</button>
              ))}
            </div>
          ) : tab === "发现" ? (
            <div className="wx-discover-groups">
              {[
                [Camera,"朋友圈","#26a958",0], [Play,"视频号","#fa9d3b",1],
                [Video,"直播","#fa5151",0], [Search,"扫一扫","#1686ed",1],
                [Music,"听一听","#fa5151",0], [Star,"看一看","#ffb400",1],
                [Search,"搜一搜","#fa5151",0], [Users,"附近的人","#1686ed",1],
                [Grid,"游戏","#26a958",1], [Grid,"小程序","#7d69ee",1],
              ].map(([Icon,label,color,separate])=>{const Glyph=Icon as typeof Camera;return (
                <button key={String(label)} className={`wx-discovery ${separate ? "wx-discovery-separated" : ""}`} type="button">
                  <Glyph size={22} style={{color:String(color)}}/>{String(label)}<span>›</span>
                </button>
              )})}
            </div>
          ) : (
            <>
              <div className="wx-profile">
                <img className="wx-custom-avatar wx-profile-custom-avatar" src="/assets/wechat/me-cat.jpeg" alt="我的头像" />
                <div>
                  <h2>🧡💖</h2>
                  <small>微信号：Orange_9217</small>
                  <button
                    className="wx-profile-status"
                    type="button"
                  >
                    ＋ 状态
                  </button>
                </div>
              </div>
              <div className="wx-profile-menu">
                {[
                  [MessageCircle, "服务", "#07c160"],
                  [Layers, "收藏", "#e8a828"],
                  [ImageIcon, "朋友圈", "#3a9bd9"],
                  [Layers, "作品", "#329dd8"],
                  [ShoppingBag, "小店与卡包", "#ed7c59"],
                  [Smile, "表情", "#f7b900"],
                  [Settings, "设置", "#1696d2"],
                ].map(([Icon, label, color]) => {
                  const Glyph = Icon as typeof Settings;
                  return (
                    <button
                      key={String(label)}
                      className="wx-discovery"
                      type="button"
                    >
                      <Glyph size={22} style={{ color: String(color) }} />
                      {String(label)}
                      <span>›</span>
                    </button>
                  );
                })}
              </div>
              {p.items
                .filter((i) => i.folder === "我")
                .map((i) => (
                  <button
                    className="wx-discovery"
                    key={i.id}
                    onClick={() => p.onItem(i)}
                  >
                    <User size={18} />
                    {i.title}
                    <span>›</span>
                  </button>
                ))}
              {p.creator && (
                <button className="phone-add" onClick={p.onAdd}>
                  编辑个人资料内容
                </button>
              )}
            </>
          )}
        </div>
      )}
      {!p.thread && !moments && !utility && (
        <nav className="wx-bottom">
          {[
            { label: "微信", icon: MessageCircle },
            { label: "通讯录", icon: Users },
            { label: "发现", icon: Compass },
            { label: "我", icon: User },
          ].map((t) => (
            <button
              className={tab === t.label ? "selected" : ""}
              key={t.label}
              onClick={() => setTab(t.label)}
            >
              <t.icon size={21} />
              <span>{t.label}</span>
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
export function WhatsAppSkin(p: SkinProps) {
  const [tab, setTab] = useState("聊天"),
    [query, setQuery] = useState(""),
    [filter, setFilter] = useState("全部");
  const tabs = [
    { label: "动态", icon: Compass },
    { label: "通话", icon: Phone },
    { label: "社区", icon: Users },
    { label: "聊天", icon: MessageCircle },
    { label: "设置", icon: Settings },
  ];
  const conversations = [
    ...new Set(
      p.items
        .filter((i) => !["动态", "通话", "社区", "设置"].includes(i.folder))
        .filter((i) => filter !== "未读" || !i.read)
        .map((i) => i.title),
    ),
  ];
  const name = tab === "聊天" ? p.name : tab;
  return (
    <div className="whatsapp-ui independent-skin">
      <div className="app-nav wa-nav">
        <button
          aria-label="返回"
          onClick={() => (p.thread ? p.onThread("") : p.onBack())}
        >
          <ChevronLeft size={22} />
        </button>
        <strong>{p.thread || name}</strong>
        <button
          aria-label={p.creator ? "新增内容" : "搜索内容"}
          onClick={
            p.creator
              ? p.onAdd
              : () =>
                  document
                    .querySelector<HTMLInputElement>(".wa-search input")
                    ?.focus()
          }
        >
          {p.creator ? <Plus size={21} /> : <Search size={20} />}
        </button>
      </div>
      {p.thread ? (
        <>
          <div className="wa-thread-profile">
            <button aria-label="返回聊天列表" onClick={() => p.onThread("")}>
              <ChevronLeft size={23} />
            </button>
            <Avatar
              name={p.thread}
              src={p.items.find((i) => i.title === p.thread)?.avatar}
              round
            />
            <div>
              <strong>{p.thread}</strong>
              <small>联系人</small>
            </div>
            <Video size={18} />
            <Phone size={17} />
          </div>
          <MessageList
            items={p.items.filter((i) => i.title === p.thread)}
            creator={p.creator}
            onItem={p.onItem}
            onRead={p.onRead}
            whatsapp
          />
          <Compose creator={p.creator} onAdd={p.onAdd} wa />
        </>
      ) : (
        <div className="skin-scroll">
          <h1 className="wa-large-title">{tab}</h1>
          {tab === "聊天" ? (
            <>
              <label className="wa-search">
                <Search size={16} />
                <input
                  placeholder="搜索"
                  aria-label="搜索WhatsApp"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
              <div className="wa-filters">
                {["全部", "未读", "群组"].map((f) => (
                  <button
                    key={f}
                    className={filter === f ? "selected" : ""}
                    onClick={() => setFilter(f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
              {conversations
                .filter((t) => t.includes(query))
                .filter(
                  (t) =>
                    filter !== "群组" ||
                    p.items.some((i) => i.title === t && i.folder === "群组"),
                )
                .map((t) => {
                  const last = p.items.filter((i) => i.title === t).at(-1)!;
                  return (
                    <button
                      className="wa-chat-row"
                      key={t}
                      onClick={() => {
                        p.onThread(t);
                        p.onRead(t);
                      }}
                    >
                      <Avatar name={t} src={last.avatar} round />
                      <div>
                        <strong>{t}</strong>
                        <p>
                          {last.outgoing && <CheckCheck size={12} />}{" "}
                          {last.body}
                        </p>
                      </div>
                      {last?.time && <time>{last.time.slice(-5)}</time>}
                    </button>
                  );
                })}
            </>
          ) : tab === "设置" ? (
            <>
              <div className="wa-settings-profile">
                <Avatar name="我" round />
                <h2>个人资料</h2>
              </div>
              {p.items
                .filter((i) => i.folder === "设置")
                .map((i) => (
                  <button
                    key={i.id}
                    className="wa-record"
                    onClick={() => p.onItem(i)}
                  >
                    {i.title}
                    <span>›</span>
                  </button>
                ))}
            </>
          ) : (
            <>
              {tab === "动态" && (
                <div className="wa-status">
                  <Avatar name="我" round />
                  <span>我的状态</span>
                  {p.creator && (
                    <button aria-label="添加状态" onClick={p.onAdd}>
                      <Plus size={17} />
                    </button>
                  )}
                </div>
              )}
              {p.items
                .filter(
                  (i) =>
                    i.folder === tab || (tab === "通话" && i.kind === "call"),
                )
                .map((i) => (
                  <button
                    className="wa-record"
                    key={i.id}
                    onClick={() => p.onItem(i)}
                  >
                    <Avatar name={i.sender} src={i.avatar} round />
                    <div>
                      <strong>{i.title}</strong>
                      <p>{i.body}</p>
                    </div>
                    <span>
                      {tab === "通话" ? (
                        <Phone size={17} />
                      ) : (
                        <ChevronLeft size={15} />
                      )}
                    </span>
                  </button>
                ))}
              {!p.items.some((i) => i.folder === tab) && (
                <p className="skin-empty">暂无{tab}内容</p>
              )}
            </>
          )}
          {p.creator && (
            <button className="phone-add" onClick={p.onAdd}>
              添加{tab === "聊天" ? "聊天" : tab}内容
            </button>
          )}
        </div>
      )}
      {!p.thread && (
        <nav className="wa-bottom">
          {tabs.map((t) => (
            <button
              className={tab === t.label ? "selected" : ""}
              key={t.label}
              onClick={() => setTab(t.label)}
            >
              <t.icon size={20} />
              <span>{t.label}</span>
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
export function InstagramSkin(p: SkinProps) {
  const [tab, setTab] = useState("首页"),
    [dm, setDm] = useState(false),
    [query, setQuery] = useState(""),
    [likes, setLikes] = useSkinState<string[]>(p, "likes", []),
    [saved, setSaved] = useSkinState<string[]>(p, "saved", []),
    [showSaved, setShowSaved] = useState(false);
  const posts = p.items.filter(
      (i) =>
        i.kind === "post" ||
        !["私信", "Story", "Reels", "个人主页"].includes(i.folder),
    ),
    stories = p.items.filter((i) => i.folder === "Story"),
    reels = p.items.filter((i) => i.kind === "video" || i.folder === "Reels"),
    messages = p.items.filter((i) => i.folder === "私信");
  const tabs = [
    { label: "首页", icon: Home },
    { label: "搜索", icon: Search },
    { label: "Reels", icon: Play },
    { label: "个人主页", icon: User },
  ];
  const shown = (
    showSaved ? posts.filter((i) => saved.includes(i.id)) : posts
  ).filter((i) => (i.title + i.body + i.sender).includes(query));
  return (
    <div className="instagram-ui independent-skin">
      <div className="app-nav ig-nav">
        <button
          aria-label="返回"
          onClick={() => (dm ? setDm(false) : p.onBack())}
        >
          <ChevronLeft size={22} />
        </button>
        <strong>{dm ? "私信" : p.name}</strong>
        <div>
          {p.creator && (
            <button aria-label="新增内容" onClick={p.onAdd}>
              <Plus size={21} />
            </button>
          )}
          <button aria-label="Instagram 私信" onClick={() => setDm(!dm)}>
            <Send size={20} />
          </button>
        </div>
      </div>
      <div className="skin-scroll ig-scroll">
        {dm ? (
          <>
            {messages.map((i) => (
              <button
                key={i.id}
                className="ig-dm-row"
                onClick={() => p.onItem(i)}
              >
                <Avatar name={i.sender} round />
                <div>
                  <strong>{i.sender}</strong>
                  <p>{i.body}</p>
                </div>
              </button>
            ))}
            {!messages.length && <p className="skin-empty">暂无私信</p>}
            {p.creator && (
              <button className="phone-add" onClick={p.onAdd}>
                添加私信
              </button>
            )}
          </>
        ) : tab === "首页" ? (
          <>
            <div className="ig-stories">
              <button
                className="ig-story"
                onClick={
                  p.creator
                    ? p.onAdd
                    : () => {
                        if (stories[0]) p.onItem(stories[0]);
                      }
                }
                disabled={!p.creator && !stories.length}
              >
                <span>
                  <Avatar name="我" round />
                </span>
                <small>你的快拍</small>
              </button>
              {stories.map((i) => (
                <button
                  key={i.id}
                  className="ig-story"
                  onClick={() => p.onItem(i)}
                >
                  <span>
                    <Avatar name={i.sender} round />
                  </span>
                  <small>{i.sender}</small>
                </button>
              ))}
            </div>
            {posts.map((i) => (
              <article className="ig-post" key={i.id}>
                <div className="ig-post-author">
                  <Avatar name={i.sender} round />
                  <strong>{i.sender}</strong>
                  <button
                    aria-label={`帖子详情${i.title}`}
                    onClick={() => p.onItem(i)}
                  >
                    <MoreHorizontal size={19} />
                  </button>
                </div>
                <button className="ig-post-media" onClick={() => p.onItem(i)}>
                  <ItemMedia item={i} />
                </button>
                <div className="ig-post-controls">
                  <button
                    aria-label={`喜欢${i.title}`}
                    onClick={() =>
                      setLikes(
                        likes.includes(i.id)
                          ? likes.filter((x) => x !== i.id)
                          : [...likes, i.id],
                      )
                    }
                  >
                    <Heart
                      size={23}
                      fill={likes.includes(i.id) ? "#ed4956" : "none"}
                      color={likes.includes(i.id) ? "#ed4956" : "currentColor"}
                    />
                  </button>
                  <button
                    aria-label={`评论${i.title}`}
                    onClick={() => p.onItem(i)}
                  >
                    <MessageCircle size={22} />
                  </button>
                  <button
                    aria-label={`查看${i.title}`}
                    onClick={() => p.onItem(i)}
                  >
                    <Send size={21} />
                  </button>
                  <button
                    aria-label={`收藏${i.title}`}
                    onClick={() =>
                      setSaved(
                        saved.includes(i.id)
                          ? saved.filter((x) => x !== i.id)
                          : [...saved, i.id],
                      )
                    }
                  >
                    <Bookmark
                      size={22}
                      fill={saved.includes(i.id) ? "currentColor" : "none"}
                    />
                  </button>
                </div>
                <div className="ig-post-caption">
                  <strong>
                    {i.likes + (likes.includes(i.id) ? 1 : 0)} 次赞
                  </strong>
                  <p>
                    <b>{i.sender}</b> {i.body}
                  </p>
                  <button onClick={() => p.onItem(i)}>
                    查看全部 {i.comments.length} 条评论
                  </button>
                  <time>{i.time}</time>
                </div>
              </article>
            ))}
          </>
        ) : tab === "搜索" ? (
          <>
            <label className="ig-search">
              <Search size={15} />
              <input
                value={query}
                aria-label="搜索Instagram"
                placeholder="搜索"
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <div className="ig-explore">
              {shown.map((i) => (
                <button key={i.id} onClick={() => p.onItem(i)}>
                  <ItemMedia item={i} />
                </button>
              ))}
            </div>
          </>
        ) : tab === "Reels" ? (
          <>
            {reels.map((i) => (
              <div className="ig-reel" key={i.id}>
                <ItemMedia item={i} />
                <button onClick={() => p.onItem(i)}>
                  {i.sender} · {i.title}
                </button>
              </div>
            ))}
            {!reels.length && <p className="skin-empty">暂无 Reels</p>}
          </>
        ) : (
          <>
            <div className="ig-profile">
              <Avatar name={posts[0]?.sender ?? "我"} round />
              <div>
                <strong>{posts.length}</strong>
                <small>帖子</small>
              </div>
              <div>
                <strong>0</strong>
                <small>关注者</small>
              </div>
              <div>
                <strong>0</strong>
                <small>正在关注</small>
              </div>
            </div>
            <h3 className="ig-profile-name">{posts[0]?.sender ?? "我"}</h3>
            <div className="ig-profile-tabs">
              <button aria-label="帖子网格" onClick={() => setShowSaved(false)}>
                <Grid size={21} />
              </button>
              <button
                aria-label="已收藏帖子"
                onClick={() => setShowSaved(true)}
              >
                <Bookmark size={21} />
              </button>
              <button
                aria-label="资料内容"
                onClick={() => {
                  const i = p.items.find((i) => i.folder === "个人主页");
                  if (i) p.onItem(i);
                  else if (p.creator) p.onAdd();
                }}
              >
                <AtSign size={21} />
              </button>
            </div>
            <div className="ig-explore">
              {shown.map((i) => (
                <button key={i.id} onClick={() => p.onItem(i)}>
                  <ItemMedia item={i} />
                </button>
              ))}
            </div>
          </>
        )}
      </div>
      <nav className="ig-bottom">
        {tabs.map((t) => (
          <button
            key={t.label}
            className={tab === t.label ? "selected" : ""}
            aria-label={`Instagram ${t.label}`}
            onClick={() => {
              setTab(t.label);
              setDm(false);
            }}
          >
            <t.icon size={23} />
          </button>
        ))}
      </nav>
    </div>
  );
}
