import { useEffect, useRef, useState } from "react";
import { ChevronLeft, Mic, Pause, Play, Search } from "lucide-react";
import "./voice-memos.css";
const KEY = "foundphone-secret-recording-heard-v1";
const recordings = [
  ["课堂录音 10.25", "10月25日 14:26", "12:38"],
  ["突然想到的选题", "10月23日 22:41", "00:46"],
  ["新录音 16", "10月21日 17:05", "00:12"],
  ["被你发现啦😼（记得点开听！！！）", "10月17日 23:48", "01:44"],
  ["推送文案思路", "10月15日 19:32", "01:17"],
  ["新录音 11", "10月12日 21:06", "00:39"],
  ["新录音 09", "10月08日 16:20", "00:24"],
  ["明天要做的事", "10月05日 00:13", "00:31"],
] as const;
export function VoiceMemos({ onBack }: {onBack:()=>void}) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(104);
  const audio = useRef<HTMLAudioElement>(null);
  useEffect(() => () => {audio.current?.pause();}, []);
  const fmt = (n:number) => `${Math.floor(n/60).toString().padStart(2,"0")}:${Math.floor(n%60).toString().padStart(2,"0")}`;
  return <div className="vm-app">
    <audio ref={audio} preload="metadata" src="/assets/voice-memos/secret-recording.m4a" onLoadedMetadata={e=>setDuration(e.currentTarget.duration||104)} onTimeUpdate={e=>setPosition(e.currentTarget.currentTime)} onPause={()=>setPlaying(false)} onPlay={()=>setPlaying(true)} onEnded={()=>{setPlaying(false);setPosition(duration);try{localStorage.setItem(KEY,"1")}catch{}window.dispatchEvent(new Event("foundphone:secret-recording-heard"));}} />
    {!selected ? <><header><h1>所有录音</h1><label><Search size={17}/><input placeholder="搜索" value={query} onChange={e=>setQuery(e.target.value)} /></label></header>
      <div className="vm-list">{recordings.filter(r=>r[0].includes(query)).map((r,i)=><button key={r[0]} className="vm-record" type="button" onClick={()=>{if(r[0]===recordings[3][0])setSelected(true)}}><strong>{r[0]}</strong><span>{r[1]} <small>{r[2]}</small></span></button>)}</div>
      <footer><span>所有录音</span><div className="vm-rec-button"><Mic size={23}/></div></footer></>
    : <><button type="button" className="vm-back" onClick={()=>{audio.current?.pause();setSelected(false)}}><ChevronLeft size={20}/> 所有录音</button>
      <div className="vm-player"><h2>{recordings[3][0]}</h2><p>10月17日 23:48</p><div className="vm-wave">{Array.from({length:48},(_,i)=><span key={i} style={{height:`${10+(i*17+i*i*7)%52}px`,opacity:i/48<=position/duration?1:.45}} />)}</div>
      <input aria-label="录音播放进度" type="range" min="0" max={duration} step="0.1" value={position} onChange={e=>{if(audio.current){audio.current.currentTime=Number(e.target.value);setPosition(Number(e.target.value))}}}/><div className="vm-times"><span>{fmt(position)}</span><span>-{fmt(Math.max(0,duration-position))}</span></div>
      <button type="button" className="vm-play" aria-label={playing?"暂停":"播放"} onClick={()=>{if(!audio.current)return;if(playing)audio.current.pause();else audio.current.play().catch(()=>setPlaying(false));}}>{playing?<Pause fill="currentColor" size={32}/>:<Play fill="currentColor" size={32}/>}</button></div></>}
  </div>;
}
