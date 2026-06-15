import{useState,useMemo,useEffect}from'react'
  interface Note{id:string;title:string;body:string;tags:string[];pin:boolean;ts:number;color:string}
  const uid=()=>Math.random().toString(36).slice(2,8)
  const COLORS=["#0f172a","#1a1035","#0c1a10","#1a0c10","#0c1418"]
  const INIT:Note[]=[
    {id:uid(),title:"Welcome to Notes",body:"# Welcome!\n\nThis is your **personal note-taking app**.\n\n- Markdown is supported\n- Notes are saved to localStorage\n- Pin important notes\n\nClick **New Note** to start writing.",tags:["getting-started"],pin:true,ts:Date.now()-1000,color:"#0f172a"},
    {id:uid(),title:"TypeScript Tips",body:"## Key TypeScript Patterns\n\n1. Use unknown instead of any\n2. Enable strict mode always\n3. Prefer interface for object shapes\n4. Use generics for reusable utilities\n5. Discriminated unions for state",tags:["typescript","dev"],pin:false,ts:Date.now()-60000,color:"#1a1035"},
    {id:uid(),title:"Project Ideas",body:"## Future Projects\n\n- [ ] Real-time collaboration tool\n- [ ] AI code review app\n- [x] Portfolio website\n- [x] AlgoVis\n- [x] Task Manager",tags:["ideas"],pin:false,ts:Date.now()-3600000,color:"#0c1418"},
  ]
  const KEY="notes-v1"
  function md(s:string){
    return s.replace(/^###\s+(.+)/gm,"<h3 style='color:#38bdf8;margin:.6rem 0 .2rem'>$1</h3>")
      .replace(/^##\s+(.+)/gm,"<h2 style='color:#38bdf8;margin:.8rem 0 .3rem'>$1</h2>")
      .replace(/^#\s+(.+)/gm,"<h1 style='color:#f1f5f9;margin:0 0 .6rem'>$1</h1>")
      .replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>")
      .replace(/\*(.+?)\*/g,"<em>$1</em>")
      .replace(/`(.+?)`/g,"<code style='background:#0f172a;padding:.1rem .35rem;border-radius:3px;color:#86efac;font-family:monospace'>$1</code>")
      .replace(/^- \[x\] (.+)/gm,"<div>✅ <s style='color:#64748b'>$1</s></div>")
      .replace(/^- \[ \] (.+)/gm,"<div>⬜ $1</div>")
      .replace(/^- (.+)/gm,"<div style='padding-left:.75rem'>• $1</div>")
      .replace(/^\d+\.\s+(.+)/gm,"<div style='padding-left:.75rem'>$&</div>")
      .replace(/\n/g,"<br/>")
  }
  function ago(ts:number){const d=Date.now()-ts;if(d<60000)return"just now";if(d<3600000)return Math.floor(d/60000)+"m ago";if(d<86400000)return Math.floor(d/3600000)+"h ago";return new Date(ts).toLocaleDateString()}
  export default function App(){
    const[notes,setNotes]=useState<Note[]>(()=>{try{return JSON.parse(localStorage.getItem(KEY)||"null")||INIT}catch{return INIT}})
    const[sel,setSel]=useState<string|null>(notes[0]?.id||null)
    const[q,setQ]=useState("")
    const[preview,setPreview]=useState(false)
    const[tagQ,setTagQ]=useState("")
    const[newTag,setNewTag]=useState("")
    useEffect(()=>localStorage.setItem(KEY,JSON.stringify(notes)),[notes])
    const list=useMemo(()=>[...notes].filter(n=>(!q||(n.title+n.body).toLowerCase().includes(q.toLowerCase()))&&(!tagQ||n.tags.includes(tagQ))).sort((a,b)=>(+b.pin- +a.pin)||b.ts-a.ts),[notes,q,tagQ])
    const note=notes.find(n=>n.id===sel)||null
    const tags=[...new Set(notes.flatMap(n=>n.tags))]
    const upd=(id:string,patch:Partial<Note>)=>setNotes(ns=>ns.map(n=>n.id===id?{...n,...patch,ts:Date.now()}:n))
    const add=()=>{const n:Note={id:uid(),title:"Untitled",body:"",tags:[],pin:false,ts:Date.now(),color:"#0f172a"};setNotes(ns=>[n,...ns]);setSel(n.id);setPreview(false)}
    const del=(id:string)=>{setNotes(ns=>ns.filter(n=>n.id!==id));setSel(list.find(n=>n.id!==id)?.id||null)}
    const addTag=(tag:string)=>{if(!tag.trim()||!note)return;upd(note.id,{tags:[...new Set([...note.tags,tag.trim()])]});setNewTag("")}
    return(
      <div style={{display:"flex",height:"100vh",background:"#0f172a",fontFamily:"Inter,system-ui,sans-serif",color:"#e2e8f0"}}>
        <div style={{width:256,borderRight:"1px solid #1e293b",display:"flex",flexDirection:"column",background:"#111827",flexShrink:0}}>
          <div style={{padding:"1rem",borderBottom:"1px solid #1e293b"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.75rem"}}>
              <span style={{fontWeight:700,color:"#f8fafc"}}>📝 Notes</span>
              <button onClick={add} style={{padding:"0.28rem 0.7rem",background:"#0ea5e9",color:"#fff",border:"none",borderRadius:6,cursor:"pointer",fontWeight:700,fontSize:"0.8rem"}}>+ New</button>
            </div>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search notes..." style={{width:"100%",background:"#0f172a",border:"1px solid #334155",borderRadius:6,padding:"0.4rem 0.7rem",color:"#e2e8f0",outline:"none",fontSize:"0.8rem"}}/>
          </div>
          {tags.length>0&&<div style={{padding:"0.5rem",borderBottom:"1px solid #1e293b",display:"flex",gap:"0.3rem",flexWrap:"wrap"}}>
            <button onClick={()=>setTagQ("")} style={{padding:"0.15rem 0.55rem",background:!tagQ?"#1e40af":"transparent",color:!tagQ?"#93c5fd":"#475569",border:"1px solid "+(!tagQ?"#1e40af":"#1e293b"),borderRadius:10,cursor:"pointer",fontSize:"0.7rem"}}>All</button>
            {tags.map(t=><button key={t} onClick={()=>setTagQ(tagQ===t?"":t)} style={{padding:"0.15rem 0.55rem",background:tagQ===t?"#1e40af":"transparent",color:tagQ===t?"#93c5fd":"#475569",border:"1px solid "+(tagQ===t?"#1e40af":"#1e293b"),borderRadius:10,cursor:"pointer",fontSize:"0.7rem"}}>{t}</button>)}
          </div>}
          <div style={{flex:1,overflowY:"auto"}}>
            {list.map(n=>(
              <div key={n.id} onClick={()=>setSel(n.id)} style={{padding:"0.7rem 1rem",cursor:"pointer",background:sel===n.id?"#1e293b":n.color,borderLeft:"3px solid "+(sel===n.id?"#38bdf8":n.pin?"#f59e0b":"transparent")}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:"0.15rem"}}>
                  <span style={{fontWeight:600,fontSize:"0.85rem",color:"#f1f5f9",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>{n.title}</span>
                  {n.pin&&<span style={{fontSize:"0.7rem"}}>📌</span>}
                </div>
                <div style={{color:"#475569",fontSize:"0.73rem",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{n.body.replace(/[#*`]/g,"").slice(0,48)||"Empty"}</div>
                <div style={{color:"#334155",fontSize:"0.68rem",marginTop:"0.2rem"}}>{ago(n.ts)}</div>
              </div>
            ))}
            {!list.length&&<div style={{padding:"2rem",textAlign:"center",color:"#475569",fontSize:"0.85rem"}}>No notes</div>}
          </div>
        </div>
        {note?(
          <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
            <div style={{padding:"0.6rem 1rem",borderBottom:"1px solid #1e293b",display:"flex",gap:"0.5rem",alignItems:"center",background:"#111827",flexWrap:"wrap"}}>
              <input value={note.title} onChange={e=>upd(note.id,{title:e.target.value})} style={{flex:1,background:"transparent",border:"none",outline:"none",color:"#f8fafc",fontWeight:700,fontSize:"1rem",minWidth:0}}/>
              <button onClick={()=>upd(note.id,{pin:!note.pin})} style={{background:note.pin?"#78350f":"#1e293b",border:"none",borderRadius:6,padding:"0.28rem 0.6rem",cursor:"pointer",fontSize:"0.85rem"}}>{note.pin?"📌":"📍"}</button>
              <button onClick={()=>setPreview(p=>!p)} style={{padding:"0.28rem 0.7rem",background:preview?"#1e40af":"#1e293b",color:preview?"#93c5fd":"#94a3b8",border:"none",borderRadius:6,cursor:"pointer",fontSize:"0.8rem"}}>{preview?"Edit":"Preview"}</button>
              {COLORS.map((c,i)=><button key={c} onClick={()=>upd(note.id,{color:c})} style={{width:16,height:16,background:c,border:"2px solid "+(note.color===c?"#38bdf8":"#334155"),borderRadius:3,cursor:"pointer"}}/>)}
              <button onClick={()=>del(note.id)} style={{background:"none",border:"none",color:"#475569",cursor:"pointer",fontSize:"1rem"}}>🗑</button>
            </div>
            {preview
              ?<div style={{flex:1,padding:"1.5rem 2rem",overflowY:"auto",lineHeight:1.8,fontSize:"0.92rem"}} dangerouslySetInnerHTML={{__html:md(note.body)}}/>
              :<textarea value={note.body} onChange={e=>upd(note.id,{body:e.target.value})} placeholder="Start writing... (Markdown supported)" style={{flex:1,background:"transparent",border:"none",outline:"none",padding:"1.5rem 2rem",color:"#e2e8f0",fontFamily:"JetBrains Mono,monospace",fontSize:"0.875rem",resize:"none",lineHeight:1.8}}/>
            }
            <div style={{padding:"0.5rem 1rem",borderTop:"1px solid #1e293b",background:"#111827",display:"flex",gap:"0.4rem",alignItems:"center",flexWrap:"wrap"}}>
              {note.tags.map(t=><span key={t} onClick={()=>upd(note.id,{tags:note.tags.filter(x=>x!==t)})} style={{padding:"0.15rem 0.55rem",background:"#1e293b",border:"1px solid #334155",borderRadius:10,fontSize:"0.73rem",color:"#94a3b8",cursor:"pointer"}}>{t} ×</span>)}
              <form onSubmit={e=>{e.preventDefault();addTag(newTag)}} style={{display:"flex",gap:"0.3rem"}}>
                <input value={newTag} onChange={e=>setNewTag(e.target.value)} placeholder="+ tag" style={{background:"transparent",border:"1px solid #334155",borderRadius:10,padding:"0.15rem 0.5rem",color:"#94a3b8",outline:"none",fontSize:"0.72rem",width:72}}/>
              </form>
              <span style={{marginLeft:"auto",color:"#334155",fontSize:"0.72rem"}}>{note.body.split(/\s+/).filter(Boolean).length} words</span>
            </div>
          </div>
        ):(
          <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:"1rem",color:"#475569"}}>
            <div style={{fontSize:"3rem"}}>📝</div>
            <p>Select a note or create one</p>
            <button onClick={add} style={{padding:"0.6rem 1.5rem",background:"#0ea5e9",color:"#fff",border:"none",borderRadius:8,cursor:"pointer",fontWeight:700}}>Create Note</button>
          </div>
        )}
      </div>
    )
  }