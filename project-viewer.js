export function createProjectViewer(React,jsx){
 const {jsx:el,jsxs:els}=jsx;
 return function ProjectViewer({item,onClose}){
  const dialog=React.useRef(null),view=React.useRef(null),pagesRef=React.useRef([]),drag=React.useRef(null);
  const [page,setPage]=React.useState(0),[zoom,setZoom]=React.useState(1),[zoomOpen,setZoomOpen]=React.useState(false);
  const pages=item?(item.pages||[{src:item.cover,label:'封面'},...item.images]):[];
  React.useEffect(()=>{
   if(!item)return;
   setPage(0);setZoom(1);setZoomOpen(false);
   const previous=document.activeElement,old=document.body.style.overflow;
   document.body.style.overflow='hidden';dialog.current.showModal();view.current.scrollTo(0,0);
   return()=>{document.body.style.overflow=old;previous?.focus({preventScroll:true})};
  },[item]);
  React.useEffect(()=>{
   if(!item)return;const node=view.current;
   const wheel=event=>{if(event.ctrlKey){event.preventDefault();changeZoom(zoom+(event.deltaY<0?.15:-.15))}};
   node.addEventListener("wheel",wheel,{passive:false});return()=>node.removeEventListener("wheel",wheel);
  },[item,zoom]);
  function go(delta){
   const next=Math.max(0,Math.min(pages.length-1,page+delta)),node=pagesRef.current[next];
   if(node){view.current.scrollTo({top:node.offsetTop-12,behavior:'smooth'});setPage(next)}
  }
  function changeZoom(value){
   const next=Math.max(.5,Math.min(3,Number(value))),node=view.current;
   const x=(node.scrollLeft+node.clientWidth/2)/zoom,y=(node.scrollTop+node.clientHeight/2)/zoom;
   setZoom(next);requestAnimationFrame(()=>{node.scrollLeft=x*next-node.clientWidth/2;node.scrollTop=y*next-node.clientHeight/2});
  }
  function track(){
   const node=view.current;let index=0;
   pagesRef.current.forEach((p,i)=>{if(p&&p.offsetTop<=node.scrollTop+node.clientHeight*.45)index=i});
   if(node.scrollTop+node.clientHeight>=node.scrollHeight-2)index=pages.length-1;
   setPage(index);
  }
  const icon=(kind)=>el('svg',{viewBox:'0 0 24 24',width:22,height:22,fill:'none',stroke:'currentColor',strokeWidth:1.7,'aria-hidden':true,children:kind==='zoom'?els('g',{children:[el('circle',{cx:10,cy:10,r:6}),el('path',{d:'m15 15 6 6M7 10h6M10 7v6'})]}):el('path',{d:kind==='up'?'m6 14 6-6 6 6':'m6 10 6 6 6-6'})});
  if(!item)return null;
  return els('dialog',{ref:dialog,className:'project-reader',onCancel:event=>{event.preventDefault();onClose()},onClick:event=>{if(event.target===dialog.current)onClose()},onKeyDown:event=>{
   if(event.target.tagName==='INPUT')return;
   if(event.key==='ArrowDown'||event.key==='PageDown'){event.preventDefault();go(1)}
   if(event.key==='ArrowUp'||event.key==='PageUp'){event.preventDefault();go(-1)}
  },'aria-labelledby':'project-reader-title',children:[
   els('header',{className:'project-reader-header',children:[
    els('div',{children:[el('h3',{id:'project-reader-title',children:item.title}),el('span',{children:item.titleCn})]}),
    item.videoUrl&&el('a',{className:'project-reader-video',href:item.videoUrl,target:'_blank',rel:'noopener noreferrer',children:'观看视频 ↗'}),
    el('span',{className:'project-reader-count','aria-live':'polite',children:`${page+1} / ${pages.length}`}),
    el('button',{className:'project-reader-close',onClick:onClose,'aria-label':'关闭项目',children:'×'})
   ]}),
   els('div',{className:'project-reader-body',children:[
    el('div',{ref:view,className:'project-reader-viewport',tabIndex:0,'aria-label':'项目页面，可滚动、拖拽，Ctrl 加滚轮缩放',onScroll:track,
     onPointerDown:event=>{if(event.button!==0)return;const node=view.current;drag.current={x:event.clientX,y:event.clientY,left:node.scrollLeft,top:node.scrollTop};node.setPointerCapture(event.pointerId);node.classList.add('is-dragging')},
     onPointerMove:event=>{if(!drag.current)return;const d=drag.current;view.current.scrollLeft=d.left-event.clientX+d.x;view.current.scrollTop=d.top-event.clientY+d.y},
     onPointerUp:()=>{drag.current=null;view.current?.classList.remove('is-dragging')},
     onPointerCancel:()=>{drag.current=null;view.current?.classList.remove('is-dragging')},
     children:el('div',{className:'project-reader-pages',style:{width:`${zoom*100}%`},children:pages.map((p,i)=>el('figure',{ref:node=>{pagesRef.current[i]=node},className:'project-reader-page',children:el('img',{src:p.src,alt:`${item.titleCn} · ${p.label||'第 '+(i+1)+' 页'}`,draggable:false,loading:i<2?'eager':'lazy',width:p.width,height:p.height})},p.src))})
    }),
    els('aside',{className:'project-reader-controls','aria-label':'阅读控制',children:[
     el('button',{onClick:()=>go(-1),disabled:page===0,'aria-label':'上一页',title:'上一页',children:icon('up')}),
     el('button',{onClick:()=>go(1),disabled:page===pages.length-1,'aria-label':'下一页',title:'下一页',children:icon('down')}),
     el('button',{onClick:()=>changeZoom(zoom-.2),disabled:zoom<=.5,'aria-label':'缩小',title:'缩小',children:'−'}),
     el('button',{onClick:()=>setZoomOpen(!zoomOpen),'aria-label':'缩放','aria-expanded':zoomOpen,title:'缩放',children:icon('zoom')}),
     zoomOpen&&els('div',{className:'project-reader-zoom',children:[
      el('label',{htmlFor:'project-zoom',children:`缩放 ${Math.round(zoom*100)}%`}),
      el('input',{id:'project-zoom',type:'range',min:.5,max:3,step:.1,value:zoom,onChange:event=>changeZoom(event.target.value)}),
      el('button',{onClick:()=>changeZoom(1),children:'适合窗口'})
     ]})
    ]})
   ]}),
   el('div',{className:'project-reader-hint',children:'滚动浏览 · 拖拽移动 · Ctrl + 滚轮缩放'})
  ]});
 };
}
