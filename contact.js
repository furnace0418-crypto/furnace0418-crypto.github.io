import { contactDetails } from './contact-config.js';

export function createContact(React, jsx) {
  const { jsx: el, jsxs: els } = jsx;
  const iconPaths = {"email":["M224,48H32a8,8,0,0,0-8,8V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A8,8,0,0,0,224,48Zm-8,144H40V74.19l82.59,75.71a8,8,0,0,0,10.82,0L216,74.19V192Z"],"wechat":["M232.07,186.76A80,80,0,0,0,169.58,72.59,80,80,0,1,0,23.93,138.76l-7.27,24.71a16,16,0,0,0,19.87,19.87l24.71-7.27a79,79,0,0,0,25.19,7.35,80,80,0,0,0,108.33,40.65l24.71,7.27a16,16,0,0,0,19.87-19.87ZM132,152a12,12,0,1,1,12-12A12,12,0,0,1,132,152Zm-52,0a80.32,80.32,0,0,0,1.3,14.3,63.45,63.45,0,0,1-15.49-5.85,8,8,0,0,0-6-.63L32,168l8.17-27.76a8,8,0,0,0-.63-6A64,64,0,0,1,151.68,72.43,80.12,80.12,0,0,0,80,152Zm108,0a12,12,0,1,1,12-12A12,12,0,0,1,188,152Z"],"phone":["M231.88,175.08A56.26,56.26,0,0,1,176,224C96.6,224,32,159.4,32,80A56.26,56.26,0,0,1,80.92,24.12a16,16,0,0,1,16.62,9.52l21.12,47.15,0,.12A16,16,0,0,1,117.39,96c-.18.27-.37.52-.57.77L96,121.45c7.49,15.22,23.41,31,38.83,38.51l24.34-20.71a8.12,8.12,0,0,1,.75-.56,16,16,0,0,1,15.17-1.4l.13.06,47.11,21.11A16,16,0,0,1,231.88,175.08Z"]};
  function icon(kind) {
    return els('svg',{viewBox:'0 0 256 256',fill:'currentColor','aria-hidden':true,children:iconPaths[kind].map((d,index)=>el('path',{d},index))});
  }
  return function Contact() {
    const [notice, setNotice] = React.useState('');
    const timer=React.useRef(null);
    React.useEffect(()=>()=>clearTimeout(timer.current),[]);
    async function copyWechat() {
      if (!contactDetails.wechat) return;
      try { await navigator.clipboard.writeText(contactDetails.wechat); setNotice('微信号已复制'); }
      catch { setNotice('请手动复制微信号：'+contactDetails.wechat); }
      clearTimeout(timer.current); timer.current=setTimeout(()=>setNotice(''),4000);
    }
    const cards=[{id:'email',name:'Email',cn:'邮箱',value:contactDetails.email,href:contactDetails.email?'mailto:'+contactDetails.email:null,action:'WRITE A NOTE'}, {id:'wechat',name:'WeChat',cn:'微信',value:contactDetails.wechat,action:'LET’S TALK'}, {id:'phone',name:'Phone',cn:'电话',value:contactDetails.phone,href:contactDetails.phone?'tel:'+contactDetails.phone.replace(/[^+\d]/g,''):null,action:'SAY HELLO'}];
    return els('section',{id:'outro',className:'contact-finale','aria-labelledby':'contact-heading',children:[
      el('div',{className:'contact-orbit','aria-hidden':true}),
      els('div',{className:'container contact-finale-inner',children:[
        els('div',{className:'contact-availability',children:[el('i',{'aria-hidden':true}), 'OPEN TO NEW POSSIBILITIES']}),
        els('h2',{id:'contact-heading',className:'contact-thanks',children:['THANK ',el('span',{children:'YOU'})]}),
        el('p',{className:'contact-message-en',children:'Thank you for browsing my portfolio.'}),
        el('p',{className:'contact-message-cn',children:'期待与你交流设计、探讨合作，一起让新的想法发生。'}),
        el('div',{className:'contact-cards',children:cards.map((card)=>{
          const tag=card.href?'a':'button';
          return el('div',{className:'contact-float',children:els(tag,{className:'contact-card contact-card--'+card.id,href:card.href||undefined,type:tag==='button'?'button':undefined,onClick:card.id==='wechat'?copyWechat:undefined,'aria-label':card.name+' '+(card.value||'待填写'),'aria-disabled':!card.value||undefined,children:[
            el('span',{className:'contact-icon',children:icon(card.id)}),
            el('h3',{children:card.name}),
            el('span',{className:'contact-value',children:card.value||'待填写'}),
            els('span',{className:'contact-card-action',children:[card.action,el('span',{'aria-hidden':true,children:'↗'})]})
          ]})},card.id);
        })}),
        el('div',{role:'status','aria-live':'polite',className:'contact-notice',children:notice}),
        els('div',{className:'contact-endnote',children:[el('span',{children:'END OF PORTFOLIO'}),el('span',{children:'LET’S MAKE SOMETHING MEANINGFUL.'}),el('a',{href:'#hero',children:'BACK TO TOP ↑'})]})
      ]})
    ]});
  };
}
