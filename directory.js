export function createDirectory(React, jsx, cards, motion) {
  const {jsx:el,jsxs:els}=jsx;
  function DirectoryCard({...props}){
    function moveGlow(event){
      if(event.pointerType==='touch')return;
      const node=event.currentTarget,rect=node.getBoundingClientRect();
      node.style.setProperty('--glow-x',`${Math.max(0,Math.min(100,(event.clientX-rect.left)/rect.width*100))}%`);
      node.style.setProperty('--glow-y',`${Math.max(0,Math.min(100,(event.clientY-rect.top)/rect.height*100))}%`);
    }
    return els('button',{...props,onPointerMove:moveGlow});
  }
  return function Directory(){
    const [selected,setSelected]=React.useState(null);
    const [active,setActive]=React.useState(0);
    const [entered,setEntered]=React.useState(false);
    const activeRef=React.useRef(0);
    const visibleCards=cards.filter(card=>['about','ip','illustration','media'].includes(card.target));
    const descriptions={
      about:{en:'Curiosity drives the way I see and create.',cn:'从观察与实践出发，形成自己的设计语言。'},
      ip:{en:'Ideas take shape through making and discovery.',cn:'让品牌、IP 与产品概念逐步走向成形。'},
      illustration:{en:'A collection of independent visual works and experiments.',cn:'独立创作与视觉实验，按类型持续收录。'},
      media:{en:'Motion brings new dimensions to visual ideas.',cn:'用影像、节奏与生成技术延展视觉表达。'}
    };

    React.useEffect(()=>{
      const section=document.getElementById('work');
      if(!section)return;
      const observer=new IntersectionObserver(entries=>{
        if(entries.some(entry=>entry.isIntersecting&&entry.intersectionRatio>=.18))setEntered(true);
      },{threshold:[0,.18,1]});
      observer.observe(section);
      return()=>observer.disconnect();
    },[]);

    React.useEffect(()=>{
      const section=document.getElementById('work');
      if(!section)return;
      section.dataset.chapter='0';
      section.dataset.chapterChangedAt=String(performance.now());
      let lastSwitch=0,accumulated=0,overviewHold=0;
      const overviewIndex=visibleCards.length;
      const inDirectory=()=>Math.abs(section.getBoundingClientRect().top)<=90;
      const advance=direction=>{
        const next=Math.max(0,Math.min(overviewIndex,activeRef.current+direction));
        if(next===activeRef.current)return false;
        if(Math.abs(section.getBoundingClientRect().top)>2)scrollTo({top:section.offsetTop,behavior:'instant'});
        activeRef.current=next;
        overviewHold=next===overviewIndex?1:0;
        section.classList.remove('is-overview-ready');
        section.dataset.chapter=String(next);
        section.dataset.overviewHold=String(overviewHold);
        section.dataset.chapterChangedAt=String(performance.now());
        setActive(next);
        lastSwitch=performance.now();
        accumulated=0;
        return true;
      };
      const step=direction=>{
        if(direction<0&&activeRef.current===0){
          section.dispatchEvent(new Event('directory:go-home'));
          return true;
        }
        if(direction>0&&activeRef.current===overviewIndex){
          scrollTo({top:section.offsetTop+section.offsetHeight,behavior:'smooth'});
          return true;
        }
        return advance(direction);
      };
      const wheel=event=>{
        if(!inDirectory()||document.querySelector('dialog[open]'))return;
        const direction=Math.sign(event.deltaY);
        if(!direction||direction>0&&activeRef.current===overviewIndex||direction<0&&activeRef.current===0)return;
        event.preventDefault();
        if(performance.now()-lastSwitch<420)return;
        accumulated+=event.deltaY;
        if(Math.abs(accumulated)<45)return;
        if(direction<0&&activeRef.current===overviewIndex&&overviewHold){
          overviewHold=0;
          section.dataset.overviewHold='0';
          section.classList.add('is-overview-ready');
          lastSwitch=performance.now();
          accumulated=0;
          return;
        }
        advance(Math.sign(accumulated));
      };
      const key=event=>{
        if(!inDirectory()||document.querySelector('dialog[open]'))return;
        const direction=['ArrowDown','PageDown'].includes(event.key)?1:['ArrowUp','PageUp'].includes(event.key)?-1:0;
        if(direction&&step(direction))event.preventDefault();
      };
      const enterFromBelow=()=>{
        activeRef.current=overviewIndex;
        overviewHold=1;
        section.classList.remove('is-overview-ready');
        section.dataset.chapter=String(overviewIndex);
        section.dataset.overviewHold='1';
        section.dataset.chapterChangedAt=String(performance.now());
        setActive(overviewIndex);
        accumulated=0;
        lastSwitch=performance.now();
      };
      const enterFromAbove=()=>{
        activeRef.current=0;
        overviewHold=0;
        section.classList.remove('is-overview-ready');
        section.dataset.chapter='0';
        section.dataset.overviewHold='0';
        section.dataset.chapterChangedAt=String(performance.now());
        setActive(0);
        accumulated=0;
        lastSwitch=performance.now();
      };
      addEventListener('wheel',wheel,{passive:false,capture:true});
      addEventListener('keydown',key);
      section.addEventListener('directory:enter-from-below',enterFromBelow);
      section.addEventListener('directory:enter-from-above',enterFromAbove);
      const stepEvent=event=>step(event.detail);
      section.addEventListener('directory:step',stepEvent);
      return()=>{removeEventListener('wheel',wheel,true);removeEventListener('keydown',key);section.removeEventListener('directory:enter-from-below',enterFromBelow);section.removeEventListener('directory:enter-from-above',enterFromAbove);section.removeEventListener('directory:step',stepEvent)};
    },[]);

    const dialog=React.useRef(null);
    const trigger=React.useRef(null);
    const closing=React.useRef(false);
    async function close(target){
      if(closing.current)return;closing.current=true;
      const node=dialog.current;
      if(node){
        node.classList.add('is-closing');
        await Promise.race([
          Promise.allSettled(node.getAnimations().map(animation=>animation.finished)),
          new Promise(resolve=>setTimeout(resolve,320))
        ]);
        if(node.open)node.close();
      }
      setSelected(null);closing.current=false;
      if(target)requestAnimationFrame(()=>document.getElementById(target)?.scrollIntoView({behavior:'smooth',block:'start'}));
    }
    React.useEffect(()=>{
      if(!selected)return;
      const node=dialog.current;node.showModal();
      const previous=document.body.style.overflow;document.body.style.overflow='hidden';
      return()=>{document.body.style.overflow=previous;if(node.open)node.close();trigger.current?.focus({preventScroll:true});};
    },[selected]);
    function open(card,event){trigger.current=event.currentTarget;setSelected(card)}
    function navigate(){close(selected.target)}
    return els('section',{id:'work',className:`section directory-section directory-expanded${entered?' is-entered':''}${active===visibleCards.length?' is-overview':''}`,children:[
      els('div',{className:'directory-story',children:[
        els('div',{className:'directory-sticky',children:[
          els('div',{className:'container directory-stage',children:[
            el('div',{className:'directory-scenes',children:visibleCards.map((card,index)=>els('div',{className:`directory-scene${active===index&&entered?' is-active':''}`,style:{'--stack-depth':(index-active+visibleCards.length)%visibleCards.length,'--card-slot':index},'aria-hidden':(active!==index&&active!==visibleCards.length)||!entered,children:[
              el('div',{className:'directory-visual',children:els(DirectoryCard,{type:'button',className:'index-glass-card',style:{'--card-order':index,'--card-tilt':'0deg'},tabIndex:active===index||active===visibleCards.length?0:-1,onClick:event=>open(card,event),'aria-haspopup':'dialog','aria-label':`查看${card.titleCn}`,children:[
                els('div',{className:'index-card-window',children:[el('img',{src:card.image,alt:card.titleCn,loading:index===0?'eager':'lazy'}),el('span',{className:'index-card-number',children:card.index})]}),
                els('div',{className:'index-card-copy',children:[el('h3',{children:card.titleEn}),el('p',{children:card.titleCn}),els('div',{className:'index-card-footer',children:[el('span',{children:card.footerTag}),el('span',{'aria-hidden':true,children:'↗'})]})]})
              ]},card.id)}),
              els('div',{className:'directory-scene-copy',children:[
                els('div',{className:'directory-scene-meta',children:[el('h3',{children:card.titleEn}),el('p',{className:'directory-scene-cn',children:card.titleCn})]}),
                el('p',{className:'directory-scene-description','aria-label':descriptions[card.target].en,children:descriptions[card.target].en.split(' ').map((word,wordIndex)=>el('span',{className:'directory-word','aria-hidden':true,style:{'--word-index':wordIndex},children:`${word} `},wordIndex))}),
                el('p',{className:'directory-scene-translation',children:descriptions[card.target].cn})
              ]})
            ]},card.id))}),
            els('nav',{className:'directory-mobile-controls','aria-label':'卡片翻页',children:[
              el('button',{type:'button',className:'directory-home-button','aria-label':'返回首页',onClick:()=>document.getElementById('work')?.dispatchEvent(new Event('directory:go-home')),children:'首页'}),
              el('button',{type:'button','aria-label':'上一张',onClick:()=>document.getElementById('work')?.dispatchEvent(new CustomEvent('directory:step',{detail:-1})),children:'←'}),
              el('span',{children:active===visibleCards.length?'全部作品':`${String(active+1).padStart(2,'0')} / 04`}),
              el('button',{type:'button','aria-label':'下一张',onClick:()=>document.getElementById('work')?.dispatchEvent(new CustomEvent('directory:step',{detail:1})),children:'→'})
            ]}),
          ]})
        ]})
      ]}),
      selected&&els('dialog',{ref:dialog,className:'index-card-dialog','aria-labelledby':'index-dialog-title',onCancel:event=>{event.preventDefault();close()},onClick:event=>{if(event.target===event.currentTarget)close()},children:[
        el('button',{type:'button',className:'index-dialog-close','aria-label':'关闭卡片',onClick:()=>close(),children:'×'}),
        el('img',{className:'index-dialog-image',src:selected.image,alt:selected.titleCn}),
        els('div',{className:'index-dialog-copy',children:[el('span',{className:'index-dialog-tag',children:selected.footerTag}),el('h3',{id:'index-dialog-title',children:selected.titleEn}),el('p',{children:selected.titleCn}),selected.target==='media'&&el('p',{className:'directory-video-note',children:'影像与动态视觉作品选辑'}),el('button',{type:'button',className:'index-dialog-enter',onClick:navigate,children:'进入板块 ↗'})]})
      ]})
    ]});
  };
}
