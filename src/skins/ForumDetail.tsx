import { ChevronLeft, ThumbsUp } from "lucide-react";
import type { Item } from "../schema";
import "./forum-detail.css";

/** Forum-only detail: replies are separate floors, not part of the post body. */
export function ForumDetail({ item, back }: { item: Item; back: () => void }) {
  return (
    <div className="momo-forum-detail">
      <header className="momo-forum-nav">
        <button aria-label="返回论坛" onClick={back}><ChevronLeft size={22} /></button>
        <strong>{item.title}</strong>
        <span />
      </header>
      <div className="momo-forum-scroll">
        <article className="momo-forum-original">
          <div className="momo-forum-author"><div className="momo-forum-avatar" aria-hidden="true" /><div><strong>{item.sender || "匿名用户"}</strong><small>{item.time}</small></div></div>
          <h2>{item.title}</h2>
          <div className="momo-forum-body">{item.body}</div>
          <div className="momo-forum-like"><ThumbsUp size={16} /> {item.likes || 0}</div>
        </article>
        <section className="momo-forum-replies" aria-label="回帖区">
          {item.comments.map((raw, index) => {
            const colon = raw.indexOf("：");
            const author = colon >= 0 ? raw.slice(0, colon) : "匿名用户";
            const message = colon >= 0 ? raw.slice(colon + 1) : raw;
            const isOwner = author.includes("momo") || author.includes("楼主");
            const update = isOwner && message.startsWith("楼主");
            return <article className="momo-forum-floor" key={index}>
              <div className="momo-forum-floor-meta"><span>{index + 1}楼</span>{isOwner && <span className="momo-forum-owner-tag">楼主</span>}<span className="momo-forum-floor-author">{author.replace("（楼主）", "")}</span></div>
              <div className={update ? "momo-forum-floor-text momo-forum-update" : "momo-forum-floor-text"}>{message}</div>
              <div className="momo-forum-like"><ThumbsUp size={15} /></div>
            </article>;
          })}
        </section>
      </div>
    </div>
  );
}
